/* Civilization Lab v1.2 — Three-path participation framework.
 * Evidence-led exploratory model. Not an independently validated questionnaire, causal estimator or live marketplace.
 * No network calls. No unsolicited publication. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.CivHubV12=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const sectors=[
{id:"company",name:"Doanh nghiệp",publicEligible:true,focus:"Vận hành, khả năng thực thi, chất lượng và kết quả"},
{id:"community",name:"Cộng đồng / hội nhóm",publicEligible:true,focus:"Tham gia, đại diện, minh bạch và tác động"},
{id:"nonprofit",name:"Tổ chức phi lợi nhuận",publicEligible:true,focus:"Nhu cầu người thụ hưởng, trách nhiệm và kết quả"},
{id:"public",name:"Dịch vụ công / chính sách",publicEligible:true,focus:"Tiếp cận, minh bạch, phản hồi và kết quả"},
{id:"school",name:"Trường học",publicEligible:false,focus:"Sự tham gia, hỗ trợ, môi trường an toàn; chú ý dữ liệu trẻ em"},
{id:"family",name:"Gia đình",publicEligible:false,focus:"Phúc lợi, quan hệ, chăm sóc và hỗ trợ; phải bảo vệ dữ liệu riêng tư"}
];
const templates=[
{id:"workflow",sector:"company",name:"Năng lực vận hành",summary:"Hỗ trợ tổ chức thấy nút thắt, trễ hạn và việc làm lại",goal:"Công việc ổn định, ít trễ và được giao đúng chất lượng",indicator:"Tỷ lệ hoàn thành đúng hạn, theo tuần",prompts:["Khi hoàn thành công việc gần đây, những bước nào thường thuận lợi?","Ở một công việc bị chậm gần đây, điều gì xảy ra trước khi trễ?","Ai có thể giải thích một cách khác về tình trạng này?","Có dữ liệu thời gian chờ, nguồn lực hoặc nghiệm thu không?"],hypotheses:["Năng lực thực hiện không khớp khối lượng cam kết","Thông tin hoặc vật tư đến muộn","Mốc dự kiến hoặc phạm vi công việc chưa thực tế"]},
{id:"governance",sector:"company",name:"Ra quyết định & công bằng",summary:"Đánh giá quyền hạn, tiêu chí và khả năng phản biện",goal:"Quyết định có thể giải thích, phản hồi được bảo vệ",indicator:"Thời gian ra quyết định; tỷ lệ phản hồi được xử lý",prompts:["Kể lại một quyết định được mọi người hiểu và thực hiện tốt.","Kể lại một quyết định gây tranh luận: tiêu chí gì, hậu quả gì?","Người bị ảnh hưởng có thể phản hồi an toàn không?","Có ghi nhận quy trình, tiêu chí và những góc nhìn khác không?"],hypotheses:["Quyền quyết định không rõ","Tiêu chí đánh giá chưa được giải thích","Thông tin phản hồi không đến người có quyền xử lý"]},
{id:"wellbeing",sector:"family",name:"Nhu cầu & nguồn lực gia đình",summary:"Tập trung an toàn, chăm sóc, điều kiện sống và tiếng nói thành viên",goal:"Nhu cầu của thành viên được đáp ứng an toàn và phù hợp",indicator:"Nhu cầu thiết yếu được đáp ứng; tiếp cận hỗ trợ",prompts:["Trong sinh hoạt gần đây điều gì giúp các thành viên cảm thấy an toàn và được hỗ trợ?","Có nhu cầu nào chưa được đáp ứng? Khi nào, điều kiện gì?","Người khác trong nhà có thể có trải nghiệm khác thế nào?","Nguồn lực hoặc dịch vụ nào phù hợp nhưng khó tiếp cận?"],hypotheses:["Gánh chăm sóc quá lớn","Khó tiếp cận nguồn lực hoặc dịch vụ","Kỳ vọng và nhu cầu chưa được trao đổi an toàn"]},
{id:"education",sector:"school",name:"Khả năng tham gia học tập",summary:"Đánh giá môi trường học, nhu cầu hỗ trợ và tiếng nói phù hợp lứa tuổi",goal:"Học sinh có điều kiện tham gia an toàn và tiến bộ",indicator:"Mức tham gia học phù hợp; thời gian nhận hỗ trợ",prompts:["Kể một hoạt động học tập mà các em được hỗ trợ tốt.","Khi việc tham gia gặp khó khăn, tình huống bắt đầu từ đâu?","Đã lắng nghe học sinh theo cách phù hợp với độ tuổi và an toàn chưa?","Yếu tố trường lớp, gia đình, nguồn lực nào chưa được kiểm tra?"],hypotheses:["Môi trường học chưa đáp ứng nhu cầu đa dạng","Hỗ trợ bị trì hoãn","Rào cản bên ngoài lớp học"]},
{id:"participation",sector:"community",name:"Tiếng nói & gắn kết",summary:"Tìm hiểu ai có quyền tham gia và tác động đến quyết định chung",goal:"Nhiều nhóm có thể tham gia và được phản hồi",indicator:"Tỷ lệ góp ý được trả lời; sự tham gia theo nhóm",prompts:["Trong hoạt động gần đây nhóm đã phối hợp tốt ở đâu?","Ai ít xuất hiện trong các quyết định và có lý do nào khác ngoài sự thiếu quan tâm?","Ý kiến trái chiều được tiếp nhận ra sao?","Kết quả nào chứng minh hoạt động có ích cho thành viên?"],hypotheses:["Kênh tham gia thiếu thuận tiện","Thông tin đến nhóm thành viên không đồng đều","Phản hồi ít chuyển thành hành động"]},
{id:"impact",sector:"nonprofit",name:"Tác động với người thụ hưởng",summary:"Phân biệt số hoạt động và thay đổi thực tế",goal:"Chương trình cải thiện kết quả có ý nghĩa cho người được hỗ trợ",indicator:"Chỉ số kết quả người thụ hưởng chọn",prompts:["Người được hỗ trợ muốn có thay đổi gì?","Hoạt động nào đang mang lại kết quả theo lời của họ?","Có nhóm nào gặp rào cản tiếp cận không?","Kết quả có được đo lặp lại và đối chiếu với điều kiện bên ngoài không?"],hypotheses:["Thước đo đang ghi đầu ra thay vì kết quả","Nguồn lực chưa đến nhóm cần nhất","Phản hồi người thụ hưởng chưa ảnh hưởng đến thiết kế"]},
{id:"service",sector:"public",name:"Cải thiện dịch vụ công",summary:"Thử giảm thời gian chờ và tăng khả năng tiếp cận, giải trình",goal:"Người dân nhận dịch vụ đáng tin và công bằng",indicator:"Thời gian xử lý hồ sơ; khả năng tiếp cận theo nhóm",prompts:["Có quy trình nào đang phục vụ người dân hiệu quả?","Kể lại một trở ngại khi sử dụng dịch vụ, không nêu tên người thực hiện.","Rào cản liên quan thủ tục, nguồn lực hay công nghệ?","Có số liệu công khai, phản hồi hai chiều hoặc giải thích từ đơn vị quản lý không?"],hypotheses:["Quy trình nhiều bước chuyển giao","Năng lực phục vụ chưa khớp nhu cầu","Thiết kế dịch vụ chưa đủ trợ năng hoặc ngôn ngữ phù hợp"]}
];
const examples=[
{id:"demo-queue",title:"Rút ngắn thời gian chờ dịch vụ hành chính",sector:"public",topic:"Dịch vụ & tiếp cận",summary:"Tình huống giả định: một trung tâm dịch vụ muốn tìm cách giảm thời gian chờ của người dân mà không làm tăng lỗi.",outcome:"Thời gian từ nộp hồ sơ đến nhận kết quả",evidence:"Cần số liệu thời gian xử lý phân theo bước và thời điểm.",contrary:"Nguyên nhân có thể là mùa cao điểm hoặc hồ sơ phức tạp, không phải cách tổ chức nhân sự.",intervention:"Thử làm rõ hướng dẫn và phân luồng quy trình một cửa ở quy mô nhỏ.",label:"Tình huống minh họa",type:"demo"},
{id:"demo-voice",title:"Để thành viên cộng đồng có tiếng nói thực chất",sector:"community",topic:"Tham gia & niềm tin",summary:"Tình huống giả định: một hội nhóm muốn tăng tiếng nói của thành viên mới và nhóm ít tham gia.",outcome:"Số phản hồi được giải quyết và mức tham gia tình nguyện",evidence:"Cần đối chiếu lịch hoạt động và phản hồi ẩn danh từ nhóm khác nhau.",contrary:"Mức tham gia thấp có thể do lịch hoạt động hoặc giao thông.",intervention:"Thử tham vấn đa kênh và công bố cách phản hồi được xử lý.",label:"Tình huống minh họa",type:"demo"},
{id:"demo-delivery",title:"Giảm công việc chậm tiến độ trong doanh nghiệp nhỏ",sector:"company",topic:"Vận hành & nguồn lực",summary:"Tình huống giả định: một nhóm thực hiện nhiều dự án nhưng vật tư và bàn giao thường đến muộn.",outcome:"Tỷ lệ công việc hoàn thành đúng hạn",evidence:"Cần nhật ký chờ, thời điểm bàn giao vật tư và giờ làm lại.",contrary:"Trễ có thể do thời tiết hoặc tăng đột biến khối lượng việc.",intervention:"Đo nguyên nhân chờ và thử cải thiện đúng bước chậm nhất.",label:"Tình huống minh họa",type:"demo"}
];
function text(v,max=1200){return String(v==null?"":v).trim().slice(0,max);}
function templateFor(sector){return templates.filter(t=>t.sector===sector);}
function template(id){return templates.find(x=>x.id===id)||null;}
function blankCase(){return {version:"1.2",mode:"template",sector:"company",templateId:"workflow",title:"",situation:"",strength:"",incident:"",counter:"",evidence:"",affected:"",goal:"",metric:"",horizon:"90",sourceType:"personal",evidenceStatus:"unverified"};}
function assess(record){
const c=record||blankCase();const chosen=template(c.templateId)||templateFor(c.sector)[0]||templates[0];
const fields=[["situation","Mô tả hiện trạng"],["strength","Điểm đang vận hành tốt"],["incident","Tình huống cụ thể"],["counter","Góc nhìn hoặc giải thích khác"],["evidence","Nguồn thông tin kiểm tra"],["goal","Kết quả muốn thay đổi"],["metric","Thước đo kết quả"]];
const missing=fields.filter(x=>text(c[x[0]]).length<({incident:25,goal:10,metric:8,situation:20,strength:10,counter:10,evidence:10}[x[0]]||10)).map(x=>x[1]);
const flags=[];
if(c.sourceType==="personal")flags.push("Hiện mới có lời kể cá nhân; chưa đối chiếu tài liệu hay người chịu ảnh hưởng.");
if(c.evidenceStatus==="unverified")flags.push("Thông tin chưa được xác minh độc lập.");
if(c.mode==="free")flags.push("Bản tự do cần được phân loại, làm rõ thêm và kiểm tra bằng chứng trước khi dùng.");
if(c.sector==="family"||c.sector==="school")flags.push("Thông tin nhạy cảm: tránh đăng công khai nội dung nhận dạng thành viên gia đình hoặc học sinh.");
const readiness=missing.length>3?"Cần bổ sung mô tả":missing.length>0?"Giả thuyết sơ bộ":"Đủ trường để thiết kế kiểm chứng — chưa xác nhận đúng";
const h=(chosen?.hypotheses||[]).slice(0,3);
const scenarios=[
{title:"A · Không can thiệp",body:"Theo dõi "+(text(c.metric,140)||chosen.indicator)+" trong khoảng "+(c.horizon||"90")+" ngày. Kết quả có thể thay đổi do các nguyên nhân ngoài ý định."},
{title:"B · Thử thay đổi một mắt xích",body:"Thử một giải pháp nhỏ đối với "+(h[0]||"cơ chế ưu tiên")+". Chỉ đo kết quả sau khi ghi hiện trạng, rủi ro và quyền dừng thử nghiệm."},
{title:"C · Giả thuyết đối lập",body:"Nếu tác động chính do "+(h[1]||"một bối cảnh chưa xét")+" hoặc "+(text(c.counter,120)||"một nguyên nhân còn thiếu")+", hướng B có thể không cải thiện kết quả. Cần phản chứng."}
];
return {chosen,missing,flags,readiness,hypotheses:h,scenarios,needsIndependentReview:!missing.length?false:true};
}
function campaignDraft(){return {version:"1.2",id:"",title:"",sector:"community",type:"improvement",entity:"",summary:"",strength:"",observable:"",evidence:"",otherSide:"",affected:"",desired:"",measure:"",time:"90",proposal:"",risk:"",status:"private_draft",comments:[],createdAt:""};}
function validateCampaign(input){
 const x=input||campaignDraft(),sector=sectors.find(s=>s.id===x.sector),warnings=[];
 const required=[["title",12,"Mô tả mục tiêu chiến dịch"],["summary",30,"Bối cảnh cụ thể"],["observable",30,"Sự kiện hoặc điều kiện quan sát"],["otherSide",15,"Giải thích cạnh tranh / góc nhìn khác"],["desired",15,"Thay đổi mong muốn"],["measure",10,"Cách đo kết quả"],["risk",12,"Rủi ro & bảo vệ người tham gia"]];
 const missing=required.filter(([k,n])=>text(x[k]).length<n).map(a=>a[2]);
 if(!sector)warnings.push("Lĩnh vực không hợp lệ.");
 if(!sector?.publicEligible)warnings.push("Lĩnh vực gia đình và trường học không được phát hành chiến dịch nêu trường hợp riêng trong bản demo.");
 if(text(x.entity))warnings.push("Nếu nêu tên một tổ chức có thật: cần quy trình xác minh, quyền phản hồi và kiểm duyệt trước khi công khai; không suy từ lời kể thành kết luận.");
 if(!text(x.evidence))warnings.push("Chưa có bằng chứng có thể đối chiếu.");
 if(/(lừa đảo|tham nhũng|tội phạm|ăn cắp|gian lận|bạo hành|lạm dụng)/i.test([x.title,x.summary,x.observable,x.entity].join(" ")))warnings.push("Có cáo buộc nghiêm trọng hoặc nhạy cảm: chỉ xem là nội dung cần kiểm tra; không đăng công khai khi chưa qua thẩm định.");
 return {missing,warnings,canPublish:false,reason:"Bản preview không có xác thực người dùng, quyền phản hồi, kiểm duyệt hoặc hạ tầng cộng đồng. Chỉ hỗ trợ bản nháp cá nhân."};
}
function makeDraft(data){const d=campaignDraft();for(const k of ["title","sector","type","entity","summary","strength","observable","evidence","otherSide","affected","desired","measure","time","proposal","risk"]){if(k in (data||{}))d[k]=text(data[k],k==="summary"||k==="observable"?2200:1100);}
d.id="local-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);d.createdAt=new Date().toISOString();return d;}
function commentary(draft,kind,content){
if(!["idea","counter","evidence","risk"].includes(kind))throw Error("INVALID_CONTRIBUTION");
if(text(content).length<15)throw Error("CONTRIBUTION_TOO_SHORT");
const d=JSON.parse(JSON.stringify(draft));d.comments=(d.comments||[]).slice(0,50);
d.comments.push({kind,text:text(content,900),createdAt:new Date().toISOString(),status:"local_only"});
return d;}
function caseStudy(seed){const x=examples.find(z=>z.id===seed);return x||null;}
function filter(extras,query="",sector="all"){
return examples.concat(extras||[]).filter(x=>(sector==="all"||x.sector===sector)&&(!query||[x.title,x.summary,x.topic,x.sector].join(" ").toLowerCase().includes(query.trim().toLowerCase())));
}
function sanitizeRecord(obj){const x=blankCase();if(!obj||obj.version!=="1.2")throw Error("INVALID_RECORD");for(const k of Object.keys(x)){if(k==="version")continue;if(k in obj)x[k]=text(obj[k],k==="situation"||k==="incident"?3500:1500);}
if(!sectors.some(z=>z.id===x.sector))throw Error("INVALID_SECTOR");return x;}
return {sectors,templates,examples,templateFor,template,blankCase,assess,campaignDraft,validateCampaign,makeDraft,commentary,caseStudy,filter,sanitizeRecord,text};
});