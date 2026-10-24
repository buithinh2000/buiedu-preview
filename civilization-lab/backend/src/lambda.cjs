"use strict";
/* This entrypoint must only be invoked by an API Gateway HTTP API with verified
 * JWT authorizer on private routes and restricted AWS Lambda invoke permissions.
 * SAM staging template intentionally excludes moderation/publication routes. */
const {createService}=require("./service.cjs");
const {makeHandler}=require("./http.cjs");
const {makeDynamoRepository}=require("./dynamo-repository.cjs");
let cached;
function configure(){
 const tableName=process.env.CIVILIZATION_TABLE;
 if(!tableName)throw Error("CIVILIZATION_TABLE is required");
 // Lazy load; unit tests do not download packages or use AWS credentials.
 const {DynamoDBClient}=require("@aws-sdk/client-dynamodb");
 const {DynamoDBDocumentClient,GetCommand,PutCommand,QueryCommand}=require("@aws-sdk/lib-dynamodb");
 const document=DynamoDBDocumentClient.from(new DynamoDBClient({
  maxAttempts:2
 }),{marshallOptions:{removeUndefinedValues:true}});
 const repo=makeDynamoRepository({
  client:document,commands:{GetCommand,PutCommand,QueryCommand},tableName
 });
 return makeHandler(createService(repo));
}
async function handler(event){
 cached=cached||configure();
 return cached(event);
}
module.exports={handler};
