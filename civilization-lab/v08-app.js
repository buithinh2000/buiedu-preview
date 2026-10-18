(function(){
"use strict";
const A=window.CivAtlasV08,R=window.CivReasonV08,$=id=>document.getElementById(id);
if(!A||!R){$("stageArea").textContent="Không tải được mô hình. Hãy tải lại trang.";return;}
let s={stage:"scope",sectorId:"company",focusId:"execution",goal:"",baseline:"",stakeholders:"",horizon:"12",safety:"unknown",answers:{},questionId:"",lever:"",plannedAction:"",ideas:[]};
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const opts=(arr,selected)=>arr.map(x=>'<option value="'+esc(x[0])+'"'+(x[0]===selected?' selected':'')+'>'+esc(x[1])+'</option>').join("");
const panel=(heading,body)=>'<section class="panel">'+heading+body+'</section>';
const head=(num,title,desc)=>'<div class="miniTitle">'+num+'</div><h2>'+title+'</h2><p>'+desc+'</p>';
const buttons=(items)=>'<div class="buttons">'+items+'</div>';
const btn=(id,label,kind="")=>'<button type="button" id="'+id+'" class="cta '+kind+'">'+label+'</button>';
const warn=(title,body,kind="")=>'<div class="notice '+kind+'"><b>'+title+'</b><p>'+body+'</p></div>';
function rep(){return R.assess({atlas:A,sectorId:s.sectorId,focusId:s.focusId,answers:s.answers,goal:s.goal,baseline:s.baseline,safety:s.safety,stakeholders:s.stakeholders,horizon:s.horizon});}
function dimensions(){$("dimensionMap").innerHTML=A.dimensions.map(d=>'<div class="mechanism"><div class="symbol" style="color:'+d.color+'">'+esc(d.icon)+'</div><strong>'+esc(d.short)+'</strong><p>'+esc(d.question)+'</p></div>').join("");}
function aside(){
 const r=rep();$("sideTitle").textContent=r.focus.name;$("sideDescription").textContent=r.sector.name+" · "+r.focus.metric;
 $("progressBar").style.width=Math.round(100*r.known.length/Math.max(1,r.list.length))+"%";
 $("observedCount").textContent=r.known.length+" / "+r.list.length;$("dataCount").textContent=r.documented.length;
 $("gateInfo").textContent=r.gate+" · "+r.views.length+" nhóm góc nhìn (tự khai) · "+r.missing.length+" điều chưa rõ.";
 $("gateInfo").className="notice"+(r.safetyPriority?" urgent":"");
 document.querySelectorAll(".navBtn").forEach(b=>{b.classList.toggle("active",b.dataset.stage===s.stage);b.setAttribute("aria-current",b.dataset.stage===s.stage?"step":"false");});
}
function attachText(id,key){let e=$(id);if(e)e.addEventListener("input",()=>{s[key]=e.value;aside();});}
function go(stage){s.stage=stage;render();window.scrollTo({top:0,behavior:"auto"});}
function renderScope(){
 const sector=A.byId[s.sectorId],focus=R.getFocus(A,s.sectorId,s.focusId).focus;
 const list=sector.outcomes.map(o=>[o.id,o.name]);list.push(["__custom","Tình huống khác — tự mô tả"]);
 let t=head("01 / Xác định vấn đề","Đo kết quả trước khi tìm nguyên nhân","Một biểu hiện có thể xuất phát từ nhiều cơ chế. Bạn chọn điều thực sự cần cải thiện; hệ thống sẽ chọn câu hỏi liên quan.");
 t+='<div class="fields2"><div class="field"><label>Loại tổ chức</label><select id="sector">'+opts(A.sectors.map(o=>[o.id,o.name]),s.sectorId)+'</select></div><div class="field"><label>Vấn đề trọng tâm</label><select id="focus">'+opts(list,s.focusId)+'</select></div></div>';
 t+='<div class="field"><label>Quan sát thực tế và mục tiêu muốn cải thiện</label><textarea id="goal" maxlength="1200" placeholder="Mô tả tình huống, tác động, điều mong muốn. Không ghi tên người thật.">'+esc(s.goal)+'</textarea><p class="helper">Tránh kết luận lỗi của một cá nhân trước khi kiểm tra bằng chứng.</p></div>';
 t+='<div class="fields2"><div class="field"><label>Đường cơ sở hiện tại</label><input id="baseline" maxlength="250" value="'+esc(s.baseline)+'" placeholder="'+esc(focus.metric.split(";")[0])+'"><p class="helper">Dữ liệu có thời điểm; nếu chưa biết, để trống.</p></div><div class="field"><label>Những người chịu ảnh hưởng (theo vai trò)</label><input id="stakeholders" maxlength="300" value="'+esc(s.stakeholders)+'" placeholder="'+esc(sector.people)+'"></div></div>';
 t+='<div class="fields2"><div class="field"><label>Khoảng thời gian cần khám phá</label><select id="horizon">'+opts([["3","3 tháng"],["12","12 tháng"],["36","3 năm"],["120","10 năm"]],s.horizon)+'</select></div><div class="field"><label>Có nguy cơ mất an toàn cần xử lý?</label><select id="safety">'+opts([["unknown","Chưa rõ"],["no","Chưa ghi nhận"],["yes","Có thể có — cần ưu tiên an toàn"]],s.safety)+'</select></div></div>';
 if(s.safety==="yes")t+=warn("An toàn được ưu tiên","Không dùng mô phỏng để ép đối thoại hay thay thế dịch vụ hỗ trợ. Nếu nguy hiểm tức thời tại Úc: 000. Nếu có bạo lực gia đình: 1800RESPECT — 1800 737 732.","urgent");
 t+=buttons(btn("begin","Bắt đầu tìm cơ chế →")+btn("demo","Nạp ví dụ minh họa","light"));
 let chips=focus.dims.map(id=>'<span class="chip">'+esc(A.dimensions.find(x=>x.id===id)?.label||id)+'</span>').join("");
 $("stageArea").innerHTML=panel("",t)+panel(head("Bản đồ hệ thống","Tại sao không chỉ xem triệu chứng?","Tìm các vòng phản hồi, nguồn lực tích lũy, động lực ngược, độ trễ và bối cảnh. Một cơ chế có thể kéo theo nhiều biểu hiện."),'<div class="chips">'+chips+'</div>'+warn("Đây là khung nghiên cứu mới của Civilization Lab","Không chấm điểm bản chất con người, gia đình, tôn giáo, văn hóa hay khác biệt phát triển. Những yếu tố cá nhân được xem xét dưới góc độ nhu cầu và sự hỗ trợ."));
 $("sector").onchange=()=>{s.sectorId=$("sector").value;s.focusId=A.byId[s.sectorId].outcomes[0].id;s.answers={};s.questionId="";s.lever="";s.goal="";s.baseline="";s.stakeholders="";render();};
 $("focus").onchange=()=>{s.focusId=$("focus").value;s.answers={};s.questionId="";s.lever="";render();};
 ["goal","baseline","stakeholders"].forEach(k=>attachText(k,k));
 $("horizon").onchange=()=>{s.horizon=$("horizon").value;aside();};
 $("safety").onchange=()=>{s.safety=$("safety").value;render();};
 $("begin").onclick=()=>go("discover");
 $("demo").onclick=()=>{demo();go("discover");};
}
function demo(){
 const sector=A.byId[s.sectorId];s.focusId=sector.outcomes[0].id;const qs=R.questions(A,s.sectorId,s.focusId);
 s.goal=sector.outcomes[0].goal;s.baseline="Minh họa: chưa có dữ liệu chính thức, cần xác minh";s.stakeholders=sector.people;s.safety="no";s.answers={};
 qs.slice(0,3).forEach((q,i)=>s.answers[q.id]={signal:i===2?"absent":"present",source:i===0?"records":"affected",perspective:i===0?"decision":"affected",time:"months",note:"Dữ liệu mẫu; không phải tổ chức có thật."});
 s.questionId=qs[3]?.id||qs[0]?.id;s.lever=qs[0]?.id;
}
function renderDiscover(){
 const r=rep(),qs=r.list,q=qs.find(v=>v.id===s.questionId)||r.next||qs[0];s.questionId=q.id;
 const a=s.answers[q.id]||{},signal=R.answerValue(a);
 let t=head("02 / Khảo sát có thích nghi","Tìm cơ chế liên quan đến mục tiêu","Những câu hỏi này được chọn theo loại tổ chức và vấn đề đang xét, không phải danh sách câu hỏi hành vi chung.");
 t+='<div class="progressTrack"><span style="width:'+Math.round(100*r.known.length/qs.length)+'%"></span></div><p class="small">Đã phân loại '+r.known.length+'/'+qs.length+' giả thuyết · Còn '+r.missing.length+' điều chưa rõ</p>';
 t+='<div class="sideRail">'+qs.map(x=>'<button type="button" data-q="'+esc(x.id)+'" class="railItem '+(x.id===q.id?"current":R.answerValue(s.answers[x.id])!=="unknown"?"done":"")+'">'+esc(x.short)+' '+(R.answerValue(s.answers[x.id])==="unknown"?"?":"✓")+'</button>').join("")+'</div>';
 t+='<div style="border-top:1px solid #dceae3;margin:19px 0"></div><div class="miniTitle">'+esc(q.label)+'</div><p class="bigQ">'+esc(q.question)+'</p>';
 t+='<div class="choiceGrid">'+[["present","◉ Có dấu hiệu","Cần kiểm tra bằng chứng"],["absent","✓ Chưa ghi nhận","Không đồng nghĩa không có rủi ro"],["unknown","? Chưa biết","Không tự suy ra bằng 0"]].map(x=>'<button type="button" data-signal="'+x[0]+'" class="choice '+(signal===x[0]?"on":"")+'"><b>'+x[1]+'</b><span>'+x[2]+'</span></button>').join("")+'</div>';
 if(signal!=="unknown"){
 t+='<div class="evidenceDetails"><h3>Quan sát này dựa trên gì?</h3><div class="fields2">';
 t+='<div class="field"><label>Nguồn (do người dùng tự khai)</label><select id="source">'+opts([["self","Nhận định chưa kiểm chứng"],["affected","Trải nghiệm của người chịu ảnh hưởng"],["records","Tài liệu / số liệu có thể đối chiếu"],["crosschecked","Đã đối chiếu nhiều nguồn (tự khai)"]],a.source||"self")+'</select></div>';
 t+='<div class="field"><label>Góc nhìn</label><select id="perspective">'+opts([["unspecified","Chưa rõ"],["decision","Người ra quyết định"],["affected","Người chịu ảnh hưởng"],["independent","Quan sát độc lập"],["multiple","Nhiều bên (tự khai)"]],a.perspective||"unspecified")+'</select></div></div>';
 t+='<div class="fields2"><div class="field"><label>Quan sát từ khi nào?</label><select id="time">'+opts([["unknown","Chưa biết"],["recent","Gần đây"],["months","Nhiều tháng"],["years","Nhiều năm"]],a.time||"unknown")+'</select></div><div class="field"><label>Dữ kiện ngắn (không có tên riêng)</label><input id="note" maxlength="500" value="'+esc(a.note||"")+'" placeholder="Sự kiện nào có thể kiểm chứng?"></div></div><p class="helper">Không yêu cầu tải hồ sơ nhạy cảm lên website.</p></div>';
 }
 t+=buttons(btn("nextQ","Cơ chế tiếp theo →")+btn("toResults","Phân tích hiện có","light"));
 let support='<div class="hypothesis"><h3>'+esc(q.label)+'</h3><p><b>Nếu được quan sát:</b> '+esc(q.mechanism)+'</p><p><b>Hướng thử thay đổi:</b> '+esc(q.action)+'</p><p><b>Cần đo:</b> '+esc(q.measure)+'</p><p class="small">Một quan sát không chứng minh nhân quả. Cần kiểm tra các giải thích khác và dấu hiệu có thể bác bỏ.</p></div>';
 $("stageArea").innerHTML=panel("",t)+panel(head("Cơ chế đang được xem xét","Giả thuyết chứ không phải cáo buộc","Các cơ chế được chọn vì liên quan đến kết quả cần cải thiện."),support);
 document.querySelectorAll("[data-q]").forEach(el=>el.onclick=()=>{s.questionId=el.dataset.q;render();});
 document.querySelectorAll("[data-signal]").forEach(el=>el.onclick=()=>{if(el.dataset.signal==="unknown")delete s.answers[q.id];else s.answers[q.id]={...(s.answers[q.id]||{}),signal:el.dataset.signal};render();});
 ["source","perspective","time","note"].forEach(k=>{const el=$(k);if(el)el.onchange=()=>{s.answers[q.id]={...(s.answers[q.id]||{}),[k]:el.value};aside();};});
 $("nextQ").onclick=()=>{const next=R.recommendNext(qs,s.answers);if(next&&next.id!==q.id){s.questionId=next.id;render();}else if(next){const alternative=qs.find(x=>x.id!==q.id&&R.answerValue(s.answers[x.id])==="unknown");if(alternative){s.questionId=alternative.id;render();}else go("explore");}else go("explore");};
 $("toResults").onclick=()=>go("explore");
}
function diagram(r,key){
 const q=r.list.find(x=>x.id===key)||r.list[0],short=(x,n=43)=>esc(String(x).length>n?String(x).slice(0,n-1)+"…":x);
 return '<svg viewBox="0 0 900 164" class="causalSvg" role="img" aria-label="Quan sát, cơ chế giả định và kết quả cần đo; quan hệ chưa được chứng minh">'+
 '<defs><marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="none" stroke="#61887d" stroke-width="1.4"/></marker></defs>'+
 '<rect x="12" y="25" width="238" height="97" rx="11" fill="#e6f5ed" stroke="#add9cb"/><rect x="333" y="25" width="238" height="97" rx="11" fill="#fff4e7" stroke="#dec99f"/><rect x="650" y="25" width="238" height="97" rx="11" fill="#eaf1f8" stroke="#bed3e5"/>'+
 '<path d="M254 74H326 M575 74H644" fill="none" stroke="#61887d" stroke-width="2" stroke-dasharray="5 5" marker-end="url(#arr)"/>'+
 '<g font-family="system-ui,sans-serif"><text x="27" y="48" fill="#00816d" font-size="11" font-weight="700">QUAN SÁT</text><text x="27" y="78" fill="#194239" font-size="16" font-weight="700">'+short(q.short)+'</text>'+
 '<text x="348" y="48" fill="#96732e" font-size="11" font-weight="700">CƠ CHẾ CẦN KIỂM TRA</text><text x="348" y="76" fill="#564c3d" font-size="12">'+short(q.mechanism,33)+'</text>'+
 '<text x="665" y="48" fill="#446c89" font-size="11" font-weight="700">KẾT QUẢ MUỐN ĐO</text><text x="665" y="76" fill="#24485b" font-size="13">'+short(r.focus.goal,29)+'</text>'+
 '<text x="450" y="149" fill="#658078" font-size="10" text-anchor="middle">Nét đứt = giả thuyết. Không khẳng định nguyên nhân đã được xác minh.</text></g></svg>';
}
function renderExplore(){
 const r=rep();if(!s.lever||!r.list.some(x=>x.id===s.lever))s.lever=r.current[0]?.id||r.list[0]?.id;
 const q=r.list.find(x=>x.id===s.lever)||r.list[0],branches=R.branches(r,s.lever,s.plannedAction),plan=R.plan(r,s.lever);
 let t=head("03 / Phân tích nhân quả","Từ thông tin đến quyết định có thể kiểm tra","Không có điểm 50/100 và không dựng đường dự báo từ hệ số tùy ý. Công cụ hiển thị điều quan sát được, điều còn thiếu và các kịch bản có điều kiện.");
 if(r.safetyPriority)t+=warn("Ưu tiên an toàn","Không dùng mô hình để ép thử nghiệm, hòa giải thiếu an toàn hoặc thay thế chuyên gia. Nguy hiểm tức thời tại Úc: 000; 1800RESPECT: 1800 737 732.","urgent");
 t+='<div class="evidencebar"><div><b>'+r.known.length+'/'+r.list.length+'</b><small>Cơ chế đã đánh giá</small></div><div><b>'+r.documented.length+'</b><small>Mục có dữ liệu tự khai</small></div></div>';
 t+=warn(esc(r.gate),r.caveats.length?esc(r.caveats[0]):"Đủ dữ liệu tự khai ban đầu để lên kế hoạch kiểm chứng; chưa xác nhận được quan hệ nhân quả.",r.caveats.length?"amber":"");
 t+='<h3>Quan sát có tín hiệu cần kiểm tra</h3>';
 t+=r.current.length?r.current.map(v=>'<div class="metricCard"><div><b>'+esc(v.title)+'</b><small>'+esc(v.mechanism)+'</small></div><span class="status yes">Chưa kiểm chứng</span></div>').join(""):'<p class="small">Chưa có tín hiệu được xác định. Điều này không đồng nghĩa hệ thống không có vấn đề.</p>';
 t+='<h3 style="margin-top:20px">Những điểm mù</h3><ul class="listQuiet">'+r.caveats.concat(r.missing.slice(0,2).map(q=>"Chưa xem xét: "+q.label)).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>';
 let t2=head("Lý thuyết thay đổi","Mắt xích bạn muốn can thiệp","Đổi điểm can thiệp để xem phương án và kết quả cần theo dõi.");
 t2+='<div class="field"><label>Cơ chế muốn thử</label><select id="lever">'+opts(r.list.map(x=>[x.id,x.label]),s.lever)+'</select></div>'+diagram(r,s.lever);
 t2+='<div class="field" style="margin-top:14px"><label>Điều bạn muốn thay đổi (có thể sửa)</label><textarea id="plannedAction" maxlength="900" placeholder="'+esc(q.action)+'">'+esc(s.plannedAction)+'</textarea><p class="helper">Cần có đồng ý, nguồn lực, kế hoạch dừng khi rủi ro và chỉ số đo trước–sau.</p></div>';
 let t3=head("Kịch bản có điều kiện","Ba khả năng tương lai","Kết quả không phải xác suất hay số phận; mỗi nhánh có giả định phải được kiểm tra.");
 t3+='<div class="scenarioCards">'+branches.map(x=>'<div class="scenario"><b>'+esc(x.name)+'</b><span>'+esc(x.state)+'</span><p>'+esc(x.body)+'</p><p class="small"><b>Theo dõi:</b> '+esc(x.watch)+'</p></div>').join("")+'</div>';
 let t4=head("Kế hoạch can thiệp","Bắt đầu từ đâu?","Chọn biện pháp an toàn, có thể đo lường và có tiêu chí dừng.");
 t4+=plan.steps.map((x,i)=>'<div class="stepbox"><span class="stepN">'+(i+1)+'</span><div><b>'+esc(x.label)+'</b><p>'+esc(x.action)+'</p><span class="small">Kiểm tra: '+esc(x.measure)+'</span></div></div>').join("");
 t4+=buttons(btn("addCommunity","Đưa giả thuyết vào thư viện ý tưởng →")+btn("revise","Bổ sung bằng chứng","light"));
 $("stageArea").innerHTML=panel("",t)+panel("",t2)+panel("",t3)+panel("",t4);
 $("lever").onchange=()=>{s.lever=$("lever").value;s.plannedAction="";render();};
 $("plannedAction").onchange=()=>{s.plannedAction=$("plannedAction").value;render();};
 $("addCommunity").onclick=()=>go("collective");$("revise").onclick=()=>go("discover");
}
function renderCollective(){
 const r=rep();
 let t=head("04 / Trí tuệ tập thể","Con người bổ sung nguyên nhân và giải pháp","Một ý tưởng có thể bị phản bác, được giữ làm tham khảo hoặc đề nghị thử nghiệm. Phiếu bầu không phải bằng chứng khoa học.");
 t+=warn("Giới hạn hiện tại","Chỉ lưu ý tưởng trong bộ nhớ tab này. Chưa có tài khoản, chia sẻ nhiều người hay AI chuyên gia đang hoạt động.");
 t+='<div class="fields2"><div class="field"><label>Loại đóng góp</label><select id="ideaType">'+opts([["hypothesis","Giả thuyết nguyên nhân"],["counter","Phản chứng / góc nhìn khác"],["measurement","Dữ liệu cần thu thập"],["change","Giải pháp có thể thử"]],"hypothesis")+'</select></div><div class="field"><label>Mục đích</label><select id="ideaStatus">'+opts([["reference","Side Ideas — tham khảo"],["evidence","Cần thêm bằng chứng"],["trial","Đề nghị xem xét thử nghiệm"]],"reference")+'</select></div></div>';
 t+='<div class="field"><label>Tiêu đề</label><input id="ideaTitle" maxlength="180" placeholder="Nêu cơ chế hoặc thay đổi, không nêu tên người thật"></div><div class="field"><label>Bằng chứng nào ủng hộ hoặc có thể bác bỏ?</label><textarea id="ideaBody" maxlength="2400" placeholder="Điều kiện nào, kết quả nào, cách đối chiếu nào? Các tác dụng phụ cần theo dõi?"></textarea></div>';
 t+=buttons(btn("saveIdea","Lưu đề xuất trong phiên")+btn("exportCase","Xuất hồ sơ JSON","light"))+'<p class="helper" id="feedback">Không nhập dữ liệu sức khỏe, thông tin trẻ em hoặc cá nhân có thể nhận dạng.</p>';
 let ideas=s.ideas.length?s.ideas.map((x,i)=>'<div class="idea"><b>'+esc(x.title)+'</b><p>'+esc(x.body)+'</p><small>'+esc(x.type)+' · '+esc(x.status)+' · '+esc(x.sector)+'</small><div class="ideaMeta">'+[["reference","Side Ideas"],["evidence","Cần kiểm chứng"],["trial","Ủng hộ thử nghiệm"]].map(z=>'<button type="button" data-vote="'+i+'" data-to="'+z[0]+'" class="'+(x.vote===z[0]?"chosen":"")+'">'+z[1]+'</button>').join("")+'</div></div>').join(""):'<p class="small">Chưa có ý tưởng trong phiên. Có thể bắt đầu bằng một giải thích cạnh tranh với giả thuyết đang xét.</p>';
 $("stageArea").innerHTML=panel("",t)+panel(head("Ý tưởng trong phiên","Thư viện đóng góp","Các phiếu chỉ là đánh dấu riêng tại trình duyệt, không có bỏ phiếu nhiều người."),ideas)+panel(head("Điều kiện mở cộng đồng thật","Đánh giá trước, thử nghiệm sau","Cần xác thực tài khoản, kiểm duyệt, quyền riêng tư, chống gian lận, quyền phản biện và ghi nhận kết quả thực tế trước khi phát hành."),"");
 $("saveIdea").onclick=()=>{
 const title=$("ideaTitle").value.trim(),body=$("ideaBody").value.trim();
 if(title.length<10||body.length<30){$("feedback").textContent="Hãy nhập tiêu đề từ 10 ký tự và phần kiểm chứng từ 30 ký tự.";return;}
 s.ideas.unshift({title,body,type:$("ideaType").selectedOptions[0].text,status:$("ideaStatus").selectedOptions[0].text,sector:r.sector.name,vote:""});render();
 };
 $("exportCase").onclick=()=>{const blob=new Blob([R.exportSafe(s)],{type:"application/json"});const url=URL.createObjectURL(blob),el=document.createElement("a");el.href=url;el.download="civilization-lab-case-v08.json";el.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 document.querySelectorAll("[data-vote]").forEach(el=>el.onclick=()=>{s.ideas[Number(el.dataset.vote)].vote=el.dataset.to;render();});
}
function render(){aside();if(s.stage==="scope")renderScope();else if(s.stage==="discover")renderDiscover();else if(s.stage==="explore")renderExplore();else renderCollective();}
document.querySelectorAll(".navBtn").forEach(el=>el.onclick=()=>go(el.dataset.stage));
$("resetBtn").onclick=()=>{if(confirm("Xóa dữ liệu đánh giá và ý tưởng trong phiên?")){s={stage:"scope",sectorId:"company",focusId:"execution",goal:"",baseline:"",stakeholders:"",horizon:"12",safety:"unknown",answers:{},questionId:"",lever:"",plannedAction:"",ideas:[]};render();}};
dimensions();render();
})();