/* Civilization Lab v1.4 — campaign governance review rehearsal, NOT actual moderation/publication. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CivGovernanceUIV14=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const G=typeof module==="object"&&module.exports?require("./v14-governance.js"):(typeof globalThis!=="undefined"?globalThis.CivReviewV14:null);
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>c==="&"?"&amp;":c==="<"?"&lt;":c===">"?"&gt;":c==='"'?"&quot;":"&#39;");
const labels={private_draft:"Bản nháp riêng",evidence_needed:"Đang bổ sung bằng chứng",response_planned:"Chuẩn bị quyền phản hồi",ready_for_human_review:"Hồ sơ chờ thẩm định bên ngoài",on_hold:"Tạm giữ để xem xét",archived:"Đã lưu trữ"};
const roleLabels={affected:"Người chịu ảnh hưởng",organization:"Góc nhìn tổ chức",independent:"Người quan sát độc lập",observer:"Góc nhìn khác"};
const sel=(arr,value)=>arr.map(([v,t])=>'<option value="'+esc(v)+'"'+(v===value?' selected':'')+'>'+esc(t)+'</option>').join("");
const need=record=>G.assess(record);
function panel(record){
 if(!record||record.kind!=="campaign")return "";
 const state=G.sanitize(record.review),gate=need(record),alternatives=G.TRANSITIONS[state.phase]||[];
 return '<div class="v14-review" id="v14-review"><div class="section-label">04 · CAMPAIGN SAFETY & RIGHT OF REPLY</div>'+
 '<h3>Chuẩn bị kiểm duyệt và phản biện công bằng</h3><div class="mini-note warn"><strong>CHỈ MÔ PHỎNG QUY TRÌNH NỘI BỘ</strong><p>Không gửi lời mời phản hồi, không xác minh danh tính, không có người kiểm duyệt thật và <b>không có bước công bố chiến dịch</b>. Tất cả câu trả lời ở đây đều là lời do người sử dụng nhập.</p></div>'+
 '<div class="v14-state"><span>Giai đoạn hiện tại (trên thiết bị)</span><strong>'+esc(labels[state.phase])+'</strong><small>'+gate.passed+'/'+gate.checks.length+' điều kiện khai báo được đáp ứng · KHÔNG PHẢI mức xác thực</small></div>'+
 '<div class="v14-gates">'+gate.checks.map(c=>'<div class="v14-gate"><span class="'+(c.pass?"complete":"missing")+'">'+(c.pass?"✓":"○")+'</span><div><b>'+esc(c.label)+'</b><p>'+esc(c.detail)+'</p></div></div>').join("")+'</div>'+
 '<div class="v14-meta"><label class="v14-check"><input type="checkbox" id="v14-privacy"'+(state.privacyReviewed?" checked":"")+'> Tôi đã tự kiểm tra nguy cơ tiết lộ thông tin riêng tư (chưa có kiểm duyệt độc lập)</label>'+
 '<label class="v14-check"><input type="checkbox" id="v14-reply-ack"'+(state.replyProtocolReviewed?" checked":"")+'> Tôi đã xem xét cách mời tổ chức liên quan phản hồi khi phù hợp (CHƯA gửi lời mời)</label></div>'+
 '<label class="field"><span>Phương án trao đổi / mời phản hồi (chỉ ghi quy trình, không ghi dữ liệu cá nhân)</span><textarea id="v14-contact-plan" rows="2" maxlength="700" placeholder="Ví dụ: đề xuất gửi câu hỏi trung lập qua kênh liên hệ công khai sau khi được người kiểm duyệt phê duyệt.">'+esc(state.contactPlan)+'</textarea></label>'+
 '<button type="button" id="v14-save-plan" class="btn ghost">Lưu kế hoạch phản hồi</button>'+
 '<h3 style="margin-top:24px">Các góc nhìn cần được lắng nghe</h3><p>Để tránh câu chuyện chỉ có một bên, lưu các <b>góc nhìn do bạn tự mô tả</b>. Không được ghi là lời tuyên bố thật của người khác hoặc đại diện tổ chức khi họ chưa xác nhận.</p>'+
 (state.perspectives.length?state.perspectives.map((p,i)=>'<div class="v14-perspective"><div><b>'+esc(roleLabels[p.role])+'</b><p>'+esc(p.statement)+'</p><small>'+esc(p.possibleCounterexample||"Chưa ghi điều có thể bác bỏ")+' · <b>chưa xác minh người phát biểu</b></small></div><button type="button" class="v13-smallbutton" data-v14-remove="'+i+'">Xóa</button></div>').join(""):'<div class="empty">Chưa có góc nhìn khác trong hồ sơ.</div>')+
 '<div class="fields"><label class="field"><span>Đang mô tả góc nhìn của ai? (theo vai trò)</span><select id="v14-role">'+sel(Object.entries(roleLabels),"affected")+'</select></label><label class="field"><span>Thời điểm quan sát (tùy chọn)</span><input type="date" id="v14-date"></label></div>'+
 '<label class="field"><span>Cách nhìn có thể có (không được mạo nhận phát biểu của người khác)</span><textarea id="v14-statement" rows="3" placeholder="Người bị ảnh hưởng có thể gặp trở ngại gì? Tại sao nhóm khác nhìn vấn đề khác?" maxlength="1100"></textarea></label>'+
 '<div class="fields"><label class="field"><span>Điều có thể chứng minh góc nhìn này không đầy đủ</span><textarea id="v14-counter" rows="2" maxlength="500"></textarea></label><label class="field"><span>Điều cần xác minh / nguồn dự kiến</span><textarea id="v14-source" rows="2" maxlength="450"></textarea></label></div>'+
 '<button type="button" id="v14-add-view" class="btn primary">Ghi góc nhìn tự khai</button>'+
 '<div class="report"><h3>Điểm chặn trước khi có thể xét duyệt thật</h3><p>'+esc(gate.blocking.length?gate.blocking.length+" mục cần bổ sung hoặc kiểm tra.":"Đã điền đủ các điều kiện cơ bản; chưa có xác thực độc lập.")+'</p>'+
 (gate.blocking.length?'<ul class="list">'+gate.blocking.map(x=>'<li>'+esc(x.label)+'</li>').join("")+'</ul>':"")+
 '<div class="fields"><label class="field"><span>Giai đoạn thử tiếp theo (không công bố)</span><select id="v14-next">'+sel([["","Chọn bước tiếp theo"],...alternatives.map(x=>[x,labels[x]])],"")+'</select></label><label class="field"><span>Lý do chuyển bước / tạm giữ</span><textarea id="v14-reason" rows="2" maxlength="400" placeholder="Giải thích một lý do cụ thể, không quy tội."></textarea></label></div>'+
 '<div class="btn-row"><button type="button" class="btn primary" id="v14-move">Ghi quyết định vào lịch sử cục bộ</button><button type="button" class="btn ghost" id="v14-export">Xuất gói thông tin chờ kiểm duyệt JSON</button></div>'+
 '<p class="small">Đây là lịch sử chỉnh sửa trên thiết bị, không chống giả mạo và không phải hồ sơ kiểm toán đáng tin cậy. Muốn công khai cần hệ thống backend và người kiểm duyệt độc lập.</p>'+
 '<h3>Lịch sử quyết định cục bộ</h3>'+
 (state.events.length?state.events.slice().reverse().map(x=>'<div class="v14-event"><small>'+esc(x.at)+' · '+esc(labels[x.from])+' → '+esc(labels[x.to])+'</small><p>'+esc(x.reason)+'</p></div>').join(""):'<div class="empty">Chưa có quyết định nào được ghi.</div>')+'</div></div>';
}
function bind(scope,record,onSave,onMessage){
 if(!record||record.kind!=="campaign")return;
 const $=id=>scope.querySelector("#"+id),state=G.sanitize(record.review);
 const submit=fn=>{try{const updated=fn();onSave(updated);onMessage("Đã cập nhật quy trình xét duyệt trong bộ nhớ riêng. Không có chiến dịch hoặc email nào được gửi.");}catch(e){onMessage("Không cập nhật được: "+String(e.message||e),true);}};
 $("v14-save-plan").onclick=()=>submit(()=>G.sanitize({...state,contactPlan:$("v14-contact-plan").value,privacyReviewed:$("v14-privacy").checked,replyProtocolReviewed:$("v14-reply-ack").checked}));
 $("v14-add-view").onclick=()=>submit(()=>G.addPerspective(state,{role:$("v14-role").value,statement:$("v14-statement").value,possibleCounterexample:$("v14-counter").value,sourceClaim:$("v14-source").value,date:$("v14-date").value}));
 scope.querySelectorAll("[data-v14-remove]").forEach(b=>b.onclick=()=>{if(!confirm("Xóa góc nhìn tự khai này?"))return;submit(()=>G.sanitize({...state,perspectives:state.perspectives.filter((x,i)=>i!==Number(b.dataset.v14Remove))}));});
 $("v14-move").onclick=()=>submit(()=>G.transition({...record,review:state},$("v14-next").value,$("v14-reason").value));
 $("v14-export").onclick=()=>{
  const packet=G.composePacket({...record,review:state}),url=URL.createObjectURL(new Blob([JSON.stringify(packet,null,2)],{type:"application/json"})),a=document.createElement("a");
  a.href=url;a.download="civilization-lab-internal-review-packet-v14.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
  onMessage("Đã xuất gói thông tin tự khai. Đây không phải phê duyệt hoặc hồ sơ đã được kiểm duyệt.");
 };
}
return {panel,bind,labels};
});