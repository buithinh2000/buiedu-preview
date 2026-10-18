(function(){
"use strict";
var $=id=>document.getElementById(id), clamp=(n,a,b)=>Math.min(b,Math.max(a,n)),safe=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function q(id,group,title,description,action,measure,positive){return {id,group,title,description,action,measure,positive:!!positive};}
var sectors={
 company:{name:"Doanh nghiệp",objective:"Hiệu quả, công bằng và khả năng tồn tại",cases:[
 q("nepotism","Lãnh đạo & nhân sự","Ưu tiên người thân/người quen thiếu năng lực","Bổ nhiệm không qua tiêu chuẩn rõ ràng; năng lực hoặc kết quả thực hiện nhiệm vụ không tương xứng với chức vụ.","Công bố tiêu chí tuyển chọn, kiểm tra năng lực, quản lý xung đột lợi ích và đánh giá sau bổ nhiệm.","Tỷ lệ vị trí có đánh giá công khai"),
 q("flattery","Lãnh đạo & nhân sự","Thăng tiến nhờ nịnh lãnh đạo hơn là thành tích","Người thường xuyên tán thành lãnh đạo được thưởng hoặc giao quyền hơn người có kết quả thực tế.","Đo kết quả công việc độc lập, lấy phản hồi nhiều chiều, thử hội đồng đánh giá.","Mức phù hợp giữa KPI và quyết định bổ nhiệm"),
 q("retaliation","Lãnh đạo & nhân sự","Người góp ý, phản biện bị trù dập","Ý kiến có dẫn chứng bị gạt bỏ; người báo rủi ro bị loại khỏi công việc hoặc đối xử bất lợi.","Thiết lập kênh góp ý được bảo vệ và kiểm tra độc lập trường hợp bị trả đũa.","Tỷ lệ phản biện được xử lý minh bạch"),
 q("opacity","Quản trị","Chi tiêu và các quyết định quan trọng thiếu minh bạch","Các thay đổi ngân sách hay hợp đồng không có giải trình hoặc người giám sát độc lập.","Thiết lập phê duyệt nhiều cấp, sổ quyết định và kiểm tra định kỳ.","Tỷ lệ chi tiêu có chứng từ/phê duyệt"),
 q("turnover","Con người","Người có năng lực rời bỏ tổ chức liên tục","Nhân sự giỏi nghỉ việc và lý do lặp lại không được điều tra một cách ẩn danh.","Phỏng vấn nghỉ việc bảo mật, công khai lộ trình nghề nghiệp và sửa vấn đề lặp lại.","Tỷ lệ nghỉ việc tự nguyện theo quý"),
 q("overload","Vận hành","Nhân viên quá tải, quy trình hay đổ lỗi","Công việc không rõ trách nhiệm; thời gian tăng ca lớn, sai sót lặp lại.","Phân định vai trò, giới hạn việc đang làm và thử quy trình bàn giao.","Giờ làm quá mức; tỷ lệ lỗi lặp lại"),
 q("cash","Tài chính","Dòng tiền thiếu ổn định","Chậm lương, nợ đến hạn, chi phí tăng nhưng chưa có dự báo hoặc quỹ dự phòng.","Dự báo dòng tiền 13 tuần và chốt thứ tự ưu tiên thanh toán.","Số tuần dự trữ tiền mặt"),
 q("fairness","Điểm mạnh bảo vệ","Có hệ thống đánh giá minh bạch và công bằng","Có tiêu chí tuyển chọn, công nhận đóng góp và cơ chế xử lý khiếu nại.","Duy trì kiểm toán công bằng và công bố biện pháp khắc phục.","Tỷ lệ quyết định có tiêu chí rõ ràng",true)
 ]},
 family:{name:"Gia đình",objective:"An toàn, gắn kết và sự phát triển phù hợp với nhu cầu từng thành viên",cases:[
 q("couple_conflict","Quan hệ vợ chồng / người chăm sóc","Xung đột, chỉ trích hoặc lạnh nhạt kéo dài","Mâu thuẫn thường diễn ra trước mặt trẻ, giao tiếp đổ lỗi hoặc hai người tránh nói chuyện những vấn đề quan trọng.","Khi an toàn, thống nhất cách trao đổi không công kích, đặt thời gian đối thoại và tìm hỗ trợ quan hệ nếu cần.","Số xung đột leo thang; mức cảm thấy an toàn khi nói chuyện"),
 q("coercion","An toàn gia đình","Có dấu hiệu đe dọa, kiểm soát hoặc bạo lực","Một người sợ bị đe dọa, cô lập, kiểm soát tiền/điện thoại, bị ép buộc hoặc tổn thương. Đây là vấn đề an toàn, không phải tranh luận bình thường.","Ưu tiên kế hoạch an toàn và dịch vụ hỗ trợ chuyên môn; không khuyên đối thoại chung khi có cưỡng ép hoặc bạo lực.","Có thể tiếp cận hỗ trợ an toàn hay không"),
 q("care_load","Cha mẹ / người chăm sóc","Trách nhiệm chăm sóc mất cân bằng","Một người gần như gánh toàn bộ việc chăm con, việc nhà và quyết định, dẫn đến kiệt sức.","Lập danh sách nhiệm vụ thực tế và phân chia lại dựa trên thời gian, sức khỏe và nguồn lực.","Thời gian chăm sóc không được hỗ trợ mỗi tuần"),
 q("parenting_conflict","Cha mẹ / người chăm sóc","Người lớn bất đồng về cách chăm sóc con","Các quy tắc và cách phản ứng với trẻ trái ngược, tranh cãi trước mặt trẻ hoặc gây cảm giác bất an.","Trao đổi về mục tiêu chung và thống nhất 2–3 phản ứng nhất quán, linh hoạt theo nhu cầu của trẻ.","Số tình huống chăm sóc có thỏa thuận chung"),
 q("finance","Kinh tế gia đình","Không đủ nguồn lực cho chi phí thiết yếu","Tiền thuê nhà, thực phẩm, y tế, hóa đơn hoặc chi phí học tập gây căng thẳng lặp lại.","Lập ngân sách thiết yếu, xem hỗ trợ tài chính phù hợp và ưu tiên nhu cầu cơ bản.","Tỷ lệ chi phí thiết yếu được đáp ứng đúng hạn"),
 q("debt","Kinh tế gia đình","Nợ và thu nhập không ổn định","Nợ đến hạn, thiếu quỹ dự phòng, thu nhập lên xuống làm gia tăng áp lực giữa các thành viên.","Đánh giá dòng tiền hộ gia đình, trao đổi với dịch vụ tư vấn tài chính có thẩm quyền.","Số tuần chi phí cơ bản dự phòng được"),
 q("housing","Môi trường sống","Chỗ ở thiếu ổn định hoặc thiếu không gian an toàn","Chuyển nhà thường xuyên, đông người vượt khả năng sinh hoạt, khó duy trì giấc ngủ và học tập.","Ưu tiên sự ổn định, khu vực nghỉ ngơi và tiếp cận hỗ trợ nhà ở khi cần.","Số lần chuyển nhà; tình trạng không gian học/ngủ"),
 q("generations","Văn hóa & quan hệ mở rộng","Khác biệt kỳ vọng giữa các thế hệ gây mâu thuẫn","Ví dụ: ông bà và cha mẹ bất đồng về kỷ luật, vai trò giới, lựa chọn học tập; vấn đề nằm ở xung đột kỳ vọng, không nằm ở xuất thân vùng miền.","Thỏa thuận ranh giới, quyền quyết định chăm sóc và cách lắng nghe các thế hệ.","Mức độ đồng thuận về quyết định chính"),
 q("school","Con cái & giáo dục","Trẻ lo âu, né tránh hoặc khó đến trường","Khó đến trường kéo dài có thể liên quan bắt nạt, lo âu, khó khăn học tập, đặc điểm thần kinh hoặc môi trường trường học.","Lắng nghe trẻ, kiểm tra an toàn và phối hợp nhà trường, GP/chuyên gia khi phù hợp; tránh mặc định trẻ lười.","Số buổi tham gia học an toàn; mức căng thẳng trước giờ học"),
 q("bullying","Con cái & giáo dục","Trẻ gặp bắt nạt, cô lập hoặc không được tôn trọng","Trẻ kể về việc bị cô lập, đe dọa hoặc bị xử lý không công bằng trong nhóm bạn/trường học.","Ghi nhận sự việc và phối hợp nhà trường bảo đảm an toàn, xây dựng hỗ trợ bạn bè.","Số vụ được xử lý; cảm nhận an toàn của trẻ"),
 q("neuro_support","Phát triển & hỗ trợ","Nhu cầu hỗ trợ của trẻ tự kỷ hoặc khác biệt phát triển chưa được đáp ứng","Ví dụ: trẻ cần môi trường ít kích thích, hỗ trợ giao tiếp, cách học khác hoặc điều chỉnh sinh hoạt nhưng chưa có đáp ứng phù hợp. Tự kỷ không phải do cách nuôi dạy gây ra.","Hỏi nhu cầu và điểm mạnh của trẻ; phối hợp chuyên gia phù hợp, trường học và các dịch vụ hỗ trợ dựa trên bằng chứng.","Mức tham gia sinh hoạt/học tập phù hợp với mục tiêu của trẻ"),
 q("time","Gắn kết","Thiếu thời gian lắng nghe và tương tác tích cực","Người lớn và trẻ ít có thời gian trò chuyện không bị gián đoạn, nhu cầu của thành viên khó được ghi nhận.","Dành khoảng thời gian đều đặn phù hợp thực tế để lắng nghe, chơi hoặc sinh hoạt chung.","Số lần trao đổi tích cực/tuần"),
 q("trusted","Điểm mạnh bảo vệ","Có ít nhất một người lớn đáng tin cậy hỗ trợ trẻ","Trẻ có thể tìm người lắng nghe và tôn trọng mình khi gặp khó khăn.","Duy trì kết nối ổn định và kênh giúp trẻ bày tỏ mong muốn an toàn.","Mức tiếp cận người hỗ trợ đáng tin cậy",true),
 q("support","Điểm mạnh bảo vệ","Gia đình tiếp cận được hỗ trợ phù hợp","Có thể nhận giúp đỡ từ người thân an toàn, nhà trường, GP, dịch vụ cộng đồng hoặc hỗ trợ phát triển khi cần.","Xác định đầu mối hỗ trợ, rào cản chi phí/đi lại/ngôn ngữ và điều chỉnh kế hoạch.","Thời gian chờ và khả năng sử dụng dịch vụ",true)
 ]},
 community:{name:"Hội nhóm / cộng đồng",objective:"Niềm tin, đóng góp và hoạt động bền vững",cases:[
 q("elite","Quản trị","Nhóm nhỏ nắm mọi quyền quyết định","Thành viên thường không được tham vấn; người có ảnh hưởng chi phối nguồn lực.","Thử quy trình biểu quyết và công khai xung đột lợi ích.","Tỷ lệ quyết định có tham gia"),
 q("exclusion","Thành viên","Thành viên mới bị gạt ra ngoài","Người mới không có cơ hội lên tiếng hoặc nhận hỗ trợ.","Thiết kế hướng dẫn tham gia và người đỡ đầu.","Mức tham gia của người mới"),
 q("conflict","Văn hóa","Mâu thuẫn bị cá nhân hóa","Thay vì tranh luận bằng chứng, thành viên công kích nhau.","Thử quy tắc thảo luận và hòa giải tự nguyện.","Số tranh chấp được giải quyết"),
 q("fund","Nguồn lực","Quỹ nhóm chi tiêu không rõ ràng","Không có báo cáo thu chi, quyền giám sát thấp.","Công khai quỹ và phân quyền phê duyệt.","Tỷ lệ chi có đối soát"),
 q("solidarity","Điểm mạnh bảo vệ","Có hỗ trợ và lòng tin giữa thành viên","Thành viên sẵn sàng hỗ trợ và chấp nhận phản biện.","Duy trì cơ chế lắng nghe.","Điểm phản hồi ẩn danh",true)
 ]},
 school:{name:"Trường học",objective:"An toàn, học tập và công bằng",cases:[
 q("safety","An toàn","Bắt nạt và tổn thương chưa được xử lý","Các báo cáo bị xem nhẹ hoặc không có phản hồi.","Thiết lập báo cáo an toàn và hỗ trợ học sinh.","Tỷ lệ sự việc được xử lý"),
 q("access","Học tập","Học sinh có nhu cầu khác biệt thiếu hỗ trợ","Điều chỉnh chương trình và môi trường học còn thiếu.","Đánh giá nhu cầu cùng gia đình và chuyên gia phù hợp.","Khả năng tham gia học tập"),
 q("stress","Nhân sự","Giáo viên quá tải","Thời gian chuẩn bị và hỗ trợ học sinh không đủ.","Đánh giá phân bổ công việc.","Giờ làm quá mức"),
 q("voice","Quản trị","Phản hồi học sinh không được lắng nghe","Cơ chế góp ý thiếu an toàn.","Thử hội đồng và phản hồi minh bạch.","Tỷ lệ phản hồi được giải quyết"),
 q("community","Điểm mạnh bảo vệ","Nhà trường phối hợp tốt với gia đình","Trao đổi hai chiều và hỗ trợ kịp thời.","Duy trì hợp tác.","Mức tiếp cận hỗ trợ",true)
 ]},
 nonprofit:{name:"Tổ chức xã hội",objective:"Tác động và trách nhiệm giải trình",cases:[
 q("mission","Chiến lược","Hoạt động lệch khỏi sứ mệnh","Ngân sách ưu tiên việc ít lợi ích cộng đồng.","Đánh giá chương trình theo kết quả.","Kết quả theo mục tiêu"),
 q("donors","Tài chính","Nguồn tài trợ tập trung quá mức","Phụ thuộc một nguồn tiền.","Đa dạng hóa và tạo dự phòng.","Tỷ lệ phụ thuộc nhà tài trợ"),
 q("opaque","Quản trị","Thiếu báo cáo chi tiêu","Cộng đồng khó kiểm tra tài chính.","Lập báo cáo kiểm chứng được.","Tỷ lệ báo cáo đủ bằng chứng"),
 q("voice","Cộng đồng","Người thụ hưởng ít được tham vấn","Kế hoạch không dựa trên nhu cầu thực.","Thiết lập phản hồi an toàn.","Tỷ lệ người thụ hưởng tham gia"),
 q("network","Điểm mạnh bảo vệ","Có mạng lưới hỗ trợ đáng tin","Hợp tác chia sẻ nguồn lực.","Duy trì liên kết.","Số đối tác bền vững",true)
 ]},
 public:{name:"Cơ quan công quyền",objective:"Chất lượng dịch vụ, minh bạch và niềm tin",cases:[
 q("patronage","Nhân sự","Bổ nhiệm ưu tiên quan hệ hơn năng lực","Các vị trí bổ nhiệm thiếu kiểm chứng phù hợp chuyên môn.","Công khai tiêu chuẩn và kiểm toán xung đột lợi ích.","Tỷ lệ bổ nhiệm cạnh tranh"),
 q("opacity","Quản trị","Quyết định thiếu giải trình","Khó truy cập tiêu chí, ngân sách và cơ sở pháp lý.","Công khai quyết định theo quy định phù hợp.","Tỷ lệ hồ sơ có giải trình"),
 q("service","Dịch vụ","Người dân gặp rào cản hành chính","Thời gian xử lý kéo dài, không rõ đầu mối.","Cải tiến quy trình dựa trên thời gian phục vụ.","Thời gian giải quyết"),
 q("complaints","Trách nhiệm","Khiếu nại không được xử lý công bằng","Thiếu cơ chế xem xét độc lập.","Bổ sung kiểm tra công bằng và thời hạn phản hồi.","Tỷ lệ xử lý đúng hạn"),
 q("trust","Điểm mạnh bảo vệ","Có kênh đối thoại thực chất","Người dân có thể phản hồi và theo dõi kết quả.","Duy trì phản hồi hai chiều.","Mức đáp ứng phản hồi",true)
 ]}
};
var state={type:"company",answers:{},ctx:{},ideas:[],changed:""};
try{var saved=JSON.parse(localStorage.getItem("civlab_ideas_v06")||"[]");if(Array.isArray(saved))state.ideas=saved;}catch(e){}
Object.keys(sectors).forEach(id=>$("type").add(new Option(sectors[id].name,id)));
function contextHTML(){
if(state.type==="family")return '<div class="context-grid">'+
'<label>Người chăm sóc chính<select data-ctx="carers"><option value="">Chưa xác định</option><option>Hai phụ huynh</option><option>Một phụ huynh</option><option>Ông bà / người thân</option><option>Nhiều người cùng chăm sóc</option></select></label>'+
'<label>Độ tuổi của con<select data-ctx="childAge"><option value="">Không nêu</option><option>Chưa có con</option><option>0–5 tuổi</option><option>6–12 tuổi</option><option>13–17 tuổi</option><option>Nhiều nhóm tuổi</option></select></label>'+
'<label>Môi trường sống<select data-ctx="area"><option value="">Chưa nêu</option><option>Thành phố</option><option>Ngoại ô</option><option>Vùng nông thôn / xa dịch vụ</option></select></label>'+
'<label>Ngôn ngữ giao tiếp / tiếp cận hỗ trợ<select data-ctx="language"><option value="">Chưa nêu</option><option>Dễ tiếp cận</option><option>Có rào cản ngôn ngữ</option></select></label>'+
'<label>Những kỳ vọng văn hóa / thế hệ<select data-ctx="culture"><option value="">Không nêu</option><option>Nhìn chung thống nhất</option><option>Có những khác biệt cần thỏa thuận</option></select></label>'+
'<label>Điều kiện tài chính chung<select data-ctx="budget"><option value="">Chưa nêu</option><option>Tạm ổn định</option><option>Áp lực thường xuyên</option><option>Biến động mạnh</option></select></label></div>'+
'<p class="fine">Xuất thân, văn hóa và vùng miền không tự động bị chấm điểm là rủi ro. Chỉ những khó khăn cụ thể do người dùng mô tả mới được xem xét. Không cần nhập tên, ngày sinh hay chẩn đoán của trẻ.</p>';
return '<div class="context-grid">'+
'<label>Quy mô<select data-ctx="size"><option>Nhỏ</option><option>Vừa</option><option>Lớn</option></select></label>'+
'<label>Mức thay đổi môi trường<select data-ctx="market"><option>Chưa rõ</option><option>Ổn định</option><option>Biến động</option></select></label></div>';
}
Object.keys(sectors).forEach(function(k){sectors[k].cases=sectors[k].cases.concat(CivEvidenceV07.extraFor(k));});
function renderContext(){ $("context").innerHTML=contextHTML(); $("context").querySelectorAll("[data-ctx]").forEach(x=>{if(state.ctx[x.dataset.ctx]!=null)x.value=state.ctx[x.dataset.ctx];x.onchange=()=>{state.ctx[x.dataset.ctx]=x.value;renderResult();};});}
function renderCases(){
var data=sectors[state.type];var groups=[...new Set(data.cases.map(c=>c.group))];
$("questions").innerHTML=groups.map(group=>'<div class="qgroup"><h3>'+safe(group)+'</h3>'+data.cases.filter(c=>c.group===group).map(c=>{
var a=state.answers[c.id]||{};return '<article class="question" data-id="'+c.id+'"><div class="qtitle">'+safe(c.title)+(c.positive?' <span class="positive">Yếu tố bảo vệ</span>':'')+'</div><p>'+safe(c.description)+'</p><div class="qcontrols"><label>Mức xảy ra<select data-frequency="'+c.id+'"><option value="">Chưa biết / thiếu dữ liệu</option><option value="0">Không xảy ra / chưa có</option><option value="1">Có, ít khi</option><option value="2">Lặp lại nhiều lần</option><option value="3">Thường xuyên / kéo dài</option></select></label><label>Loại bằng chứng<select data-evidence="'+c.id+'"><option value="0">Nhận định chưa kiểm chứng</option><option value="1">Quan sát / trải nghiệm một phía</option><option value="2">Có tài liệu hoặc dữ liệu</option><option value="3">Nhiều nguồn hoặc bên liên quan</option></select></label></div><div class="qcontrols advanced"><label>Mức ảnh hưởng nếu có<select data-impact="'+c.id+'"><option value="1">Nhẹ / giới hạn</option><option value="2">Đáng kể</option><option value="3">Nghiêm trọng</option></select></label><label>Thời gian tồn tại<select data-duration="'+c.id+'"><option value="1">Mới / ngắn hạn</option><option value="2">Kéo dài nhiều tuần/tháng</option><option value="3">Kéo dài nhiều tháng/năm</option></select></label></div><label style="margin-top:8px">Nguồn quan sát<select data-voice="'+c.id+'"><option value="">Chưa rõ</option><option value="leader">Người phụ trách / tự đánh giá</option><option value="affected">Người chịu ảnh hưởng</option><option value="third">Người quan sát độc lập</option><option value="multi">Nhiều bên (tự khai)</option></select></label><details><summary>Ghi chú / dữ kiện thực tế (không nhập tên cá nhân)</summary><textarea maxlength="600" data-note="'+c.id+'" placeholder="Thời điểm, sự kiện và dữ liệu có thể kiểm tra — tránh thông tin định danh.">'+safe(a.note||"")+'</textarea></details></article>';
}).join("")+'</div>').join("");
$("questions").querySelectorAll("[data-frequency]").forEach(x=>{x.value=(state.answers[x.dataset.frequency]||{}).freq??"";x.onchange=()=>{var a=state.answers[x.dataset.frequency]||{};a.freq=x.value;state.answers[x.dataset.frequency]=a;renderResult();};});
$("questions").querySelectorAll("[data-evidence]").forEach(x=>{x.value=String((state.answers[x.dataset.evidence]||{}).evidence??0);x.onchange=()=>{var a=state.answers[x.dataset.evidence]||{};a.evidence=Number(x.value);state.answers[x.dataset.evidence]=a;renderResult();};});
["impact","duration","voice"].forEach(function(k){$("questions").querySelectorAll("[data-"+k+"]").forEach(function(x){var id=x.dataset[k],a=state.answers[id]||{};x.value=a[k]??(k==="voice"?"":"1");x.onchange=function(){var next=state.answers[id]||{};next[k]=k==="voice"?x.value:Number(x.value);state.answers[id]=next;renderResult();};});});
$("questions").querySelectorAll("[data-note]").forEach(x=>{x.oninput=()=>{var a=state.answers[x.dataset.note]||{};a.note=x.value;state.answers[x.dataset.note]=a;};});
$("lever").innerHTML=data.cases.filter(c=>!c.positive).map(c=>'<option value="'+c.id+'">'+safe(c.title)+'</option>').join("");
if(state.changed&&data.cases.some(c=>c.id===state.changed))$("lever").value=state.changed;
else state.changed=$("lever").value;
}
function getAnswered(){return sectors[state.type].cases.filter(c=>state.answers[c.id]&&state.answers[c.id].freq!=null&&state.answers[c.id].freq!=="");}
function getMetrics(){return CivEvidenceV07.assess(sectors[state.type].cases,state.answers,state.type);}
function summary(){
 var d=getMetrics();
 $("coverage").textContent=d.knownCount+" / "+d.total+" tiêu chí";
 $("evidenceCount").textContent=d.sources+" mục được khai có dữ liệu";
 $("mainRisk").textContent=d.risks[0]?d.risks[0].c.title:"Chưa thấy tín hiệu ưu tiên / còn thiếu dữ liệu";
}
function graph(series,horizon){
var svg=$("chart"),L=42,R=18,T=20,B=35,W=740,H=260;
var X=i=>L+i*(W-L-R)/horizon,Y=y=>T+(100-y)*(H-T-B)/100;
var s='<rect x="'+L+'" y="'+T+'" width="'+(W-L-R)+'" height="'+(H-T-B)+'" fill="#0a1b2b" rx="8"/>';
for(var y=0;y<=100;y+=25)s+='<line x1="'+L+'" y1="'+Y(y)+'" x2="'+(W-R)+'" y2="'+Y(y)+'" stroke="#315068"/><text x="'+(L-9)+'" y="'+(Y(y)+4)+'" font-size="11" fill="#a8bdd1" text-anchor="end">'+y+'</text>';
["#fa9f9f","#53dbc7","#bbafff"].forEach((color,i)=>{s+='<polyline stroke="'+color+'" stroke-width="4" fill="none" stroke-linejoin="round" points="'+series[i].map((v,j)=>X(j)+","+Y(v)).join(" ")+'"/>';});
for(var i=0;i<=horizon;i++){if(horizon>5&&i%2)continue;s+='<text x="'+X(i)+'" y="'+(H-12)+'" font-size="11" fill="#b0c9d9" text-anchor="middle">'+i+'</text>';}
svg.innerHTML=s;
}
function simulate(m){
var duration=Number($("horizon").value),start=Number($("start").value),eff=Number($("boost").value)/100;
var base=clamp(70-47*(m.risk??.3)+13*(m.support??.2),0,100),selected=$("lever").value;
var rec=state.answers[selected]||{},severity=rec.freq===""?0:Number(rec.freq)||0;
var a=[[base],[base],[base]],slope=(-0.4-(m.risk??0)*1.5+(m.support??0)*0.9);
for(var year=1;year<=duration;year++){
var active=Math.max(0,year-start+1),gain=severity*eff*3.2*(1-Math.exp(-active*.6))*Math.min(active,4),extra=(m.support??0)<.5?2.6*eff*Math.min(active,4):1.5*eff*Math.min(active,4);
a[0].push(clamp(base+slope*year,0,100));a[1].push(clamp(base+slope*year+gain,0,100));a[2].push(clamp(base+slope*year+gain+extra,0,100));
}
return a;
}
var mechanisms={
nepotism:["Bổ nhiệm không dựa vào năng lực","Giảm niềm tin về công bằng","Nguy cơ nhân sự giỏi rời đi / hiệu quả quyết định giảm"],
flattery:["Thưởng cho việc làm hài lòng lãnh đạo","Thông tin xấu ít được báo cáo","Rủi ro quyết định sai và mất khả năng tự sửa lỗi"],
retaliation:["Phản biện bị trừng phạt","Thông tin bị che giấu","Rủi ro sai lầm kéo dài"],
cash:["Chi trả không ổn định","Áp lực nhân sự và nhà cung cấp","Nguy cơ ngưng hoạt động"],
couple_conflict:["Xung đột giữa người chăm sóc","Căng thẳng và giảm khả năng phối hợp","Môi trường sinh hoạt có thể bất ổn hơn"],
care_load:["Một người gánh quá nhiều trách nhiệm","Mệt mỏi và thiếu thời gian phục hồi","Khả năng chăm sóc và giao tiếp chịu áp lực"],
finance:["Thiếu tiền cho nhu cầu cơ bản","Căng thẳng về chỗ ở, dinh dưỡng và thời gian","Phúc lợi gia đình có thể bị ảnh hưởng"],
generations:["Kỳ vọng thế hệ không thống nhất","Bất đồng về quyết định chăm sóc / ranh giới","Gia tăng căng thẳng nếu không có đối thoại an toàn"],
school:["Trẻ khó đến trường","Có thể liên quan lo âu / bắt nạt / nhu cầu học tập","Nguy cơ xa rời trường học nếu không được hỗ trợ phù hợp"],
neuro_support:["Môi trường chưa đáp ứng nhu cầu phát triển","Khó tham gia học tập, giao tiếp hoặc sinh hoạt","Cơ hội tham gia và phúc lợi có thể cải thiện nếu hỗ trợ phù hợp"],
housing:["Chỗ ở thiếu ổn định","Gián đoạn lịch sinh hoạt và học tập","Khó duy trì cảm giác ổn định"],
bullying:["Bắt nạt hoặc cô lập","Giảm cảm nhận an toàn","Trẻ có thể né tránh môi trường học tập"],
coercion:["Hành vi kiểm soát hoặc bạo lực","Nguy cơ mất an toàn","Cần hỗ trợ an toàn trước mọi thử nghiệm khác"]
};
function renderAdvice(m){
 var focus=sectors[state.type].cases.find(function(q){return q.id===$("lever").value;});
 var relevant=m.risks.slice(0,4);
 var ctx=state.ctx||{},hasGoal=$("outcomeMeasure")?$("outcomeMeasure").value.trim():"";
 var target=$("targetMeasure")?$("targetMeasure").value.trim():"";
 var scenario=CivEvidenceV07.scenarios(focus,$("horizon").value,$("start").value,$("boost").value,hasGoal,target);
 $("chart").innerHTML="";
 var note=document.getElementById("numericNotice");if(note)note.textContent="Các đường điểm số dự báo đã được loại bỏ vì chưa có hệ số được hiệu chuẩn bằng dữ liệu thực.";
 var summaryHtml='<div class="notice"><b>'+safe(m.label)+'</b> · '+m.knownCount+'/'+m.total+' chủ đề được trả lời. '+m.sources+' mục được người dùng khai có dữ liệu. '+m.voices.length+' loại góc nhìn. Đây là đánh giá phạm vi, không phải điểm tốt–xấu.</div>';
 if(m.safety){
 summaryHtml='<div class="notice warning"><b>Ưu tiên an toàn trước mô phỏng.</b> Có dấu hiệu liên quan an toàn được báo cáo: '+safe(m.safety.c.title)+'. Đây chưa phải xác nhận sự việc. Cần xem xét an toàn của người chịu ảnh hưởng và tiếp cận chuyên gia phù hợp; không khuyến khích tự giải quyết vấn đề bạo lực bằng thử nghiệm nhóm.</div>'+summaryHtml;
 }
 if(!m.usable){
 $("outcome").innerHTML=summaryHtml+'<p class="fine">Chưa đủ thông tin để lập kịch bản có ý nghĩa. Hãy đánh giá ít nhất 3 mục, gồm tối thiểu một vấn đề cụ thể và một yếu tố bảo vệ (nếu có).</p>';
 $("advice").innerHTML='<div class="event"><b>Điều nên tìm hiểu trước</b><ul>'+m.missing.concat(m.contextNeeded.slice(0,2)).map(function(t){return '<li>'+safe(t)+'</li>';}).join("")+'</ul></div>';
 return;
 }
 $("outcome").innerHTML=summaryHtml+'<div class="scenario-grid">'+scenario.map(function(item){return '<div class="scenario"><b>'+safe(item.title)+'</b><p>'+safe(item.body)+'</p></div>';}).join("")+'</div><p class="fine">Ba luồng là giả thuyết có điều kiện, không phải xác suất hay dự báo đã được xác nhận. Mốc thời gian dùng để lập kế hoạch theo dõi, không xác định tương lai.</p>';
 var missing='<div class="event"><b>Điểm mù cần kiểm tra</b><ul>'+m.missing.concat(m.contextNeeded.slice(0,2)).map(function(t){return '<li>'+safe(t)+'</li>';}).join("")+'</ul></div>';
 var priority='<h3>Vấn đề cần khảo sát, sắp xếp theo mức xuất hiện × ảnh hưởng × thời gian</h3>';
 priority+= relevant.length?relevant.map(function(v,i){
 var origin=v.evidence>=2?"Có dữ liệu được người dùng tự khai (chưa kiểm chứng)":"Chưa có dữ liệu độc lập";
 return '<div class="event"><b>'+(i+1)+'. '+safe(v.c.title)+'</b><p>'+safe(v.c.description)+'</p><p><b>Bước thử:</b> '+safe(v.c.action)+'</p><small><b>Kiểm tra bằng:</b> '+safe(v.c.measure)+' · '+safe(origin)+'</small></div>';
 }).join(""):'<p class="fine">Chưa có vấn đề được ghi nhận ở các mục đã đánh giá; không có nghĩa là tổ chức không có vấn đề.</p>';
 var causal=focus?'<div class="event"><b>Giả thuyết cần kiểm chứng</b><p><b>Điều thay đổi:</b> '+safe(focus.action)+'</p><p><b>Giả thuyết:</b> nếu can thiệp làm thay đổi tình huống '+safe(focus.title)+' thì chỉ số '+safe(hasGoal||focus.measure)+' có thể thay đổi. Cần ghi nhận đường cơ sở, thời điểm thực hiện và các tác động đồng thời.</p><p><b>Thử nghiệm an toàn:</b> đo hiện trạng → thử quy mô nhỏ → đo lại → lấy phản hồi → điều chỉnh hoặc dừng nếu có tác hại.</p></div>':"";
 var family='';
 if(state.type==="family"){
 family='<div class="notice">Gia đình được nhìn nhận theo các yếu tố tương tác và nguồn lực bảo vệ, không gán lỗi cho cha mẹ từ một dấu hiệu đơn lẻ. Tự kỷ không phải do cách nuôi dạy gây ra; hãy tập trung vào nhu cầu hỗ trợ thực tế.</div>';
 if(ctx.language==="Có rào cản ngôn ngữ")family+='<p>Hãy kiểm tra khả năng tiếp cận hỗ trợ bằng ngôn ngữ người nhà hiểu.</p>';
 if(ctx.area==="Vùng nông thôn / xa dịch vụ")family+='<p>Hãy tính thêm khoảng cách dịch vụ và lựa chọn hỗ trợ từ xa.</p>';
 if(ctx.childAge==="Chưa có con")family+='<p>Không áp dụng giả định về phát triển của trẻ khi gia đình chưa có con.</p>';
 if(m.risks.some(function(v){return v.c.id==="school";}))family+='<p class="fine">Với khó khăn đến trường: cần xem xét an toàn, nhu cầu học tập, sự lo âu, quan hệ bạn bè và môi trường trường học thay vì mặc định trẻ “không chịu học”.</p>';
 }
 $("advice").innerHTML=(m.safety?'<div class="notice warning">Với tình huống nguy hiểm khẩn cấp tại Úc, gọi 000. Nếu liên quan bạo lực gia đình: 1800RESPECT — 1800 737 732.</div>':"")+priority+missing+causal+family;
}
function renderResult(){var m=getMetrics();summary();renderAdvice(m);}
function render(){state.type=$("type").value;state.answers={};state.ctx={};state.changed="";$("sectorTitle").textContent="Đánh giá hiện trạng: "+sectors[state.type].name;$("sectorHint").textContent="Chọn tình huống thực tế thay vì tự đoán điểm số. Trả lời Chưa biết nếu chưa có dữ liệu. Mỗi lĩnh vực có bộ câu hỏi và gợi ý riêng.";renderContext();renderCases();renderResult();}
$("type").value="company";$("type").onchange=render;
$("lever").onchange=()=>{state.changed=$("lever").value;renderResult();};
["boost","horizon","start"].forEach(id=>$(id).oninput=()=>{if(Number($("start").value)>Number($("horizon").value))$("start").value="1";$("boostOut").textContent=$("boost").value+"%";renderResult();});
$("sample").onclick=()=>{var ids=state.type==="family"?{couple_conflict:2,care_load:2,finance:2,school:1,neuro_support:1,trusted:2,support:1}:{nepotism:2,flattery:2,retaliation:1,cash:2,fairness:1};state.answers={};if(state.type!=="family"&&state.type!=="company"){ids={};sectors[state.type].cases.slice(0,4).forEach((c,i)=>ids[c.id]=i===0?2:1);}for(var id of Object.keys(ids))state.answers[id]={freq:String(ids[id]),evidence:1};renderCases();renderResult();$("sampleMsg").textContent="Đã tải dữ liệu GIẢ ĐỊNH để bạn khám phá. Không phải đánh giá một gia đình hoặc tổ chức có thật.";};
$("clear").onclick=()=>{state.answers={};renderCases();renderResult();$("sampleMsg").textContent="Đã xóa câu trả lời của lĩnh vực này.";};
function ideas(){var t=state.ideas;$("ideas").innerHTML=t.length?t.map((x,i)=>'<div class="event"><b>'+safe(x.title)+'</b><small> '+safe(x.type)+' · '+safe(x.date)+'</small><p>'+safe(x.text)+'</p><div class="vote"><button data-idx="'+i+'" data-vote="test">Ủng hộ thử nghiệm</button><button data-idx="'+i+'" data-vote="side">Giữ Side Ideas</button><span>'+safe(x.vote||"Chưa biểu quyết")+'</span></div></div>').join(""):'<p class="fine">Chưa có ý tưởng trên thiết bị này.</p>';$("ideas").querySelectorAll("[data-vote]").forEach(btn=>btn.onclick=()=>{state.ideas[Number(btn.dataset.idx)].vote=btn.dataset.vote==="test"?"Ủng hộ thử nghiệm":"Side Ideas";saveIdeas();ideas();});}
function saveIdeas(){try{localStorage.setItem("civlab_ideas_v06",JSON.stringify(state.ideas));}catch(e){$("ideaMsg").textContent="Trình duyệt không cho lưu cục bộ.";}}
$("addIdea").onclick=()=>{var title=$("ideaTitle").value.trim(),text=$("ideaText").value.trim();if(title.length<8||text.length<25){$("ideaMsg").textContent="Nhập tiêu đề ít nhất 8 ký tự và mô tả ít nhất 25 ký tự.";return;}state.ideas.unshift({title,text,type:sectors[state.type].name,date:new Date().toISOString().slice(0,10),vote:""});saveIdeas();ideas();$("ideaTitle").value="";$("ideaText").value="";$("ideaMsg").textContent="Đã lưu ý tưởng trên thiết bị. Chưa được chia sẻ hoặc kiểm chứng.";};
$("export").onclick=()=>{var data={version:"0.6",kind:state.type,answers:state.answers,context:state.ctx,ideas:state.ideas,disclaimer:"Illustrative, not validated; may include private notes. Share only with consent."},url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})),a=document.createElement("a");a.href=url;a.download="civilization-lab-private-export.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),500);};
render();ideas();
})();