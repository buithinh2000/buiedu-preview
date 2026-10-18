/* Civilization Lab v1.0 — Evidence and learning review.
 * All outputs are descriptive and conditional. No causal attribution, invented probabilities or AI claims.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CivReviewV10=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const clip=(v,n=600)=>String(v==null?"":v).trim().slice(0,n);
const validNum=(x)=>x!==null&&x!==""&&x!==undefined&&Number.isFinite(Number(x));
function inspect(c,model){
 if(!c||!model)throw Error("INVALID_CASE");
 const reviewed=model.review(c);
 const q=reviewed.evaluated||[];
 const answered=q.reduce((sum,h)=>sum+h.answered,0);
 const count=q.reduce((sum,h)=>sum+h.total,0);
 const supporting=q.filter(h=>h.yes>0),mixed=q.filter(h=>h.state==="mixed"),weak=q.filter(h=>h.state==="weakened");
 const documentary=q.reduce((sum,h)=>sum+h.claimedDocuments,0);
 const observed=(c.observations||[]).filter(x=>validNum(x.value)&&/^\d{4}-\d{2}-\d{2}$/.test(String(x.date))).slice().sort((a,b)=>a.date.localeCompare(b.date));
 const hasBaseline=validNum(c.baseline);
 const value=hasBaseline?Number(c.baseline):null;
 const latest=observed.length?observed[observed.length-1]:null;
 const start=c.experiment?.start||"",end=c.experiment?.end||"";
 const post=start?observed.filter(x=>x.date>=start):[];
 const pre=start?observed.filter(x=>x.date<start):[];
 const oneSided=answered>0&&documentary===0;
 const timelineReady=hasBaseline&&observed.length>=3&&post.length>=2;
 const evidenceQuality=(answered===0?"Chưa khảo sát":oneSided?"Mới có lời khai/nhận định":"Có nguồn tài liệu được tự khai, chưa xác minh độc lập");
 const checks=[
 {id:"problem",label:"Mô tả vấn đề cụ thể",pass:clip(c.description).length>=35,next:"Ghi biểu hiện, thời điểm và người chịu ảnh hưởng theo vai trò."},
 {id:"rivals",label:"Đã kiểm tra từ hai giả thuyết trở lên",pass:q.filter(x=>x.answered>0).length>=2,next:"Đánh giá ít nhất một giải thích thay thế."},
 {id:"source",label:"Có tài liệu hoặc số liệu để đối chiếu",pass:documentary>=1,next:"Thu thập số liệu, hồ sơ hoặc xác minh từ bên độc lập; không nhập PII vào demo."},
 {id:"baseline",label:"Ghi đường cơ sở đo được",pass:hasBaseline,next:"Ghi chỉ số trước thay đổi, với đơn vị và thời điểm."},
 {id:"safety",label:"Đã định nghĩa điều kiện dừng thử nghiệm",pass:!!clip(c.experiment?.stop),next:"Xác định điều kiện dừng nếu gây hại hoặc vượt giới hạn."},
 {id:"monitor",label:"Có ít nhất ba lần đo, gồm hai lần sau ngày bắt đầu",pass:timelineReady,next:"Ghi dữ liệu có ngày thực tế và hoàn cảnh khi đo."}
 ];
 const signal=!hasBaseline||!latest?null:latest.value-value;
 const direction=c.direction==="down"?"down":"up";
 const favorable=signal===null?null:signal===0?"unchanged":((direction==="up"?signal>0:signal<0)?"favorable":"unfavorable");
 const issues=[];
 if(oneSided)issues.push("Các tín hiệu mới là lời tự khai, cần đối chiếu từ nhiều nguồn.");
 if(mixed.length)issues.push("Có giả thuyết với dữ kiện mâu thuẫn; cần kiểm tra trước khi chọn giải pháp.");
 if(!hasBaseline)issues.push("Thiếu đường cơ sở nên không thể đo thay đổi.");
 if(c.experiment?.status==="active"&&!(c.experiment?.stop||"").trim())issues.push("Thử nghiệm đang chạy chưa có tiêu chí dừng rõ ràng.");
 if(post.length<2)issues.push("Chưa đủ các mốc sau can thiệp để đánh giá xu hướng.");
 if(observed.length>=2){const dates=new Set(observed.map(x=>x.date));if(dates.size<observed.length)issues.push("Có nhiều số liệu cùng ngày; cần thống nhất cách tổng hợp trước khi so sánh.");}
 if(latest&&end&&latest.date>end)issues.push("Dữ liệu mới nhất nằm sau ngày kết thúc dự kiến; kiểm tra thời điểm và phạm vi đo.");
 const next=checks.filter(x=>!x.pass).slice(0,3);
 return {q,answered,count,supporting,mixed,weak,documentary,evidenceQuality,checks,hasBaseline,observed,pre,post,latest,signal,favorable,issues,next,timelineReady,complete:checks.filter(x=>x.pass).length,metadata:{title:clip(c.title,150),domain:clip(c.domain,35),metric:clip(c.metric,160),unit:clip(c.unit,25),status:clip(c.experiment?.status,20)}};
}
function reviewOutcome(c,model){
 const r=inspect(c,model);
 if(!r.latest)return {headline:"Chưa có kết quả đo sau thay đổi",detail:"Thiết lập chỉ số hiện tại và ghi các mốc theo dõi thực tế."};
 if(!r.hasBaseline)return {headline:"Đã có dữ liệu, chưa so sánh được",detail:"Cần giá trị đường cơ sở hợp lệ để tính độ thay đổi."};
 const delta=r.signal,unit=clip(c.unit,35),signed=delta>0?"+"+delta:String(delta);
 const lines="Thay đổi so với mốc đầu: "+signed+" "+unit+".";
 if(r.favorable==="favorable")return {headline:"Quan sát đi theo hướng mong muốn",detail:lines+" Đây là tương quan theo thời gian, KHÔNG chứng minh can thiệp gây ra thay đổi."};
 if(r.favorable==="unfavorable")return {headline:"Quan sát đi ngược hướng mong muốn",detail:lines+" Cần kiểm tra hiệu quả, tác dụng phụ, thay đổi đồng thời và cân nhắc dừng/sửa biện pháp."};
 return {headline:"Quan sát chưa thay đổi",detail:lines+" Cần xác định đủ thời gian và tính phù hợp của chỉ số."};
}
function reportMarkdown(c,model){
 const r=inspect(c,model),outcome=reviewOutcome(c,model);
 const line=[];
 line.push("# Civilization Lab — Báo cáo rà soát quyết định");
 line.push("");
 line.push("**Cảnh báo phương pháp:** Báo cáo dựa trên dữ liệu do người dùng tự khai. Không phải kết luận nhân quả, xác minh độc lập, tư vấn pháp lý/tài chính hay dự báo đã kiểm định.");
 line.push("");
 line.push("## Hồ sơ");
 line.push("- Vấn đề: "+clip(c.title,150));
 line.push("- Lĩnh vực: "+clip(c.domain,40));
 line.push("- Mô tả: "+clip(c.description,2000));
 line.push("- Chỉ số: "+clip(c.metric,150)+" ("+clip(c.unit,30)+"), hướng mong muốn: "+(c.direction==="down"?"giảm":"tăng"));
 line.push("- Đường cơ sở: "+(r.hasBaseline?String(c.baseline):"chưa biết"));
 line.push("- Mục tiêu: "+(validNum(c.target)?String(c.target):"chưa đặt"));
 line.push("");
 line.push("## Giả thuyết và nguồn bằng chứng");
 for(const h of r.q){line.push("### "+clip(h.name,250));line.push("- Tình trạng: "+h.state+"; "+h.answered+"/"+h.total+" câu có dữ kiện, "+h.claimedDocuments+" mục tự khai có tài liệu.");line.push("- Cơ chế giả định: "+clip(h.mechanism,500));line.push("- Bằng chứng phản bác cần tìm: "+clip(h.disconfirm,500));}
 line.push("");
 line.push("## Thử nghiệm");
 line.push("- Biện pháp: "+clip(c.experiment?.action,1200));
 line.push("- Trách nhiệm theo vai trò: "+clip(c.experiment?.owner,120));
 line.push("- Thời gian: "+clip(c.experiment?.start,20)+" → "+clip(c.experiment?.end,20));
 line.push("- Điều kiện dừng: "+clip(c.experiment?.stop,550));
 line.push("- Rủi ro ngoài dự kiến: "+clip(c.experiment?.risks,550));
 line.push("");
 line.push("## Quan sát và kết quả");
 line.push("**"+outcome.headline+".** "+outcome.detail);
 for(const o of r.observed){line.push("- "+o.date+": "+o.value+" "+clip(c.unit,30)+" — "+clip(o.note,300));}
 if(!r.observed.length)line.push("- Chưa có số liệu theo thời gian.");
 line.push("");
 line.push("## Những điều chưa đủ căn cứ");
 for(const item of r.issues.concat(r.next.map(x=>x.next)))line.push("- "+clip(item,350));
 if(!r.issues.length&&!r.next.length)line.push("- Vẫn cần phương pháp đối chứng và đánh giá tác dụng phụ trước khi khẳng định nguyên nhân.");
 line.push("");
 line.push("## Các bước xem xét tiếp");
 line.push("1. Tìm dữ liệu có thể đối chiếu và quan điểm của người chịu ảnh hưởng nếu an toàn, tự nguyện.");
 line.push("2. So sánh các cơ chế thay thế, không chỉ giả thuyết đang ưu tiên.");
 line.push("3. Xem biến cố đồng thời; tiếp tục đo theo một chỉ số và định nghĩa ổn định.");
 line.push("4. Sửa hoặc dừng can thiệp nếu không hiệu quả hoặc tạo nguy cơ.");
 line.push("");
 line.push("Civilization Lab v1.0 — báo cáo được tạo từ hồ sơ do người dùng nhập, chưa được AI hoặc chuyên gia kiểm định.");
 return line.join("\n");
}
return {inspect,reviewOutcome,reportMarkdown};
});