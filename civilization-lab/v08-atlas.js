/* Civilization Lab v0.8 — system-mechanism question bank
 * Original synthesis: OECD Systems Thinking, OECD Well-Being, CDC Evaluation,
 * MRC Complex Intervention Framework, AIFS, WHO/UNICEF Nurturing Care,
 * Safe Work Australia and UK Magenta Book. Not a validated instrument.
 */
(function(root,factory){const value=factory();if(typeof module==="object"&&module.exports)module.exports=value;root.CivAtlasV08=value;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const dimensions=[
{id:"outcomes",label:"Mục tiêu & kết quả",short:"Mục tiêu",icon:"◎",question:"Kết quả nào thực sự quan trọng, cho ai và trong khoảng thời gian nào?",color:"#7eddd2"},
{id:"capacity",label:"Nguồn lực & sức chịu đựng",short:"Nguồn lực",icon:"◈",question:"Tiền, thời gian, năng lượng và dự phòng có đủ để thực hiện mục tiêu?",color:"#f9c28b"},
{id:"roles",label:"Năng lực & phân công",short:"Năng lực",icon:"▣",question:"Trách nhiệm, năng lực và quyền thực thi có khớp nhau?",color:"#94bbff"},
{id:"incentives",label:"Quyền lực & động lực",short:"Quyền lực",icon:"◇",question:"Ai được lợi, ai gánh rủi ro, cơ chế thưởng phạt có tạo hệ quả ngược?",color:"#dcabfa"},
{id:"relationships",label:"Quan hệ & niềm tin",short:"Quan hệ",icon:"♡",question:"Người trong hệ thống có thể phối hợp, bất đồng an toàn và khôi phục niềm tin?",color:"#e3a4c7"},
{id:"feedback",label:"Thông tin & học hỏi",short:"Học hỏi",icon:"↻",question:"Tín hiệu xấu được ghi nhận thế nào, có độ trễ hay bóp méo thông tin?",color:"#89d4f4"},
{id:"context",label:"Môi trường & phụ thuộc",short:"Bối cảnh",icon:"⌁",question:"Yếu tố nào nằm ngoài quyền kiểm soát nhưng quyết định kết quả?",color:"#a6ce9b"},
{id:"resilience",label:"Thích nghi & phục hồi",short:"Thích nghi",icon:"♧",question:"Hệ thống có lựa chọn dự phòng và khả năng học từ cú sốc?",color:"#f4df93"}
];
const def=[
{id:"company",name:"Doanh nghiệp",tag:"Giá trị · nhân sự · năng lực · tài chính",people:"Lãnh đạo, nhân viên, khách hàng, nhà cung ứng",context:"Ngành, giai đoạn phát triển, thị trường, pháp luật, hệ thống lao động",outcomes:[
{id:"execution",name:"Công việc trì trệ, phối hợp kém",metric:"Đơn hàng đúng hẹn; số lỗi; số quyết định phải làm lại",dims:["roles","feedback","capacity","incentives","context"],goal:"Giảm trì hoãn và sai sót"},
{id:"people",name:"Nhân sự rời đi, niềm tin suy giảm",metric:"Tỷ lệ nghỉ việc; mức an toàn phản hồi; khả năng giữ người",dims:["relationships","incentives","roles","feedback","resilience"],goal:"Cải thiện điều kiện làm việc và duy trì năng lực"},
{id:"cashflow",name:"Doanh thu có nhưng dòng tiền yếu",metric:"Dòng tiền ròng; thời gian thu tiền; tuần dự phòng",dims:["capacity","outcomes","roles","context","resilience"],goal:"Ổn định khả năng đáp ứng cam kết"},
{id:"growth",name:"Chiến lược tăng trưởng thiếu hiệu quả",metric:"Giữ chân khách; hiệu suất; chi phí tạo kết quả",dims:["outcomes","feedback","context","capacity","resilience"],goal:"Đổi mới nhưng vẫn kiểm soát rủi ro"}],
probes:{
outcomes:["Có mục tiêu rõ ràng nhưng hoạt động và ngân sách không hướng đến kết quả đó?","Các bộ phận tối ưu chỉ số riêng thay vì giá trị khách hàng.","Đo kết quả với khách hàng, không chỉ hoạt động nội bộ.","Chọn một kết quả khách hàng và kiểm tra tương quan với hoạt động."],
capacity:["Khối lượng công việc và cam kết tài chính có vượt quá tiền, người hoặc thời gian hiện có?","Nguồn lực và dự phòng không đủ so với khối lượng đã nhận.","Ưu tiên các nghĩa vụ và hạn mức công việc; không chuyển rủi ro cho nhân viên.","Theo dõi giờ vượt tải, tuần tiền mặt, nợ đến hạn."],
roles:["Có quyết định bị trì hoãn vì phân quyền, trách nhiệm hoặc năng lực thực thi không rõ?","Trách nhiệm và năng lực không khớp nơi ra quyết định.","Thử ma trận quyết định cho một quy trình có nhiều lỗi.","Đếm số việc trễ do chờ phê duyệt."],
incentives:["Cách khen thưởng, thăng tiến hoặc phạt có khiến mọi người giấu vấn đề, chạy theo hình thức?","Động lực thực tế không đồng nhất với mục tiêu tổ chức.","Công khai tiêu chí dựa trên đóng góp, phản biện và giải trình xung đột lợi ích.","So sánh tiêu chí công bố với quyết định nhân sự thực tế."],
relationships:["Nhân viên có thể trình bày bất đồng, nhu cầu và sai sót mà không sợ bị trù dập?","Thiếu an toàn tâm lý và sự hỗ trợ trong phối hợp.","Khảo sát ẩn danh thực chất và xây kênh phản hồi được bảo vệ.","Đo tỷ lệ sự cố được nêu và xử lý không trả đũa."],
feedback:["Có dữ liệu khách hàng, nhân sự hoặc chất lượng nhưng báo cáo đến muộn hoặc bị làm đẹp?","Tín hiệu chất lượng không đi đến người có quyền sửa.","Thiết lập vòng phản hồi theo tuần và ghi quyết định thay đổi.","Đo thời gian từ phát hiện đến khắc phục."],
context:["Áp lực thị trường, giá đầu vào, luật hoặc đối tác bên ngoài có giải thích một phần kết quả?","Một nguyên nhân bên ngoài có thể bị nhầm với lỗi nội bộ.","Đối chiếu với giai đoạn, doanh nghiệp hoặc khu vực tương tự.","Theo dõi chi phí đầu vào và nhu cầu thị trường."],
resilience:["Khi mất một người chủ chốt hay khách lớn, hoạt động có bị gián đoạn nghiêm trọng?","Có điểm lỗi đơn và quá ít phương án dự phòng.","Chuẩn hóa bàn giao và thử phương án thay thế không gây gián đoạn.","Thời gian phục hồi sau sự cố."]}},
{id:"family",name:"Gia đình",tag:"Phúc lợi · chăm sóc · quan hệ · môi trường",people:"Những người chăm sóc, trẻ em nếu có, người thân và mạng lưới hỗ trợ",context:"Lứa tuổi, nhu cầu tiếp cận dịch vụ, điều kiện nhà ở, kinh tế và văn hóa gia đình",outcomes:[
{id:"stability",name:"Gia đình căng thẳng, quan hệ thiếu ổn định",metric:"Cảm nhận an toàn, chất lượng giao tiếp và khả năng giải quyết nhu cầu",dims:["relationships","capacity","roles","feedback","context"],goal:"Tăng an toàn và hỗ trợ lẫn nhau"},
{id:"child",name:"Trẻ gặp khó khăn trong học tập hay sinh hoạt",metric:"Khả năng tham gia học tập, sinh hoạt, chất lượng cuộc sống theo mục tiêu của trẻ",dims:["context","capacity","relationships","feedback","resilience"],goal:"Cải thiện hỗ trợ phù hợp với nhu cầu của trẻ"},
{id:"resources",name:"Áp lực kinh tế, nhà ở và chăm sóc",metric:"Khả năng đáp ứng nhu cầu thiết yếu, thời gian chăm sóc được hỗ trợ",dims:["capacity","roles","context","resilience","outcomes"],goal:"Ổn định nguồn lực thiết yếu"},
{id:"change",name:"Gia đình cần thích nghi với biến cố",metric:"Mức ổn định sinh hoạt, tiếp cận hỗ trợ và mục tiêu được thống nhất",dims:["resilience","relationships","feedback","capacity","context"],goal:"Giảm tác động tiêu cực của biến cố"}],
probes:{
outcomes:["Các thành viên có thể khác nhau về điều họ muốn cải thiện hoặc chưa thống nhất đâu là ưu tiên?","Người lớn tự đặt mục tiêu thay người chịu ảnh hưởng.","Lắng nghe nhu cầu từng người phù hợp độ tuổi và an toàn.","Ghi một mục tiêu nhỏ do thành viên đồng thuận."],
capacity:["Gia đình có thiếu thời gian nghỉ ngơi, tiền cho nhu cầu cơ bản, hoặc năng lực tiếp cận hỗ trợ?","Gánh nặng tích lũy dễ làm giảm khả năng chăm sóc.","Xác định nhu cầu cấp bách và nguồn hỗ trợ có thể tiếp cận.","Số nhu cầu thiết yếu được đáp ứng và giờ nghỉ thực tế."],
roles:["Việc chăm sóc, quyết định và việc nhà có khiến một người chịu tải vượt sức hoặc không rõ ràng?","Phân bổ trách nhiệm không phù hợp sức khỏe và thời gian.","Thử điều chỉnh một nhiệm vụ với sự đồng ý của người liên quan.","Giờ chăm sóc không được chia sẻ và cảm nhận tải công việc."],
incentives:["Các quy tắc và phản ứng trong nhà có khiến thành viên né tránh chia sẻ hoặc cảm thấy thiếu công bằng?","Quy tắc thiếu nhất quán hoặc quyền quyết định mất cân đối.","Thống nhất cách phản hồi tôn trọng và ranh giới an toàn; không ép hòa giải khi có bạo lực.","Mức độ thành viên cảm thấy được tôn trọng."],
relationships:["Người trong nhà có thiếu lắng nghe, thiếu kết nối hoặc thường xuyên xảy ra xung đột không được giải quyết an toàn?","Thiếu quan hệ hỗ trợ có thể làm tăng sức ép khi gặp biến cố.","Ưu tiên an toàn; khi phù hợp, tăng thời gian giao tiếp và tìm hỗ trợ chuyên môn.","Cảm giác an toàn và số tương tác tích cực được tự nguyện ghi nhận."],
feedback:["Khi một thành viên gặp khó khăn, nhu cầu đó có được nhận biết đúng và điều chỉnh kịp thời không?","Dấu hiệu có thể bị hiểu sai, ví dụ khó đến trường không đồng nghĩa với lười.","Hỏi nhu cầu, xem bối cảnh và phối hợp dịch vụ/nhà trường khi phù hợp.","Thời gian từ ghi nhận đến tiếp cận hỗ trợ."],
context:["Nhà ở, công việc, nhà trường, khả năng tiếp cận y tế hoặc rào cản ngôn ngữ có đang tác động không?","Hệ thống hỗ trợ bên ngoài có thể thiếu hoặc khó tiếp cận.","Liệt kê rào cản cụ thể và dịch vụ thực sự có thể sử dụng.","Số trở ngại tiếp cận đã giải quyết."],
resilience:["Nếu ốm đau, mất việc hoặc thay đổi nơi ở, gia đình có kế hoạch và người hỗ trợ phù hợp?","Thiếu mạng lưới bảo vệ khiến biến cố nhỏ có thể gây tác động dây chuyền.","Xây kế hoạch nguồn lực và đầu mối trợ giúp dự phòng.","Thời gian phục hồi thói quen sinh hoạt."]}},
{id:"school",name:"Trường học",tag:"An toàn · học tập · công bằng · giáo viên",people:"Học sinh, giáo viên, gia đình, lãnh đạo trường, cộng đồng",context:"Độ tuổi, điều kiện vùng, nhu cầu hỗ trợ, nguồn lực giáo dục",outcomes:[
{id:"learning",name:"Học sinh thiếu tiến bộ hoặc ít tham gia",metric:"Tiến bộ học tập phù hợp; sự tham gia và trải nghiệm an toàn",dims:["outcomes","capacity","roles","feedback","context"],goal:"Cải thiện trải nghiệm và tiến bộ thực tế"},
{id:"safety",name:"An toàn, niềm tin hoặc gắn kết suy giảm",metric:"Mức an toàn; thời gian xử lý phản hồi; sự tham gia",dims:["relationships","incentives","feedback","roles","resilience"],goal:"Bảo đảm môi trường học tôn trọng"}],
probes:{
outcomes:["Mục tiêu nhà trường có coi trọng điểm số hơn mức tiến bộ, hòa nhập và an toàn thực tế?","Chỉ số thưởng phạt có thể làm lệch việc dạy.","Chọn bộ đo tiến bộ, sự tham gia, và an toàn.","Đối chiếu tiến bộ của từng nhóm nhu cầu."],
capacity:["Sĩ số, thời gian, hỗ trợ chuyên môn và thiết bị có thiếu so với nhu cầu học sinh?","Nguồn lực không theo kịp nhu cầu.","Đánh giá phân bổ hỗ trợ và điều chỉnh lớp học.","Tỷ lệ nhu cầu hỗ trợ được đáp ứng."],
roles:["Giáo viên, lãnh đạo và gia đình có hiểu rõ trách nhiệm hỗ trợ học sinh?","Giao tiếp đứt đoạn khiến trẻ thiếu trợ giúp.","Thử quy trình theo dõi và phản hồi có người chịu trách nhiệm.","Thời gian hoàn thành kế hoạch hỗ trợ."],
incentives:["Cách đánh giá giáo viên và trường có vô tình làm giảm hỗ trợ nhóm học sinh gặp khó khăn?","Động lực tập trung vào chỉ số dễ đạt.","Rà soát chỉ tiêu để không đánh đổi hòa nhập và an toàn.","Chênh lệch cơ hội tham gia giữa nhóm học sinh."],
relationships:["Học sinh và giáo viên có thể lên tiếng an toàn về bắt nạt, tổn thương và khó khăn?","Thiếu tin tưởng có thể làm sự cố ít được báo cáo.","Thiết lập báo cáo an toàn, bảo vệ người phản ánh.","Cảm giác an toàn và xử lý vụ việc."],
feedback:["Trường có phát hiện sớm khi một nhóm học sinh không tiến bộ hoặc giảm tham gia?","Thông tin chậm khiến can thiệp bỏ lỡ thời điểm.","Theo dõi dấu hiệu theo tuần, trao đổi phù hợp.","Độ trễ từ phát hiện đến hỗ trợ."],
context:["Điều kiện gia đình, giao thông, nhu cầu phát triển hoặc tiếp cận dịch vụ ảnh hưởng việc học ra sao?","Nguyên nhân ngoài lớp học dễ bị bỏ sót.","Phối hợp phù hợp với gia đình, y tế và dịch vụ hỗ trợ.","Các trở ngại ngoài trường được giải quyết."],
resilience:["Nhà trường có kế hoạch duy trì hỗ trợ khi thiếu giáo viên, khủng hoảng hay thay đổi chương trình?","Thiếu phương án thay thế gây đứt quãng hỗ trợ.","Thử phương án bàn giao và liên tục hỗ trợ.","Thời gian gián đoạn được giảm."]}},
{id:"community",name:"Hội nhóm & cộng đồng",tag:"Tham gia · niềm tin · tác động · hỗ trợ",people:"Thành viên lâu năm, người mới, nhóm ít tiếng nói và đối tác",context:"Quy mô nhóm, mục đích, quy tắc, địa bàn, đối tác",outcomes:[
{id:"cooperation",name:"Nhóm mất đoàn kết hoặc người tham gia giảm",metric:"Mức tham gia có ý nghĩa; xử lý bất đồng; duy trì thành viên",dims:["relationships","incentives","roles","feedback","resilience"],goal:"Khôi phục phối hợp và tin tưởng"},
{id:"impact",name:"Nhóm hoạt động nhiều nhưng tác động thấp",metric:"Mục tiêu đạt; lợi ích thực tế; chi phí vận hành",dims:["outcomes","capacity","feedback","context","roles"],goal:"Tăng tác động bền vững"}],
probes:{
outcomes:["Các thành viên có thống nhất tổ chức tạo ra lợi ích gì ngoài số buổi họp và sự kiện?","Số hoạt động bị nhầm với kết quả.","Thống nhất mục tiêu từ người được hưởng lợi.","Tỷ lệ mục tiêu có thay đổi quan sát được."],
capacity:["Nguồn quỹ, thời gian tình nguyện hoặc không gian có thiếu so với hoạt động?","Lệ thuộc nguồn lực tự nguyện ít bền vững.","Giảm nhiệm vụ và tìm cách chia sẻ nguồn lực.","Thời gian và quỹ dự phòng."],
roles:["Ai quyết định, ai có quyền phản biện và ai kiểm tra sử dụng quỹ?","Quy tắc mơ hồ dễ gây tranh chấp.","Viết rõ quyền và quy trình bầu chọn/kiểm tra.","Số quyết định có ghi nhận và giải trình."],
incentives:["Lợi ích, danh tiếng hoặc quyền kiểm soát có tập trung vào một nhóm nhỏ?","Động lực cá nhân có thể lấn át mục đích chung.","Thiết lập công khai lợi ích và nhiệm kỳ phù hợp.","Tỷ lệ quyết định có giám sát."],
relationships:["Thành viên mới hoặc nhóm ít tiếng nói có thể tham gia mà không bị loại trừ?","Quan hệ và chuẩn mực ngầm cản trở tham gia.","Đồng thiết kế hoạt động và kênh hòa giải an toàn.","Mức tham gia của người mới."],
feedback:["Phản hồi có được ghi và dẫn đến sửa đổi có giải trình?","Thiếu vòng phản hồi khiến mâu thuẫn lặp lại.","Công khai phản hồi và các biện pháp xử lý.","Tỷ lệ phản hồi được trả lời."],
context:["Hội nhóm chịu phụ thuộc địa điểm, pháp lý, mạng lưới đối tác hay xu hướng cộng đồng không?","Thay đổi ngoài tổ chức có thể làm giảm số người tham gia.","Đối chiếu lịch sự kiện và nguồn lực địa phương.","Mức phụ thuộc một đối tác."],
resilience:["Nếu người khởi xướng rời đi thì hoạt động có tiếp tục?","Lệ thuộc nhân vật trung tâm.","Phát triển nhóm kế nhiệm và tài liệu bàn giao.","Thời gian duy trì hoạt động sau thay đổi."]}},
{id:"nonprofit",name:"Tổ chức phi lợi nhuận",tag:"Người thụ hưởng · kết quả · nguồn lực · bảo vệ",people:"Người thụ hưởng, người làm việc, nhà tài trợ, cộng đồng, hội đồng quản trị",context:"Nguồn tài trợ, nghĩa vụ bảo vệ, quy định và nhu cầu của người thụ hưởng",outcomes:[
{id:"mission",name:"Chi tiêu nhiều nhưng tác động xã hội chưa rõ",metric:"Thay đổi thực tế cho người thụ hưởng, không chỉ số hoạt động",dims:["outcomes","feedback","relationships","capacity","roles"],goal:"Nâng hiệu quả và tính minh bạch"},
{id:"sustain",name:"Phụ thuộc tài trợ hoặc khó duy trì dịch vụ",metric:"Tháng dự phòng; mức liên tục phục vụ; quyền lợi người thụ hưởng",dims:["capacity","resilience","context","incentives","roles"],goal:"Tăng khả năng tồn tại lâu dài"}],
probes:{
outcomes:["Có bằng chứng cho thấy hoạt động đã thay đổi điều kiện của người được hỗ trợ?","Số lượt tham gia có thể bị nhầm là kết quả.","Cùng người thụ hưởng xác định thước đo có ý nghĩa.","Sự thay đổi trước–sau về nhu cầu ưu tiên."],
capacity:["Cơ cấu chi và nguồn tài trợ có đủ để phục vụ lâu dài?","Phụ thuộc dòng tiền ngắn hạn.","Xem dự trữ, chi phí và cam kết.","Số tháng hoạt động có thể duy trì."],
roles:["Hội đồng quản trị và đội thực hiện có phân định rõ trách nhiệm, quyền phê duyệt?","Trùng quyền hoặc thiếu giám sát.","Rà soát phân quyền và kiểm tra lợi ích.","Tỷ lệ quyết định có giải trình."],
incentives:["Áp lực từ nhà tài trợ có làm lệch sứ mệnh hoặc bỏ quên nhóm khó phục vụ?","Tối ưu báo cáo hơn nhu cầu người thụ hưởng.","Công khai đánh đổi và phản hồi từ người dùng dịch vụ.","Mức đáp ứng nhu cầu nhóm khó tiếp cận."],
relationships:["Người được hỗ trợ có thể phản hồi không sợ ảnh hưởng quyền lợi?","Quan hệ quyền lực cản trở tiếng nói của người thụ hưởng.","Mở kênh phản hồi an toàn và bảo vệ.","Tỷ lệ góp ý được dùng."],
feedback:["Kết quả chương trình có được đo lại và công khai giới hạn?","Tổ chức thiếu dữ liệu về hiệu quả thật.","Đánh giá mục tiêu và tác dụng phụ.","Số điều chỉnh được đối chiếu kết quả."],
context:["Các điều kiện chính sách và nhu cầu cộng đồng đang thay đổi thế nào?","Mô hình phục vụ cũ có thể không còn phù hợp.","Hỏi lại nhu cầu và đối chiếu dữ liệu cộng đồng.","Thay đổi nhu cầu qua thời gian."],
resilience:["Nếu một nhà tài trợ dừng, người thụ hưởng có bị mất dịch vụ thiết yếu?","Thiếu kế hoạch chuyển tiếp và dự phòng.","Chuẩn bị chuyển tiếp dịch vụ và đa dạng nguồn lực.","Tỷ lệ gián đoạn dịch vụ."]}},
{id:"public",name:"Cơ quan công quyền",tag:"Dịch vụ · trách nhiệm · công bằng · niềm tin",people:"Người sử dụng dịch vụ, công chức, bên giám sát, cộng đồng",context:"Pháp luật, ngân sách, nhóm người cần tiếp cận và hạ tầng công",outcomes:[
{id:"service",name:"Dịch vụ chậm, tốn kém hoặc khó tiếp cận",metric:"Thời gian xử lý; hoàn thành; chênh lệch tiếp cận",dims:["capacity","roles","feedback","context","outcomes"],goal:"Cải thiện chất lượng phục vụ"},
{id:"trust",name:"Thiếu minh bạch, niềm tin và trách nhiệm",metric:"Giải quyết khiếu nại; công khai quyết định; trải nghiệm công bằng",dims:["incentives","relationships","feedback","roles","resilience"],goal:"Tăng năng lực giải trình và phục vụ"}],
probes:{
outcomes:["Thành công được đo bằng số hồ sơ đã xử lý hay hiệu quả mà người dân nhận được?","Chỉ số đầu ra có thể che giấu trải nghiệm người dân.","Đo thời gian, chi phí và chất lượng theo từng nhóm.","Tỷ lệ hoàn thành thực chất."],
capacity:["Nguồn ngân sách, nhân lực, công nghệ và tải nhu cầu có tương xứng?","Công suất không theo kịp nhu cầu.","Phân tích điểm nghẽn và phân bổ nhân lực.","Thời gian chờ thực tế."],
roles:["Hồ sơ bị chuyển vòng vì quy trình và quyền phê duyệt không rõ?","Các đơn vị phụ thuộc nhau không có người chịu trách nhiệm.","Thử quy trình một đầu mối và trách nhiệm rõ.","Số lần chuyển hồ sơ."],
incentives:["Cách đo thành tích hoặc xung đột lợi ích có thể làm lệch quyết định phục vụ công?","Thành tích nội bộ không phản ánh chất lượng công bằng.","Kiểm tra xung đột lợi ích và tác dụng ngoài ý muốn của chỉ số.","Độ minh bạch và công bằng quyết định."],
relationships:["Người dân có thể khiếu nại, phản ánh vấn đề mà được tôn trọng và bảo vệ?","Thiếu niềm tin khiến nhu cầu không được nói ra.","Thiết lập phản hồi có thời hạn, trợ năng và ngôn ngữ phù hợp.","Tỷ lệ khiếu nại được xử lý."],
feedback:["Có dữ liệu về lỗi, bất bình đẳng tiếp cận nhưng được chuyển thành hành động chậm?","Khoảng trống giữa dữ liệu và chính sách.","Công khai lý do quyết định và kết quả chỉnh sửa.","Thời gian xử lý vấn đề tái diễn."],
context:["Thay đổi luật, dân số, ngân sách hay công nghệ có làm quy trình cũ không phù hợp?","Bối cảnh ngoài quy trình chưa được cập nhật.","Đánh giá nhu cầu định kỳ và khả năng tiếp cận.","Tỷ lệ dịch vụ được cập nhật."],
resilience:["Khi hệ thống CNTT gián đoạn hoặc có khủng hoảng, quyền tiếp cận dịch vụ có được bảo đảm?","Phụ thuộc một nền tảng và thiếu dự phòng.","Thiết kế kênh thay thế và phục hồi có thử nghiệm.","Thời gian dịch vụ bị gián đoạn."]}}
];
function makeIndex(){return Object.fromEntries(def.map(d=>[d.id,d]));}
return {dimensions,sectors:def,byId:makeIndex()};
});