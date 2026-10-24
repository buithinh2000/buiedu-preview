"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {makeDynamoRepository}=require("../src/dynamo-repository.cjs");
function fixture(){
 const base=new Map(),calls=[];let forcedQuery=null,queryResult=null;
 class GetCommand{constructor(input){this.kind="Get";this.input=input;}}
 class PutCommand{constructor(input){this.kind="Put";this.input=input;}}
 class QueryCommand{constructor(input){this.kind="Query";this.input=input;}}
 const client={async send(command){
  const {kind,input}=command;calls.push({kind,input});
  if(kind==="Get")return {Item:base.get(input.Key.PK)?structuredClone(base.get(input.Key.PK)):undefined};
  if(kind==="Put"){
   const old=base.get(input.Item.PK);
   if(input.ConditionExpression==="attribute_not_exists(#pk)"&&old)throw Object.assign(new Error("Conflict"),{name:"ConditionalCheckFailedException"});
   if(input.ConditionExpression==="#version = :expected"&&(!old||old.version!==input.ExpressionAttributeValues[":expected"]))throw Object.assign(new Error("Conflict"),{name:"ConditionalCheckFailedException"});
   base.set(input.Item.PK,structuredClone(input.Item));return {};
  }
  if(kind==="Query"){
   if(forcedQuery)return {Items:structuredClone(forcedQuery)};
   const pk=input.ExpressionAttributeValues[":value"];
   return {Items:[...base.values()].filter(x=>x[input.IndexName==="GSI1"?"GSI1PK":"GSI2PK"]===pk).slice(0,input.Limit).map(structuredClone)};
  }
  throw new Error("Unexpected command "+kind);
 }};
 const repo=makeDynamoRepository({client,commands:{GetCommand,PutCommand,QueryCommand},tableName:"civilization-lab-test"});
 return {repo,base,calls,forceQuery:x=>{forcedQuery=x;}};
}
const item=(id="aaa",owner="member_one",status="private_draft")=>({id,owner,createdAt:"2026-10-25T00:00:00Z",updatedAt:"2026-10-25T00:00:00Z",title:"Ví dụ",status,publication:status==="published"?{publishedAt:"2026-10-25T00:01:00Z",title:"Đề xuất",summary:"Thông tin cho cộng đồng",objective:"Hỗ trợ",measure:"Ngày"}:null});
test("Dynamo adapter rejects configuration with no client or an invalid table",()=>{assert.throws(()=>makeDynamoRepository({}),/Invalid DynamoDB/);assert.throws(()=>makeDynamoRepository({client:{send:()=>{}},commands:{},tableName:"table"}),/Invalid DynamoDB/);});
test("First version is 1, later writes use conditional version check",async()=>{const f=fixture();const created=await f.repo.put("campaigns",item());assert.equal(created.version,1);
 const a=await f.repo.get("campaigns","aaa");assert.equal(a.version,1);
 a.title="Updated";await f.repo.put("campaigns",a);
 assert.equal((await f.repo.get("campaigns","aaa")).version,2);
 const writes=f.calls.filter(x=>x.kind==="Put");assert.equal(writes[0].input.ConditionExpression,"attribute_not_exists(#pk)");assert.equal(writes[1].input.ExpressionAttributeValues[":expected"],1);
});
test("Two editors using stale versions cannot silently overwrite each other",async()=>{const f=fixture();await f.repo.put("cases",item("case_one"));
 const a=await f.repo.get("cases","case_one"),b=await f.repo.get("cases","case_one");
 a.title="Editor A";await f.repo.put("cases",a);
 b.title="Editor B";await assert.rejects(f.repo.put("cases",b),{code:"VERSION_CONFLICT"});
 assert.equal((await f.repo.get("cases","case_one")).title,"Editor A");
});
test("Create-only collisions cannot silently replace an existing record",async()=>{const f=fixture();await f.repo.put("cases",item("same_id"));await assert.rejects(f.repo.put("cases",item("same_id")),{code:"VERSION_CONFLICT"});});
test("Private listing uses OWNER GSI Query; never Scan or unscoped list",async()=>{const f=fixture();await f.repo.put("cases",item("first","member_one"));await f.repo.put("cases",item("second","member_two"));
 const result=await f.repo.list("cases",{owner:"member_one"});assert.equal(result.length,1);assert.equal(result[0].id,"first");
 const query=f.calls.find(x=>x.kind==="Query");assert.equal(query.input.IndexName,"GSI1");assert.equal(query.input.ExpressionAttributeValues[":value"],"OWNER#member_one");
 assert.ok(f.calls.every(x=>x.kind!=="Scan"));await assert.rejects(f.repo.list("cases",{}),{code:"QUERY_SCOPE_REQUIRED"});
});
test("Only published campaign rows receive sparse public index key",async()=>{const f=fixture();await f.repo.put("campaigns",item("hidden"));
 await f.repo.put("campaigns",item("shown","member_one","published"));
 assert.equal(f.base.get("CAMPAIGN#hidden").GSI2PK,undefined);assert.equal(f.base.get("CAMPAIGN#shown").GSI2PK,"PUBLIC#CAMPAIGNS");
 assert.equal((await f.repo.list("campaigns",{status:"published"})).length,1);
});
test("Stale GSI listing after suspension cannot leak a suspended campaign",async()=>{const f=fixture(),rec=await f.repo.put("campaigns",item("shown","member_one","published"));
 const stale=structuredClone(f.base.get("CAMPAIGN#shown"));
 rec.status="suspended";rec.publication=null;await f.repo.put("campaigns",rec);
 f.forceQuery([stale]);const publicRows=await f.repo.list("campaigns",{status:"published"});
 assert.equal(publicRows.length,0);
 const strongRead=f.calls.filter(x=>x.kind==="Get").at(-1);assert.equal(strongRead.input.ConsistentRead,true);
});
test("Owner-scoped listing revalidates ownership after stale GSI result",async()=>{const f=fixture();await f.repo.put("cases",item("id_x","member_two"));
 const fake=structuredClone(f.base.get("CASE#id_x"));fake.GSI1PK="OWNER#member_one";
 f.forceQuery([fake]);assert.deepEqual(await f.repo.list("cases",{owner:"member_one"}),[]);
});
test("Public query only accepts campaigns with published status",async()=>{const f=fixture();await assert.rejects(f.repo.list("cases",{status:"published"}),{code:"QUERY_SCOPE_REQUIRED"});});
test("Index keys removed when published item is put in suspended state",async()=>{const f=fixture();const r=await f.repo.put("campaigns",item("shown","member_one","published"));r.status="suspended";await f.repo.put("campaigns",r);assert.equal(f.base.get("CAMPAIGN#shown").GSI2PK,undefined);});
