/* Civilization Lab v0.9 — Business Case Studio frontend. Local-only; no external inference. */
(function(){
"use strict";
const M=window.CivBizV09;if(!M){document.body.textContent="Không tải được engine.";return;}
const $=id=>document.getElementById(id);
const escapeHTML=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const option=(value,label,current)=>'<option value="'+escapeHTML(value)+'"'+(value===current?' selected':'')+'>'+escapeHTML(label)+'</option>';
const input=(label,id,value,placeholder="",type="text")=>'<label class="field"><span>'+label+'</span><input type="'+type+'" id="'+id+'" value="'+escapeHTML(value??"")+'" placeholder="'+escapeHTML(placeholder)+'"></label>';
const pill=x=>'<span class="pill">'+escapeHTML(x)+'</span>';
const blank=()=>M.createCase();
let c=blank(),step="describe",chosenHyp="",qIndex=0,demo=false;
const nav=["describe","investigate","trial","results"];
const navTitles={describe:"01 · Mô tả",investigate:"02 · Tìm nguyên nhân",trial:"03 · Thử thay đổi",results:"04 · Đo kết quả"};
function nowDate(){return new Date().toLocaleDateString("en-CA");}
function markDate(offset){const d=new Date();d.setDate(d.getDate()+offset);return d.toLocaleDateString("en-CA");}
function download(name,data,type){const blob=new Blob([data],{type});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function setStatus(text,isError=false){$("status").textContent=text;$("status").className="status-message"+(isError?" error":"");}
function go(key){step=key;render();window.scrollTo({top:0,behavior:"auto"});}
function domain(){return M.DOMAINS.find(x=>x.id===c.domain)||M.DOMAINS[0];}
function report(){return M.review(c);}
function hypothesis(){const list=report().evaluated;return list.find(x=>x.id===chosenHyp)||list[0];}
function navRender(){
 $("stepNav").innerHTML=nav.map(k=>'<button type="button" class="step'+(step===k?" active":"")+'" data-step="'+k+'"><strong>'+navTitles[k]+'</strong><small>'+({describe:"Vấn đề & mục tiêu",investigate:"Giả thuyết & bằng chứng",trial:"Kế hoạch & rủi ro",results:"Số liệu đo được"}[k])+'</small></button>').join("");
 document.querySelectorAll("[data-step]").forEach(b=>b.onclick=()=>go(b.dataset.step));
 $("progressPill").textContent=demo?"VÍ DỤ GIẢ ĐỊNH":c.description?"HỒ SƠ ĐANG LÀM":"CHƯA CÓ HỒ SƠ";
 $("sideIntro").textContent=c.title||"Hãy bắt đầu bằng một vấn đề có thật, nhưng không điền tên người hoặc thông tin riêng tư.";
 const r=report();$("sideSector").textContent=c.domain?domain().name:"Chưa phân loại";
 $("sideEvidence").textContent=r.evaluated.reduce((sum,h)=>sum+h.answered,0)+" quan sát";
 $("sideBaseline").textContent=c.baseline===null?"Chưa có":c.baseline+" "+(c.unit||"");
 $("sideStatus").textContent=c.experiment.status==="draft"?"Chưa thử":c.experiment.status==="active"?"Đang thử":c.experiment.status==="complete"?"Đã kết thúc":"Tạm dừng";
}
function renderDescribe(){
 const det=M.detect(c.description||"");
 let html='<div class="eyebrow">ĐỊNH NGHĨA VẤN ĐỀ</div><h2>Vấn đề gì đang diễn ra?</h2><p class="sub">Viết bằng ngôn ngữ thường. Hệ thống gợi ý nhóm cần xem xét từ nội dung, rồi bạn xác nhận. Đây là bộ phân loại minh bạch, chưa phải AI chuyên gia.</p>';
 html+='<label class="field"><span>Tiêu đề hồ sơ</span><input id="title" maxlength="150" value="'+escapeHTML(c.title)+'" placeholder="Ví dụ: Công ty có việc nhưng luôn thiếu tiền mặt"></label>';
 html+='<label class="field"><span>Mô tả hiện trạng (không cần biết nguyên nhân)</span><textarea id="description" maxlength="4000" rows="6" placeholder="Điều gì lặp lại? Từ khi nào? Ai bị ảnh hưởng theo vai trò? Đâu là kết quả nhìn thấy được?">'+escapeHTML(c.description)+'</textarea><small>Không nhập tên nhân viên, khách hàng hoặc thông tin cá nhân.</small></label>';
 html+='<div class="two"><label class="field"><span>Nhóm phân tích</span><select id="domain">'+option("","Để hệ thống gợi ý",c.domain)+M.DOMAINS.map(d=>option(d.id,d.name,c.domain)).join("")+'</select></label><div class="detect"><span>GỢI Ý TỪ MÔ TẢ</span><strong id="detectedDomain">'+escapeHTML((M.DOMAINS.find(d=>d.id===det.first)||{}).name)+'</strong><small id="detectNote">'+(det.uncertain?"Chưa có đủ dấu hiệu; người dùng nên chọn thủ công.":"Đây chỉ là phân loại chủ đề, không phải kết luận nguyên nhân.")+'</small></div></div>';
 html+='<div class="tip"><strong>Điều phân tích không được làm:</strong> xác nhận cáo buộc từ một phía, tự đoán doanh thu hoặc coi một mô hình minh họa là dự báo chính xác.</div>';
 html+='<div class="actions"><button id="analyze" class="btn primary">Tìm các giả thuyết →</button><button class="btn ghost" id="sample">Thử tình huống mẫu</button></div>';
 $("stageContent").innerHTML=html;
 $("title").oninput=e=>{c.title=e.target.value;navRender();};
 $("description").oninput=e=>{c.description=e.target.value;const v=M.detect(c.description);$("detectedDomain").textContent=M.DOMAINS.find(d=>d.id===v.first)?.name||"";$("detectNote").textContent=v.uncertain?"Chưa đủ dấu hiệu; cần chọn nhóm phân tích.":"Chỉ phân loại chủ đề; không suy ra nguyên nhân.";navRender();};
 $("domain").onchange=e=>{c.domain=e.target.value;navRender();};
 $("analyze").onclick=()=>{
  if(c.description.trim().length<35){setStatus("Hãy mô tả hiện trạng tối thiểu 35 ký tự để tránh kết luận thiếu ngữ cảnh.",true);return;}
  if(!c.title.trim())c.title=c.description.slice(0,65);
  if(!c.domain)c.domain=M.detect(c.description).first;
  if(!c.metric){const d=domain();c.metric=d.metric.name;c.unit=d.metric.unit;c.direction=d.metric.direction;}
  demo=false;chosenHyp="";go("investigate");setStatus("Đã lập danh sách giả thuyết để kiểm tra. Chưa xác nhận nguyên nhân.");
 };
 $("sample").onclick=()=>{
  c=blank();c.title="Tình huống minh họa · Công ty thi công nhỏ";
  c.description="Công ty có nhiều dự án đang thi công, tiến độ thường trễ. Nhân viên phải chờ vật tư hoặc hướng dẫn, làm lại một số công việc. Dòng tiền thiếu ổn định do khách hàng thanh toán theo giai đoạn.";
  c.domain="delivery";c.metric="Tỷ lệ công việc hoàn thành đúng hạn";c.unit="%";c.direction="up";c.baseline=55;c.target=75;
  chosenHyp="";demo=true;go("investigate");setStatus("Đã nạp ví dụ giả định. Mọi số liệu và câu trả lời trong ví dụ không phản ánh tổ chức có thật.");
 };
}
function stateText(h){return {untested:"Chưa kiểm tra",plausible:"Có tín hiệu ủng hộ, chưa xác minh",mixed:"Bằng chứng đang mâu thuẫn",weakened:"Ít tín hiệu ủng hộ"}[h.state];}
function renderInvestigate(){
 const r=report(),list=r.evaluated,h=hypothesis();if(!h){$("stageContent").innerHTML='<p>Chưa có nhóm nguyên nhân. <button id="back">Quay lại mô tả</button></p>';$("back").onclick=()=>go("describe");return;}
 chosenHyp=h.id;
 let html='<div class="eyebrow">ĐÁNH GIÁ GIẢ THUYẾT CẠNH TRANH</div><h2>Nguyên nhân nào đáng kiểm tra?</h2><p class="sub">Các thẻ dưới đây là giả thuyết khả dĩ cho <b>'+escapeHTML(domain().name)+'</b>. Từng giả thuyết có bằng chứng ủng hộ, dấu hiệu phản bác và giải pháp riêng. Sắp xếp lại theo câu trả lời, <b>không phải xác suất đúng</b>.</p>';
 html+='<div class="hyp-grid">'+list.map((x,i)=>'<button class="hyp'+(x.id===h.id?" active":"")+'" data-hyp="'+x.id+'"><span class="rank">GIẢ THUYẾT '+String(i+1).padStart(2,"0")+'</span><strong>'+escapeHTML(x.name)+'</strong><small>'+escapeHTML(stateText(x))+'</small><span class="scorelabel">'+x.answered+'/'+x.total+' câu đã đánh giá</span></button>').join("")+'</div>';
 html+='<div class="investigate-card"><div class="eyebrow">CƠ CHẾ GIẢ ĐỊNH</div><h3>'+escapeHTML(h.name)+'</h3><p>'+escapeHTML(h.mechanism)+'</p><div class="rebuttal"><strong>Điều có thể bác bỏ</strong><p>'+escapeHTML(h.disconfirm)+'</p></div><div class="eyebrow">HÃY KIỂM TRA TỪNG DẤU HIỆU</div>';
 html+=h.questions.map(q=>{
  const id=h.id+"."+q[0],a=c.answers[id]||{},selected=a.value||"unknown";
  return '<div class="question"><strong>'+escapeHTML(q[1])+'</strong><small>Chứng cứ cần tìm: '+escapeHTML(q[2])+'</small><div class="choices">'+[["yes","Có ghi nhận"],["no","Không ghi nhận"],["unknown","Chưa biết"]].map(v=>'<button class="choice'+(selected===v[0]?" chosen":"")+'" type="button" data-ans="'+escapeHTML(id)+'" data-value="'+v[0]+'">'+v[1]+'</button>').join("")+'</div><div class="two tight"><label>Nguồn thông tin<select data-source="'+escapeHTML(id)+'">'+[["self","Lời kể/nhận định"],["record","Có tài liệu (tự khai)"],["multiple","Nhiều bên (tự khai)"]].map(v=>option(v[0],v[1],a.source||"self")).join("")+'</select></label><label>Ghi chú ẩn danh<input maxlength="400" data-note="'+escapeHTML(id)+'" value="'+escapeHTML(a.note||"")+'" placeholder="Mốc thời gian hoặc số liệu"></label></div></div>';
 }).join("");
 html+='</div>';
 html+='<div class="alert amber"><strong>Đừng kết luận sớm:</strong> ngay cả khi có nhiều dấu hiệu, tương quan không đủ chứng minh nguyên nhân. Cần dữ liệu theo thời gian và xem các nguyên nhân khác.</div>';
 html+='<div class="actions"><button id="toTrial" class="btn primary">Chọn một thay đổi cần thử →</button><button id="backToBrief" class="btn ghost">Sửa mô tả</button></div>';
 $("stageContent").innerHTML=html;
 document.querySelectorAll("[data-hyp]").forEach(b=>b.onclick=()=>{chosenHyp=b.dataset.hyp;renderInvestigate();navRender();});
 document.querySelectorAll("[data-ans]").forEach(b=>b.onclick=()=>{const id=b.dataset.ans;const previous=c.answers[id]||{};c.answers[id]={...previous,value:b.dataset.value};renderInvestigate();navRender();});
 document.querySelectorAll("[data-source]").forEach(x=>x.onchange=()=>{c.answers[x.dataset.source]={...(c.answers[x.dataset.source]||{}),source:x.value};renderInvestigate();navRender();});
 document.querySelectorAll("[data-note]").forEach(x=>x.onchange=()=>{c.answers[x.dataset.note]={...(c.answers[x.dataset.note]||{}),note:x.value};});
 $("toTrial").onclick=()=>{c.hypothesisId=h.id;if(!c.experiment.action)c.experiment.action=h.intervention;go("trial");};
 $("backToBrief").onclick=()=>go("describe");
}
function renderTrial(){
 const r=report(),h=r.evaluated.find(x=>x.id===c.hypothesisId)||r.evaluated[0];
 if(h&&!c.experiment.action)c.experiment.action=h.intervention;
 if(!c.metric){c.metric=domain().metric.name;c.unit=domain().metric.unit;c.direction=domain().metric.direction;}
 let html='<div class="eyebrow">THỬ NGHIỆM CÓ GIỚI HẠN</div><h2>Thay đổi từ đâu, đo thế nào?</h2><p class="sub">Chỉ thử một thay đổi trong phạm vi đủ nhỏ để quan sát. Không tự động triển khai thay người dùng; an toàn và nghĩa vụ pháp luật là điều kiện trước tiên.</p>';
 html+='<div class="alert"><strong>Giả thuyết đang xét:</strong> '+escapeHTML(h?.name||"Chưa chọn")+'<br><small>'+escapeHTML(h?.mechanism||"")+'</small><p><b>Dấu hiệu phản bác:</b> '+escapeHTML(h?.disconfirm||"")+'</p></div>';
 const alternative=r.evaluated.find(x=>x.id!==h?.id&&x.state!=="weakened")||r.evaluated.find(x=>x.id!==h?.id);
 html+='<h3 class="subhead">Ba hướng cần so sánh trước khi quyết định</h3><div class="hyp-grid">'+
 '<div class="hyp"><span class="rank">A · CHƯA CAN THIỆP</span><strong>Theo dõi hiện trạng</strong><small>Ghi số liệu, bối cảnh và biến cố để có điểm so sánh. Hiện trạng có thể thay đổi ngay cả khi không chủ động can thiệp.</small></div>'+
 '<div class="hyp"><span class="rank">B · THỬ MỘT THAY ĐỔI</span><strong>'+escapeHTML(h?.name||"Giả thuyết đang xét")+'</strong><small>'+escapeHTML(h?.intervention||"Xác định một can thiệp có thể theo dõi")+'</small></div>'+
 '<div class="hyp"><span class="rank">C · NGUYÊN NHÂN THAY THẾ</span><strong>'+escapeHTML(alternative?.name||"Xem lại giả thuyết")+'</strong><small>Đối chiếu: '+escapeHTML(alternative?.disconfirm||"Có thể tồn tại nguyên nhân khác chưa đo.")+'</small></div></div><p class="small">Các nhánh mô tả khả năng, không phải tỷ lệ thành công. Chỉ ưu tiên thử một biện pháp sau khi thu thập bằng chứng và cân nhắc tác dụng phụ.</p>';
 html+='<label class="field"><span>Thay đổi cụ thể cần thử</span><textarea id="action" rows="4" maxlength="1400">'+escapeHTML(c.experiment.action)+'</textarea></label>';
 html+='<div class="two">'+input("Người phụ trách (chỉ ghi vai trò)","owner",c.experiment.owner,"Ví dụ: quản lý dự án")+'<label class="field"><span>Trạng thái</span><select id="trialStatus">'+[["draft","Đang lập kế hoạch"],["active","Đang thử"],["paused","Tạm dừng"],["complete","Đã kết thúc"]].map(v=>option(v[0],v[1],c.experiment.status)).join("")+'</select></label></div>';
 html+='<div class="two">'+input("Ngày bắt đầu","start",c.experiment.start||nowDate(),"","date")+input("Ngày đánh giá lại","end",c.experiment.end||markDate(30),"","date")+'</div>';
 html+='<div class="metricbox"><h3>Chỉ số có thể kiểm chứng</h3><div class="two">'+input("Tên chỉ số cần đo","metric",c.metric,"Ví dụ: tỷ lệ giao đúng hẹn")+input("Đơn vị","unit",c.unit,"%, ngày, giờ, AUD")+'</div><div class="three"><label class="field"><span>Giá trị hiện tại</span><input type="number" step="any" id="baseline" value="'+escapeHTML(c.baseline??"")+'" placeholder="Chưa có"></label><label class="field"><span>Mục tiêu</span><input type="number" step="any" id="target" value="'+escapeHTML(c.target??"")+'" placeholder="Chưa đặt"></label><label class="field"><span>Hướng tốt hơn</span><select id="direction">'+[["up","Càng cao càng tốt"],["down","Càng thấp càng tốt"]].map(v=>option(v[0],v[1],c.direction)).join("")+'</select></label></div><p class="small">Mục tiêu là quyết định của người dùng, không phải dự báo của AI. Ví dụ giảm số giờ làm lại từ 12 còn 6 giờ/tuần.</p></div>';
 html+='<div class="two">'+input("Rủi ro/tác dụng phụ cần theo dõi","risks",c.experiment.risks,"Ví dụ: tăng tải cho nhân viên")+input("Khi nào phải dừng/đánh giá lại?","stop",c.experiment.stop,"Ví dụ: phát sinh rủi ro an toàn hoặc làm trễ lương")+'</div>';
 const qc=M.qualityCheck(c);
 html+='<div class="alert '+(qc.ready?"success":"amber")+'"><strong>'+(qc.ready?"Đủ các trường tối thiểu để theo dõi":"Còn thiếu thông tin trước khi bắt đầu")+'</strong>'+(qc.issues.length?'<ul>'+qc.issues.map(x=>'<li>'+escapeHTML(x)+'</li>').join("")+'</ul>':'<p>Điều kiện biểu mẫu đã đủ; điều đó không chứng minh giải pháp an toàn hoặc hiệu quả.</p>')+'</div>';
 html+='<div class="actions"><button id="toResults" class="btn primary">Ghi kết quả thực tế →</button><button id="backHyps" class="btn ghost">Xem giả thuyết khác</button></div>';
 html+='<div class="footnote">Nguồn tham khảo phù hợp: <a href="'+escapeHTML(M.SOURCES[h?.ref||"productivity"].url)+'" target="_blank" rel="noopener">'+escapeHTML(M.SOURCES[h?.ref||"productivity"].title)+'</a>. Tài liệu này hỗ trợ phương pháp, không xác minh biện pháp đang chọn.</div>';
 $("stageContent").innerHTML=html;
 for(const k of ["action","owner","start","end","risks","stop"]){$(k).oninput=e=>{c.experiment[k]=e.target.value;};}
 $("trialStatus").onchange=e=>{c.experiment.status=e.target.value;navRender();};
 for(const k of ["metric","unit"]){$(k).oninput=e=>{c[k]=e.target.value;};}
 for(const k of ["baseline","target"]){$(k).oninput=e=>{c[k]=e.target.value.trim()===""?null:Number(e.target.value);navRender();};}
 $("direction").onchange=e=>{c.direction=e.target.value;};
 $("toResults").onclick=()=>{for(const k of ["action","owner","start","end","risks","stop"])c.experiment[k]=$(k).value;for(const k of ["metric","unit"])c[k]=$(k).value;for(const k of ["baseline","target"])c[k]=$(k).value.trim()===""?null:Number($(k).value);go("results");};
 $("backHyps").onclick=()=>go("investigate");
}
function sparkline(c){
 const v=[...(c.baseline!==null&&Number.isFinite(Number(c.baseline))?[{date:"baseline",value:Number(c.baseline)}]:[]),...(c.observations||[])];
 if(v.length<2)return '<div class="empty">Đồ thị sẽ xuất hiện sau khi có ít nhất một số liệu sau mốc ban đầu. Không tạo dữ liệu giả.</div>';
 const vals=v.map(p=>Number(p.value)),lo=Math.min(...vals),hi=Math.max(...vals),span=hi-lo||1,W=650,H=205;
 const coords=v.map((x,i)=>({x:46+i*(W-66)/Math.max(1,v.length-1),y:22+(hi-Number(x.value))/span*(H-62)}));
 return '<svg viewBox="0 0 '+W+' '+H+'" class="actual-chart" role="img" aria-label="Giá trị thực tế do người dùng nhập theo thời gian"><g><line x1="46" y1="22" x2="46" y2="'+(H-38)+'" stroke="#c7d9d3"/><line x1="46" y1="'+(H-38)+'" x2="'+(W-20)+'" y2="'+(H-38)+'" stroke="#c7d9d3"/><polyline points="'+coords.map(p=>p.x+','+p.y).join(' ')+'" fill="none" stroke="#008578" stroke-width="3" stroke-linejoin="round"/>'+coords.map((p,i)=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="5" fill="#008578"><title>'+escapeHTML(v[i].date+": "+v[i].value+" "+c.unit)+'</title></circle>').join("")+'<text x="5" y="25" font-size="12" fill="#69817e">'+hi+'</text><text x="5" y="'+(H-39)+'" font-size="12" fill="#69817e">'+lo+'</text></g></svg>';
}
function renderResults(){
 const p=M.progress(c),qc=M.qualityCheck(c);
 let html='<div class="eyebrow">THEO DÕI KẾT QUẢ THẬT</div><h2>Giải pháp có tạo chuyển biến không?</h2><p class="sub">Chỉ hiển thị số liệu bạn nhập. Đường thay đổi quan sát được <b>không tự chứng minh</b> rằng biện pháp là nguyên nhân; cần xem bối cảnh, mùa vụ và các thay đổi đồng thời.</p>';
 html+='<div class="stats"><div><strong>'+escapeHTML(c.baseline===null?"—":c.baseline)+'</strong><small>Đường cơ sở '+escapeHTML(c.unit)+'</small></div><div><strong>'+escapeHTML(c.target===null?"—":c.target)+'</strong><small>Mục tiêu tự đặt</small></div><div><strong>'+escapeHTML(p.last??"—")+'</strong><small>Quan sát mới nhất</small></div></div>';
 html+='<div class="chart-block">'+sparkline(c)+'</div><div class="alert '+(p.status==="observed"&&p.preferred?"success":"")+'"><b>Đối chiếu:</b> '+escapeHTML(p.description)+'</div>';
 html+='<div class="two"><label class="field"><span>Ngày đo</span><input id="observedDate" type="date" value="'+nowDate()+'"></label><label class="field"><span>'+escapeHTML(c.metric||"Chỉ số")+" ("+escapeHTML(c.unit||"")+")"+'</span><input id="observedValue" type="number" step="any" placeholder="Giá trị đo được"></label></div>';
 html+='<label class="field"><span>Điều kiện khi đo (mùa vụ, thay đổi khác, rủi ro)</span><textarea id="observedNote" rows="2" maxlength="350" placeholder="Ví dụ: trong tuần có hai ngày mưa, thiếu vật tư ở dự án A."></textarea></label>';
 html+='<div class="actions"><button id="addObservation" class="btn primary">Ghi số liệu đo thực tế</button><button id="editTrial" class="btn ghost">Sửa kế hoạch thử</button></div>';
 if((c.observations||[]).length)html+='<h3 class="subhead">Nhật ký theo thời gian</h3><div class="tablewrap"><table><thead><tr><th>Ngày</th><th>Giá trị</th><th>Ghi chú</th></tr></thead><tbody>'+c.observations.slice().reverse().map(o=>'<tr><td>'+escapeHTML(o.date)+'</td><td>'+escapeHTML(o.value+" "+c.unit)+'</td><td>'+escapeHTML(o.note)+'</td></tr>').join("")+'</tbody></table></div>';
 html+='<div class="footnote">'+(qc.ready?"Kế hoạch có đủ trường theo dõi.":"Kế hoạch còn thiếu: "+qc.issues.map(escapeHTML).join("; "))+'. Đánh giá quan hệ nhân quả cần dữ liệu đối chứng phù hợp, không thể suy từ một lần đo.</div>';
 $("stageContent").innerHTML=html;
 $("addObservation").onclick=()=>{try{c=M.recordOutcome(c,$("observedDate").value,$("observedValue").value,$("observedNote").value);renderResults();navRender();setStatus("Đã ghi nhận dữ liệu thực tế vào hồ sơ đang mở. Chưa được lưu lên máy chủ.");}catch(err){setStatus("Giá trị hoặc ngày không hợp lệ.",true);}};
 $("editTrial").onclick=()=>go("trial");
}
function render(){
 navRender();if(step==="describe")renderDescribe();if(step==="investigate")renderInvestigate();if(step==="trial")renderTrial();if(step==="results")renderResults();
 if(window.CivStudioBridgeV09)window.dispatchEvent(new Event("civlab:case-render"));
}
$("exportJSON").onclick=()=>{download("civilization-lab-case-v09.json",JSON.stringify({...c,exportNote:"Locally entered, unverified observations; share only with consent."},null,2),"application/json");setStatus("Đã tạo file JSON. Hãy kiểm tra dữ liệu trước khi chia sẻ.");};
$("exportCSV").onclick=()=>{download("civilization-lab-results-v09.csv",M.csv(c),"text/csv;charset=utf-8");setStatus("Đã xuất dữ liệu đo thực tế ra CSV.");};
$("saveLocal").onclick=()=>{try{localStorage.setItem("civilization_lab_v09_optin",JSON.stringify(c));setStatus("Đã lưu trên trình duyệt này theo yêu cầu. Trên thiết bị dùng chung, người khác có thể truy cập dữ liệu trình duyệt.");}catch(err){setStatus("Không thể lưu trên trình duyệt.",true);}};
$("loadLocal").onclick=()=>{try{const raw=localStorage.getItem("civilization_lab_v09_optin");if(!raw){setStatus("Chưa có hồ sơ lưu trên trình duyệt.",true);return;}c=M.validateImport(JSON.parse(raw));chosenHyp=c.hypothesisId||"";demo=false;go("results");setStatus("Đã mở hồ sơ trên thiết bị này.");}catch(err){setStatus("Hồ sơ cục bộ không hợp lệ.",true);}};
$("importJSON").onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>1200000)throw Error("TOO_LARGE");c=M.validateImport(JSON.parse(await file.text()));chosenHyp=c.hypothesisId||"";demo=false;go("describe");setStatus("Đã nhập hồ sơ. Hãy kiểm tra nội dung trước khi dùng.");}catch(err){setStatus("Không thể nhập file: chỉ chấp nhận JSON hồ sơ v0.9 hợp lệ.",true);}finally{e.target.value="";}};
$("reset").onclick=()=>{if(!confirm("Xóa hồ sơ đang làm trong phiên? Bản đã lưu trên trình duyệt không tự bị xóa."))return;c=blank();chosenHyp="";step="describe";demo=false;render();setStatus("Đã bắt đầu hồ sơ mới.");};
$("deleteLocal").onclick=()=>{if(confirm("Xóa hồ sơ Civilization Lab v0.9 đã lưu trên trình duyệt này?")){localStorage.removeItem("civilization_lab_v09_optin");setStatus("Đã xóa bản lưu cục bộ v0.9.");}};
window.CivStudioBridgeV09={
 getCase:()=>JSON.parse(JSON.stringify(c)),
 setCase:caseFile=>{c=M.validateImport(caseFile);chosenHyp=c.hypothesisId||"";demo=false;step="describe";render();},
 newCase:()=>{c=blank();chosenHyp="";demo=false;step="describe";render();},
 stepTo:key=>{if(!nav.includes(key))throw Error("INVALID_STEP");go(key);},
 model:M,
 getStage:()=>step
};
render();
})();