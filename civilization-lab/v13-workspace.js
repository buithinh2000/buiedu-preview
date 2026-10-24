/* Civilization Lab v1.3 — private workspace UI, no global publishing or background sync. */
(function(root,factory){const ui=factory();if(typeof module==="object"&&module.exports)module.exports=ui;root.CivWorkspaceV13=ui;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const D=typeof globalThis!=="undefined"?globalThis.CivDossierV13:null;
let selected="",message="",level="",showExport=false;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>c==="&"?"&amp;":c==="<"?"&lt;":c===">"?"&gt;":c==='"'?"&quot;":"&#39;");
const options=(arr,v)=>arr.map(([id,title])=>'<option value="'+esc(id)+'"'+(id===String(v)?' selected':'')+'>'+esc(title)+'</option>').join("");
const input=(title,id,value,type="text",hint="")=>'<label class="field"><span>'+esc(title)+'</span><input id="'+esc(id)+'" type="'+type+'" value="'+esc(value??"")+'" placeholder="'+esc(hint)+'"></label>';
const textArea=(title,id,value,rows=2)=>'<label class="field"><span>'+esc(title)+'</span><textarea id="'+esc(id)+'" rows="'+rows+'">'+esc(value||"")+'</textarea></label>';
const btn=(id,label,variant="")=>'<button type="button" id="'+id+'" class="btn '+variant+'">'+label+'</button>';
function download(name,contents,type="application/json"){const url=URL.createObjectURL(new Blob([contents],{type})),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function useStorage(){if(typeof localStorage==="undefined")throw Error("Bộ nhớ thiết bị không khả dụng");return localStorage;}
function list(bridge){return D.load(useStorage(),bridge.model).records;}
function get(bridge){const a=list(bridge);return a.find(x=>x.id===selected)||null;}
function err(e){message="Không thực hiện được: "+String(e?.message||e);level="danger";}
function success(m){message=m;level="";}
function wrapDo(callback,rend){try{callback();}catch(e){err(e);}rend();}
function help(){
 return '<div class="mini-note warn"><b>Ranh giới an toàn:</b> workspace này chỉ có trên thiết bị và không được mã hóa riêng. Tránh điền thông tin định danh nhân viên, trẻ em, hoặc bằng chứng nhạy cảm. Không phải dịch vụ lưu trữ an toàn cho hồ sơ tố cáo. Chưa có tài khoản, backend, người dùng chung hoặc kiểm duyệt.</div>';
}
function report(e){
 const inspection=D.inspect(e),scenario=D.scenario(e),outcome=D.measure(e);
 let s="# Civilization Lab — Private Decision Dossier v1.3\n\n";
 s+="**Unverified self-reported draft. NOT published; no independent validation and no numeric forecast.**\n\n";
 s+="## Case\n"+e.title+"\nSector: "+e.sector+"\nType: "+e.kind+"\n\n";
 s+="## Narrative\n"+(e.item.situation||e.item.summary||"")+"\n\n";
 s+="## Evidence register\n";
 for(const x of e.evidence){s+="- "+x.stance+" / "+x.origin+" / unverified: "+x.claim+"\n  Reference: "+x.reference+"\n";}
 s+="\nEvidence gaps: "+(inspection.gaps.join("; ")||"Basic categories present but not verified")+"\n\n";
 s+="## Scenario assumptions\n"+scenario.assumptions.map((x,i)=>"- Driver "+(i+1)+": "+x).join("\n")+"\n\n";
 for(const x of scenario.cards)s+="### "+x.name+"\n"+x.body+"\n\n";
 s+="## Recorded measurements\nMetric: "+(e.scenario.metric||e.item.measure||"")+" ("+(e.scenario.unit||"")+")\n";
 s+="Baseline: "+(e.scenario.baseline??"unknown")+", Target: "+(e.scenario.target??"unknown")+"\n";
 for(const x of outcome.series)s+="- "+x.date+": "+x.value+" "+e.scenario.unit+"; "+x.note+"\n";
 s+="\nResult: "+outcome.note+"\n\n## Caveat\nTemporal patterns do not establish causal effects. Any public allegation would require verification, moderation and right of reply.\n";
 return s;
}
function detail(bridge,e){
 const q=D.inspect(e),s=D.scenario(e),measurement=D.measure(e),d=e.scenario;
 return '<section class="panel"><div class="eyebrow">PRIVATE DOSSIER · '+esc(e.kind==='campaign'?"CAMPAIGN":"ASSESSMENT")+'</div><div class="v13-titlebar"><div><h2>'+esc(e.title)+'</h2><p>'+esc(e.sector)+' · cập nhật '+esc((e.updatedAt||"").slice(0,10))+' · không công khai</p></div><span class="pill">PRIVATE DRAFT</span></div>'+
 '<div class="btn-row">'+btn("v13-edit","Mở để chỉnh sửa","ghost")+btn("v13-export-one","Xuất báo cáo .md","ghost")+btn("v13-delete","Xóa hồ sơ","ghost")+'</div>'+
 '<div class="section-label">01 · EVIDENCE LEDGER</div><h3>Điều nào đã được nói, được ghi lại hoặc cần phản biện?</h3><p>Không cho phép đánh dấu “đã xác minh” từ một nguồn tự khai. Dữ kiện trái chiều được lưu riêng, không gộp thành điểm đúng–sai.</p>'+
 '<div class="v13-metrics"><div><b>'+q.support+'</b><small>Luận điểm ủng hộ</small></div><div><b>'+q.challenge+'</b><small>Dữ kiện phản biện</small></div><div><b>'+q.context+'</b><small>Thông tin bối cảnh</small></div></div>'+
 (e.evidence.length?e.evidence.map((a,i)=>'<article class="v13-evidence"><div><b>'+esc({support:"Ủng hộ giả thuyết",challenge:"Phản chứng",context:"Bối cảnh"}[a.stance])+'</b><p>'+esc(a.claim)+'</p><small>'+esc(a.origin)+' · '+esc(a.reference||"Chưa có nguồn đối chiếu")+' · chưa kiểm chứng độc lập</small></div><button data-remove-evidence="'+i+'" type="button" class="v13-smallbutton">Xóa</button></article>').join(""):'<div class="empty">Chưa có bằng chứng ghi nhận. Bắt đầu từ điều quan sát được, không phải phán xét.</div>')+
 (q.gaps.length?'<div class="mini-note warn"><b>Điểm chưa rõ:</b> '+q.gaps.map(esc).join(" · ")+'</div>':'<div class="mini-note">Các loại dữ liệu cơ bản đã được người dùng tự khai. Chưa có xác minh độc lập.</div>')+
 '<div class="fields">'+
 textArea("Sự kiện / nhận định cần ghi nhận","v13-claim","",3)+
 '<div>'+ '<label class="field"><span>Vai trò trong giả thuyết</span><select id="v13-stance">'+options([["support","Dữ kiện ủng hộ"],["challenge","Phản chứng / ngoại lệ"],["context","Bối cảnh khách quan"]],"context")+'</select></label>'+
 '<label class="field"><span>Loại nguồn (tự khai)</span><select id="v13-origin">'+options([["personal","Ý kiến cá nhân"],["witness","Trực tiếp chứng kiến"],["records","Tài liệu có thể đối chiếu"],["external","Nguồn công khai bên ngoài"]],"personal")+'</select></label></div></div>'+
 '<div class="fields">'+input("Cách tra cứu nguồn (không tải dữ liệu nhạy cảm)","v13-reference","","text","Ví dụ: bản ghi nội bộ tháng này, chỉ số công khai")+input("Ngày nguồn hoặc sự kiện (tùy chọn)","v13-evid-date","","date")+'</div>'+
 btn("v13-add-evidence","Ghi vào sổ chứng cứ","primary")+
 '<div class="report"><div class="section-label">02 · WHAT-IF LAB</div><h3>Thử thay đổi giả định, không tạo xác suất giả</h3><p>Ba tham số dưới đây là <b>điều kiện giả định do người dùng chọn</b>, không phải dữ liệu hệ thống tự suy ra. Chúng chỉ thay đổi lời giải thích kịch bản.</p>'+
 '<div class="fields">'+
 '<label class="field"><span>Áp lực nguồn lực</span><select id="v13-pressure">'+options([["0","Dư địa rộng"],["1","Tương đối đủ"],["2","Đang căng"],["3","Rất hạn chế"]],d.pressure)+'</select></label>'+
 '<label class="field"><span>Mức chấp nhận thay đổi</span><select id="v13-adoption">'+options([["0","Chưa đồng thuận"],["1","Nhóm nhỏ tham gia"],["2","Có nhiều nhóm tham gia"],["3","Cam kết rõ từ các bên"]],d.adoption)+'</select></label>'+
 '<label class="field"><span>Biến động bên ngoài</span><select id="v13-external">'+options([["0","Ổn định"],["1","Biến động nhẹ"],["2","Biến động lớn"],["3","Có nguy cơ gián đoạn"]],d.external)+'</select></label>'+
 '<label class="field"><span>Thời gian theo dõi</span><select id="v13-horizon">'+options([["30","30 ngày"],["90","90 ngày"],["180","180 ngày"],["365","1 năm"]],d.horizon)+'</select></label></div>'+
 btn("v13-simulate","Cập nhật giả định & kịch bản","primary")+
 '<div class="report-grid" id="v13-scenarios">'+s.cards.map(x=>'<div class="scenario"><b>'+esc(x.name)+'</b><p>'+esc(x.body)+'</p></div>').join("")+'</div>'+
 '<div class="mini-note warn">'+esc(s.disclaimer)+'</div></div>'+
 '<div class="report"><div class="section-label">03 · EVIDENCE-TO-OUTCOME</div><h3>Đo kết quả thật thay vì tự vẽ đường tương lai</h3><div class="fields">'+
 input("Chỉ số kết quả", "v13-metric",d.metric||e.item.measure||e.item.metric||"","text","Ví dụ: số ngày xử lý / tỷ lệ hoàn thành")+
 input("Đơn vị", "v13-unit",d.unit||"","text","ngày, %, giờ, AUD")+
 input("Giá trị ban đầu","v13-baseline",d.baseline??"","number","Chưa có số liệu")+
 input("Mục tiêu tự chọn","v13-target",d.target??"","number","Mục tiêu chưa hiệu chuẩn")+
 '<label class="field"><span>Hướng cải thiện</span><select id="v13-direction">'+options([["up","Càng cao càng tốt"],["down","Càng thấp càng tốt"]],d.direction)+'</select></label></div>'+
 btn("v13-metric-save","Lưu cách đo và mốc gốc","ghost")+
 '<div class="v13-observed"><strong>'+esc(measurement.note)+'</strong><p>'+esc(measurement.state==="observed"?"Chênh lệch quan sát: "+(measurement.delta>0?"+":"")+measurement.delta+" "+d.unit:"Chưa có so sánh số liệu đáng tin.")+'</p></div>'+
 (measurement.series.length?'<table class="v13-table"><thead><tr><th>Ngày</th><th>Giá trị</th><th>Điều kiện khi đo</th></tr></thead><tbody>'+measurement.series.map(x=>'<tr><td>'+esc(x.date)+'</td><td>'+esc(x.value+' '+d.unit)+'</td><td>'+esc(x.note)+'</td></tr>').join("")+'</tbody></table>':'<div class="empty">Chưa nhập số liệu đo được. Không tạo số liệu mẫu giả.</div>')+
 '<div class="fields">'+input("Ngày đo","v13-measure-date","","date")+input("Giá trị đo","v13-measure-value","","number","Số liệu thực tế")+'</div>'+
 textArea("Hoàn cảnh đo, yếu tố khác tác động","v13-measure-note","",2)+btn("v13-record","Thêm quan sát thực tế","primary")+'</div>'+((typeof globalThis!=="undefined"&&globalThis.CivGovernanceUIV14)?globalThis.CivGovernanceUIV14.panel(e):"")+'</section>';
}
function render(root,bridge){
 const model=bridge.model;let records=[];
 try{records=list(bridge);}catch(e){err(e);}
 if(selected&&!records.some(x=>x.id===selected))selected="";
 const item=records.find(x=>x.id===selected)||null;
 const drafts=bridge.getDrafts();
 root.innerHTML='<section class="panel v13-shell"><div class="eyebrow">MY WORKSPACE · v1.3</div><h2>Hồ sơ riêng tư & phòng thí nghiệm kịch bản</h2><p>Tiếp tục nghiên cứu từng vấn đề; lưu bản đánh giá, đề xuất chiến dịch, phản chứng và số liệu thực tế. Chỉ lưu trên trình duyệt khi bạn bấm nút. <b>Không có tính năng công khai nội dung.</b></p>'+
 '<div class="btn-row">'+btn("v13-save-assessment","Lưu bản Assessment đang làm","primary")+btn("v13-save-campaign","Lưu form Campaign đang làm","ghost")+btn("v13-backup","Xuất tất cả hồ sơ","ghost")+'<label class="v13-import">Khôi phục JSON<input id="v13-import" type="file" accept=".json,application/json"></label></div>'+
 '<div class="v13-status">'+(message?'<div class="mini-note '+level+'">'+esc(message)+'</div>':"")+'</div>'+
 '<p class="small">'+records.length+' / '+D.MAX_RECORDS+' hồ sơ đã lưu trong trình duyệt này. Đóng trang không làm mất hồ sơ đã lưu, nhưng thiết bị khác không tự đồng bộ.</p>'+
 (drafts.length?'<div class="mini-note"><b>Chiến dịch mới tạo trong Marketplace:</b> '+drafts.length+' bản đang nằm trong phiên. Nhấn Lưu để giữ lại trên thiết bị.</div><div class="v13-unsaved">'+drafts.slice(0,12).map((d,i)=>'<div><strong>'+esc(d.title)+'</strong><button data-save-draft="'+i+'" class="v13-smallbutton" type="button">Lưu bản nháp</button></div>').join("")+'</div>':"")+
 '<div class="v13-records">'+(records.length?records.map(e=>'<button class="v13-record'+(selected===e.id?" active":"")+'" data-open-record="'+esc(e.id)+'" type="button"><small>'+esc(e.kind==="campaign"?"CHIẾN DỊCH RIÊNG":"ĐÁNH GIÁ RIÊNG")+' · '+esc(e.sector)+'</small><b>'+esc(e.title)+'</b><span>'+esc(e.evidence.length)+' dữ kiện · '+esc(e.observations.length)+' lần đo</span></button>').join(""):'<div class="empty">Chưa có hồ sơ được lưu. Hãy bắt đầu từ Assessment Studio hoặc Create Campaign, rồi quay lại đây để lưu.</div>')+'</div>'+
 help()+'</section>'+
 (item?detail(bridge,item):'<section class="panel"><div class="eyebrow">SELECT A DOSSIER</div><h2>Chọn hồ sơ để mở Evidence & What-if Lab</h2><p>Tại đây bạn có thể thêm bằng chứng ủng hộ, bằng chứng phản bác, đổi giả định và ghi kết quả đo. Những thay đổi chỉ áp dụng cho hồ sơ đã chọn.</p></section>');
 const rerender=()=>render(root,bridge);
 document.getElementById("v13-save-assessment").onclick=()=>wrapDo(()=>{const a=bridge.getAssessment();if(!a.situation||a.situation.trim().length<15)throw Error("Hãy mô tả hiện trạng ít nhất 15 ký tự ở Assessment Studio.");const e=D.add(useStorage(),model,"assessment",a);selected=e.id;success("Đã lưu bản đánh giá cục bộ.");},rerender);
 document.getElementById("v13-save-campaign").onclick=()=>wrapDo(()=>{const c=bridge.getCampaign();if(!c.title||c.title.trim().length<10||!c.summary||c.summary.trim().length<20)throw Error("Hãy bổ sung tiêu đề và bối cảnh Campaign trước khi lưu.");const e=D.add(useStorage(),model,"campaign",c);selected=e.id;success("Đã lưu chiến dịch dưới dạng bản nháp riêng.");},rerender);
 document.getElementById("v13-backup").onclick=()=>wrapDo(()=>{download("civilization-lab-private-workspace-v13.json",D.exportAll(useStorage(),model));success("Đã xuất file. File chưa mã hóa, hãy lưu ở nơi phù hợp.");},rerender);
 document.getElementById("v13-import").onchange=async ev=>{try{const file=ev.target.files[0];if(!file)return;if(file.size>D.LIMIT)throw Error("File quá lớn.");if(!confirm("Khôi phục bản sao lưu sẽ ghi đè toàn bộ hồ sơ riêng đang lưu trên thiết bị. Tiếp tục?"))return;D.restore(useStorage(),model,await file.text());selected="";success("Đã khôi phục workspace trên thiết bị.");}catch(e){err(e);}finally{ev.target.value="";rerender();}};
 root.querySelectorAll("[data-save-draft]").forEach(b=>b.onclick=()=>wrapDo(()=>{const draft=drafts[Number(b.dataset.saveDraft)];if(!draft)throw Error("Bản nháp không tìm thấy.");const e=D.add(useStorage(),model,"campaign",draft);selected=e.id;success("Đã lưu bản nháp riêng. Không công bố lên Marketplace.");},rerender));
 root.querySelectorAll("[data-open-record]").forEach(b=>b.onclick=()=>{selected=b.dataset.openRecord;message="";rerender();});
 if(!item)return;
 if(typeof globalThis!=="undefined"&&globalThis.CivGovernanceUIV14){
  globalThis.CivGovernanceUIV14.bind(root,item,
   nextReview=>{wrapDo(()=>{D.update(useStorage(),model,item.id,{review:nextReview});success("Đã lưu bản rà soát nội bộ trên thiết bị. Không gửi hoặc công bố nội dung.");},rerender);},
   (msg,isError)=>{if(isError){err(new Error(msg));}else success(msg);const node=root.querySelector(".v13-status");if(node)node.innerHTML='<div class="mini-note '+level+'">'+esc(message)+'</div>';}
  );
 }
 document.getElementById("v13-delete").onclick=()=>{if(!confirm("Xóa hẳn hồ sơ riêng này khỏi trình duyệt?"))return;wrapDo(()=>{D.remove(useStorage(),model,item.id);selected="";success("Đã xóa hồ sơ đã chọn.");},rerender);};
 document.getElementById("v13-edit").onclick=()=>{if(item.kind==="assessment")bridge.setAssessment(item.item);else bridge.setCampaign(item.item);};
 document.getElementById("v13-export-one").onclick=()=>wrapDo(()=>{download("civilization-lab-private-dossier-v13.md",report(item),"text/markdown;charset=utf-8");success("Đã xuất báo cáo tự khai kèm giới hạn nhân quả.");},rerender);
 document.getElementById("v13-add-evidence").onclick=()=>wrapDo(()=>{
 const x={id:"",claim:document.getElementById("v13-claim").value,stance:document.getElementById("v13-stance").value,origin:document.getElementById("v13-origin").value,reference:document.getElementById("v13-reference").value,date:document.getElementById("v13-evid-date").value};
 D.update(useStorage(),model,item.id,{evidence:[...item.evidence,D.safeEvidence(x)]});success("Đã ghi nguồn tự khai; chưa được xác minh độc lập.");
 },rerender);
 root.querySelectorAll("[data-remove-evidence]").forEach(b=>b.onclick=()=>{if(!confirm("Xóa mục chứng cứ tự khai này?"))return;wrapDo(()=>{const next=item.evidence.filter((_,i)=>i!==Number(b.dataset.removeEvidence));D.update(useStorage(),model,item.id,{evidence:next});success("Đã xóa mục chứng cứ.");},rerender);});
 document.getElementById("v13-simulate").onclick=()=>wrapDo(()=>{
 const v={pressure:Number(document.getElementById("v13-pressure").value),adoption:Number(document.getElementById("v13-adoption").value),external:Number(document.getElementById("v13-external").value),horizon:document.getElementById("v13-horizon").value};
 D.update(useStorage(),model,item.id,{scenario:{...item.scenario,...v}});success("Đã lưu điều kiện giả định; các kịch bản vẫn là phân tích định tính, không phải dự báo xác suất.");
 },rerender);
 document.getElementById("v13-metric-save").onclick=()=>wrapDo(()=>{
 const val=id=>document.getElementById(id).value;
 const num=id=>{const v=val(id);return v.trim()===""?null:Number(v);};
 const a=num("v13-baseline"),b=num("v13-target");if((a!==null&&!Number.isFinite(a))||(b!==null&&!Number.isFinite(b)))throw Error("Số liệu không hợp lệ.");
 D.update(useStorage(),model,item.id,{scenario:{...item.scenario,metric:val("v13-metric"),unit:val("v13-unit"),baseline:a,target:b,direction:val("v13-direction")}});success("Đã lưu cách đo và đường cơ sở.");
 },rerender);
 document.getElementById("v13-record").onclick=()=>wrapDo(()=>{D.addObservation(useStorage(),model,item.id,document.getElementById("v13-measure-date").value,document.getElementById("v13-measure-value").value,document.getElementById("v13-measure-note").value);success("Đã lưu một lần đo thực tế, không suy ra tác động nhân quả.");},rerender);
}
return {render,report};
});