"use strict";
/* Staging contract E2E: API Gateway JWT claims -> HTTP handler -> service
 * -> DynamoDB adapter (fake DocumentClient). No external calls or credentials. */
const test=require("node:test"),assert=require("node:assert/strict");
const {createService}=require("../src/service.cjs");
const {makeHandler}=require("../src/http.cjs");
const {makeDynamoRepository}=require("../src/dynamo-repository.cjs");
function setup(){
 const table=new Map();let calls=[],slowQuery=false;
 class GetCommand{constructor(input){this.kind="get";this.input=input;}}
 class PutCommand{constructor(input){this.kind="put";this.input=input;}}
 class QueryCommand{constructor(input){this.kind="query";this.input=input;}}
 const client={async send(req){
  calls.push(req);const x=req.input;
  if(req.kind==="get"){const row=table.get(x.Key.PK);return {Item:row?structuredClone(row):undefined};}
  if(req.kind==="put"){
   const prev=table.get(x.Item.PK);
   const exists=x.ConditionExpression==="attribute_not_exists(#pk)";
   if((exists&&prev)||(!exists&&(!prev||prev.version!==x.ExpressionAttributeValues[":expected"])))throw Object.assign(new Error("Conflict"),{name:"ConditionalCheckFailedException"});
   table.set(x.Item.PK,structuredClone(x.Item));return {};
  }
  if(req.kind==="query"){
   const indexField=x.IndexName==="GSI1"?"GSI1PK":"GSI2PK";
   const prefix=x.ExpressionAttributeValues[":typePrefix"];
   const rows=[...table.values()].filter(v=>v[indexField]===x.ExpressionAttributeValues[":value"]&&(!prefix||v.GSI1SK?.startsWith(prefix)));
   return {Items:rows.slice(0,x.Limit).map(row=>structuredClone(row))};
  }
  throw Error("unexpected AWS request");
 }};
 let ids=0;
 const repo=makeDynamoRepository({client,commands:{GetCommand,PutCommand,QueryCommand},tableName:"CivilizationP1Test"});
 const service=createService(repo,{id:()=>"cl-test-"+(++ids),now:()=>"2026-10-25T03:00:00.000Z"});
 const handler=makeHandler(service);
 const call=async(method,path,actor,body,claimsExtra={})=>{
  const event={rawPath:path,requestContext:{http:{method}},body:body===undefined?undefined:JSON.stringify(body)};
  if(actor)event.requestContext.authorizer={jwt:{claims:{sub:actor,scope:"civilization:member",...claimsExtra}}};
  const res=await handler(event);
  return {status:res.statusCode,data:JSON.parse(res.body)};
 };
 return {service,repo,table,calls,call};
}
const caseInput={sector:"company",title:"Công việc giao nhận",narrative:"Một công việc tháng này bị trễ do phụ thuộc nhiều khâu phối hợp."};
const campaignInput={
 sector:"community",title:"Tăng cơ hội đóng góp ý kiến cộng đồng",
 summary:"Một nhóm thành viên muốn góp ý cải thiện cách tổ chức phản hồi trong hội nhóm.",
 objective:"Giúp thành viên gửi góp ý dễ dàng hơn",
 measure:"Số ngày trung bình nhận được phản hồi",
 otherSide:"Lịch làm việc của tình nguyện viên có thể ảnh hưởng",
 consentToInternalReview:true
};
test("Real request path with fake Dynamo: A creates, reopens and edits; B cannot read or update",async()=>{
 const x=setup(),created=await x.call("POST","/v1/private/cases","member_a",caseInput);
 assert.equal(created.status,201);const id=created.data.id;
 const read=await x.call("GET","/v1/private/cases/"+id,"member_a");
 assert.equal(read.status,200);assert.equal(read.data.narrative,caseInput.narrative);
 const update=await x.call("PATCH","/v1/private/cases/"+id,"member_a",{title:"Đã kiểm tra tiến độ",owner:"member_b",visibility:"public"});
 assert.equal(update.status,200);
 assert.equal((await x.call("GET","/v1/private/cases/"+id,"member_b")).status,404);
 assert.equal((await x.call("PATCH","/v1/private/cases/"+id,"member_b",{title:"Cố sửa"})).status,404);
 assert.equal((await x.call("GET","/v1/private/cases/"+id,"member_a")).data.title,"Đã kiểm tra tiến độ");
 assert.equal(x.table.get("CASE#"+id).version,2);
});
test("Owner list reads only owner-scoped GSI; anonymous request fails JWT boundary",async()=>{
 const x=setup();
 await x.call("POST","/v1/private/cases","member_a",caseInput);
 await x.call("POST","/v1/private/cases","member_b",{...caseInput,title:"Hồ sơ riêng của B"});
 const one=await x.call("GET","/v1/private/cases","member_a");
 assert.equal(one.status,200);assert.equal(one.data.items.length,1);
 const unauthorized=await x.call("GET","/v1/private/cases",null);
 assert.equal(unauthorized.status,401);
 assert.ok(x.calls.some(c=>c.kind==="query"&&c.input.IndexName==="GSI1"));
});
test("Submission creates pending review and cannot appear in public listing",async()=>{
 const x=setup();
 const created=await x.call("POST","/v1/private/campaigns","member_a",campaignInput);
 assert.equal(created.status,201);
 const sent=await x.call("POST","/v1/private/campaigns/"+created.data.id+"/submit","member_a");
 assert.equal(sent.status,202);assert.equal(sent.data.status,"pending_review");
 const list=await x.call("GET","/v1/public/campaigns",null);
 assert.equal(list.status,200);assert.deepEqual(list.data.items,[]);
 assert.ok(!x.table.get("CAMPAIGN#"+created.data.id).GSI2PK);
});
test("Parallel stale Dynamo edits reject conflict, never overwrite newer publication or personal data",async()=>{
 const x=setup();
 const created=await x.service.createCase({sub:"member_a",scopes:[]},caseInput);
 const a=await x.repo.get("cases",created.id),b=await x.repo.get("cases",created.id);
 a.title="A wins";await x.repo.put("cases",a);
 b.title="B stale";await assert.rejects(x.repo.put("cases",b),{code:"VERSION_CONFLICT"});
 assert.equal((await x.repo.get("cases",created.id)).title,"A wins");
});
test("A spoofed JWT in body does not establish identity or moderation power",async()=>{
 const x=setup();
 const spoof=await x.call("POST","/v1/private/cases",null,{...caseInput,sub:"member_a",scope:"civilization:moderate civilization:publish"});
 assert.equal(spoof.status,401);
 const draft=await x.call("POST","/v1/private/campaigns","member_a",campaignInput);
 await x.call("POST","/v1/private/campaigns/"+draft.data.id+"/submit","member_a");
 const review=await x.call("POST","/v1/moderation/campaigns/"+draft.data.id+"/decision","member_b",{decision:"approve_for_publication",reason:"I declare myself moderator",role:"moderator",publicCopy:{title:"Something"}});
 assert.equal(review.status,403);
});

test("P1 staging is fail-closed even if an admin accidentally invokes publish with a trusted scope",async()=>{
 const x=setup();
 const created=await x.call("POST","/v1/private/campaigns","member_a",campaignInput);
 await x.call("POST","/v1/private/campaigns/"+created.data.id+"/submit","member_a");
 await assert.rejects(
  x.service.publishCampaign({sub:"publisher_different",scopes:["civilization:publish"]},created.data.id),
  {code:"PUBLICATION_DISABLED"}
 );
 assert.equal((await x.call("GET","/v1/public/campaigns",null)).data.items.length,0);
});
