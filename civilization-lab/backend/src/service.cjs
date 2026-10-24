"use strict";
/*
 * Civilization Lab — API domain service, source-only proof of concept.
 * NO DEPLOYMENT. A Map repository is provided ONLY for deterministic unit tests.
 * Production demands authenticated API Gateway + durable tenant-scoped database,
 * independent moderators, rate limits, privacy/legal review, append-only audit and backups.
 */
const {randomUUID}=require("node:crypto");

const MAX={title:120,description:2500,metric:120,summary:900,reason:700};
const TYPES=["company","community","nonprofit","public","school","family"];
const PRIVACY_SECTORS=new Set(["family","school"]);
const fail=(code,message)=>{const err=new Error(message||code);err.code=code;return err;};
const clean=(str,max)=>typeof str==="string"?str.trim().slice(0,max):"";
const required=(str,min,max,field)=>{const value=clean(str,max);if(value.length<min||String(str).trim().length>max)throw fail("INVALID_INPUT",field+" requires "+min+"-"+max+" characters");return value;};
function identity(actor){
 if(!actor||typeof actor.sub!=="string"||!/^[-._a-zA-Z0-9:|@]{3,160}$/.test(actor.sub))throw fail("UNAUTHENTICATED","Authenticated subject required");
 return {sub:actor.sub,scopes:new Set(Array.isArray(actor.scopes)?actor.scopes:[])};
}
function assertScope(actor,name){const a=identity(actor);if(!a.scopes.has(name))throw fail("FORBIDDEN","Required verified permission not present");return a;}
function safePlain(x){return JSON.parse(JSON.stringify(x));}
const publicFields=(x)=>({id:x.id,title:x.publication.title,summary:x.publication.summary,objective:x.publication.objective,measure:x.publication.measure,sector:x.sector,publishedAt:x.publication.publishedAt,disclaimer:"Proposal for improving a system, not a verified accusation, endorsement or causal forecast."});
function memoryRepository(){
 const data={cases:new Map(),campaigns:new Map()};
 return {
 async get(type,id){if(!data[type])throw fail("REPO_TYPE");const x=data[type].get(id);return x?safePlain(x):null;},
 async put(type,obj){if(!data[type])throw fail("REPO_TYPE");data[type].set(obj.id,safePlain(obj));},
 async list(type,filter={}){if(!data[type])throw fail("REPO_TYPE");let records=[...data[type].values()];if(filter.owner)records=records.filter(x=>x.owner===filter.owner);if(filter.status)records=records.filter(x=>x.status===filter.status);return records.slice(0,50).map(safePlain);}
 };
}
function createService(repo,{now=()=>new Date().toISOString(),id=()=>randomUUID()}={}){
 if(!repo||typeof repo.get!=="function"||typeof repo.put!=="function"||typeof repo.list!=="function")throw new Error("Repository adapter required");
 const audit=(a,type,subject,detail)=>({id:id(),at:now(),actor:a.sub,type,subject,detail:clean(detail,MAX.reason)});
 const get=async(type,recordId)=>{const x=await repo.get(type,recordId);if(!x)throw fail("NOT_FOUND","Record not found");return x;};
 const own=(actor,x)=>{if(x.owner!==actor.sub)throw fail("NOT_FOUND","Record not found");};
 const campaignData=input=>{
  if(!input||typeof input!=="object"||Array.isArray(input))throw fail("INVALID_INPUT","Object required");
  const sector=clean(input.sector,30);
  if(!TYPES.includes(sector))throw fail("INVALID_INPUT","Invalid sector");
  return {sector,title:required(input.title,12,MAX.title,"title"),summary:required(input.summary,30,MAX.description,"summary"),
   objective:required(input.objective,15,MAX.summary,"objective"),measure:required(input.measure,10,MAX.metric,"measure"),
   otherSide:required(input.otherSide,15,MAX.summary,"otherSide"),evidenceNotes:clean(input.evidenceNotes,1000),
   namedOrganization:clean(input.namedOrganization,180),consentToInternalReview:input.consentToInternalReview===true};
 };
 return {
 async createCase(actor,input){
  const a=identity(actor);
  if(!input||typeof input!=="object")throw fail("INVALID_INPUT");
  const sector=clean(input.sector,30);
  if(!TYPES.includes(sector))throw fail("INVALID_INPUT");
  const x={id:id(),owner:a.sub,sector,title:required(input.title,5,MAX.title,"title"),
   narrative:required(input.narrative,15,MAX.description,"narrative"),createdAt:now(),updatedAt:now(),visibility:"private",
   events:[audit(a,"PRIVATE_CASE_CREATED","case","Owner-only case created")]};
  await repo.put("cases",x);return {id:x.id,visibility:x.visibility};
 },
 async getCase(actor,caseId){
  const a=identity(actor),x=await get("cases",caseId);own(a,x);
  return {id:x.id,sector:x.sector,title:x.title,narrative:x.narrative,visibility:x.visibility,updatedAt:x.updatedAt};
 },
 async updateCase(actor,caseId,input){
  const a=identity(actor),x=await get("cases",caseId);own(a,x);
  if(!input||typeof input!=="object"||Array.isArray(input))throw fail("INVALID_INPUT");
  // All writable fields are explicitly whitelisted. Never accept owner, visibility or status.
  if(Object.prototype.hasOwnProperty.call(input,"title"))x.title=required(input.title,5,MAX.title,"title");
  if(Object.prototype.hasOwnProperty.call(input,"narrative"))x.narrative=required(input.narrative,15,MAX.description,"narrative");
  if(!Object.prototype.hasOwnProperty.call(input,"title")&&!Object.prototype.hasOwnProperty.call(input,"narrative"))throw fail("INVALID_INPUT","Nothing to update");
  x.updatedAt=now();x.events.push(audit(a,"PRIVATE_CASE_UPDATED","case","Owner-edited case"));
  await repo.put("cases",x);
  return {id:x.id,updatedAt:x.updatedAt,visibility:"private"};
 },
 async listCases(actor){
  const a=identity(actor),items=await repo.list("cases",{owner:a.sub});
  return items.filter(x=>x.owner===a.sub).map(x=>({id:x.id,title:x.title,sector:x.sector,updatedAt:x.updatedAt}));
 },
 async createCampaign(actor,input){
  const a=identity(actor),d=campaignData(input);
  const x={id:id(),owner:a.sub,sector:d.sector,draft:d,status:"private_draft",createdAt:now(),updatedAt:now(),
   moderation:null,publication:null,history:[audit(a,"CAMPAIGN_CREATED","campaign","Private campaign created")]};
  await repo.put("campaigns",x);return {id:x.id,status:x.status};
 },
 async updateCampaign(actor,campaignId,input){
  const a=identity(actor),x=await get("campaigns",campaignId);own(a,x);
  if(x.status!=="private_draft"&&x.status!=="changes_requested")throw fail("BAD_STATE","Review snapshot is locked");
  // A resubmitted campaign must get a fresh moderation decision, not reuse a prior approval.
  x.draft=campaignData(input);
  x.sector=x.draft.sector;x.status="private_draft";x.moderation=null;x.publication=null;
  x.updatedAt=now();x.history.push(audit(a,"CAMPAIGN_DRAFT_UPDATED","campaign","Submitted previous review invalidated; private only"));
  await repo.put("campaigns",x);return {id:x.id,status:x.status,updatedAt:x.updatedAt};
 },
 async getCampaign(actor,campaignId){
  const a=identity(actor),x=await get("campaigns",campaignId);own(a,x);
  return {id:x.id,status:x.status,sector:x.sector,draft:x.draft,moderation:x.moderation?{decision:x.moderation.decision,at:x.moderation.at}:null,publication:x.publication?{publishedAt:x.publication.publishedAt}:null,updatedAt:x.updatedAt};
 },
 async submitCampaign(actor,campaignId){
  const a=identity(actor),x=await get("campaigns",campaignId);own(a,x);
  if(x.status!=="private_draft")throw fail("BAD_STATE","Only private drafts can be submitted");
  if(!x.draft.consentToInternalReview)throw fail("CONSENT_REQUIRED","Explicit internal-review consent required");
  if(PRIVACY_SECTORS.has(x.sector))throw fail("PROTECTED_SECTOR","This sector cannot enter public moderation flow");
  x.status="pending_review";x.updatedAt=now();x.history.push(audit(a,"CAMPAIGN_SUBMITTED","campaign","Sent to server-side moderation queue; NOT public"));
  await repo.put("campaigns",x);return {id:x.id,status:x.status,public:false};
 },
 async reviewCampaign(actor,campaignId,decision,comment,publicCopy){
  const reviewer=assertScope(actor,"civilization:moderate"),x=await get("campaigns",campaignId);
  if(x.owner===reviewer.sub)throw fail("SELF_REVIEW","Submitter cannot moderate own campaign");
  if(x.status!=="pending_review")throw fail("BAD_STATE","Not awaiting moderation");
  if(!["request_changes","reject","approve_for_publication"].includes(decision))throw fail("INVALID_INPUT","Unsupported decision");
  const reason=required(comment,15,MAX.reason,"reason");
  const proposed=decision==="approve_for_publication"?{
   title:required(publicCopy?.title,12,MAX.title,"moderated public title"),
   summary:required(publicCopy?.summary,30,MAX.summary,"moderated public summary"),
   objective:required(publicCopy?.objective,15,MAX.summary,"moderated public objective"),
   measure:required(publicCopy?.measure,10,MAX.metric,"moderated public measure")
  }:null;
  if(decision==="approve_for_publication"&&x.draft.namedOrganization)throw fail("NAMED_ORG_GATE","Named organization: verified right-of-reply workflow not yet implemented");
  if(decision==="approve_for_publication"&&PRIVACY_SECTORS.has(x.sector))throw fail("PROTECTED_SECTOR");
  x.status=decision==="approve_for_publication"?"reviewed_waiting_publisher":decision==="reject"?"rejected":"changes_requested";
  x.moderation={reviewer:reviewer.sub,decision,reason,at:now(),proposed};
  x.history.push(audit(reviewer,"MODERATION_DECISION","campaign",decision+" — "+reason));
  x.updatedAt=now();await repo.put("campaigns",x);return {id:x.id,status:x.status,public:false};
 },
 async publishCampaign(actor,campaignId){
  const publisher=assertScope(actor,"civilization:publish"),x=await get("campaigns",campaignId);
  if(x.owner===publisher.sub||x.moderation?.reviewer===publisher.sub)throw fail("SEGREGATION_OF_DUTIES","Publisher, reviewer and submitter must be separate people");
  if(x.status!=="reviewed_waiting_publisher"||x.moderation?.decision!=="approve_for_publication"||!x.moderation.proposed)throw fail("BAD_STATE","Independent moderation approval required");
  if(x.draft.namedOrganization||PRIVACY_SECTORS.has(x.sector))throw fail("PUBLICATION_BLOCKED","Protected or named campaign requires additional trust process");
  x.publication={...x.moderation.proposed,publishedAt:now(),publisher:publisher.sub};
  x.status="published";x.updatedAt=now();x.history.push(audit(publisher,"CAMPAIGN_PUBLISHED","campaign","Approved safe excerpt released"));
  await repo.put("campaigns",x);return {id:x.id,status:"published",public:true};
 },
 async unpublishCampaign(actor,campaignId,reason){
  const reviewer=assertScope(actor,"civilization:moderate"),x=await get("campaigns",campaignId);
  const why=required(reason,15,MAX.reason,"reason");
  if(x.status!=="published")throw fail("BAD_STATE","Only published campaigns can be unpublished");
  x.status="suspended";x.updatedAt=now();x.history.push(audit(reviewer,"PUBLICATION_SUSPENDED","campaign",why));
  await repo.put("campaigns",x);return {id:x.id,status:"suspended",public:false};
 },
 async publicCampaigns(){
  const a=await repo.list("campaigns",{status:"published"});
  return a.filter(x=>x.status==="published"&&x.publication).map(publicFields);
 },
 async publicCampaign(campaignId){
  const x=await get("campaigns",campaignId);
  if(x.status!=="published"||!x.publication)throw fail("NOT_FOUND");
  return publicFields(x);
 },
 async auditCampaign(actor,campaignId){
  const a=assertScope(actor,"civilization:moderate"),x=await get("campaigns",campaignId);
  return {id:x.id,events:x.history};
 }
 };
}
module.exports={createService,memoryRepository,fail};
