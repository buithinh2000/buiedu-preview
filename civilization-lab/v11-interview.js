/* Civilization Lab v1.1 — Guided Situation Interview
  Research-informed synthesis. No diagnosis, no forecast calibration, no inference that self-reports are facts.
  Locally processed on the user's browser, explicit export only. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CivInterviewV11=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const LENSES=[
{id:"purpose",name:"Mục tiêu & kết quả",description:"Điều gì được mong đợi và ai nhận được lợi ích?",question:"Trong thời gian gần đây, tổ chức có đạt được những kết quả mà các thành viên thực sự coi trọng không?",follow:"Kể một quyết định hoặc hoạt động cụ thể: muốn đạt điều gì và kết quả thực tế ra sao?",measure:"Một kết quả có thể quan sát và đối chiếu với mục tiêu.",next:["feedback","roles"]},
{id:"capacity",name:"Nguồn lực & thời gian",description:"Thời gian, tiền, sức khỏe và sức chịu đựng.",question:"Nguồn lực hiện có có đáp ứng được những việc quan trọng mà tổ chức đang đảm nhận?",follow:"Trong một việc gần nhất, có gì bị thiếu hoặc dư? Điều đó ảnh hưởng ai và trong bao lâu?",measure:"Khối lượng cần làm, nguồn lực khả dụng và khoảng thiếu hụt.",next:["roles","resilience"]},
{id:"roles",name:"Vai trò & trách nhiệm",description:"Ai phụ trách, ai ra quyết định, ai thực hiện?",question:"Khi có việc quan trọng, mọi người có biết trách nhiệm và phạm vi quyết định của mình không?",follow:"Hãy lấy một trường hợp cần phối hợp gần đây: việc được giao thế nào, ai chờ ai và kết quả?",measure:"Thời gian xử lý công việc; số lần phải chuyển giao hoặc làm lại.",next:["incentives","feedback"]},
{id:"incentives",name:"Quyết định & công bằng",description:"Quyền quyết định và hệ quả ngoài dự kiến.",question:"Các quyết định quan trọng có được giải thích rõ và có cơ hội xem xét lại khi phát sinh vấn đề?",follow:"Mô tả một quyết định gần đây, tiêu chí được dùng, người chịu ảnh hưởng và lý do được thông báo.",measure:"Tỷ lệ quyết định có tiêu chí, giải trình và xem xét phản hồi.",next:["relationships","feedback"]},
{id:"relationships",name:"Quan hệ & an toàn",description:"Sự tôn trọng, hỗ trợ và khả năng bày tỏ bất đồng.",question:"Các thành viên có thể trao đổi khó khăn hoặc quan điểm khác nhau một cách tôn trọng và an toàn?",follow:"Trong lần bất đồng gần nhất, các bên trao đổi thế nào và điều gì xảy ra sau đó?",measure:"Khả năng nói lên mối quan ngại an toàn và mức hỗ trợ phù hợp.",next:["incentives","resilience"]},
{id:"feedback",name:"Thông tin & học hỏi",description:"Tổ chức phát hiện và sửa sai nhanh đến đâu?",question:"Khi điều gì đó không diễn ra như mong đợi, tổ chức có sớm nhận biết và rút kinh nghiệm không?",follow:"Kể một sai sót hoặc phản hồi gần nhất, khi nào được phát hiện và điều gì được thay đổi.",measure:"Thời gian từ phát hiện đến hành động kiểm tra hiệu quả.",next:["purpose","roles"]},
{id:"context",name:"Môi trường bên ngoài",description:"Thị trường, cộng đồng, nhà trường, môi trường sống và dịch vụ.",question:"Những yếu tố nằm ngoài quyền kiểm soát gần đây đã tác động đến hoạt động hoặc đời sống của tổ chức như thế nào?",follow:"Nêu một biến cố cụ thể bên ngoài và phân biệt ảnh hưởng đã quan sát với suy đoán.",measure:"Sự kiện ngoại cảnh, thời điểm và những kết quả bị ảnh hưởng.",next:["capacity","resilience"]},
{id:"resilience",name:"Dự phòng & thích nghi",description:"Khả năng duy trì hoạt động khi có biến cố.",question:"Khi có thay đổi bất ngờ, mọi người có phương án thay thế và nhận được hỗ trợ phù hợp không?",follow:"Một lần bị gián đoạn gần đây đã được xử lý ra sao và mất bao lâu để ổn định lại?",measure:"Thời gian phục hồi và khả năng duy trì nhu cầu thiết yếu.",next:["capacity","relationships"]}
];
const SECTORS=[
{id:"company",name:"Doanh nghiệp",description:"Kinh doanh, quản trị, con người, khách hàng và tài chính.",order:["purpose","capacity","roles","feedback","incentives","relationships","context","resilience"],examples:{
purpose:"Lợi ích cho khách hàng; chất lượng dịch vụ; tiến độ và lợi nhuận thật",
capacity:"Dòng tiền đến hạn, số người sẵn sàng, thời gian và nguyên vật liệu",
roles:"Bàn giao dự án, phân quyền phê duyệt, trách nhiệm tại từng bước",
incentives:"Tiêu chí tuyển dụng, đề bạt, quyết định chi tiêu và xử lý bất đồng",
relationships:"Nhân viên có thể báo lỗi, khách có thể phản hồi, đối thoại an toàn",
feedback:"Sự cố, bảo hành, công nợ, lý do khách không quay lại",
context:"Biến động thị trường, thời tiết, pháp luật, lịch khách hàng và nhà cung cấp",
resilience:"Khách lớn chậm trả, người chủ chốt nghỉ, dự án phát sinh"}},
{id:"family",name:"Gia đình",description:"An toàn, nhu cầu cơ bản, chăm sóc, hỗ trợ và phúc lợi.",order:["relationships","capacity","roles","context","resilience","purpose","feedback","incentives"],examples:{
purpose:"Sự an toàn, kết nối, nhu cầu và mục tiêu khác nhau của từng thành viên",
capacity:"Thời gian chăm sóc, kinh tế, giấc ngủ, dinh dưỡng, chỗ ở",
roles:"Phân chia việc nhà, chăm sóc, người hỗ trợ, giao tiếp phù hợp lứa tuổi",
incentives:"Quy tắc trong gia đình được giải thích và thay đổi theo nhu cầu thực tế",
relationships:"Lắng nghe, sự tôn trọng, an toàn khi bày tỏ lo lắng hoặc bất đồng",
feedback:"Khi trẻ hoặc người lớn cần trợ giúp, dấu hiệu có được nhận biết và đáp ứng",
context:"Công việc, dịch vụ y tế, trường học, nhà ở và rào cản tiếp cận",
resilience:"Ốm đau, chuyển nhà, mất việc và người có thể hỗ trợ an toàn"}},
{id:"school",name:"Trường học",description:"An toàn học sinh, giáo viên, tiếp cận và tiến bộ học tập.",order:["relationships","purpose","capacity","feedback","roles","context","incentives","resilience"],examples:{
purpose:"Sự tham gia an toàn, tiến bộ học tập và nhu cầu hỗ trợ đa dạng",
capacity:"Số lượng học sinh, giờ giáo viên, điều chỉnh môi trường học tập",
roles:"Phối hợp giáo viên, học sinh, gia đình và chuyên viên hỗ trợ",
incentives:"Chỉ số thành tích có hỗ trợ cả học sinh gặp khó khăn không",
relationships:"Lắng nghe học sinh, bảo vệ người báo bắt nạt, tôn trọng khác biệt",
feedback:"Phản hồi về an toàn và việc học được xử lý nhanh đến đâu",
context:"Di chuyển, gia đình, điều kiện tiếp cận công nghệ và dịch vụ",
resilience:"Thiếu giáo viên, chuyển lớp, gián đoạn dạy học"}},
{id:"community",name:"Hội nhóm / cộng đồng",description:"Gắn kết, tham gia, mục tiêu chung và phân bổ nguồn lực.",order:["relationships","purpose","incentives","capacity","feedback","roles","context","resilience"],examples:{
purpose:"Hoạt động có tạo lợi ích cụ thể cho cộng đồng hay không",
capacity:"Thời gian tình nguyện, quỹ và mạng lưới hỗ trợ",
roles:"Ai đại diện, ai tổ chức, ai quản lý quỹ",
incentives:"Quyền phát biểu của người mới hoặc thành viên ít ảnh hưởng",
relationships:"Cách giải quyết khác biệt và hỗ trợ nhau trong nhóm",
feedback:"Ý kiến đóng góp có được phản hồi và tạo thay đổi",
context:"Địa bàn, chính sách và nhu cầu thành viên thay đổi",
resilience:"Khi người tổ chức chính rời đi, hoạt động có được duy trì"}},
{id:"nonprofit",name:"Tổ chức xã hội",description:"Sứ mệnh, người thụ hưởng, bảo vệ và hiệu quả tác động.",order:["purpose","relationships","capacity","feedback","incentives","roles","context","resilience"],examples:{
purpose:"Người được phục vụ thật sự thay đổi điều gì, không chỉ lượt hoạt động",
capacity:"Tài trợ, chi phí vận hành, người có chuyên môn, dịch vụ",
roles:"Hội đồng quản trị, thực hiện và giám sát",
incentives:"Yêu cầu nhà tài trợ và quyền lợi người thụ hưởng có xung đột không",
relationships:"Người thụ hưởng có thể góp ý và báo cáo an toàn",
feedback:"Thực hiện chương trình có được đo kết quả sau một thời gian",
context:"Nguồn tài trợ, chính sách, nhu cầu cộng đồng",
resilience:"Khi một nguồn tiền dừng, các hỗ trợ thiết yếu có tiếp tục"}},
{id:"public",name:"Cơ quan công quyền",description:"Tiếp cận dịch vụ, công bằng, phản hồi và trách nhiệm.",order:["purpose","incentives","feedback","capacity","roles","relationships","context","resilience"],examples:{
purpose:"Dịch vụ giúp người dân đạt kết quả gì, không chỉ xử lý bao nhiêu hồ sơ",
capacity:"Nhân sự, ngân sách, tải hồ sơ và công nghệ",
roles:"Trách nhiệm phê duyệt, chuyển hồ sơ giữa các bộ phận",
incentives:"Tiêu chí quyết định, minh bạch, công bằng và xung đột lợi ích",
relationships:"Người dân có thể yêu cầu giải thích, phản hồi, khiếu nại an toàn",
feedback:"Lỗi và phản hồi của dân dẫn đến thay đổi thực tế thế nào",
context:"Luật, công nghệ, dân số, ngân sách, địa lý và trợ năng",
resilience:"Khi dịch vụ gián đoạn, có kênh hỗ trợ người dân thay thế"}}
];
const byId=x=>LENSES.find(q=>q.id===x);
const sectorOf=x=>SECTORS.find(s=>s.id===x);
function create(){return {version:"1.1",sector:"company",role:"",period:"90",goal:"",answers:{},startedAt:"",note:"Self-reported, not independently verified; do not include identifying personal data."};}
function validAnswer(a){return a&&["works","mixed","difficult","unknown"].includes(a.status);}
function answered(a){return validAnswer(a)&&a.status!=="unknown";}
function next(state){
 const sector=sectorOf(state.sector)||SECTORS[0],history=Object.entries(state.answers||{}).filter(([id,a])=>answered(a)&&byId(id));
 const pending=sector.order.filter(id=>!state.answers?.[id]?.at);
 if(!pending.length)return null;
 // Start with high-coverage neutral questions, then follow linked mechanisms if challenge/mixed.
 const last=history.sort((a,b)=>(b[1].at||0)-(a[1].at||0))[0];
 if(last&&["mixed","difficult"].includes(last[1].status)){
  const linked=byId(last[0])?.next||[];
  const candidate=linked.find(id=>pending.includes(id));if(candidate)return candidate;
 }
 return pending[0];
}
function assess(state){
 const sector=sectorOf(state.sector)||SECTORS[0];
 const known=sector.order.map(id=>({lens:byId(id),a:state.answers[id]})).filter(x=>answered(x.a));
 const open=sector.order.filter(id=>!answered(state.answers[id]));
 const strengths=known.filter(x=>x.a.status==="works");
 const concerns=known.filter(x=>x.a.status==="mixed"||x.a.status==="difficult");
 const detailed=known.filter(x=>String(x.a.event||"").trim().length>=30);
 const sources=known.filter(x=>["record","multi"].includes(x.a.source));
 const perspectives=new Set(known.map(x=>x.a.voice).filter(x=>x&&x!=="unknown"));
 const blindspots=[];
 if(known.length<4)blindspots.push("Còn nhiều chiều chưa khảo sát; kết luận chỉ là thăm dò.");
 if(!strengths.length)blindspots.push("Chưa ghi nhận lĩnh vực đang vận hành tốt; nên tìm điểm mạnh và nguồn lực bảo vệ.");
 if(!detailed.length)blindspots.push("Chưa có sự kiện cụ thể có thời điểm để xem xét.");
 if(!sources.length)blindspots.push("Chưa ghi nhận tài liệu/số liệu để đối chiếu; mọi thông tin mới là lời tự khai.");
 if(perspectives.size<2)blindspots.push("Thiếu các góc nhìn khác; cần tham khảo người bị ảnh hưởng khi an toàn và tự nguyện.");
 const concernsWithEvents=concerns.filter(x=>x.a.event?.trim().length>=30);
 const first=concernsWithEvents[0]||concerns[0]||null;
 const readiness=known.length<3?"Cần hiểu thêm hiện trạng":detailed.length<2||!sources.length?"Có quan sát, chưa đủ căn cứ":"Có thể hình thành giả thuyết để kiểm chứng";
 const conditional=first?[
 {title:"A · Không chủ động thay đổi",body:"Theo dõi "+first.lens.measure+" trong thời gian đã chọn. Tổ chức vẫn có thể cải thiện hoặc xấu đi do điều kiện khác; không có xu hướng định sẵn."},
 {title:"B · Thử một thay đổi nhỏ",body:"Chọn một trở ngại gắn với "+first.lens.name.toLowerCase()+", cùng người chịu ảnh hưởng thiết kế thay đổi an toàn và quan sát "+first.lens.measure+" trước–sau. Kết quả chưa thể ước lượng nếu không có dữ liệu."},
 {title:"C · Giải thích thay thế",body:"Giả sử trở ngại chính nằm ở môi trường, nguồn lực hoặc một góc nhìn chưa được nghe. Cần đối chiếu tài liệu và phản hồi độc lập trước khi kết luận biện pháp B có ích."}
 ]:[
 {title:"A · Tiếp tục quan sát",body:"Chưa có vấn đề cụ thể được ghi nhận. Tiếp tục tìm hiểu cả thành công và khó khăn."},
 {title:"B · Bảo vệ điều đang hoạt động tốt",body:"Ghi nhận các điều kiện tạo nên điểm mạnh, tránh thay đổi gây hệ quả ngoài ý muốn."},
 {title:"C · Thu thập góc nhìn khác",body:"Hỏi những người chịu ảnh hưởng trong điều kiện an toàn, tự nguyện để phát hiện điều chưa được nhận biết."}
 ];
 return {known,open,strengths,concerns,detailed,sources,perspectives:[...perspectives],blindspots,first,readiness,conditional};
}
function interviewExport(state){
 const safe=create();
 safe.sector=sectorOf(state.sector)?.id||"company";safe.role=String(state.role||"").slice(0,150);safe.period=["30","90","365"].includes(String(state.period))?String(state.period):"90";safe.goal=String(state.goal||"").slice(0,900);
 for(const id of LENSES.map(x=>x.id)){
  const a=state.answers?.[id];if(!validAnswer(a))continue;
  safe.answers[id]={status:a.status,event:String(a.event||"").slice(0,1200),alternative:String(a.alternative||"").slice(0,500),source:["self","witness","record","multi"].includes(a.source)?a.source:"self",voice:["own","affected","observer","unknown"].includes(a.voice)?a.voice:"unknown",at:Math.max(0,Math.floor(Number(a.at)||0))};
 }
 return JSON.stringify({...safe,notice:"Câu trả lời do người dùng khai, không được kiểm chứng; chia sẻ chỉ khi có đồng ý và đã xóa thông tin nhận dạng."},null,2);
}
function readImport(text){
 if(typeof text!=="string"||text.length>150000)throw Error("INVALID_SIZE");
 const obj=JSON.parse(text);if(!obj||obj.version!=="1.1"||!sectorOf(obj.sector)||!obj.answers||typeof obj.answers!=="object"||Array.isArray(obj.answers))throw Error("INVALID_FILE");
 return JSON.parse(interviewExport(obj));
}
function toBusinessCase(state,engine){
 const report=assess(state),c=engine.createCase(),sector=sectorOf(state.sector);
 if(state.sector!=="company")throw Error("ONLY_COMPANY_SUPPORT");
 const notes=[];
 notes.push("Bản phỏng vấn định hướng (chưa kiểm chứng) cho "+sector.name+".");
 if(state.goal?.trim())notes.push("Mục tiêu tự khai: "+state.goal.trim().slice(0,500));
 for(const x of report.known){
  notes.push(x.lens.name+": "+({works:"Vận hành tương đối tốt",mixed:"Có cả điểm tốt và khó khăn",difficult:"Có trở ngại được ghi nhận"}[x.a.status])+".");
  if(x.a.event?.trim())notes.push("Ví dụ do người dùng mô tả: "+x.a.event.trim().slice(0,350));
  if(x.a.alternative?.trim())notes.push("Góc nhìn hoặc phản chứng: "+x.a.alternative.trim().slice(0,200));
 }
 c.title="Hồ sơ phỏng vấn · "+(state.goal?.trim().slice(0,68)||"Khảo sát tổ chức");
 c.description=notes.join("\n").slice(0,3900);
 const map={capacity:"cash",roles:"delivery",purpose:"customers",incentives:"people",relationships:"people",feedback:"quality",context:"customers",resilience:"delivery"};
 c.domain=map[report.first?.lens.id]||"delivery";
 const m=engine.DOMAINS.find(x=>x.id===c.domain).metric;
 c.metric=m.name;c.unit=m.unit;c.direction=m.direction;
 return c;
}
return {LENSES,SECTORS,byId,sectorOf,create,next,assess,interviewExport,readImport,toBusinessCase};
});