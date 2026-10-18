(function(root,factory) {
  "use strict";
  var api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.CivEvidenceV07=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  var gapsBySector={
    company:["Ý kiến ẩn danh của nhân viên, không chỉ lãnh đạo","Dữ liệu chất lượng sản phẩm, khách hàng, tài chính theo thời gian","An toàn lao động, mức độ tự chủ và tính công bằng","Tác động của bối cảnh thị trường"],
    family:["Góc nhìn và mong muốn của các thành viên, khi an toàn và tự nguyện","Điều kiện chăm sóc, sức khỏe, giấc ngủ, tài chính và nguồn hỗ trợ","Diễn biến các sự kiện theo thời gian","Nhu cầu và điểm mạnh của trẻ thay vì chỉ tập trung vào hành vi khó khăn"],
    community:["Người có ít tiếng nói và thành viên mới","Minh bạch tài chính và quyền ra quyết định","Mức an toàn và khả năng giải quyết bất đồng","Kết quả cộng đồng thực sự nhận được"],
    school:["Sự an toàn và tiếng nói của học sinh","Khả năng tiếp cận điều chỉnh học tập","Sức khỏe và điều kiện làm việc của giáo viên","Số liệu tham gia, tiến bộ và phản hồi qua thời gian"],
    nonprofit:["Tiếng nói của người thụ hưởng","Bằng chứng kết quả thay vì chỉ số hoạt động","Quản trị, bảo vệ người yếu thế, tài chính","Chi phí và hiệu quả của từng giải pháp"],
    public:["Chất lượng dịch vụ và thời gian xử lý","Sự công bằng trong thực tế theo nhiều nhóm","Minh bạch, chính trực và kiểm soát lợi ích","Khả năng người dân tham gia và nhận phản hồi"]
  };
  var extras={
    company:[
      ["customer_value","Kết quả khách hàng","Khách hàng rời bỏ, khiếu nại hoặc không quay lại","Có xu hướng mất khách hoặc hoàn tiền mà chưa phân tích lý do.","Phân tích lý do và thử xử lý một điểm nghẽn.","Tỷ lệ khách hàng quay lại"],
      ["role_clarity","Tổ chức công việc","Quyền quyết định và trách nhiệm không rõ","Nhiều việc bị trễ do trùng thẩm quyền hoặc không ai chịu trách nhiệm.","Vẽ sơ đồ phân quyền và thử quy trình bàn giao.","Thời gian ra quyết định"],
      ["worker_safety","An toàn lao động","Nguy cơ quấy rối, bắt nạt hoặc mất an toàn chưa được xử lý","Có dấu hiệu hoặc báo cáo về mất an toàn thể chất/tâm lý mà biện pháp kiểm soát chưa phù hợp.","Ưu tiên bảo vệ và đánh giá rủi ro cùng người chịu ảnh hưởng.","Mức giảm tiếp xúc nguy cơ"],
      ["learning_culture","Điểm mạnh bảo vệ","Tổ chức học từ sai sót và bảo vệ phản biện","Có báo cáo sai sót không đổ lỗi và biện pháp được kiểm tra sau triển khai.","Duy trì vòng học hỏi và giám sát.","Tỷ lệ cải tiến đã đo kết quả",true]
    ],
    family:[
      ["healthcare","Sức khỏe và hỗ trợ","Thành viên gặp trở ngại khi tiếp cận chăm sóc phù hợp","Chi phí, khoảng cách, chờ đợi hoặc rào cản giao tiếp làm khó việc chăm sóc sức khỏe.","Xác định rào cản cụ thể và tìm hỗ trợ phù hợp.","Thời gian tiếp cận hỗ trợ"],
      ["sleep","Sức khỏe và hỗ trợ","Thiếu ngủ hoặc kiệt sức kéo dài trong chăm sóc","Lịch làm việc và trách nhiệm chăm sóc khiến người lớn thiếu nghỉ ngơi kéo dài.","Thử tái phân bổ công việc và tìm nguồn hỗ trợ nghỉ ngơi.","Số đêm thiếu ngủ đáng kể mỗi tuần"],
      ["essential_needs","Nguồn lực thiết yếu","Nhu cầu thực phẩm, nhà ở hoặc điện nước chưa được đảm bảo","Có những nhu cầu cơ bản phải trì hoãn hoặc không được đáp ứng.","Ưu tiên hỗ trợ nhu cầu thiết yếu, xây ngân sách thực tế.","Số nhu cầu thiết yếu chưa được đáp ứng"],
      ["child_voice","Điểm mạnh bảo vệ","Trẻ được lắng nghe theo cách phù hợp lứa tuổi","Trẻ có cơ hội bày tỏ lo lắng và lựa chọn theo khả năng giao tiếp.","Duy trì việc lắng nghe và điều chỉnh giao tiếp.","Mức cảm nhận được lắng nghe",true],
      ["community_support","Điểm mạnh bảo vệ","Gia đình có mạng lưới hỗ trợ tin cậy","Có người thân, bạn bè hoặc dịch vụ có thể hỗ trợ an toàn khi cần.","Duy trì hỗ trợ và giảm phụ thuộc vào một người.","Khả năng tiếp cận hỗ trợ",true]
    ],
    school:[
      ["attendance","Tham gia học tập","Xu hướng vắng học hoặc tránh đến trường tăng","Tỷ lệ đi học giảm và nguyên nhân chưa được xác định.","Tìm hiểu với học sinh và gia đình, đảm bảo an toàn.","Mức tham gia học an toàn"],
      ["teacher_wellbeing","Nhân lực","Giáo viên thiếu hỗ trợ hoặc quá tải","Giờ làm kéo dài, thiếu nhân lực hoặc mức nghỉ việc tăng.","Rà soát khối lượng công việc và phân bổ hỗ trợ.","Giờ làm thêm và tỷ lệ nghỉ việc"],
      ["learning_progress","Kết quả học tập","Chỉ đo điểm số mà không đo tiến bộ và công bằng","Thiếu dữ liệu tiến bộ theo nhóm nhu cầu.","Thiết lập theo dõi tiến bộ và trải nghiệm học.","Chỉ số tiến bộ theo thời gian"],
      ["student_voice","Điểm mạnh bảo vệ","Học sinh có cơ chế góp ý an toàn và được phản hồi","Có kênh phản hồi, người phụ trách và kết quả công khai phù hợp.","Duy trì cơ chế lắng nghe.","Tỷ lệ phản hồi được xử lý",true]
    ],
    community:[
      ["excluded","Tham gia","Nhóm thành viên ít quyền lực khó tham gia","Những người chịu tác động không có cơ hội lên tiếng.","Mở kênh tham gia bảo đảm an toàn.","Độ đa dạng của tiếng nói"],
      ["outcomes","Tác động","Hoạt động nhiều nhưng thiếu đo kết quả","Nhóm đếm số cuộc họp hơn là kết quả đạt được.","Định nghĩa mục tiêu đo được.","Kết quả theo mục tiêu"],
      ["reciprocity","Điểm mạnh bảo vệ","Mạng lưới hỗ trợ thành viên bền vững","Thành viên giúp đỡ và có sự tin tưởng hai chiều.","Duy trì phản hồi và giúp người mới.","Mức tiếp cận hỗ trợ",true]
    ],
    nonprofit:[
      ["impact","Tác động","Không đo kết quả cho người thụ hưởng","Chỉ đếm lượt hoạt động hoặc tài trợ, thiếu đo thay đổi thực tế.","Xác định kết quả, thời điểm và đường cơ sở.","Thay đổi của chỉ số người thụ hưởng"],
      ["safeguarding","An toàn","Thiếu quy trình bảo vệ người dễ bị tổn thương","Không có kênh báo cáo an toàn và xử lý khách quan.","Thiết lập cơ chế bảo vệ và kiểm tra thực thi.","Tỷ lệ vụ việc được xử lý phù hợp"],
      ["beneficiary_voice","Điểm mạnh bảo vệ","Người thụ hưởng tham gia thiết kế hoạt động","Phản hồi của người được phục vụ có thể thay đổi hoạt động.","Tiếp tục đồng thiết kế.","Tỷ lệ cải tiến dựa trên phản hồi",true]
    ],
    public:[
      ["accessibility","Chất lượng dịch vụ","Có nhóm người dân khó tiếp cận dịch vụ","Rào cản ngôn ngữ, trợ năng, địa lý hoặc kỹ thuật làm tăng thời gian xử lý.","Kiểm tra khả năng tiếp cận theo nhóm.","Chênh lệch tỷ lệ sử dụng dịch vụ"],
      ["conflict_interest","Chính trực","Xung đột lợi ích không được kiểm soát đủ","Hồ sơ, lợi ích hoặc trách nhiệm công bố còn thiếu.","Đánh giá quy trình kiểm soát và giải trình.","Tỷ lệ hồ sơ được rà soát"],
      ["responsiveness","Điểm mạnh bảo vệ","Ý kiến người dân được ghi nhận và tạo thay đổi","Quyết định có giải trình công khai sau tham vấn.","Duy trì vòng phản hồi và đo kết quả.","Tỷ lệ ý kiến được phản hồi",true]
    ]
  };
  function extraFor(type){return (extras[type]||[]).map(function(x){return {id:x[0],group:x[1],title:x[2],description:x[3],action:x[4],measure:x[5],positive:!!x[6]};});}
  function assess(questions,answers,type){
    questions=questions||[];answers=answers||{};
    var known=questions.filter(function(q){var a=answers[q.id];return a&&a.freq!==""&&a.freq!==undefined&&a.freq!==null;});
    var positives=known.filter(function(q){return q.positive&&Number(answers[q.id].freq)>0;});
    var events=known.filter(function(q){return !q.positive&&Number(answers[q.id].freq)>0;});
    var data=known.filter(function(q){return Number(answers[q.id].evidence)>=2;});
    var voices=[...new Set(known.map(function(q){return answers[q.id].voice;}).filter(Boolean))];
    var exposure=function(a,key){var n=Number(a[key]);return n>=1&&n<=3?n:1;};
    var risks=events.map(function(q){var a=answers[q.id],f=Number(a.freq);return {c:q,severity:f,impact:exposure(a,"impact"),duration:exposure(a,"duration"),evidence:Number(a.evidence)||0,priority:f*(exposure(a,"impact")+exposure(a,"duration"))};});
    risks.sort(function(a,b){return b.priority-a.priority||b.evidence-a.evidence;});
    var gaps=[];
    var coverage=questions.length?known.length/questions.length:0;
    if(coverage<.6)gaps.push("Chưa khảo sát đủ nhóm chủ đề; chỉ nên xem kết quả là thăm dò.");
    if(data.length<2)gaps.push("Cần thêm ít nhất hai tài liệu hoặc chuỗi dữ liệu có thể đối chiếu, không chỉ nhận định.");
    if(voices.length<2)gaps.push("Cần thêm góc nhìn từ người chịu tác động (khi có sự đồng ý và bảo đảm an toàn).");
    if(positives.length===0)gaps.push("Chưa ghi nhận yếu tố bảo vệ; không nên chỉ tập trung vào biểu hiện tiêu cực.");
    var safetyIds=["coercion","worker_safety","safety","safeguarding","bullying"];
    var urgent=risks.find(function(x){return safetyIds.includes(x.c.id);})||null;
    return {known:known,risks:risks,positives:positives,knownCount:known.length,total:questions.length,coverage:coverage,sources:data.length,voices:voices,missing:gaps,safety:urgent,usable:known.length>=3&&events.length>=1,contextNeeded:gapsBySector[type]||[],label:coverage<.3?"Chưa đủ dữ liệu":coverage<.65?"Đánh giá sơ bộ":"Đánh giá phạm vi tương đối rộng (chưa được kiểm chứng)"};
  }
  function scenarios(focus,years,start,intensity,measure,target){
    if(!focus)return [];
    var metric=measure||focus.measure||"chỉ số liên quan";
    var goal=target?"Mục tiêu tự đặt: "+target+".":"Chưa có mục tiêu/đường cơ sở định lượng.";
    return [
      {title:"A · Không thay đổi có chủ đích",body:"Theo dõi "+metric+" trong "+years+" năm. Kết quả có thể thay đổi do hoàn cảnh khác; không thể suy ra rằng hiện trạng chắc chắn xấu đi."},
      {title:"B · Thử một biện pháp",body:"Bắt đầu năm "+start+", mức triển khai dự kiến "+intensity+"%: "+focus.action+" Theo dõi "+metric+". "+goal},
      {title:"C · Kết hợp hỗ trợ",body:"Cùng biện pháp trên, thêm hỗ trợ phù hợp và phản hồi từ người chịu ảnh hưởng. Theo dõi cả kết quả ngoài dự kiến. "+goal}
    ];
  }
  return {assess:assess,extraFor:extraFor,scenarios:scenarios,gapsBySector:gapsBySector};
});