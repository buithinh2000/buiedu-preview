/* Civilization Lab v1.0 — explicit opt-in, local-only multi-case portfolio.
 * Not encrypted. Do not use for PII or regulated records.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CivPortfolioV10=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const KEY="civilization_lab_v10_portfolio",VERSION=1,MAX_CASES=25,MAX_BYTES=650000;
const clone=x=>JSON.parse(JSON.stringify(x));
function empty(){return {version:VERSION,cases:[]};}
function isId(x){return typeof x==="string"&&/^[a-zA-Z0-9_-]{3,70}$/.test(x);}
function checkData(raw,model){
 if(raw===null||raw===undefined||raw==="")return empty();
 let data=typeof raw==="string"?JSON.parse(raw):raw;
 if(!data||data.version!==VERSION||!Array.isArray(data.cases)||data.cases.length>MAX_CASES)throw Error("PORTFOLIO_FORMAT");
 if(JSON.stringify(data).length>MAX_BYTES)throw Error("PORTFOLIO_TOO_LARGE");
 const ids=new Set();
 const cases=data.cases.map(entry=>{
  if(!entry||!isId(entry.id)||ids.has(entry.id))throw Error("CASE_ID");
  ids.add(entry.id);
  const c=model.validateImport(entry.case);
  const updatedAt= /^\d{4}-\d{2}-\d{2}T/.test(entry.updatedAt)?String(entry.updatedAt).slice(0,35):"";
  return {id:entry.id,updatedAt,case:c};
 });
 return {version:VERSION,cases};
}
function load(storage,model){
 return checkData(storage.getItem(KEY),model);
}
function makeId(){
 if(typeof crypto!=="undefined"&&crypto.randomUUID)return "cl_"+crypto.randomUUID();
 return "cl_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,12);
}
function save(storage,model,c,existingId,clock){
 const data=load(storage,model);const safe=model.validateImport(c);
 if(!safe.description||safe.description.length<10)throw Error("CASE_DESCRIPTION_REQUIRED");
 const id=existingId&&isId(existingId)?existingId:makeId();
 const ix=data.cases.findIndex(x=>x.id===id);
 const entry={id,updatedAt:typeof clock==="string"?clock:new Date().toISOString(),case:safe};
 if(ix>=0)data.cases[ix]=entry;else {if(data.cases.length>=MAX_CASES)throw Error("PORTFOLIO_LIMIT");data.cases.unshift(entry);}
 const payload=JSON.stringify(data);
 if(payload.length>MAX_BYTES)throw Error("PORTFOLIO_TOO_LARGE");
 storage.setItem(KEY,payload);
 return {id,updatedAt:entry.updatedAt,count:data.cases.length};
}
function remove(storage,model,id){
 const data=load(storage,model);const old=data.cases.length;
 data.cases=data.cases.filter(x=>x.id!==id);
 if(old===data.cases.length)return false;
 storage.setItem(KEY,JSON.stringify(data));return true;
}
function open(storage,model,id){
 const item=load(storage,model).cases.find(x=>x.id===id);
 if(!item)throw Error("CASE_NOT_FOUND");
 return clone(item.case);
}
function list(storage,model){
 return load(storage,model).cases.map(x=>({id:x.id,title:x.case.title||x.case.description.slice(0,70),domain:x.case.domain,updatedAt:x.updatedAt,status:x.case.experiment.status,observations:x.case.observations.length})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
}
function backup(storage,model){return JSON.stringify(load(storage,model),null,2);}
function restore(storage,model,text){
 if(typeof text!=="string"||text.length>MAX_BYTES)throw Error("PORTFOLIO_TOO_LARGE");
 const checked=checkData(text,model);
 storage.setItem(KEY,JSON.stringify(checked));
 return checked.cases.length;
}
function erase(storage){storage.removeItem(KEY);}
return {KEY,MAX_CASES,MAX_BYTES,empty,checkData,save,remove,open,list,backup,restore,erase};
});