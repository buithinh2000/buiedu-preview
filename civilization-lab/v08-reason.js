(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CivReasonV08=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
function safeText(x){return String(x??"").slice(0,1500);}
function getFocus(atlas,sectorId,focusId){const s=atlas.byId[sectorId];if(!s)throw Error("SECTOR_NOT_FOUND");const f=s.outcomes.find(o=>o.id===focusId)||s.outcomes[0];return {sector:s,focus:f};}
function questions(atlas,sectorId,focusId){
 const {sector,focus}=getFocus(atlas,sectorId,focusId);
 const result=focus.dims.map((id,i)=>{const dim=atlas.dimensions.find(d=>d.id===id);const probe=sector.probes[id];return {id,label:dim.label,short:dim.short,color:dim.color,question:probe[0],mechanism:probe[1],action:probe[2],measure:probe[3],rank:i};});
 return result;
}
function answerValue(a){return a&&["present","absent"].includes(a.signal)?a.signal:"unknown";}
function recommendNext(list,answers){
 const pending=list.filter(x=>answerValue(answers[x.id])==="unknown");if(!pending.length)return null;
 const active=list.filter(x=>answerValue(answers[x.id])==="present");
 // Prefer the next mechanism connected in the focus' sequence when a signal appears.
 if(active.length){const recent=active[active.length-1];const next=pending.find(x=>x.rank>recent.rank);if(next)return next;}
 return pending[0];
}
function assess({atlas,sectorId,focusId,answers={},goal="",baseline="",safety="unknown",stakeholders="",horizon="12"}){
 const {sector,focus}=getFocus(atlas,sectorId,focusId),list=questions(atlas,sectorId,focusId);
 const known=list.filter(x=>answerValue(answers[x.id])!=="unknown");
 const signals=list.filter(x=>answerValue(answers[x.id])==="present");
 const notObserved=list.filter(x=>answerValue(answers[x.id])==="absent");
 const documented=list.filter(x=>answerValue(answers[x.id])!=="unknown"&&["records","crosschecked"].includes(answers[x.id].source));
 const views=new Set(known.map(q=>answers[q.id]?.perspective).filter(x=>x&&x!=="unspecified"));
 const current=signals.map((x)=>({id:x.id,title:x.short,mechanism:x.mechanism,action:x.action,measure:x.measure,source:answers[x.id]?.source||"self",perspective:answers[x.id]?.perspective||"unspecified",time:answers[x.id]?.time||"unknown"}));
 const caveats=[];
 if(known.length<2)caveats.push("Chưa đánh giá đủ các cơ chế: cần thêm ít nhất hai quan sát để hình thành giả thuyết sơ bộ.");
 if(!baseline.trim())caveats.push("Thiếu đường cơ sở đo kết quả hiện tại (một con số hoặc mô tả có mốc thời gian).");
 if(documented.length===0)caveats.push("Chưa có nguồn ghi chép/dữ liệu được khai báo. Cần xác minh độc lập trước khi kết luận.");
 if(views.size<2)caveats.push("Đang thiếu nhiều góc nhìn: chỉ đánh giá từ một người có thể bỏ sót hoặc làm sai lệch vấn đề.");
 if(signals.length===0)caveats.push("Chưa có cơ chế nào được ghi nhận là hiện diện; không có nghĩa là mọi thứ đều ổn.");
 if(safety==="unknown")caveats.push("Chưa sàng lọc an toàn; cần ưu tiên xác định có rủi ro cấp bách hay không.");
 const safetyPriority=safety==="yes";
 const gate=safetyPriority?"Ưu tiên an toàn":known.length<2?"Cần khảo sát":baseline.trim()&&documented.length>0&&views.size>=2?"Có thể lập kế hoạch kiểm chứng":"Giả thuyết sơ bộ";
 const missing=questions(atlas,sectorId,focusId).filter(q=>answerValue(answers[q.id])==="unknown");
 const selected=current[0]||null;
 const horizonLabel={"3":"3 tháng","12":"12 tháng","36":"3 năm","120":"10 năm"}[horizon]||"12 tháng";
 return {sector,focus,list,known,signals,notObserved,documented,views:[...views],current,selected,missing,caveats,gate,safetyPriority,hasBaseline:!!baseline.trim(),horizonLabel,next:recommendNext(list,answers),goal:safeText(goal),baseline:safeText(baseline),stakeholders:safeText(stakeholders)};
}
function branches(report, selectedId, plannedAction){
 const chosen=report.current.find(x=>x.id===selectedId)||report.selected;
 const action=plannedAction?.trim()||chosen?.action||"Chỉ thu thập dữ liệu trước khi thử can thiệp";
 const metric=chosen?.measure||report.focus.metric, h=report.horizonLabel;
 return [
 {name:"A · Không thay đổi có chủ đích",state:"Đối chứng quan sát",body:"Trong "+h+", theo dõi "+metric+". Tình hình có thể tốt lên, xấu đi hoặc giữ nguyên vì những yếu tố ngoài kế hoạch; nhánh này không mang nghĩa chắc chắn sẽ suy giảm.",watch:"Theo dõi yếu tố bên ngoài, biến cố và cách đo có thay đổi không."},
 {name:"B · Thử thay đổi trọng tâm",state:"Thử nghiệm có điều kiện",body:"Thực hiện: "+action+". Nếu cơ chế đang xét thực sự góp phần gây vấn đề và biện pháp được triển khai phù hợp, "+metric+" có thể cải thiện. Cũng có thể không đổi hoặc có tác dụng phụ.",watch:"Ghi mức hiện tại, thời điểm bắt đầu, mức triển khai và kiểm tra dấu hiệu ngoài ý muốn."},
 {name:"C · Giả thuyết nguyên nhân khác",state:"Phản biện mô hình",body:"Giả sử nguyên nhân chính nằm ở nguồn lực, môi trường bên ngoài hoặc một cơ chế chưa được đo. Khi đó can thiệp B có thể không tạo kết quả kỳ vọng; cần bổ sung bằng chứng từ nguồn khác trước khi nhân rộng.",watch:"Tìm bằng chứng trái ngược và so sánh với một trường hợp/tình huống tương đồng nếu phù hợp."}
 ];
}
function plan(report,selectedId){
 const c=report.current.find(x=>x.id===selectedId)||report.selected;
 if(report.safetyPriority)return {
  urgent:true,steps:[
  {label:"Ngay lúc này",action:"Ưu tiên bảo vệ người có nguy cơ, không dùng mô phỏng làm công cụ gây áp lực hoặc thay thế hỗ trợ chuyên môn.",measure:"Xác định phương án an toàn và cách liên hệ hỗ trợ phù hợp."},
  {label:"Sau khi an toàn",action:"Chỉ đánh giá và thảo luận với người liên quan khi bảo đảm sự đồng ý và an toàn.",measure:"Chất lượng hỗ trợ thực tế, không phải số người đồng ý."}
 ]};
 return {urgent:false,steps:[
  {label:"Khảo sát",action:"Đặt câu hỏi cho người bị tác động và đối chiếu tài liệu, bối cảnh, sự kiện xảy ra trước–sau.",measure:"Ít nhất một nguồn thông tin khác, sự kiện có mốc thời gian."},
  {label:"Thử nhỏ",action:c?c.action:"Kiểm tra một yếu tố có thể thay đổi với rủi ro thấp.",measure:c?c.measure:report.focus.metric},
  {label:"Đánh giá",action:"So sánh với đường cơ sở và nguyên nhân thay thế; dừng hoặc sửa nếu không hiệu quả hay xuất hiện tác dụng phụ.",measure:report.focus.metric}
 ]};
}
function exportSafe(state){return JSON.stringify({schema:"civilization-lab/0.8",note:"Assessment is locally entered, unverified, not a validated forecast. Only share with consent.",sectorId:state.sectorId,focusId:state.focusId,goal:state.goal,baseline:state.baseline,horizon:state.horizon,safety:state.safety,stakeholders:state.stakeholders,answers:state.answers,ideas:state.ideas||[]},null,2);}
return {getFocus,questions,answerValue,recommendNext,assess,branches,plan,exportSafe};
});