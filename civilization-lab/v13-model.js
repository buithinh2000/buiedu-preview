/* Civilization Lab v1.3 — Private evidence dossier and scenario experiment model.
 * Research prototype. Explicit local storage, no crowd data, no inferred verified evidence.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CivDossierV13=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const KEY="civilization_lab_v13_private_workspace";
const LIMIT=480000,MAX_RECORDS=35,MAX_EVIDENCE=60,MAX_OBSERVATIONS=300;
const text=(x,n=1500)=>String(x==null?"":x).trim().slice(0,n);
const dateOK=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+"T12:00:00Z"));
const copy=x=>JSON.parse(JSON.stringify(x));
function empty(){return {schema:"civilization-lab/workspace-1.3",records:[]};}
function nameId(v){return typeof v==="string"&&/^[a-zA-Z0-9_-]{5,80}$/.test(v);}
function uuid(){return "cl_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,12);}
const sectorIDs=["company","family","school","community","nonprofit","public"];
function entry(kind,item,id){
 if(!["assessment","campaign"].includes(kind))throw Error("INVALID_KIND");
 const safe={kind,id:nameId(id)?id:uuid(),title:text(item.title||"Chưa đặt tên",120),sector:sectorIDs.includes(item.sector)?item.sector:"community",updatedAt:new Date().toISOString(),item:copy(item),evidence:[],observations:[],scenario:{pressure:1,adoption:1,external:1,metric:"",unit:"",direction:"up",baseline:null,target:null,horizon:"90"}};
 if(kind==="campaign"){safe.item.status="private_draft";safe.item.type="private_draft";}return safe;
}
function safeEvidence(x){
 const item={id:nameId(x.id)?x.id:uuid(),claim:text(x.claim,700),stance:["support","challenge","context"].includes(x.stance)?x.stance:"context",origin:["personal","witness","records","external"].includes(x.origin)?x.origin:"personal",reference:text(x.reference,700),date:dateOK(x.date)?x.date:"",status:"self_reported_unverified"};
 if(item.claim.length<15)throw Error("CLAIM_TOO_SHORT");
 return item;
}
function sanitize(x,model){
 if(!x||typeof x!=="object"||x.schema!=="civilization-lab/workspace-1.3"||!Array.isArray(x.records)||x.records.length>MAX_RECORDS)throw Error("INVALID_WORKSPACE");
 const seen=new Set(),out=empty();
 for(const src of x.records){
 if(!src||!nameId(src.id)||seen.has(src.id)||!["assessment","campaign"].includes(src.kind))throw Error("INVALID_RECORD");
 seen.add(src.id);
 if(!src.item||typeof src.item!=="object")throw Error("INVALID_ITEM");
 const kind=src.kind,base=kind==="assessment"?model.sanitizeRecord(src.item):model.makeDraft(src.item);
 if(kind==="campaign"){base.id=src.id;base.status="private_draft";base.type="private_draft";base.comments=Array.isArray(src.item.comments)?src.item.comments.slice(0,40).map(x=>({kind:["idea","counter","evidence","risk"].includes(x.kind)?x.kind:"idea",text:text(x.text,500),status:"local_only"})):[];}
 const e={kind,id:src.id,title:text(src.title,120),sector:sectorIDs.includes(src.sector)?src.sector:"community",updatedAt:text(src.updatedAt,40),item:base,evidence:[],observations:[],scenario:{pressure:1,adoption:1,external:1,metric:"",unit:"",direction:"up",baseline:null,target:null,horizon:"90"}};
 if(!Array.isArray(src.evidence)||src.evidence.length>MAX_EVIDENCE)throw Error("INVALID_EVIDENCE");
 e.evidence=src.evidence.map(safeEvidence);
 if(!Array.isArray(src.observations)||src.observations.length>MAX_OBSERVATIONS)throw Error("INVALID_OBSERVATIONS");
 e.observations=src.observations.filter(z=>dateOK(z.date)&&z.value!==""&&z.value!==null&&Number.isFinite(Number(z.value))).map(z=>({date:z.date,value:Number(z.value),note:text(z.note,450)}));
 const scen=src.scenario||{};e.scenario={pressure:bound(scen.pressure),adoption:bound(scen.adoption),external:bound(scen.external),metric:text(scen.metric,150),unit:text(scen.unit,30),direction:scen.direction==="down"?"down":"up",baseline:isNum(scen.baseline)?Number(scen.baseline):null,target:isNum(scen.target)?Number(scen.target):null,horizon:["30","90","180","365"].includes(String(scen.horizon))?String(scen.horizon):"90"};
 out.records.push(e);
 }
 if(JSON.stringify(out).length>LIMIT)throw Error("WORKSPACE_LIMIT");
 return out;
}
function bound(x){const n=Number(x);return Number.isInteger(n)&&n>=0&&n<=3?n:1;}
function isNum(x){return x!==null&&x!==undefined&&x!==""&&Number.isFinite(Number(x));}
function load(storage,model){
 const raw=storage.getItem(KEY);
 if(!raw)return empty();
 if(raw.length>LIMIT)throw Error("WORKSPACE_LIMIT");
 return sanitize(JSON.parse(raw),model);
}
function save(storage,model,state){const valid=sanitize(state,model);const payload=JSON.stringify(valid);if(payload.length>LIMIT)throw Error("WORKSPACE_LIMIT");storage.setItem(KEY,payload);return valid;}
function add(storage,model,kind,item){
 const old=load(storage,model);
 if(old.records.length>=MAX_RECORDS)throw Error("MAX_RECORDS");
 const e=entry(kind,item);old.records.unshift(e);save(storage,model,old);return e;
}
function update(storage,model,id,change){
 const old=load(storage,model),i=old.records.findIndex(x=>x.id===id);if(i<0)throw Error("NOT_FOUND");
 const next=copy(old.records[i]);
 if(change.evidence){if(change.evidence.length>MAX_EVIDENCE)throw Error("MAX_EVIDENCE");next.evidence=change.evidence.map(safeEvidence);}
 if(change.scenario)next.scenario={...next.scenario,...change.scenario};
 if(change.observations)next.observations=change.observations;
 if(change.item)next.item=change.item;
 next.updatedAt=new Date().toISOString();old.records[i]=next;
 return save(storage,model,old).records[i];
}
function remove(storage,model,id){
 const old=load(storage,model),n=old.records.length;old.records=old.records.filter(x=>x.id!==id);if(n===old.records.length)return false;save(storage,model,old);return true;
}
function inspect(e){
 const items=e.evidence||[],s=items.filter(x=>x.stance==="support"),c=items.filter(x=>x.stance==="challenge"),t=items.filter(x=>x.stance==="context");
 const gaps=[];if(s.length===0)gaps.push("Chưa có dẫn chứng ủng hộ nhận định.");
 if(c.length===0)gaps.push("Chưa có phản chứng hoặc cách giải thích khác.");
 if(!items.some(x=>x.origin==="records"||x.origin==="external"))gaps.push("Chưa khai báo nguồn số liệu/tài liệu đối chiếu.");
 if(!items.some(x=>x.reference.length>=12))gaps.push("Chưa ghi cách tra cứu hoặc đối chiếu nguồn.");
 return {support:s.length,challenge:c.length,context:t.length,total:items.length,gaps,sourceLabel:"Nguồn người dùng tự khai · chưa có kiểm chứng độc lập"};
}
function scenario(e){
 const s=e.scenario||{},drivers={
 pressure:bound(s.pressure),adoption:bound(s.adoption),external:bound(s.external)
 };
 const get=(name,values)=>values[drivers[name]];
 const textOutcome=text(s.metric||e.item?.measure||e.item?.metric||"chỉ số kết quả",140),h=["30","90","180","365"].includes(String(s.horizon))?String(s.horizon):"90";
 const capacity=get("pressure",["Nguồn lực dư địa rộng","Nguồn lực tương đối đủ","Nguồn lực căng","Nguồn lực rất hạn chế"]);
 const buyin=get("adoption",["Chưa có sự đồng thuận","Mới có nhóm nhỏ ủng hộ","Một số nhóm tham gia","Đã có cam kết rõ ràng từ các bên"]);
 const shock=get("external",["Bối cảnh ổn định","Bối cảnh có biến động nhẹ","Bối cảnh nhiều biến động","Bối cảnh có thể gián đoạn lớn"]);
 return {drivers,assumptions:[capacity,buyin,shock],cards:[
 {name:"A · Tiếp tục như hiện tại",kind:"Đối chứng quan sát",body:"Theo dõi "+textOutcome+" trong "+h+" ngày mà không chủ động triển khai biện pháp mới. "+shock+". Kết quả có thể tốt lên, xấu đi hoặc giữ nguyên do những nguyên nhân khác."},
 {name:"B · Thử can thiệp có giới hạn",kind:"Giả thuyết thay đổi",body:"Giả định biện pháp nhỏ phù hợp, triển khai an toàn và được chấp thuận. "+buyin+". "+capacity+". Quan sát "+textOutcome+" trước–sau; không khẳng định sẽ cải thiện."},
 {name:"C · Nguyên nhân khác chi phối",kind:"Kiểm tra phản chứng",body:"Giả định nguyên nhân thực nằm ngoài can thiệp dự kiến; "+shock.toLowerCase()+". Biện pháp có thể không tạo tác dụng mong đợi. Tìm bằng chứng trái chiều và nguy cơ gây tác dụng phụ."}
 ],disclaimer:"Đây là ba kịch bản lời giải thích có điều kiện, không phải kết quả mô phỏng động lực hệ thống đã hiệu chuẩn. Các thanh lựa chọn chỉ thay giả định, không tạo xác suất hay dự báo số."};
}
function measure(e){
 const s=e.scenario||{},obs=(e.observations||[]).slice().sort((a,b)=>a.date.localeCompare(b.date)),baseline=isNum(s.baseline)?Number(s.baseline):null;
 if(baseline===null)return {state:"unknown",note:"Chưa có đường cơ sở. Không thể tính thay đổi.",series:obs};
 if(!obs.length)return {state:"baseline",note:"Có đường cơ sở; chưa có dữ liệu sau thời điểm ban đầu.",series:obs};
 const latest=obs[obs.length-1],delta=latest.value-baseline,better=s.direction==="down"?delta<0:delta>0,unchanged=delta===0;
 return {state:"observed",baseline,latest,delta,better,series:obs,note:unchanged?"Kết quả chưa thay đổi; chưa đủ bằng chứng về tác động.":(better?"Chỉ số di chuyển theo hướng mong muốn; không chứng minh nguyên nhân.":"Chỉ số đi ngược mục tiêu; cần xem lại can thiệp và yếu tố bên ngoài.")};
}
function addObservation(storage,model,id,date,value,note){
 if(!dateOK(date)||!isNum(value))throw Error("INVALID_MEASUREMENT");
 const e=load(storage,model).records.find(x=>x.id===id);if(!e)throw Error("NOT_FOUND");
 const obs=[...(e.observations||[]),{date,value:Number(value),note:text(note,450)}];
 if(obs.length>MAX_OBSERVATIONS)throw Error("MAX_OBSERVATIONS");
 return update(storage,model,id,{observations:obs});
}
function exportAll(storage,model){return JSON.stringify(load(storage,model),null,2);}
function restore(storage,model,source){if(typeof source!=="string"||source.length>LIMIT)throw Error("FILE_TOO_LARGE");return save(storage,model,JSON.parse(source));}
return {KEY,LIMIT,MAX_RECORDS,MAX_EVIDENCE,empty,entry,safeEvidence,sanitize,load,save,add,update,remove,inspect,scenario,measure,addObservation,exportAll,restore};
});