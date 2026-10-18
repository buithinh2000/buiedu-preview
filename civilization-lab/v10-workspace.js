/* Civilization Lab v1.0 workspace — manual local case saving, audit & review.
 * Data remains in browser only; no server calls, no persistence without explicit opt-in.
 */
(function(){
"use strict";
const bridge=window.CivStudioBridgeV09,P=window.CivPortfolioV10,A=window.CivReviewV10;
if(!bridge||!P||!A){const el=document.getElementById("v10-workspace");if(el)el.textContent="Không tải được chức năng quản lý hồ sơ.";return;}
const $=id=>document.getElementById(id),clean=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;":"&#39;"}[c]));
let activeId=null,showDetails=false,showReport=false;
function notice(text,error=false){$("v10-message").textContent=text;$("v10-message").style.color=error?"#b44438":"#176e5e";}
function c(){return bridge.getCase();}
function canLoad(){return typeof localStorage!=="undefined";}
function download(name,data,mime){const blob=new Blob([data],{type:mime}),link=document.createElement("a"),url=URL.createObjectURL(blob);link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function portfolio(){
 if(!canLoad())throw Error("STORAGE_BLOCKED");
 return P.list(localStorage,bridge.model);
}
function refreshPortfolio(){
 let data=[];
 try{data=portfolio();}catch(err){notice("Không thể đọc danh sách hồ sơ: "+err.message+". Không tự ghi đè dữ liệu cũ.",true);}
 $("v10-count").textContent=data.length+" hồ sơ đã lưu trên thiết bị";
 $("v10-current").textContent=activeId?"Đang mở hồ sơ đã lưu · các thay đổi cần bấm Lưu cập nhật":"Hồ sơ trong phiên · chưa gắn với mục lưu";
 const list=$("v10-case-list");
 if(!showDetails){list.hidden=true;return;}
 list.hidden=false;
 list.innerHTML=data.length?data.map(x=>'<article class="caseItem"><div><strong>'+clean(x.title)+'</strong><small>'+clean(x.domain)+' · '+clean(x.observations)+' lần đo · '+clean(x.updatedAt.slice(0,10))+'</small></div><div class="caseButtons"><button type="button" data-load="'+clean(x.id)+'">Mở</button><button type="button" class="remove" data-delete="'+clean(x.id)+'">Xóa</button></div></article>').join(""):'<p class="v10-small">Chưa có hồ sơ đã lưu. Hồ sơ hiện tại vẫn có thể dùng mà không lưu lại.</p>';
 list.querySelectorAll("[data-load]").forEach(btn=>btn.onclick=()=>{
  if(!confirm("Mở hồ sơ đã lưu? Những chỉnh sửa chưa lưu của hồ sơ đang mở sẽ không được giữ lại."))return;
  try{const chosen=P.open(localStorage,bridge.model,btn.dataset.load);activeId=btn.dataset.load;bridge.setCase(chosen);notice("Đã mở hồ sơ. Những thay đổi tiếp theo chỉ được lưu khi bạn bấm Lưu cập nhật.");refresh();}catch(err){notice("Không mở được hồ sơ: "+err.message,true);}
 });
 list.querySelectorAll("[data-delete]").forEach(btn=>btn.onclick=()=>{
  if(!confirm("Xóa vĩnh viễn bản hồ sơ này khỏi thiết bị? Hãy xuất bản sao lưu nếu cần."))return;
  try{P.remove(localStorage,bridge.model,btn.dataset.delete);if(activeId===btn.dataset.delete)activeId=null;notice("Đã xóa bản lưu. Nếu đang mở, dữ liệu chỉ còn trong phiên cho đến khi đóng trang.");refresh();}catch(err){notice("Không xóa được: "+err.message,true);}
 });
}
function saveCase(){
 try{
  const draft=c();
  if(!draft.description||draft.description.trim().length<10){notice("Hãy mô tả vấn đề trước khi lưu.",true);return;}
  if(!draft.domain)draft.domain=bridge.model.detect(draft.description).first;
  if(!draft.title)draft.title=draft.description.trim().slice(0,80);
  if(!draft.metric){const m=bridge.model.DOMAINS.find(x=>x.id===draft.domain)?.metric;if(m){draft.metric=m.name;draft.unit=m.unit;draft.direction=m.direction;}}
  const result=P.save(localStorage,bridge.model,draft,activeId);
  activeId=result.id;notice("Đã lưu hồ sơ trên thiết bị của bạn. Dữ liệu chưa được chia sẻ hay xác minh.");refresh();
 }catch(err){notice("Không lưu được hồ sơ: "+err.message,true);}
}
function nextStatus(done){return done?"Đã ghi nhận":"Cần bổ sung";}
function audit(){
 const main=$("v10-audit");if(!main)return;
 const draft=c(),r=A.inspect(draft,bridge.model),result=A.reviewOutcome(draft,bridge.model);
 const checklist=r.checks.map(x=>'<div class="auditCheck"><span class="'+(x.pass?"pass":"pending")+'">'+(x.pass?"✓":"○")+'</span><div><strong>'+clean(x.label)+'</strong><small>'+clean(x.pass?nextStatus(true):x.next)+'</small></div></div>').join("");
 const issues=r.issues.length?'<div class="v10-risk"><strong>Điểm cần xem xét</strong><ul>'+r.issues.slice(0,4).map(x=>'<li>'+clean(x)+'</li>').join("")+'</ul></div>':"";
 const headline='<div class="v10-overview"><strong>'+clean(result.headline)+'</strong><p>'+clean(result.detail)+'</p></div>';
 main.innerHTML='<div class="v10-head">EVIDENCE & LEARNING AUDIT</div><h3>Độ hoàn chỉnh của hồ sơ</h3>'+
 '<p class="v10-small">Đây là checklist thu thập thông tin, không phải thang điểm sức khỏe doanh nghiệp hay chứng nhận độ chính xác.</p>'+
 '<div class="v10-progress"><span style="width:'+Math.round(100*r.complete/r.checks.length)+'%"></span></div><div class="v10-sub"><span>'+r.complete+'/'+r.checks.length+' bước có dữ liệu</span><span>'+r.answered+' quan sát từ '+r.q.length+' giả thuyết</span></div>'+
 '<p class="v10-small"><b>Bằng chứng:</b> '+clean(r.evidenceQuality)+'.</p>'+
 '<div class="v10-checks">'+checklist+'</div>'+headline+issues+
 '<button id="v10-report" class="v10-action" type="button">Tạo báo cáo & tải Markdown ↓</button>'+
 '<p class="v10-small">Báo cáo chứa thông tin do bạn nhập. Kiểm tra trước khi chia sẻ.</p>';
 $("v10-report").onclick=()=>{showReport=!showReport;let box=$("v10-report-box");if(!box){box=document.createElement("div");box.id="v10-report-box";main.appendChild(box);}if(!showReport){box.innerHTML="";return;}const data=A.reportMarkdown(c(),bridge.model);
 box.innerHTML='<div class="v10-reporthead"><strong>Báo cáo kiểm tra</strong><button type="button" id="v10-downloadReport">Tải .md</button></div><textarea aria-label="Nội dung báo cáo" readonly rows="11">'+clean(data)+'</textarea>';
 $("v10-downloadReport").onclick=()=>{download("civilization-lab-decision-review-v10.md",data,"text/markdown;charset=utf-8");notice("Đã xuất báo cáo. Báo cáo không xác nhận nguyên nhân và chưa được chuyên gia thẩm định.");};
 };
}
function refresh(){refreshPortfolio();audit();}
function initialize(){
 const root=$("v10-workspace");
 root.innerHTML='<div class="v10-heading"><div><span class="v10-head">CASE WORKSPACE / V1.0</span><h2>Hồ sơ quyết định của bạn</h2><p>Quản lý nhiều vấn đề, thử giải pháp và đo kết quả theo thời gian. Chỉ lưu khi bạn yêu cầu — <b>không tải dữ liệu lên server</b>.</p></div><span class="v10-tag">LƯU CỤC BỘ · TÙY CHỌN</span></div>'+
 '<div class="v10-buttons">'+
 '<button type="button" id="v10-save" class="v10-primary">Lưu hồ sơ hiện tại</button>'+
 '<button type="button" id="v10-show">Danh sách hồ sơ</button>'+
 '<button type="button" id="v10-new">Tạo hồ sơ mới</button>'+
 '<button type="button" id="v10-backup">Xuất bản sao lưu</button>'+
 '<label class="v10-upload">Nhập bản sao lưu <input id="v10-import" type="file" accept=".json,application/json" /></label>'+
 '</div><div class="v10-footer"><span id="v10-count">0 hồ sơ</span><span id="v10-current">Hồ sơ trong phiên</span></div>'+
 '<div id="v10-case-list" hidden></div><p id="v10-message" role="status" class="v10-small" aria-live="polite"></p>'+
 '<p class="v10-privacy">Lưu trên thiết bị không có mã hóa riêng; ai dùng cùng trình duyệt có thể đọc. Không lưu tên, dữ liệu nhân viên hay thông tin bí mật vào bản preview.</p>';
 $("v10-save").onclick=saveCase;
 $("v10-show").onclick=()=>{showDetails=!showDetails;$("v10-show").textContent=showDetails?"Ẩn danh sách":"Danh sách hồ sơ";refreshPortfolio();};
 $("v10-new").onclick=()=>{if(!confirm("Tạo hồ sơ mới? Hãy bấm Lưu hồ sơ hiện tại nếu bạn muốn giữ các thay đổi."))return;activeId=null;bridge.newCase();notice("Đã tạo hồ sơ mới. Chưa tự lưu.");refresh();};
 $("v10-backup").onclick=()=>{try{download("civilization-lab-local-portfolio-v10.json",P.backup(localStorage,bridge.model),"application/json");notice("Đã xuất toàn bộ hồ sơ trên thiết bị. File sao lưu không được mã hóa.");}catch(err){notice("Không xuất được: "+err.message,true);}};
 $("v10-import").onchange=async event=>{
  try{const file=event.target.files[0];if(!file)return;if(file.size>P.MAX_BYTES)throw Error("FILE_TOO_LARGE");
  if(!confirm("Khôi phục bản sao lưu sẽ THAY THẾ tất cả hồ sơ Civilization Lab v1.0 đã lưu trên thiết bị này. Tiếp tục?"))return;
  const n=P.restore(localStorage,bridge.model,await file.text());activeId=null;notice("Đã nhập "+n+" hồ sơ vào thiết bị. Chọn Danh sách hồ sơ để mở.");refresh();
  }catch(err){notice("Bản sao lưu không hợp lệ, không thay đổi hồ sơ: "+err.message,true);}
  finally{event.target.value="";}
 };
 refresh();
}
window.addEventListener("civlab:case-render",()=>{audit();refreshPortfolio();});
initialize();
})();