"use strict";
/*
 * Civilization Lab P1 DynamoDB adapter. SOURCE ONLY; no resource creation.
 * Dependency injection of DocumentClient and AWS command constructors enables
 * exact request assertions without AWS credentials or external calls.
 *
 * Single table PK/SK, GSI1 owner index, GSI2 public-only index.
 * Never use Scan; read index candidates with strong GetItem revalidation.
 */
const {fail}=require("./service.cjs");
const TYPES={cases:"CASE",campaigns:"CAMPAIGN"};
function makeDynamoRepository({client,commands,tableName,maxList=50}){
 if(!client||typeof client.send!=="function"||!commands||!["GetCommand","PutCommand","QueryCommand"].every(x=>typeof commands[x]==="function")||!tableName||!/^[-_A-Za-z0-9.]{3,255}$/.test(tableName))throw Error("Invalid DynamoDB adapter inputs");
 if(!Number.isInteger(maxList)||maxList<1||maxList>100)throw Error("Invalid maxList");
 const command=(type,params)=>new commands[type](params);
 const table=tableName;
 const typeName=t=>{if(!TYPES[t])throw fail("REPO_TYPE");return TYPES[t];};
 const key=(type,id)=>({PK:typeName(type)+"#"+id,SK:"RECORD"});
 const copy=x=>JSON.parse(JSON.stringify(x));
 function document(type,obj){
  const item={...copy(obj),...key(type,obj.id)};
  // Sparse GSIs: only member-owned items and explicitly published campaigns.
  item.GSI1PK="OWNER#"+obj.owner;
  item.GSI1SK=typeName(type)+"#"+obj.createdAt+"#"+obj.id;
  if(type==="campaigns"&&obj.status==="published"&&obj.publication){
   item.GSI2PK="PUBLIC#CAMPAIGNS";
   item.GSI2SK=(obj.publication.publishedAt||obj.updatedAt)+"#"+obj.id;
  }else{delete item.GSI2PK;delete item.GSI2SK;}
  return item;
 }
 function strip(item){
  if(!item)return null;
  const {PK,SK,GSI1PK,GSI1SK,GSI2PK,GSI2SK,...data}=item;
  return data;
 }
 async function get(type,id){
  if(typeof id!=="string"||id.length>90)throw fail("INVALID_INPUT");
  const res=await client.send(command("GetCommand",{TableName:table,Key:key(type,id),ConsistentRead:true}));
  return strip(res.Item);
 }
 async function put(type,obj){
  if(!obj||typeof obj!=="object"||typeof obj.id!=="string"||typeof obj.owner!=="string")throw fail("INVALID_INPUT");
  const isNew=obj.version===undefined||obj.version===null;
  const expected=obj.version;
  if(!isNew&&(!Number.isInteger(expected)||expected<1))throw fail("INVALID_VERSION");
  const version=isNew?1:expected+1;
  const Item=document(type,{...obj,version});
  // An older service instance or parallel request must not overwrite a newer
  // approved, suspended or unpublished state.
  const opts={
   TableName:table,Item,
   ConditionExpression:isNew?"attribute_not_exists(#pk)":"#version = :expected",
   ExpressionAttributeNames:isNew?{"#pk":"PK"}:{"#version":"version"},
   ...(isNew?{}:{ExpressionAttributeValues:{":expected":expected}})
  };
  try{
   await client.send(command("PutCommand",opts));
  }catch(err){
   if(err?.name==="ConditionalCheckFailedException"||err?.code==="ConditionalCheckFailedException")throw fail("VERSION_CONFLICT","Concurrent modification; reload before retry");
   throw err;
  }
  return strip(Item);
 }
 async function list(type,filter={}){
  typeName(type);
  if(!filter||typeof filter!=="object")throw fail("INVALID_INPUT");
  const isOwner=typeof filter.owner==="string"&&filter.owner.length>=3;
  const isPublic=type==="campaigns"&&filter.status==="published";
  if(!isOwner&&!isPublic)throw fail("QUERY_SCOPE_REQUIRED","Unscoped query forbidden");
  if(filter.status&&filter.status!=="published")throw fail("QUERY_SCOPE_REQUIRED");
  const params={
   TableName:table,IndexName:isOwner?"GSI1":"GSI2",
   KeyConditionExpression:isOwner?"#partition = :value AND begins_with(#sort, :typePrefix)":"#partition = :value",
   ExpressionAttributeNames:isOwner?{"#partition":"GSI1PK","#sort":"GSI1SK"}:{"#partition":"GSI2PK"},
   ExpressionAttributeValues:isOwner?{":value":"OWNER#"+filter.owner,":typePrefix":typeName(type)+"#"}:{":value":"PUBLIC#CAMPAIGNS"},
   Limit:maxList,ScanIndexForward:false
  };
  // A GSI only supplies candidates; it is eventually consistent. Re-read
  // each record from the base table STRONGLY CONSISTENT before releasing it,
  // especially after moderation suspension/depublication.
  const query=await client.send(command("QueryCommand",params));
  const results=[];
  for(const item of (query.Items||[])){
   if(results.length>=maxList)break;
   const id=item.id,typeToken=typeName(type);
   if(typeof id!=="string"||item.PK!==typeToken+"#"+id)continue;
   const latest=await get(type,id);
   if(!latest)continue;
   if(isOwner&&latest.owner!==filter.owner)continue;
   if(isPublic&&(latest.status!=="published"||!latest.publication))continue;
   results.push(latest);
  }
  return results;
 }
 return {get,put,list};
}
module.exports={makeDynamoRepository};
