/* Civilization Lab v1.4 — Public Participation Safety / Review Rehearsal.
 * PRIVATE SIMULATION ONLY. No real moderation, identity verification, contact, publication or approval.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CivReviewV14=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const VERSION="civilization-lab/review-1.4";
const PHASES=["private_draft","evidence_needed","response_planned","ready_for_human_review","on_hold","archived"];
const ROLES=["affected","organization","independent","observer"];
const clamp=(v,n=1000)=>String(v==null?"":v).trim().slice(0,n);
const copy=x=>JSON.parse(JSON.stringify(x));
const cleanTime=x=>typeof x==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(x)?x.slice(0,35):"";
const validDate=x=>typeof x==="string"&&/^\d{4}-\d\d-\d\d$/.test(x)?x:"";
function empty(){return {schema:VERSION,phase:"private_draft",contactPlan:"",privacyReviewed:false,replyProtocolReviewed:false,perspectives:[],events:[]};}
function sanitize(raw){
 const d=empty();if(!raw)return d;
 if(!raw||typeof raw!=="object"||Array.isArray(raw)||raw.schema!==VERSION)throw Error("INVALID_REVIEW_SCHEMA");
 d.phase=PHASES.includes(raw.phase)?raw.phase:"private_draft";
 d.contactPlan=clamp(raw.contactPlan,700);d.privacyReviewed=raw.privacyReviewed===true;d.replyProtocolReviewed=raw.replyProtocolReviewed===true;
 if(!Array.isArray(raw.perspectives)||raw.perspectives.length>25)throw Error("PERSPECTIVES_LIMIT");
 d.perspectives=raw.perspectives.map(x=>{
  if(!x||!ROLES.includes(x.role))throw Error("INVALID_PERSPECTIVE");
  const p={role:x.role,statement:clamp(x.statement,1100),possibleCounterexample:clamp(x.possibleCounterexample,500),sourceClaim:clamp(x.sourceClaim,450),date:validDate(x.date),status:"self_reported_unverified"};
  if(p.statement.length<20)throw Error("PERSPECTIVE_TOO_SHORT");return p;
 });
 if(!Array.isArray(raw.events)||raw.events.length>80)throw Error("REVIEW_EVENTS_LIMIT");
 d.events=raw.events.map(x=>{if(!x||!PHASES.includes(x.from)||!PHASES.includes(x.to))throw Error("INVALID_EVENT");return {at:cleanTime(x.at),from:x.from,to:x.to,reason:clamp(x.reason,400),mode:"local_simulation"};});
 return d;
}
function isCampaign(record){return record&&record.kind==="campaign";}
function assess(record){
 if(!isCampaign(record))return {eligible:false,phase:"not_applicable",checks:[],blocking:["Chỉ áp dụng quy trình xét duyệt cho bản nháp Campaign."]};
 const d=sanitize(record.review),e=record.evidence||[],item=record.item||{};
 const named=clamp(item.entity).length>0;
 const personal=record.sector==="family"||record.sector==="school";
 const supports=e.filter(x=>x.stance==="support"),challenges=e.filter(x=>x.stance==="challenge");
 const checks=[
 {id:"sector",label:"Phạm vi có thể xem xét công khai",pass:!personal,detail:"Gia đình và trường học: không đưa tình huống riêng chứa dữ liệu cá nhân/trẻ em vào chiến dịch."},
 {id:"focus",label:"Mục tiêu cải thiện được mô tả rõ",pass:clamp(item.desired).length>=15&&clamp(item.title).length>=12,detail:"Mô tả kết quả cần cải thiện, không lấy cáo buộc làm mục đích."},
 {id:"evidence",label:"Có ít nhất một lập luận ủng hộ và một phản chứng",pass:supports.length>0&&challenges.length>0,detail:"Các bằng chứng vẫn chỉ do người dùng tự khai, chưa được kiểm chứng."},
 {id:"source",label:"Có nguồn hoặc cách kiểm tra dữ kiện",pass:e.some(x=>clamp(x.reference).length>=12),detail:"Ghi cách truy tìm dữ liệu được phép chia sẻ; không tải hồ sơ nhạy cảm."},
 {id:"perspective",label:"Có lập trường của người bị ảnh hưởng và phương án giải thích khác",pass:d.perspectives.some(x=>x.role==="affected")&&d.perspectives.some(x=>x.role==="organization"||x.role==="independent"),detail:"Đây là các lời mô tả do cùng người dùng nhập, KHÔNG xác minh bên khác đã phát biểu."},
 {id:"privacy",label:"Đã rà soát quyền riêng tư và tác dụng phụ",pass:d.privacyReviewed,detail:"Không đưa thông tin nhận dạng và tình huống nguy hiểm vào website công khai."},
 {id:"reply",label:"Có kế hoạch mời phản hồi phù hợp (nếu nêu tổ chức)",pass:!named||(d.replyProtocolReviewed&&d.contactPlan.length>=20),detail:"Không có email hoặc thư mời nào được gửi trong bản thử nghiệm."},
 {id:"measurement",label:"Có chỉ số để theo dõi kết quả",pass:clamp(item.measure||record.scenario?.metric).length>=10,detail:"Chọn tiêu chí kiểm tra trước và sau; chưa được coi là hiệu quả nhân quả."}
 ];
 const blocking=checks.filter(x=>!x.pass);
 if(named)blocking.push({id:"named",label:"Tên tổ chức có thật phải qua kiểm duyệt độc lập và quyền phản hồi trước mọi công bố",detail:"Chưa có bộ phận kiểm duyệt hoặc xác thực tổ chức."});
 return {eligible:!personal,phase:d.phase,checks,passed:checks.filter(x=>x.pass).length,blocking,canPublish:false,canSendInvitation:false,notes:["Mọi mục phản hồi do một người nhập vẫn là lời tự khai.","Đủ trường không đồng nghĩa nội dung đã được xác minh, kiểm duyệt hoặc được phép đăng công khai."]};
}
const TRANSITIONS={
 private_draft:["evidence_needed","on_hold","archived"],
 evidence_needed:["response_planned","private_draft","on_hold","archived"],
 response_planned:["ready_for_human_review","evidence_needed","on_hold","archived"],
 ready_for_human_review:["evidence_needed","on_hold","archived"],
 on_hold:["private_draft","archived"],
 archived:["private_draft"]
};
function transition(record,target,reason,at){
 if(!isCampaign(record))throw Error("NOT_A_CAMPAIGN");
 const d=sanitize(record.review),gate=assess({...record,review:d});
 if(!PHASES.includes(target)||!TRANSITIONS[d.phase].includes(target))throw Error("INVALID_REVIEW_TRANSITION");
 if(target==="response_planned"&&(!gate.checks.find(x=>x.id==="evidence").pass||!gate.checks.find(x=>x.id==="source").pass))throw Error("EVIDENCE_GATE");
 if(target==="ready_for_human_review"&&gate.blocking.some(x=>x.id!=="named"))throw Error("REVIEW_GATE");
 const why=clamp(reason,400);if(why.length<12)throw Error("REASON_REQUIRED");
 const next=copy(d),prev=d.phase;next.phase=target;
 next.events.push({at:cleanTime(at)||new Date().toISOString(),from:prev,to:target,reason:why,mode:"local_simulation"});
 if(next.events.length>80)next.events=next.events.slice(-80);
 return next;
}
function addPerspective(raw,person){
 const d=sanitize(raw);if(!ROLES.includes(person?.role))throw Error("INVALID_ROLE");
 const x={role:person.role,statement:clamp(person.statement,1100),possibleCounterexample:clamp(person.possibleCounterexample,500),sourceClaim:clamp(person.sourceClaim,450),date:validDate(person.date),status:"self_reported_unverified"};
 if(x.statement.length<20)throw Error("PERSPECTIVE_TOO_SHORT");
 if(d.perspectives.length>=25)throw Error("PERSPECTIVES_LIMIT");
 const next=copy(d);next.perspectives.push(x);
 return next;
}
function composePacket(record){
 const a=assess(record),r=sanitize(record.review),e=record.evidence||[];
 return {format:"civilization-lab/review-packet-1.4",publication:"NOT_PUBLISHED",humanModeration:"NOT_CONDUCTED",realContact:"NOT_SENT",verification:"SELF_REPORTED_UNVERIFIED",caseId:clamp(record.id,80),sector:clamp(record.sector,40),title:clamp(record.title,120),currentPhase:r.phase,questions:a.checks.map(x=>({name:x.label,selfReportedComplete:x.pass,needed:x.detail})),sources:e.map(x=>({stance:x.stance,claim:clamp(x.claim,700),sourceClaim:clamp(x.reference,700),verified:false})),perspectives:r.perspectives.map(x=>({...x,verified:false})),rightsOfReplyPlan:r.contactPlan,auditHistory:r.events,notice:"For internal rehearsal only. No publication, no independent source validation, no role verification or actual organization contact."};
}
return {VERSION,PHASES,ROLES,TRANSITIONS,empty,sanitize,assess,transition,addPerspective,composePacket};
});