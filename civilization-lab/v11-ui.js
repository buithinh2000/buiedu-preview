/* Civilization Lab v1.1 — Guided interview frontend, browser-only */
(function(){
"use strict";
const E=window.CivInterviewV11;const bridge=window.CivStudioBridgeV09;
const root=document.getElementById("v11-interview");
if(!E||!root){return;}
const $=id=>document.getElementById(id);
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;',"'" :"&#39;"}[c]));
const options=(vals,value)=>vals.map(v=>'<option value="'+esc(v[0])+'"'+(v[0]===value?" selected":"")+'>'+esc(v[1])+'</option>').join("");
const roles=[["","Chọn vai trò (không cần tên)"],["Lãnh đạo / người ra quyết định","Lãnh đạo / người ra quyết định"],["Thành viên / người lao động","Thành viên / người lao động"],["Người chăm sóc / phụ huynh","Người chăm sóc / phụ huynh"],["Người được phục vụ / người chịu ảnh hưởng","Người được phục vụ / người chịu ảnh hưởng"],["Người quan sát","Người quan sát"],["Khác","Khác"]];
let s=E.create(),phase="start",id="",stepCounter=0,reportTab="outcome";
function scope(){return E.sectorOf(s.sector);}
function result(){return E.assess(s);}
function feedback(t,isErr=false){const el=$("v11-notice");if(el){el.textContent=t;el.className="v11-message"+(isErr?" error":"");}}
function render(){
 const r=result();
 root.innerHTML='<div class="v11-bar"><span class="v11-step-label">GUIDED INTERVIEW · V1.1</span><span class="v11-breadcrumb">'+(phase==="start"?"01 / Bắt đầu":phase==="question"?"02 / Tìm hiểu hiện trạng":"03 / Bản đồ và kịch bản")+'</span></div><div id="v11-panel"></div><div id="v11-notice" class="v11-message" role="status"></div>';
 if(phase==="start")startView();else if(phase==="question")questionView();else resultsView();
}
function startView(){
 const sect=scope();
 const cards=E.SECTORS.map(x=>'<button type="button" class="v11-sector'+(s.sector===x.id?" selected":"")+'" data-sector="'+esc(x.id)+'"><strong>'+esc(x.name)+'</strong><small>'+esc(x.description)+'</small></button>').join("");
 $("v11-panel").innerHTML='<div class="v11-intro"><div><span class="v11-kicker">Không cần biết tổ chức đang gặp vấn đề gì</span><h2>Kể thật về cách tổ chức đang vận hành.</h2><p>Mình sẽ hỏi bạn từng câu ngắn về công việc hằng ngày, mối quan hệ, nguồn lực, cách quyết định và việc thích nghi. Hãy nêu <b>điều đã xảy ra</b>, không cần tự kết luận ai đúng, ai sai.</p></div><div class="v11-promise"><b>Không có điểm 50/100.</b><span>Không bắt buộc mọi câu hỏi.</span><span>Có thể trả lời “chưa biết”.</span><span>Không tự xuất bản dữ liệu riêng.</span></div></div>'+
 '<div class="v11-kicker">Chọn hệ thống muốn tìm hiểu</div><div class="v11-sectors">'+cards+'</div>'+
 '<div class="v11-meta"><label>Vai trò của bạn<select id="v11-role">'+options(roles,s.role)+'</select></label><label>Nhìn lại trong khoảng<select id="v11-period">'+options([["30","30 ngày"],["90","90 ngày"],["365","12 tháng"]],s.period)+'</select></label></div>'+
 '<label class="v11-field">Bạn mong tổ chức trở nên như thế nào? (có thể để trống)<textarea id="v11-goal" rows="2" maxlength="900" placeholder="Ví dụ: phối hợp ổn định hơn, mọi người được lắng nghe, đáp ứng nhu cầu thiết yếu...">'+esc(s.goal)+'</textarea></label>'+
 '<div class="v11-alert"><strong>Cam kết minh bạch:</strong> Đây là phỏng vấn có hướng dẫn, chưa có AI hội thoại hay bằng chứng độc lập. Trình bày rõ cũng không bảo đảm nhận định đúng; hệ thống sẽ hỏi về cả thành công, hạn chế và những góc nhìn khác.</div>'+
 '<div class="v11-actions"><button class="v11-primary" id="v11-begin">Bắt đầu từ tình huống thực tế →</button><button class="v11-minor" id="v11-demo">Điền ví dụ minh họa</button></div>';
 document.querySelectorAll("[data-sector]").forEach(b=>b.onclick=()=>{s.sector=b.dataset.sector;s.answers={};id="";render();});
 $("v11-role").onchange=e=>s.role=e.target.value;
 $("v11-period").onchange=e=>s.period=e.target.value;
 $("v11-goal").oninput=e=>s.goal=e.target.value;
 $("v11-begin").onclick=()=>{id=E.next(s)||scope().order[0];phase="question";render();};
 $("v11-demo").onclick=()=>{
 s.answers={};s.role="Lãnh đạo / người ra quyết định";s.goal="Hoạt động công bằng hơn và giảm trễ công việc";
 const sector=scope(),o=sector.order;
 s.answers[o[0]]={status:"works",event:"Trong tháng trước, hoạt động cơ bản được hoàn thành theo kế hoạch và mọi người đã cùng phối hợp.",alternative:"Chưa được đối chiếu với ý kiến của mọi thành viên.",source:"self",voice:"own",at:1};
 s.answers[o[1]]={status:"mixed",event:"Trong ba tháng gần đây, một số việc bị chậm do thiếu vật tư hoặc chưa rõ bước giao việc; vài công việc vẫn đúng hạn.",alternative:"Có thể do biến động bên ngoài và thay đổi số lượng việc.",source:"self",voice:"own",at:2};
 s.answers[o[2]]={status:"difficult",event:"Một việc gần đây bị chuyển qua hai người trước khi quyết định; người trực tiếp thực hiện phải chờ hướng dẫn.",alternative:"Chưa có số liệu để biết tình trạng phổ biến tới đâu.",source:"self",voice:"own",at:3};
 id=E.next(s)||o[0];phase="question";render();feedback("Dữ liệu ví dụ đều là giả định; không phản ánh tổ chức có thật.");
 };
}
function saveQuestion(){
 const q=E.byId(id);
 if(!q)return;
 const ans=s.answers[id]||{status:"unknown"};
 const event=$("v11-event");if(event)ans.event=event.value.trim().slice(0,1200);
 const alt=$("v11-counter");if(alt)ans.alternative=alt.value.trim().slice(0,500);
 const source=$("v11-source");if(source)ans.source=source.value;
 const voice=$("v11-voice");if(voice)ans.voice=voice.value;
 ans.at=++stepCounter;
 s.answers[id]=ans;
}
function questionView(){
 const sector=scope(),r=result(),q=E.byId(id)||E.byId(E.next(s))||E.byId(sector.order[0]);id=q.id;
 const ans=s.answers[id]||{status:"unknown"};
 const selected=ans.status,progress=Math.round(r.known.length/8*100);
 const pos=sector.order.indexOf(id)+1;
 const chip=sector.examples[id]||"Hãy nói một tình huống cụ thể, không cần kết luận.";
 const count=r.known.length;
 $("v11-panel").innerHTML='<div class="v11-qbar"><div><span class="v11-kicker">LĨNH VỰC '+pos+' / 8</span><h2>'+esc(q.name)+'</h2><p>'+esc(q.description)+'</p></div><div class="v11-counters"><strong>'+count+' / 8</strong><small>chiều đã mô tả</small></div></div>'+
 '<div class="v11-track"><span style="width:'+progress+'%"></span></div>'+
 '<div class="v11-question">'+esc(q.question)+'</div>'+
 '<p class="v11-example"><strong>Gợi ý nhớ lại:</strong> '+esc(chip)+'</p>'+
 '<div class="v11-choices">'+[
 ["works","Nhìn chung đang tốt","Có ví dụ cụ thể về điều hoạt động hiệu quả"],
 ["mixed","Có cả tốt và chưa tốt","Hai điều này có thể cùng tồn tại"],
 ["difficult","Đang có trở ngại","Mô tả sự kiện, không quy lỗi cho ai"],
 ["unknown","Chưa biết / bỏ qua","Không tự đoán, không xem là không có vấn đề"]
 ].map(x=>'<button type="button" class="v11-choice'+(selected===x[0]?" selected":"")+'" data-status="'+x[0]+'"><b>'+x[1]+'</b><small>'+x[2]+'</small></button>').join("")+'</div>'+
 (selected!=="unknown"?'<div class="v11-detail"><label class="v11-field"><span>Kể một lần xảy ra gần đây, càng cụ thể càng tốt</span><small>'+esc(q.follow)+'</small><textarea id="v11-event" rows="3" maxlength="1200" placeholder="Trong khoảng thời gian nào? Việc gì đã xảy ra? Tác động ra sao? Tránh tên thật.">'+esc(ans.event||"")+'</textarea></label>'+
 '<label class="v11-field"><span>Điều gì cho thấy nhận định này có thể chưa đầy đủ?</span><small>Ví dụ trái ngược, yếu tố bên ngoài hoặc cách nhìn của người khác.</small><textarea id="v11-counter" rows="2" maxlength="500" placeholder="Tôi chưa thấy... / Người khác có thể nhìn khác vì...">'+esc(ans.alternative||"")+'</textarea></label>'+
 '<div class="v11-meta"><label>Nguồn điều bạn kể<select id="v11-source">'+options([["self","Nhận định/kinh nghiệm cá nhân"],["witness","Sự việc đã tận mắt chứng kiến"],["record","Có tài liệu/số liệu (tự khai)"],["multi","Nhiều nguồn đã trao đổi (tự khai)"]],ans.source||"self")+'</select></label><label>Góc nhìn<select id="v11-voice">'+options([["unknown","Chưa nêu"],["own","Từ góc nhìn của tôi"],["affected","Người chịu ảnh hưởng"],["observer","Người quan sát khác"]],ans.voice||"own")+'</select></label></div>'+
 '<div class="v11-foot">Việc chọn “có tài liệu” không có nghĩa hệ thống đã kiểm chứng tài liệu. Không tải thông tin riêng tư lên phiên bản demo.</div></div>':
 '<div class="v11-alert">“Chưa biết” là một câu trả lời có giá trị. Hệ thống sẽ giữ câu hỏi này trong danh sách cần tìm hiểu, không tự đánh giá nó là điểm tốt hoặc xấu.</div>')+
 '<div class="v11-actions"><button id="v11-next" class="v11-primary">Lưu câu này và hỏi tiếp →</button><button id="v11-see" class="v11-minor">Xem bản phân tích sơ bộ</button><button id="v11-back" class="v11-minor">Quay lại chọn tổ chức</button></div>'+
 '<div class="v11-rail">'+sector.order.map(x=>'<button type="button" data-go="'+x+'" class="v11-rail-chip'+(id===x?" current":E.assess(s).known.some(z=>z.lens.id===x)?" answered":"")+'">'+esc(E.byId(x).name)+'</button>').join("")+'</div>';
 document.querySelectorAll("[data-status]").forEach(b=>b.onclick=()=>{
  saveQuestion();s.answers[id]={...(s.answers[id]||{}),status:b.dataset.status,at:++stepCounter};render();
 });
 document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{saveQuestion();id=b.dataset.go;render();});
 $("v11-next").onclick=()=>{saveQuestion();const next=E.next(s);if(next){id=next;render();}else {phase="results";render();}};
 $("v11-see").onclick=()=>{saveQuestion();phase="results";render();};
 $("v11-back").onclick=()=>{saveQuestion();phase="start";render();};
}
function resultsView(){
 const sector=scope(),r=result(),count=r.known.length;
 const focus=r.first;
 const shown=r.known.map(x=>'<div class="v11-finding"><div><b>'+esc(x.lens.name)+'</b><p>'+esc(x.a.event?.trim()||"Chưa có ví dụ cụ thể.")+'</p><small>'+({works:"Điều đang tốt",mixed:"Cả tốt và khó khăn",difficult:"Đang có trở ngại"}[x.a.status])+' · '+({self:"Lời kể cá nhân",witness:"Chứng kiến trực tiếp",record:"Có tài liệu được tự khai",multi:"Báo cáo nhiều nguồn tự khai"}[x.a.source]||"Nguồn chưa rõ")+'</small></div></div>').join("");
 const missing=r.open.map(x=>esc(E.byId(x).name)).join(", ");
 $("v11-panel").innerHTML='<div class="v11-results-head"><div><span class="v11-kicker">BẢN ĐỒ HỆ THỐNG SƠ BỘ</span><h2>Điều đã biết. Điều chưa biết. Điều có thể thử.</h2><p><strong>'+esc(sector.name)+'</strong> · Góc nhìn: '+esc(s.role||"chưa khai")+' · Khoảng nhìn lại: '+esc(s.period)+' ngày</p></div><span class="v11-summary">'+count+'/8 chiều được xem xét</span></div>'+
 '<div class="v11-kpis"><div><b>'+r.strengths.length+'</b><span>Điểm đang tốt</span></div><div><b>'+r.concerns.length+'</b><span>Lĩnh vực cần tìm hiểu</span></div><div><b>'+r.open.length+'</b><span>Chưa biết / chưa khảo sát</span></div><div><b>'+r.sources.length+'</b><span>Mục có nguồn đối chiếu tự khai</span></div></div>'+
 '<div class="v11-alert"><b>'+esc(r.readiness)+'</b>. Đây là đánh giá từ câu trả lời người dùng, không phải chẩn đoán hệ thống, độ tin cậy thống kê hoặc xác nhận sự kiện. Không tạo dự báo định lượng khi chưa có dữ liệu kiểm chứng.</div>'+
 '<div class="v11-columns"><section><h3>Những thông tin đã mô tả</h3>'+(shown||'<p>Chưa có thông tin cụ thể.</p>')+'</section><section><h3>Điểm mù cần kiểm tra</h3><ul class="v11-list">'+r.blindspots.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>'+(r.open.length?'<p class="v11-foot">Còn thiếu: '+missing+'</p>':"")+'<h3>Giả thuyết khởi đầu</h3><div class="v11-highlight">'+(focus?'<b>'+esc(focus.lens.name)+'</b><p>Được người dùng ghi nhận là một trở ngại có thể liên quan đến mục tiêu. Cần kiểm chứng bằng '+esc(focus.lens.measure)+' và các nguồn trái chiều; chưa thể gọi đây là nguyên nhân.</p>':'<p>Chưa có trở ngại cụ thể được ghi nhận. Hãy kiểm tra thêm để tránh bỏ sót vấn đề hoặc làm hỏng những gì đang tốt.</p>')+'</div></section></div>'+
 '<h3 class="v11-scenario-title">Ba tương lai có thể xảy ra — chưa phải dự báo xác suất</h3><div class="v11-scenarios">'+r.conditional.map(item=>'<div><b>'+esc(item.title)+'</b><p>'+esc(item.body)+'</p></div>').join("")+'</div>'+
 (s.sector==="family"?'<div class="v11-alert"><b>Giới hạn về gia đình:</b> Không dùng lời kể một người để xác định lỗi, chẩn đoán trẻ hay dự đoán cuộc đời thành viên. Nếu có bạo lực hoặc đe dọa, ưu tiên an toàn và hỗ trợ chuyên môn; tại Úc nguy hiểm tức thời gọi 000, tư vấn bạo lực gia đình 1800RESPECT (1800 737 732).</div>':"")+
 '<div class="v11-actions"><button id="v11-continue" class="v11-primary">Bổ sung những điều chưa biết →</button><button id="v11-export" class="v11-minor">Xuất bản đánh giá JSON</button>'+(s.sector==="company"&&bridge?'<button id="v11-business" class="v11-minor">Phân tích doanh nghiệp sâu hơn →</button>':"")+'<button id="v11-restart" class="v11-minor">Chọn lĩnh vực khác</button></div>'+
 '<div class="v11-foot">Các phương án chỉ là kịch bản có điều kiện. Để dự báo đáng tin, cần số liệu qua thời gian, phương pháp kiểm định phù hợp, quan điểm độc lập và đo độ chính xác trên trường hợp chưa dùng để xây mô hình.</div>';
 $("v11-continue").onclick=()=>{id=E.next(s)||scope().order[0];phase="question";render();};
 $("v11-export").onclick=()=>{const data=E.interviewExport(s),url=URL.createObjectURL(new Blob([data],{type:"application/json"})),a=document.createElement("a");a.href=url;a.download="civilization-lab-guided-interview-v11.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);feedback("Đã xuất bản câu trả lời chưa được kiểm chứng; hãy kiểm tra và bỏ thông tin định danh trước khi chia sẻ.");};
 $("v11-restart").onclick=()=>{phase="start";render();};
 if($("v11-business"))$("v11-business").onclick=()=>{if(!bridge){feedback("Studio doanh nghiệp chưa sẵn sàng",true);return;}const c=E.toBusinessCase(s,bridge.model);bridge.setCase(c);const area=$("v11-existing-studio");if(area){area.hidden=false;area.scrollIntoView({behavior:"smooth",block:"start"});}feedback("Đã chuyển bản tự khai sang Business Case Studio để kiểm tra giả thuyết và đo kết quả; chưa lưu lên máy chủ.");};
}
render();
})();