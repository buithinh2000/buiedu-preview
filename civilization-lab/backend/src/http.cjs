"use strict";
/*
 * HTTP API adapter for an API Gateway JWT-authorized Lambda.
 * Source code only; NOT deployed. The API Gateway JWT authorizer MUST validate
 * issuer, audience, signature and token expiry before invoking protected paths.
 *
 * Only requestContext.authorizer.jwt.claims is trusted. Never body/header user IDs.
 * Direct lambda invocation must be restricted with IAM/resource-based policies.
 */
const {fail}=require("./service.cjs");
const maxBodyBytes=12000;
const responses={
 UNAUTHENTICATED:401,FORBIDDEN:403,SELF_REVIEW:403,SEGREGATION_OF_DUTIES:403,NOT_FOUND:404,
 INVALID_INPUT:400,INVALID_JSON:400,REQUEST_TOO_LARGE:413,BAD_STATE:409,
 CONSENT_REQUIRED:422,PROTECTED_SECTOR:422,NAMED_ORG_GATE:422,PUBLICATION_BLOCKED:422
};
function identity(event){
 const jwt=event?.requestContext?.authorizer?.jwt;
 const claims=jwt?.claims;
 if(!claims||typeof claims.sub!=="string"||!claims.sub)throw fail("UNAUTHENTICATED");
 const scopes=typeof claims.scope==="string"?claims.scope.split(/\s+/).filter(Boolean):[];
 return {sub:claims.sub,scopes};
}
function jsonBody(event){
 if(!event?.body)return {};
 if(typeof event.body!=="string")throw fail("INVALID_JSON");
 const body=event.isBase64Encoded?Buffer.from(event.body,"base64").toString("utf8"):event.body;
 if(Buffer.byteLength(body,"utf8")>maxBodyBytes)throw fail("REQUEST_TOO_LARGE");
 try{const value=JSON.parse(body);if(!value||typeof value!=="object"||Array.isArray(value))throw Error("Object expected");return value;}
 catch{throw fail("INVALID_JSON","Valid JSON object required");}
}
function response(status,obj){
 return {statusCode:status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"},body:JSON.stringify(obj)};
}
function makeHandler(service){
 if(!service||typeof service.createCase!=="function")throw Error("Service required");
 return async(event)=>{
  try{
   const method=String(event?.requestContext?.http?.method||"").toUpperCase();
   const path=String(event?.rawPath||"");
   if(!method||!path||path.length>400)throw fail("NOT_FOUND");
   let match;
   // Public reads only the server-approved public extract. No authentication required.
   if(method==="GET"&&path==="/v1/public/campaigns")return response(200,{items:await service.publicCampaigns()});
   if(method==="GET"&&(match=path.match(/^\/v1\/public\/campaigns\/([a-zA-Z0-9_-]{3,80})$/)))return response(200,await service.publicCampaign(match[1]));
   const actor=identity(event);
   if(method==="POST"&&path==="/v1/private/cases")return response(201,await service.createCase(actor,jsonBody(event)));
   if(method==="GET"&&path==="/v1/private/cases")return response(200,{items:await service.listCases(actor)});
   if(method==="GET"&&(match=path.match(/^\/v1\/private\/cases\/([a-zA-Z0-9_-]{3,80})$/)))return response(200,await service.getCase(actor,match[1]));
   if(method==="POST"&&path==="/v1/private/campaigns")return response(201,await service.createCampaign(actor,jsonBody(event)));
   if(method==="GET"&&(match=path.match(/^\/v1\/private\/campaigns\/([a-zA-Z0-9_-]{3,80})$/)))return response(200,await service.getCampaign(actor,match[1]));
   if(method==="POST"&&(match=path.match(/^\/v1\/private\/campaigns\/([a-zA-Z0-9_-]{3,80})\/submit$/)))return response(202,await service.submitCampaign(actor,match[1]));
   if(method==="POST"&&(match=path.match(/^\/v1\/moderation\/campaigns\/([a-zA-Z0-9_-]{3,80})\/decision$/))){
    const b=jsonBody(event);
    return response(200,await service.reviewCampaign(actor,match[1],b.decision,b.reason,b.publicCopy));
   }
   if(method==="GET"&&(match=path.match(/^\/v1\/moderation\/campaigns\/([a-zA-Z0-9_-]{3,80})\/audit$/)))return response(200,await service.auditCampaign(actor,match[1]));
   if(method==="POST"&&(match=path.match(/^\/v1\/publication\/campaigns\/([a-zA-Z0-9_-]{3,80})\/publish$/)))return response(200,await service.publishCampaign(actor,match[1]));
   if(method==="POST"&&(match=path.match(/^\/v1\/moderation\/campaigns\/([a-zA-Z0-9_-]{3,80})\/suspend$/))){
    return response(200,await service.unpublishCampaign(actor,match[1],jsonBody(event).reason));
   }
   throw fail("NOT_FOUND");
  }catch(err){
   const code=typeof err.code==="string"?err.code:"INTERNAL_ERROR";
   const status=responses[code]||500;
   return response(status,{error:code,message:status>=500?"Unexpected server error":String(err.message||code).slice(0,180)});
  }
 };
}
module.exports={makeHandler};
