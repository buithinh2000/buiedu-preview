/* Civilization Lab v1.2 — interactive entry paths and local idea marketplace */
(function(){
"use strict";
const M=window.CivHubV12,root=document.getElementById("v12-root");
if(!root||!M){if(root)root.textContent="Không tải được mô hình v1.2.";return;}
const $=id=>document.getElementById(id);
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>{if(c==="&")return "&amp;";if(c==="<")return "&lt;";if(c===">")return "&gt;";if(c==='"')return "&quot;";return "&#39;";});
const opts=(values,sel)=>values.map(x=>'<option value="'+esc(x[0])+'"'+(x[0]===sel?' selected':'')+'>'+esc(x[1])+'</option>').join("");
const field=(title,key,value,help="",large=false,placeholder="")=>'<label class="field"><span>'+esc(title)+'</span>'+(large?'<textarea data-field="'+esc(key)+'" rows="'+(large===true?3:large)+'" placeholder="'+esc(placeholder)+'">'+esc(value||"")+'</textarea>':'<input data-field="'+esc(key)+'" value="'+esc(value||"")+'" placeholder="'+esc(placeholder)+'" maxlength="1100">')+(help?'<small>'+esc(help)+'</small>':"")+'</label>';
const btn=(name,label,cls="")=>'<button type="button" class="btn '+cls+'" id="'+name+'">'+label+'</button>';
const select=(key,items,current,label)=>'<label class="field"><span>'+label+'</span><select data-field="'+key+'">'+opts(items,current)+'</select></label>';
let nav="assessment",mode="template",c=M.blankCase(),campaign=M.campaignDraft(),drafts=[],chosen="",assessmentResult=false,marketQuery="",marketSector="all",contributionMode="idea";
function displayMessage(text,kind=""){return '<div class="mini-note '+kind+'">'+esc(text)+'</div>';}
function copyForm(obj){root.querySelectorAll("[data-field]").forEach(el=>{let key=el.dataset.field;if(key&&key in obj)obj[key]=el.value;});}
function download(name,text){const blob=new Blob([text],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function setNav(n){if(nav==="assessment")copyForm(c);if(nav==="campaign")copyForm(campaign);nav=n;assessmentResult=false;chosen="";render();}
function render(){
 document.querySelectorAll("[data-nav]").forEach(el=>{el.classList.toggle("active",el.dataset.nav===nav);el.setAttribute("aria-current",el.dataset.nav===nav?"page":"false");});
 if(nav==="assessment")assessment();else if(nav==="market")market();else campaignView();
}
function assessment(){
 const selected=M.template(c.templateId)||M.templateFor(c.sector)[0]||M.templates[0];
 let html='<div class="layout"><section class="panel"><div class="eyebrow">ASSESSMENT STUDIO</div><h2>Chọn cách bạn muốn tìm hiểu hệ thống</h2><p>Không cần trả lời mọi điều ngay từ đầu. Các mô hình bên dưới là <b>khung hướng dẫn xây dựng từ nghiên cứu</b>, chưa phải thang đo chuẩn hóa được kiểm định cho cá nhân hay tổ chức.</p>';
 html+='<div class="cards"><button class="choice-card'+(mode==="template"?" selected":"")+'" data-mode="template"><span class="card-mark">OPTION 01</span><strong>Chọn mẫu đánh giá</strong><small>Được gợi ý về mục tiêu, sự kiện, điểm mạnh, nguồn dữ liệu và những góc nhìn khác</small></button>';
 html+='<button class="choice-card'+(mode==="free"?" selected":"")+'" data-mode="free"><span class="card-mark">OPTION 02</span><strong>Tôi muốn kể tự do</strong><small>Kể toàn bộ những gì đang diễn ra; sau đó hệ thống giúp cấu trúc thành giả thuyết</small></button></div>';
 html+='<div class="fields">'+select("sector",M.sectors.map(x=>[x.id,x.name]),c.sector,"Loại tổ chức")+(mode==="template"?select("templateId",M.templateFor(c.sector).map(x=>[x.id,x.name]),c.templateId,"Mẫu đánh giá"):'<div class="mini-note">Không có mẫu phù hợp? Bạn có thể dùng câu chuyện tự do, hoặc mở <a href="./legacy-v11.html">Guided Interview</a> với câu hỏi từng bước.</div>')+'</div>';
 if(mode==="template"){
 html+='<div class="mini-note"><b>Mục đích mẫu: '+esc(selected.name)+'</b><p>'+esc(selected.summary)+'</p><div class="pill-row"><span class="pill">Mục tiêu tham khảo: '+esc(selected.goal)+'</span><span class="pill">Chỉ số tham khảo: '+esc(selected.indicator)+'</span></div></div>';
 html+='<div class="section-label">Câu gợi ý giúp kể tình huống thật</div><ol class="list">'+selected.prompts.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>';
 }else{
 html+='<div class="mini-note"><b>Gợi ý để kể tự do:</b> bắt đầu từ một sự việc gần đây, nêu điều bạn trực tiếp biết, những điều đang làm tốt, điều chưa rõ và tác động thực tế. Không phải khẳng định ai sai khi chưa có bằng chứng.</div>';
 }
 html+=field("Tên vấn đề hoặc câu hỏi", "title",c.title,"Một câu ngắn về điều muốn tìm hiểu.",false,"Ví dụ: Vì sao nhiều công việc thường bị trễ?");
 html+=field(mode==="free"?"Tự kể tình trạng theo cách của bạn":"Mô tả hiện trạng, không quy kết nguyên nhân","situation",c.situation,"Bối cảnh, diễn biến, những điều đã quan sát.",5,"Kể thực tế tổ chức đang hoạt động như thế nào...");
 html+=field("Điều nào vẫn đang hoạt động tốt?","strength",c.strength,"Giúp tránh chỉ thu thập thông tin tiêu cực.",2,"Một ví dụ cụ thể về điểm mạnh hoặc điều đang giúp hệ thống vận hành...");
 html+=field("Một sự việc cụ thể gần đây","incident",c.incident,"Điều gì xảy ra, khi nào, kết quả quan sát được? Không ghi tên riêng.",3,"Lần gần đây nhất, diễn biến bắt đầu như thế nào?");
 html+=field("Người khác có thể nhìn tình huống này khác ra sao?","counter",c.counter,"Nêu ví dụ trái chiều, nguyên nhân khác hoặc điều bạn chưa biết.",2,"Điều gì có thể chứng minh cách hiểu ban đầu chưa đúng?");
 html+='<div class="fields">'+field("Thông tin nào có thể đối chiếu?","evidence",c.evidence,"Có tài liệu, dữ liệu thời gian, trải nghiệm của nhóm khác?",2,"Ví dụ: nhật ký công việc, số ngày chờ, phản hồi khách...")+field("Ai chịu tác động (theo vai trò)?","affected",c.affected,"Không ghi tên thật, thông tin trẻ em hoặc hồ sơ nhạy cảm.",2,"Ví dụ: thành viên mới, nhóm chăm sóc, khách hàng...")+'</div>';
 html+='<div class="fields">'+field("Kết quả bạn muốn cải thiện","goal",c.goal,"Mục tiêu của người dùng, không phải dự đoán của AI.",2,selected.goal)+field("Chỉ số kiểm tra thay đổi","metric",c.metric,"Hãy chọn kết quả có thể quan sát qua thời gian.",2,selected.indicator)+'</div>';
 html+='<div class="fields">'+select("horizon",[["30","30 ngày"],["90","90 ngày"],["365","1 năm"],["1095","3 năm"]],c.horizon,"Khoảng thời gian cần xem xét")+select("sourceType",[["personal","Nhận định cá nhân"],["observed","Đã trực tiếp chứng kiến"],["records","Có tài liệu/số liệu (tự khai)"],["multiple","Có nhiều góc nhìn (tự khai)"]],c.sourceType,"Nguồn diễn giải")+'</div>';
 html+='<div class="btn-row">'+btn("assessBtn","Phân tích và dựng kịch bản →","primary")+btn("exportAssessment","Xuất hồ sơ JSON","ghost")+'<a class="btn ghost" href="./legacy-v11.html">Phỏng vấn từng câu v1.1 ↗</a></div>';
 if(assessmentResult)html+=renderCaseResult(M.assess(c));
 html+='</section><aside class="panel"><div class="section-label">TẠI SAO KHUNG NÀY KHÁC CHECKLIST?</div><h3>Đánh giá theo tình huống, không chấm điểm con người</h3><p>Mô tả bằng chứng, thời điểm và góc nhìn trái ngược giúp giảm nguy cơ rút kết luận từ một cảm giác nhất thời.</p><div class="factor"><b>Quan sát</b><span>Điều đã xảy ra, khi nào, ảnh hưởng gì?</span></div><div class="factor"><b>Điểm mạnh</b><span>Điều gì đang giúp hệ thống hoạt động?</span></div><div class="factor"><b>Giả thuyết</b><span>Những cơ chế nào có thể giải thích?</span></div><div class="factor"><b>Phản chứng</b><span>Điều gì sẽ cho thấy giả thuyết sai?</span></div><div class="factor"><b>Thử thay đổi</b><span>Chỉ khi có điều kiện an toàn và có cách đo kết quả.</span></div>'+displayMessage("Trong bản tĩnh này, câu chuyện chỉ được xử lý bằng quy tắc và mẫu có sẵn. Không có AI ngôn ngữ hoặc dự báo xác suất đã kiểm định.", "warn")+'</aside></div>';
 root.innerHTML=html;
 root.querySelectorAll("[data-mode]").forEach(el=>el.onclick=()=>{copyForm(c);mode=el.dataset.mode;c.mode=mode;assessmentResult=false;render();});
 const sect=root.querySelector('[data-field="sector"]');sect.onchange=()=>{copyForm(c);c.sector=sect.value;c.templateId=M.templateFor(c.sector)[0]?.id||"";assessmentResult=false;render();};
 const tmpl=root.querySelector('[data-field="templateId"]');if(tmpl)tmpl.onchange=()=>{copyForm(c);c.templateId=tmpl.value;assessmentResult=false;render();};
 $("assessBtn").onclick=()=>{copyForm(c);c.mode=mode;assessmentResult=true;render();$("assessBtn").scrollIntoView({behavior:"smooth",block:"center"});};
 $("exportAssessment").onclick=()=>{copyForm(c);download("civilization-lab-private-assessment-v12.json",JSON.stringify(c,null,2));};
}
function renderCaseResult(r){
 return '<div class="report"><div class="eyebrow">EVIDENCE REVIEW · KHÔNG PHẢI ĐỘ CHÍNH XÁC DỰ BÁO</div><h3>'+esc(r.readiness)+'</h3>'+(r.missing.length?'<div class="mini-note warn"><b>Chưa đủ thông tin:</b><ul class="list">'+r.missing.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div>':displayMessage("Các trường cơ bản đã có thông tin; chưa có xác minh độc lập hoặc đánh giá đúng–sai."))+
 '<div class="section-label">CƠ CHẾ CẦN KIỂM TRA</div>'+r.hypotheses.map((x,i)=>'<div class="factor"><b>'+(i+1)+'. '+esc(x)+'</b><span>Giả thuyết từ khung nghiên cứu — chưa chứng minh là nguyên nhân của trường hợp này.</span></div>').join("")+
 '<div class="section-label">BA HƯỚNG TƯƠNG LAI CÓ ĐIỀU KIỆN</div><div class="report-grid">'+r.scenarios.map(x=>'<div class="scenario"><b>'+esc(x.title)+'</b><p>'+esc(x.body)+'</p></div>').join("")+'</div>'+
 '<div class="mini-note"><b>Những giới hạn quan trọng:</b><ul class="list">'+r.flags.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul><p>Đường tương lai chưa có xác suất hoặc dự báo số vì không có dữ liệu và mô hình kiểm định phù hợp.</p></div></div>';
}
function market(){
 const cards=M.filter(drafts,marketQuery,marketSector);
 root.innerHTML='<div class="panel"><div class="eyebrow">IDEA MARKETPLACE / DEMONSTRATION</div><h2>Khám phá vấn đề và đề xuất giúp hệ thống tốt hơn</h2><p>Marketplace hiện là <b>thư viện tình huống minh họa + bản nháp trong phiên</b>. Không có chiến dịch nào đã được công khai hay người tham gia thực. Khởi tạo chiến dịch để đề xuất thay đổi, không kết luận một tổ chức có tội hoặc kém cỏi.</p>'+
 '<div class="market-controls"><label class="field"><span>Tìm ý tưởng hoặc vấn đề</span><input id="marketSearch" value="'+esc(marketQuery)+'" placeholder="Ví dụ: thời gian chờ, tiến độ, phản hồi, công bằng"></label>'+
 '<label class="field"><span>Lĩnh vực</span><select id="marketSector">'+opts([["all","Tất cả"],...M.sectors.map(s=>[s.id,s.name])],marketSector)+'</select></label></div>'+
 '<div class="market-grid">'+(cards.length?cards.map(x=>'<article class="market-card"><div class="tags"><span>'+esc(M.sectors.find(s=>s.id===x.sector)?.name||x.sector)+'</span><span class="'+(x.type==="private_draft"?"draft":"")+'">'+(x.type==="private_draft"?"Bản nháp riêng tư":"Ví dụ giả định")+'</span></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.summary)+'</p>'+btn("ignore","Xem đề xuất →","ghost").replace('id="ignore"','data-open="'+esc(x.id)+'"')+'</article>').join(""):'<div class="empty">Không có tình huống khớp bộ lọc.</div>')+'</div></div>'+
 (chosen?renderMarketDetail(chosen):"")+
 '<div class="panel"><div class="eyebrow">GÓP Ý CÓ TRÁCH NHIỆM</div><h2>Một vấn đề có thể có nhiều góc nhìn</h2><p>Các chiến dịch thật trong tương lai cần quyền phản hồi của bên được nhắc đến, xác thực người đóng góp, kiểm duyệt, kiểm tra bằng chứng và lịch sử thay đổi có thể truy vết. Không đánh đồng số phiếu ủng hộ với độ đúng.</p>'+btn("goCampaign","Tạo bản nháp chiến dịch của bạn →","primary")+'</div>';
 $("marketSearch").oninput=el=>{marketQuery=el.target.value;const cursor=el.target.selectionStart;market();$("marketSearch").focus();$("marketSearch").setSelectionRange(cursor,cursor);};
 $("marketSector").onchange=el=>{marketSector=el.target.value;chosen="";market();};
 root.querySelectorAll("[data-open]").forEach(el=>el.onclick=()=>{chosen=el.dataset.open;market();$("market-detail")?.scrollIntoView({behavior:"smooth",block:"start"});});
 $("goCampaign").onclick=()=>setNav("campaign");
 const modeEl=$("commentMode"),noteEl=$("commentText"),saveEl=$("saveComment");
 if(modeEl&&noteEl&&saveEl)saveEl.onclick=()=>{
  const data=drafts.find(x=>x.id===chosen),seed=M.caseStudy(chosen);if(!data){$("commentResult").textContent="Bạn đang xem một tình huống minh họa. Đóng góp mẫu chỉ lưu trong phiên hiện tại; trước tiên hãy tạo bản nháp riêng nếu muốn ghi ý tưởng.";return;}
  try{const updated=M.commentary(data,modeEl.value,noteEl.value),idx=drafts.findIndex(x=>x.id===chosen);drafts[idx]=updated;market();$("market-detail")?.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){$("commentResult").textContent="Hãy mô tả đóng góp cụ thể ít nhất 15 ký tự."; }
 };
}
function renderMarketDetail(id){
 const seed=M.caseStudy(id),draft=drafts.find(x=>x.id===id),x=seed||draft;if(!x)return "";
 const props=seed?{outcome:seed.outcome,evidence:seed.evidence,otherSide:seed.contrary,proposal:seed.intervention}:{outcome:draft.desired,evidence:draft.evidence,otherSide:draft.otherSide,proposal:draft.proposal};
 const comments=draft?.comments||[];
 return '<section class="panel" id="market-detail"><div class="eyebrow">'+(seed?"EXAMPLE · NOT A REAL CAMPAIGN":"PRIVATE DRAFT · ONLY IN THIS BROWSER TAB")+'</div><h2>'+esc(x.title)+'</h2><p>'+esc(x.summary)+'</p>'+
 '<div class="fields"><div><div class="factor"><b>Mục tiêu mong muốn</b><span>'+esc(props.outcome)+'</span></div><div class="factor"><b>Bằng chứng cần kiểm tra</b><span>'+esc(props.evidence||"Chưa được cung cấp")+'</span></div></div><div><div class="factor"><b>Giải thích khác / phản biện</b><span>'+esc(props.otherSide)+'</span></div><div class="factor"><b>Phương án có thể thử</b><span>'+esc(props.proposal||"Chưa xác định")+'</span></div></div></div>'+
 '<div class="flow-tags">'+["Đề xuất","Kiểm tra nguồn","Phản biện đa chiều","Thử nghiệm an toàn","Đo kết quả"].map((z,i)=>'<span'+(i===0?' class="active"':"")+'>'+esc(z)+'</span>').join("")+'</div>'+
 '<div class="mini-note warn">Đây chưa phải cuộc thảo luận công khai. Không hiển thị lượt ủng hộ, người tham gia hay bằng chứng đã được xác minh khi chưa có dịch vụ cộng đồng thực sự.</div>'+
 '<h3>Ý kiến phản biện trong phiên ('+comments.length+')</h3>'+(comments.length?comments.map(n=>'<div class="note-list"><strong>'+esc({idea:"Giải pháp",counter:"Phản chứng",evidence:"Dữ kiện",risk:"Rủi ro"}[n.kind]||n.kind)+'</strong><p>'+esc(n.text)+'</p></div>').join(""):'<p class="small">Chưa có phản hồi đã lưu trong phiên này.</p>')+
 '<div class="fields">'+select("commentKind",[["idea","Gợi ý giải pháp"],["counter","Phản biện / nguyên nhân khác"],["evidence","Bằng chứng cần tìm"],["risk","Rủi ro cần bảo vệ"]],"idea","Kiểu đóng góp")+
 field("Nội dung đóng góp (chỉ lưu cục bộ)","commentBody","","",3,"Gợi ý một giả thuyết cụ thể, cách kiểm tra hoặc biện pháp có thể đo.")+'</div>'+
 '<div class="btn-row"><button id="saveComment" class="btn primary">Ghi đóng góp trong phiên</button>'+(draft?btn("exportDraft","Xuất bản nháp JSON","ghost"):"")+'</div><div id="commentResult" class="small"></div></section>';
}
function campaignView(){
 const sector=M.sectors.find(s=>s.id===campaign.sector)||M.sectors[1];
 const v=M.validateCampaign(campaign);
 root.innerHTML='<div class="layout"><section class="panel"><div class="eyebrow">CREATE CAMPAIGN · PRIVATE DRAFT</div><h2>Tạo một đề xuất cải thiện có trách nhiệm</h2><p>Thay vì đăng “tổ chức này tệ”, hãy mô tả <b>điều quan sát được, thay đổi muốn đạt, lý do có thể khác và cách kiểm chứng</b>. Có thể đề xuất cho một dịch vụ hoặc tổ chức có thật, nhưng bản này không được công khai.</p>'+
 '<div class="fields">'+select("sector",M.sectors.map(s=>[s.id,s.name]),campaign.sector,"Loại hệ thống")+
 select("type",[["improvement","Đề xuất cải thiện"],["research","Mở nghiên cứu nguyên nhân"],["scenario","Khám phá tương lai giả định"]],campaign.type,"Mục đích chiến dịch")+'</div>'+
 field("Tên chiến dịch — viết dưới dạng mục tiêu thay đổi","title",campaign.title,"Không dùng tiêu đề để kết luận cá nhân hoặc tổ chức vi phạm.",false,"Ví dụ: Làm sao giảm thời gian chờ dịch vụ?")+
 field("Bối cảnh hoặc tổ chức liên quan (không bắt buộc)","entity",campaign.entity,"Nếu nêu tên thật, cần quyền phản hồi và kiểm duyệt trước khi đưa lên mạng.",false,"Có thể để trống và dùng mô tả ẩn danh")+
 field("Bối cảnh và lý do cần cải thiện","summary",campaign.summary,"Lời kể chưa phải kết luận được xác minh.",4,"Ai đang gặp trở ngại, trong hoàn cảnh nào?")+
 '<div class="fields">'+field("Điều hiện đang hoạt động tốt","strength",campaign.strength,"Lấy cả điểm mạnh để tránh định kiến.",3,"Điều nào đang giúp tổ chức vận hành?")+
 field("Sự kiện quan sát cụ thể","observable",campaign.observable,"Khi nào? Ở bước nào? Có thể đối chiếu ra sao?",3,"Điều thực tế bạn đã thấy hoặc có thể kiểm tra.")+'</div>'+
 '<div class="fields">'+field("Nguồn dữ kiện có thể đối chiếu","evidence",campaign.evidence,"Nếu chưa có, viết điều cần thu thập.",3,"Số liệu công khai, nhật ký, phản hồi...")+
 field("Một giải thích hoặc quan điểm trái chiều","otherSide",campaign.otherSide,"Bắt buộc xem nguyên nhân cạnh tranh trước khi kết luận.",3,"Nếu chúng ta hiểu sai, vì sao?")+'</div>'+
 '<div class="fields">'+field("Nhóm chịu ảnh hưởng (vai trò, không tên người)","affected",campaign.affected,"Không nhập hồ sơ cá nhân.",2,"Người sử dụng dịch vụ, thành viên mới...")+
 field("Kết quả mong muốn","desired",campaign.desired,"Ưu tiên kết quả quan sát được.",2,"Cải thiện điều gì cho ai?")+'</div>'+
 '<div class="fields">'+field("Cách đo kết quả","measure",campaign.measure,"Ví dụ thời gian chờ hoặc tỷ lệ phản hồi.",2)+
 select("time",[["30","30 ngày"],["90","90 ngày"],["180","180 ngày"],["365","1 năm"]],campaign.time,"Chu kỳ theo dõi")+'</div>'+
 field("Biện pháp thử thay đổi / đề xuất","proposal",campaign.proposal,"Chưa tự thực thi. Chỉ thử khi an toàn, có thẩm quyền và sự đồng ý cần thiết.",3)+
 field("Rủi ro, quyền phản hồi và tiêu chí dừng","risk",campaign.risk,"Đề cập khả năng gây hiểu lầm, trả đũa, mất an toàn hoặc tác dụng phụ.",3)+
 '<div class="btn-row">'+btn("reviewCampaign","Rà soát trước khi lưu","primary")+btn("saveCampaign","Lưu bản nháp riêng","ghost")+btn("showMarket","Xem Marketplace →","ghost")+'</div>'+
 '<div id="campaignFeedback">'+campaignReport(v)+'</div></section><aside class="panel"><div class="section-label">CHU TRÌNH ĐỀ XUẤT CỘNG ĐỒNG</div><h3>Đầu tiên phải có đề xuất kiểm chứng được</h3><div class="flow-tags">'+["1. Xác định vấn đề","2. Kiểm tra dữ kiện","3. Quyền phản hồi","4. Thảo luận và sửa","5. Thử nghiệm có giới hạn","6. Theo dõi kết quả"].map(x=>'<span>'+esc(x)+'</span>').join("")+'</div>'+
 displayMessage("Bản nháp mặc định là riêng tư. Không có nút Công khai vì preview chưa có xác thực, kiểm duyệt, phòng chống lạm dụng và quyền phản hồi của tổ chức được nhắc đến.","warn")+
 '<p class="small">Tương lai nền tảng nên có ba không gian độc lập: vấn đề của tổ chức tự đánh giá, đề xuất xã hội công khai đã được kiểm duyệt, và phòng thí nghiệm kịch bản ẩn danh.</p>'+
 '<h3>Những việc cần có trước khi mở công khai</h3><ul class="list"><li>Xác thực, quản trị vai trò và chống spam</li><li>Kiểm duyệt cáo buộc, bảo vệ người liên quan</li><li>Quyền phản hồi và cơ chế khiếu nại</li><li>Nhật ký phiên bản và nguồn chứng cứ</li><li>Biểu quyết không quyết định sự thật</li><li>Không cho đăng thông tin riêng tư của trẻ em/gia đình</li></ul></aside></div>';
 $("reviewCampaign").onclick=()=>{copyForm(campaign);$("campaignFeedback").innerHTML=campaignReport(M.validateCampaign(campaign));$("campaignFeedback").scrollIntoView({behavior:"smooth",block:"nearest"});};
 $("saveCampaign").onclick=()=>{copyForm(campaign);const v=M.validateCampaign(campaign);const draft=M.makeDraft(campaign);draft.type="private_draft";draft.topic="Đề xuất trong phiên";draft.summary=campaign.summary;drafts.unshift(draft);chosen=draft.id;campaign=M.campaignDraft();nav="market";market();document.querySelectorAll("[data-nav]").forEach(x=>x.classList.toggle("active",x.dataset.nav==="market"));$("market-detail")?.scrollIntoView({behavior:"smooth",block:"start"});};
 $("showMarket").onclick=()=>setNav("market");
 const sel=root.querySelector('[data-field="sector"]');sel.onchange=()=>{copyForm(campaign);campaign.sector=sel.value;render();};
}
function campaignReport(v){
return '<div class="report"><h3>Điểm cần kiểm tra trước khi chuyển thành chiến dịch thật</h3>'+
 (v.missing.length?'<ul class="campaign-check">'+v.missing.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':displayMessage("Các mục mô tả tối thiểu đã có, nhưng dữ kiện và cáo buộc chưa được xác minh."))+
 (v.warnings.length?'<div class="mini-note warn"><ul class="list">'+v.warnings.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul></div>':"")+
 displayMessage("Trạng thái: Bản nháp riêng tư. Không thể phát hành từ GitHub Pages tĩnh. "+v.reason)+'</div>';
}
document.querySelectorAll("[data-nav]").forEach(x=>x.onclick=()=>setNav(x.dataset.nav));
render();
})();