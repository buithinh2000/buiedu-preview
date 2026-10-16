// BuiEdu public preview v0.4 — deliberately small, deterministic and honest.
// This is NOT a live LLM. Only selected guided scenarios are supported.
// No external AI, ungrounded profession assumptions, or fabricated mastery.
const CAREER=/(?:giám\s*đốc\s*(?:kinh\s*doanh|bán\s*hàng)|trưởng\s*phòng\s*kinh\s*doanh|(?:sales?|sale)\s*director|(?:sales?)\s*manager|head\s*of\s*sales|director\s*of\s*sales)/i;
const CAREER_WISH=/(?:tôi\s*(?:nói\s*)?(?:muốn|mong|ước)|mình\s*muốn|mục\s*tiêu|i\s*(?:want|mean|would\s*like)|my\s*goal|become|trở\s*thành|lên\s*làm)/i;
const SALES=/(?:bán\s*(?:được|hàng|nhiều)|không\s*bán|chốt\s*đơn|khách\s*hỏi|doanh\s*thu|sell\s*more|can't\s*sell|make\s*more\s*sales)/i;
const UNKNOWN=/(?:không\s*biết|chưa\s*biết|chưa\s*rõ|không\s*rành|tôi\s*không\s*chắc|i\s*(?:still\s*)?(?:don't|dont|do\s*not)\s*know|i'?m\s*not\s*sure|not\s*sure|no\s*idea)/i;
const RESET=/(?:^(?:đổi\s*(?:mục\s*tiêu|chủ\s*đề)|change\s*(?:goal|topic)|start\s*over)$)/i;
const JOB=/(?:file\s*excel|excel|bảng\s*tính|word|email|báo\s*cáo|powerpoint|slide|báo\s*giá|spreadsheet|presentation)/i;
const VI=/(?:\b(tôi|muốn|không|chưa|công|việc|giám|đốc|kinh|doanh|bán|hàng|trở|thành|rành)\b|[ăâđêôơưĂÂĐÊÔƠƯ])/i;
const maxMessage=500;
function safe(input){
 if(typeof input!=='string')throw Error('invalid_message');
 const s=input.trim();
 if(s.length>maxMessage)throw Error('message_too_long');
 return s;
}
function chooseLocale(message,requested,previous){
 if(!['en','vi'].includes(requested))throw Error('unsupported_locale');
 if(message&&VI.test(message))return 'vi';
 if(message&&/\b(?:i|what|dont|don't|never|no|not|become|director|sales|manager|please|help)\b/i.test(message))return 'en';
 return previous||requested;
}
const options=(l,values)=>values.map(([id,vi,en])=>({id,label:l==='vi'?vi:en}));
const careerRoles=l=>options(l,[
 ['sales','Tôi đang làm kinh doanh','I currently work in sales'],
 ['lead','Tôi đang quản lý nhóm','I lead a team'],
 ['new','Tôi chưa có kinh nghiệm','I am new to this field'],
 ['unknown','Tôi chưa biết bắt đầu từ đâu',"I don't know where to start"]
]);
const careerChoices=l=>options(l,[
 ['explore','Tìm hiểu nguyên nhân trước','Investigate the cause first'],
 ['pressure','Chỉ yêu cầu bán nhiều hơn','Just demand more sales'],
 ['unknown','Tôi không chắc','I am not sure']
]);
const nextTopics=l=>options(l,[
 ['numbers','Học xem bảng doanh số','Understand sales numbers'],
 ['coaching','Học hướng dẫn nhân viên','Learn to coach staff'],
 ['unknown','Bạn chọn bước phù hợp giúp tôi','Choose a suitable next step']
]);
const salesChoices=l=>options(l,[
 ['few','Ít người hỏi mua','Few people ask'],
 ['asks','Có hỏi nhưng không mua','People ask but do not buy'],
 ['repeat','Mua một lần rồi không quay lại','Customers do not return'],
 ['unknown','Tôi chưa biết nguyên nhân','I do not know the cause']
]);
const workChoices=l=>options(l,[
 ['excel','Bảng tính / Excel','Spreadsheets / Excel'],
 ['writing','Báo cáo hoặc email','Reports or emails'],
 ['career','Định hướng nghề nghiệp','Career development'],
 ['unknown','Tôi chưa biết','I do not know']
]);
function reply(state,action,message,opts=[]){
 return {state,action,reply:message,options:opts,changed:true};
}
function stateOf(domain,goal,locale,previous=null){
 return {schemaVersion:4,domain,goal,locale,version:0,
  phase:'',role:'unknown',focus:null,previousGoal:previous,
  attempts:0,verified:false,questionCount:0};
}
function careerExample(locale){
 return locale==='vi'?
  'Ví dụ GIẢ ĐỊNH: Bạn phụ trách đội có 3 nhân viên. Mục tiêu mỗi người là 10 đơn/tháng. A đạt 10, B đạt 2, C đạt 7.\n\nBạn sẽ làm gì trước để giúp cả đội cải thiện?':
  'FICTIONAL example: You lead three salespeople, each with a target of 10 orders a month. A sold 10, B sold 2, and C sold 7.\n\nWhat would you do first to improve the team?';
}
function careerStart(message,locale,previous=null){
 const s=stateOf('career',message,locale,previous);
 s.phase='position';
 const lead=locale==='vi'?
  'Bạn đang hướng tới vai trò giám đốc kinh doanh — đó là mục tiêu nghề nghiệp, không phải chỉ bán thêm vài đơn. Công việc thường gồm đặt mục tiêu, hiểu số liệu, phát triển đội ngũ và lập kế hoạch.\n\nBạn không cần biết hết từ đầu. Hiện bạn gần với tình huống nào nhất?':
  'You want to become a sales director. That is a career goal, not just a request to sell more. The role involves targets, sales numbers, developing a team, and planning.\n\nYou do not need to know everything already. What best describes where you are now?';
 return reply(s,'ASK',lead,careerRoles(locale));
}
function salesStart(message,locale,previous=null){
 const s=stateOf('sales',message,locale,previous);s.phase='obstacle';
 return reply(s,'ASK',locale==='vi'?
  'Mình sẽ không vội khuyên chạy quảng cáo. Để tìm lý do bán hàng chưa hiệu quả, tình huống nào gần thực tế nhất?':
  'I won’t assume you need more advertising. Which situation is closest to what happens when you try to sell?',salesChoices(locale));
}
function workStart(message,locale,previous=null){
 const s=stateOf('work',message,locale,previous);s.phase='direction';
 return reply(s,'ASK',locale==='vi'?
  'Mình chưa biết chính xác việc bạn muốn cải thiện nên sẽ không đoán. Bạn muốn bắt đầu từ loại kết quả nào?':
  'I am not yet sure what outcome you want, so I won’t guess. Which type of result should we start with?',workChoices(locale));
}
function isCareerGoal(message){
 const occurrence=CAREER.exec(message);
 if(!occurrence)return false;
 const before=message.slice(0,occurrence.index);
 // "My boss is a sales director and needs an email" is NOT a desire to become one.
 return CAREER_WISH.test(before)&&!/(?:\b(?:email|send|ask)\b|gửi\s*(?:email|thư))/i.test(before);
}
function previewForGoal(message,locale,previous=null){
 if(isCareerGoal(message))return careerStart(message,locale,previous);
 if(SALES.test(message)&&!CAREER.test(message))return salesStart(message,locale,previous);
 return workStart(message,locale,previous);
}
export function beginGoal(message,locale='vi'){
 const text=safe(message);
 if(!text)throw Error('goal_required');
 return previewForGoal(text,chooseLocale(text,locale));
}
function careerTurn(state,text,choice,locale){
 const s={...state,locale,version:state.version+1,questionCount:state.questionCount+1};
 if(state.phase==='position'){
  const allowed=['sales','lead','new','unknown'];
  const role=allowed.includes(choice)?choice:
   UNKNOWN.test(text)?'unknown':
   /quản\s*lý|lead|manage/i.test(text)?'lead':
   /nhân\s*viên|đang\s*bán|work\s*in\s*sales/i.test(text)?'sales':'unknown';
  s.role=role;s.phase='scenario';
  const intro=role==='unknown'?(locale==='vi'?
   'Chưa rõ điểm xuất phát cũng được. Mình sẽ bắt đầu từ một ví dụ dễ, không cần biết AI hay thuật ngữ quản lý.\n\n':
   "That's fine. We can start with a simple example, no AI experience needed.\n\n"):'';
  return reply(s,'TEACH',intro+careerExample(locale),careerChoices(locale));
 }
 if(state.phase==='scenario'){
  if(choice==='unknown'||(!choice&&UNKNOWN.test(text))){
   s.version=state.version;s.questionCount=state.questionCount;
   return reply(s,'SUPPORT',locale==='vi'?
    'Gợi ý: nếu B chỉ đạt 2 đơn, ta chưa biết B ít khách, cần luyện tư vấn hay đang gặp trở ngại khác. Giám đốc nên tìm nguyên nhân trước khi đưa giải pháp. Bạn muốn chọn cách tìm hiểu nguyên nhân không?':
    'Hint: B has only 2 orders, but we do not know why. It could be too few leads, a skills gap, or something else. First investigate, then decide. Would you explore the cause?',careerChoices(locale));
  }
  s.phase='numbers';
  const explanation=locale==='vi'?
   'Một quyết định hợp lý là hỏi B đang vướng ở đâu và xem dữ liệu bán hàng trước khi gây áp lực. Ta không thể kết luận chỉ từ số đơn.\n\nBước nhỏ tiếp theo: mục tiêu cả đội là 30 đơn, thực tế 10 + 2 + 7 = 19 đơn, còn thiếu 11. Giám đốc cần nhìn được khoảng cách này và tìm lý do.\n\nBạn muốn thử phần nào trước?':
   'A useful first step is to ask B about blockers and review the sales data, not immediately blame them. Order counts alone cannot reveal the cause.\n\nNext: target = 30 orders; actual = 10 + 2 + 7 = 19; gap = 11. A director must understand the gap and investigate why.\n\nWhich part would you like to try first?';
  return reply(s,'PRACTICE',explanation,nextTopics(locale));
 }
 if(state.phase==='numbers'){
  const selected=['coaching','numbers','unknown'].includes(choice)?choice:'unknown';
  s.phase='reflect';s.focus=selected;
  const lesson=selected==='coaching'?
   (locale==='vi'?'Thử ngay: nếu B nói “Em có ít khách hỏi mua”, hãy chọn câu hỏi đầu tiên: “Em đang có bao nhiêu khách tiềm năng?” hay “Sao em bán kém vậy?”. Vì sao?':
   'Practice: B says "I have too few interested customers." Which question helps more: "How many leads do you have?" or "Why are your sales so bad?" Why?'):
   (locale==='vi'?'Thử ngay: mục tiêu 30 đơn, thực tế 19 đơn. Bạn thử nói bằng lời mình rằng đội đã đạt bao nhiêu phần trăm mục tiêu. Có thể ước lượng, không cần biết công thức Excel.':
   'Practice: target 30 orders, actual 19. Explain approximately what percentage of the target the team achieved. You do not need Excel to start.');
  return reply(s,'PRACTICE',lesson,options(locale,[['help','Cho tôi ví dụ / giải thích','Show an example / explain'],['try','Tôi muốn thử trả lời','I want to answer']]));
 }
 if(state.phase==='reflect'){
  if(choice==='help'||UNKNOWN.test(text)){
   s.version=state.version;
   return reply(s,'SUPPORT',s.focus==='coaching'?
    (locale==='vi'?'Hỏi về số khách tiềm năng giúp tìm nguyên nhân; trách móc không giúp ta hiểu khó khăn. Bạn có thể thử đề xuất một câu hỏi thân thiện hơn.':
    'Asking about leads helps identify the cause; blaming does not. Try asking a helpful question.') :
    (locale==='vi'?'Ta lấy 19 chia cho 30, được khoảng 0,63, tức 63%. Con số này chưa nói nguyên nhân vì sao thiếu 11 đơn. Bạn muốn tự giải thích ý nghĩa 63% không?':
    '19 divided by 30 is about 0.63, or 63%. This does not explain the reason for the gap. Can you explain what 63% tells us?'),options(locale,[['try','Tôi thử trả lời','Let me try']]));
  }
  s.phase='review';s.report={status:'self_reported',text:text||''};
  return reply(s,'REVIEW',locale==='vi'?
   'Cảm ơn bạn đã thử. Đây mới là phần bạn tự báo cáo, chưa phải đánh giá năng lực. Muốn tiến gần vai trò giám đốc, ta sẽ luyện lần lượt: hiểu số liệu, tìm nguyên nhân, hỗ trợ đội và lập kế hoạch. Bạn có thể kể chỗ nào đang khó để mình điều chỉnh.':
   'Thanks for trying. This is your own report, not verified mastery. We can gradually practise reading numbers, investigating causes, coaching a team, and planning. Tell me what is still difficult so the next step can be adjusted.',[]);
 }
 return reply(s,'RESUME',locale==='vi'?
  'Mình có thể tiếp tục từ mục tiêu trở thành giám đốc kinh doanh. Hãy nói điều bạn còn vướng, hoặc chọn “Bắt đầu lại”.':
  'We can continue working toward your sales director goal. Tell me what still feels difficult, or start again.',[]);
}
function salesTurn(state,text,choice,locale){
 const s={...state,locale,version:state.version+1};
 if(state.phase==='obstacle'){
  const valid=['few','asks','repeat','unknown'];
  s.focus=valid.includes(choice)?choice:'unknown';
  s.phase='smallPractice';
  const lessons={
   few:['Nếu ít khách hỏi, ta cần biết họ có nhìn thấy sản phẩm và hiểu lợi ích không. Ví dụ GIẢ ĐỊNH: 100 người xem bài, 2 người hỏi. Bước đầu là kiểm tra cách giới thiệu sản phẩm, không tự động chi tiền quảng cáo.',
   'If few people ask, check whether they see the offer and understand its value. FICTIONAL example: 100 views, 2 inquiries. Review the message before spending on ads.'],
   asks:['Nếu khách hỏi nhưng không mua, chưa thể kết luận chỉ do giá. Ví dụ GIẢ ĐỊNH: khách hỏi “Có bảo hành không?”. Hãy xác định thông tin còn thiếu trước khi trả lời.',
   'If buyers ask but do not purchase, price is not necessarily the cause. FICTIONAL example: a buyer asks about a warranty. Verify facts before replying.'],
   repeat:['Nếu khách ít quay lại, hãy tìm hiểu trải nghiệm sau mua. Ví dụ GIẢ ĐỊNH: 10 người mua, 1 người quay lại. Đây chưa phải bằng chứng sản phẩm kém.',
   'If customers rarely return, review what happened after purchase. FICTIONAL example: 10 sales and 1 return buyer do not prove the product is bad.'],
   unknown:['Chưa biết nguyên nhân cũng được. Ví dụ GIẢ ĐỊNH: 10 khách xem hàng, 2 hỏi giá, 1 mua. Ta sẽ học cách quan sát từng bước thay vì phỏng đoán.',
   'It is fine not to know yet. FICTIONAL example: 10 people viewed, 2 asked, 1 bought. Track each step before drawing conclusions.']
  };
  return reply(s,'TEACH',lessons[s.focus][locale==='vi'?0:1]+'\n\n'+(locale==='vi'?
   'Nếu gặp tình huống này, bạn muốn kiểm tra điều gì trước? Cứ trả lời theo suy nghĩ của bạn, không cần biết AI.':
   'What would you check first in that situation? Answer naturally; no AI knowledge needed.'),options(locale,[['help','Cho tôi một gợi ý','Give me a hint'],['try','Tôi muốn thử trả lời','Let me answer']]));
 }
 if(choice==='help'||UNKNOWN.test(text)){
  s.version=state.version;return reply(s,'SUPPORT',locale==='vi'?
   'Hãy quan sát một bước có thể kiểm chứng: khách đã thấy sản phẩm chưa, họ hỏi gì, họ hiểu lợi ích chưa? Chỉ chọn một bước; chưa cần chạy quảng cáo hay tạo báo cáo.':
   'Choose one observable step: did people see the offer, what did they ask, and did they understand it? No ads or reports are needed yet.',options(locale,[['try','Tôi thử trả lời','Let me answer']]));
 }
 s.phase='review';s.report={status:'self_reported',text};
 return reply(s,'REVIEW',locale==='vi'?
  'Mình đã ghi nhận cách bạn nghĩ. Ta sẽ không khẳng định đúng sai khi chưa có dữ liệu thật. Bạn có thể chia sẻ thêm một tình huống đã ẩn danh để mình giúp phân tích từng bước.':
  'I have your initial thinking. Without real data, I will not claim a diagnosis. You can describe an anonymized situation for a more specific next step.',[]);
}
function workTurn(state,text,choice,locale){
 const s={...state,locale,version:state.version+1};
 if(state.phase==='direction'){
  if(choice==='career')return careerStart(locale==='vi'?'Tôi muốn phát triển nghề nghiệp':'I want career development',locale,state.goal);
  if(choice==='excel'||(/excel|bảng\s*tính|spreadsheet/i.test(text))){
   s.phase='guided';s.focus='excel';
   return reply(s,'TEACH',locale==='vi'?
    'Mình có thể bắt đầu ngay bằng ví dụ GIẢ ĐỊNH: 2 món giá 100 đồng/món, 3 món giá 50 đồng/món. Tổng là 350 đồng.\n\nBạn muốn tự tính lại, hay xem bảng CSV mẫu có thể mở bằng Excel ở bên dưới?':
    'Let’s try a FICTIONAL example: 2 items at 100 each and 3 items at 50 each. Total = 350.\n\nWould you like to calculate it yourself or open the sample CSV below in Excel?',options(locale,[['try','Tôi tính thử','Let me calculate'],['example','Xem mẫu trước','Show me the example']]));
  }
  if(choice==='writing'||(/word|email|báo\s*cáo/i.test(text))){
   s.phase='guided';s.focus='writing';
   return reply(s,'TEACH',locale==='vi'?
    'Ví dụ GIẢ ĐỊNH: một nhân viên đã hoàn thành 3 việc, còn 1 việc bị chậm. Báo cáo ngắn có thể gồm: Đã làm 3 việc; Chậm 1 việc; Bước tiếp theo là xác nhận thời hạn.\n\nBạn muốn thử viết lại bằng lời của mình, hay xem thêm một ví dụ?':
    'FICTIONAL example: an employee finished 3 tasks and 1 is late. A short report can state results, blocker and next step.\n\nWant to try explaining this in your own words, or see another example?',options(locale,[['try','Tôi thử viết','Let me try'],['example','Xem ví dụ','Show me more']]));
  }
  s.phase='undecided';return reply(s,'ASK',locale==='vi'?
   'Bạn chưa cần chọn ngay. BuiEdu hiện mới mô phỏng một số tình huống; để tránh hiểu sai, bạn có thể chọn một kết quả muốn xem mẫu: Excel, báo cáo hoặc định hướng nghề nghiệp.':
   'You do not need to decide yet. This preview has only a few guided examples. Choose an Excel example, a report, or career guidance so I do not misinterpret you.',workChoices(locale));
 }
 if(state.phase==='undecided')return workTurn({...state,phase:'direction'},text,choice,locale);
 if(state.phase==='guided'){
  if(choice==='example'||UNKNOWN.test(text))return reply(state,'SUPPORT',locale==='vi'?
   'Bạn có thể xem ví dụ ở trên rồi chọn một điều muốn hiểu rõ hơn. Đây là bản mẫu, không phải tài liệu AI đã làm từ dữ liệu của bạn.':
   'Use the example above and choose the part you want to understand. It is sample content, not an AI-generated file from your own data.',[]);
  s.phase='review';
  return reply(s,'REVIEW',locale==='vi'?
   'Bạn đã thử bước đầu. BuiEdu chưa có khả năng tự kiểm tra bài làm trong bản demo này; phiên bản AI thật sẽ cần đọc và đánh giá sản phẩm thực tế.':
   'You tried the first step. This preview cannot evaluate your work; the live AI tutor will need to inspect actual outcomes.',[]);
 }
 return reply(s,'RESUME',locale==='vi'?'Bạn có thể mô tả điều muốn học tiếp hoặc đổi mục tiêu.':'You can describe what to learn next or switch goals.',[]);
}
export function continueGoal(state,{message='',choice='',locale=state?.locale}={}){
 if(!state||state.schemaVersion!==4)throw Error('invalid_state');
 const text=safe(message);
 const l=chooseLocale(text,locale,state.locale);
 if(RESET.test(text))return workStart(l==='vi'?'Tôi muốn học một điều mới':'I want a new goal',l,state.goal);
 if(!choice&&text){
  const newCareer=isCareerGoal(text);
  const newSales=SALES.test(text)&&CAREER_WISH.test(text)&&!CAREER.test(text);
  if(newCareer && state.domain!=='career'){
   const r=careerStart(text,l,state.goal);r.state.version=state.version+1;r.topicChanged=true;return r;
  }
  if(newSales && state.domain!=='sales'){
   const r=salesStart(text,l,state.goal);r.state.version=state.version+1;r.topicChanged=true;return r;
  }
  if(newCareer&&state.domain==='career'&& /^(?:ý tôi|tôi nói|i mean|i said|actually)/i.test(text)){
   const r=careerStart(text,l,state.previousGoal);r.state.version=state.version+1;return r;
  }
 }
 if(state.domain==='career')return careerTurn(state,text,choice,l);
 if(state.domain==='sales')return salesTurn(state,text,choice,l);
 return workTurn(state,text,choice,l);
}
