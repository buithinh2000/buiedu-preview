// Public preview snapshot of ../engineering/intent-router.mjs — phrase-based, not a live AI model.
// BuiEdu v0.3 PREVIEW intent router. No model calls; limited phrase/choice recognition.
// Critical contract: a strong new user goal supersedes the old stage. No diagnosis inferred.
// The state remains in the browser only; never store private learner data in this preview.
import {initialDiscovery,advanceDiscovery,safeAnswer,classifyGoal} from './guided-discovery.mjs';

const careerSignals=/(?:giám\s*đốc\s*(?:kinh\s*doanh|bán\s*hàng)|trưởng\s*phòng\s*kinh\s*doanh|(?:làm|trở\s*thành|lên)\s*(?:quản\s*lý\s*kinh\s*doanh)|sales\s*(?:director|manager)|head\s*of\s*sales)/i;
const goalStatement=/(?:tôi\s*(?:nói\s*)?(?:muốn|cần)|mình\s*muốn|ý\s*tôi\s*là|mục\s*tiêu\s*(?:của\s*tôi)?|i\s*(?:want|mean|would\s*like)|my\s*goal)/i;
const learningSignals=/(?:học\s*(?:tiếng\s*anh|ngoại\s*ngữ|lập\s*trình|kỹ\s*năng)|learn\s*(?:english|coding|a\s*skill))/i;
const salesSignals=/(?:bán\s*(?:được|hàng|nhiều)|doanh\s*thu|chốt\s*đơn|khách\s*mua|sell\s*more|make\s*more\s*sales)/i;
const careerChoices={
 vi:{
  role:[["sales_staff","Tôi đang làm nhân viên kinh doanh"],["manager","Tôi đang quản lý một nhóm"],["new","Tôi chưa làm trong ngành"],["unsure","Tôi chưa rõ lộ trình"],["other","Khác"]],
  focus:[["leadership","Quản lý và phát triển đội ngũ"],["planning","Lập kế hoạch kinh doanh"],["metrics","Hiểu số liệu và doanh thu"],["unsure","Tôi chưa biết cần học gì"],["other","Khác"]],
  familiarity:[["never","Chưa từng dùng AI"],["some","Đã dùng vài lần"],["regular","Tôi dùng AI thường xuyên"],["skip","Bỏ qua"]],
  confirm:[["yes","Đúng rồi"],["correct","Chưa đúng"],["unsure","Tôi không chắc"]],
  practice:[["tried","Tôi đã thử"],["help","Cho ví dụ đơn giản hơn"],["later","Để sau"]]
 },
 en:{
  role:[["sales_staff","I work in sales"],["manager","I manage a team"],["new","I have not worked in sales"],["unsure","I don't know the path yet"],["other","Something else"]],
  focus:[["leadership","Lead and develop a team"],["planning","Plan sales activities"],["metrics","Understand sales metrics"],["unsure","I don't know what to learn"],["other","Something else"]],
  familiarity:[["never","Never used AI"],["some","Tried AI a few times"],["regular","Use AI regularly"],["skip","Skip"]],
  confirm:[["yes","Yes"],["correct","Not quite"],["unsure","I'm not sure"]],
  practice:[["tried","I tried"],["help","Show an easier example"],["later","Maybe later"]]
 }
};
function choices(locale,stage){
 const list=careerChoices[locale]?.[stage]||[];
 return list.map(([id,label])=>({id,label}));
}
function goalKind(message){
 if(careerSignals.test(message))return "career";
 if(learningSignals.test(message))return "learning";
 if(salesSignals.test(message))return "sales";
 return "unknown";
}
function statedGoal(message){
 const text=safeAnswer(message);
 return goalStatement.test(text)?goalKind(text):"unknown";
}
function extractGoal(message){
 const text=safeAnswer(message);
 // Remove the outer "I said..." but never silently reinterpret the user's meaning.
 return text.replace(/^\s*(?:tôi\s*(?:đã\s*)?(?:nói|bảo)\s*(?:rằng|là)?\s*|ý\s*tôi\s*là\s*|i\s*said\s*(?:that\s*)?)/i,"").trim();
}
function careerInitial(message,locale){
 const text=safeAnswer(extractGoal(message));
 const state={schemaVersion:2,version:0,locale,domain:"career",goal:text,
   phase:"role",role:null,roleText:null,focus:null,skill:null,
   provisional:true,evidence:null,previousGoal:null,questionCount:0};
 const reply=locale==="vi"?
  "Mình hiểu mục tiêu của bạn là phát triển để trở thành giám đốc kinh doanh — đây là lộ trình nghề nghiệp, không phải vấn đề chốt một đơn hàng. Bạn đang ở vị trí nào gần nhất?":
  "Your goal is to become a sales director — a career path, not merely selling more products. What best describes your current experience?";
 return {state,action:"ASK",reply,options:choices(locale,"role"),changed:false};
}
export function beginGoal(message,locale="vi"){
 if(!["vi","en"].includes(locale))throw new Error("unsupported_locale");
 const text=safeAnswer(message);
 if(!text)throw new Error("goal_required");
 if(goalKind(text)==="career")return careerInitial(text,locale);
 return initialDiscovery(text,locale);
}
function describeRole(s){
 const vi=s.locale==="vi";
 const map=vi?{
  sales_staff:"đang làm nhân viên kinh doanh",manager:"đã quản lý đội nhóm",
  new:"chưa làm trong ngành",unsure:"chưa rõ lộ trình",other:"có kinh nghiệm chưa rõ"
 }:{
  sales_staff:"working in sales",manager:"managing a team",
  new:"new to the industry",unsure:"unsure of the path",other:"with experience still unclear"
 };
 return map[s.role]||map.other;
}
function careerTask(s){
 const vi=s.locale==="vi";
 const targets=vi?{
  leadership:"quản lý và hướng dẫn đội nhóm",
  planning:"lập kế hoạch doanh số",
  metrics:"phân tích số liệu bán hàng",
  unsure:"xác định kỹ năng quan trọng của giám đốc kinh doanh",
  other:"xác định kỹ năng cần cải thiện"
 }:{
  leadership:"leading and coaching a team",
  planning:"sales planning",
  metrics:"understanding sales numbers",
  unsure:"identifying key director skills",
  other:"identifying the skills to improve"
 };
 const focus=targets[s.focus]||targets.other;
 return vi?
  `Đây là bài thực hành, không phải lời hứa thăng chức. Hãy mở một công cụ AI đáng tin cậy và viết: “Tôi muốn trở thành giám đốc kinh doanh. Hiện tôi ${describeRole(s)}. Hãy hỏi tôi từng câu để xây một bài tập nhỏ về ${focus}. Không giả định tôi đã có kinh nghiệm; đưa ví dụ dễ hiểu và cách tự kiểm tra.”\n\nBạn có thể dùng tình huống giả, không cần đưa dữ liệu khách hàng. Nếu chưa quen AI, chọn “Cho ví dụ đơn giản hơn”.`:
  `Try this small learning task, not a promise of promotion. Open an AI tool you trust and ask: “I want to become a sales director. I'm ${describeRole(s)}. Ask me one question at a time, then create a small exercise on ${focus} with an example and a way to check my work. Don't invent my experience.” Use fictional customer data.`;
}
function careerTurn(state,{message="",choice="",locale=state.locale}={}){
 if(locale!==state.locale)throw new Error("locale_mismatch");
 const text=safeAnswer(message);
 const answers=choices(locale,state.phase);
 const valid=answers.some(o=>o.id===choice)?choice:null;
 const vi=locale==="vi";
 if(!text&&!valid)return {state,action:"ASK",reply:vi?"Bạn có thể chọn một gợi ý, hoặc trả lời ngắn bằng lời của mình.":"Choose an option or use your own words.",options:answers,changed:false};
 const next={...state,version:state.version+1,questionCount:state.questionCount+1};
 let reply="",action="ASK";
 if(state.phase==="role"){
  next.role=valid||(/quản\s*lý|manager|team\s*lead/i.test(text)?"manager":/nhân\s*viên|sales\s*rep/i.test(text)?"sales_staff":/chưa|never|new/i.test(text)?"new":"other");
  next.roleText=text&&!valid?text:null;
  next.phase="focus";
  reply=vi?"Nếu muốn tiến lên vị trí giám đốc kinh doanh, phần nào bạn muốn tìm hiểu hoặc thấy khó nhất? Không biết cũng được.":"Which part of a sales director's role would you like to understand or improve? It's okay not to know.";
 }else if(state.phase==="focus"){
  next.focus=valid||"other";next.phase="confirm";
  const details=next.roleText?(vi?` Bạn chia sẻ: “${next.roleText}”.`:` You said: “${next.roleText}”.`):"";
  reply=vi?
   `Để kiểm tra mình hiểu đúng: bạn muốn theo đuổi vai trò giám đốc kinh doanh; hiện ${describeRole(next)}.${details} Mình chưa biết đầy đủ kỹ năng hay kinh nghiệm của bạn. Mình hiểu đúng hướng chưa?`:
   `Let me check: you want a sales director role and are currently ${describeRole(next)}.${details} I don't yet know your full experience. Is that right?`;
 }else if(state.phase==="confirm"){
  if(valid==="correct"||/^(chưa đúng|không đúng|no|not quite)/i.test(text)){
   next.phase="role";next.role=null;next.roleText=null;
   reply=vi?"Cảm ơn bạn đã sửa. Vậy tình hình thực tế của bạn gần với lựa chọn nào?":"Thanks for correcting me. Which option is closest to your actual situation?";
  }else if(valid==="unsure"||/không\s*chắc|not\s*sure/i.test(text)){
   next.phase="role";
   reply=vi?"Mình sẽ chưa kết luận. Chỉ cần chọn trải nghiệm gần nhất của bạn hoặc kể một ví dụ.":"Let's avoid assumptions. Choose the closest example, or tell me about one task.";
  }else{
   next.phase="familiarity";next.provisional=false;
   reply=vi?"Để dạy phù hợp: bạn đã từng dùng ChatGPT hoặc AI để học hay làm việc chưa?":"To tailor the next step, have you used ChatGPT or AI for learning or work?";
  }
 }else if(state.phase==="familiarity"){
  next.skill=valid||"some";next.phase="practice";action="PRACTICE";
  reply=careerTask(next);
 }else if(state.phase==="practice"){
  if(valid==="help"){
   return {state,changed:false,action:"PRACTICE",options:choices(locale,"practice"),reply:vi?
    "Ví dụ siêu ngắn: mở AI và gõ “Tôi chưa biết giám đốc kinh doanh làm gì. Hãy giải thích cho tôi bằng một ví dụ có 3 nhân viên, rồi hỏi tôi 1 câu dễ trả lời.” Dùng ví dụ giả, không cần thông tin công ty thật.":
    "Try: 'Explain what a sales director does using a fictional team of three people. Ask me one easy question to check understanding.'"};
  }
  if(valid==="later")return {state,changed:false,action:"RESUME",options:choices(locale,"practice"),reply:vi?"Bạn có thể trở lại khi sẵn sàng; mình chưa ghi nhận hoàn thành.":"Return when ready; nothing has been marked complete."};
  next.phase="reflect";
  reply=vi?"Bạn đã tự thử phần nào? Có gì hữu ích, chỗ nào còn khó? Nếu chưa làm được, cứ nói thật.":"What did you try, what helped, and what was difficult? It's okay if you couldn't do it.";
 }else if(state.phase==="reflect"){
  next.phase="review";next.evidence={status:"self_reported",text};
  action="EVALUATE";
  reply=vi?"Đã ghi nhận phần bạn tự kể, chưa xác minh kết quả. Ta sẽ chỉnh bài tập dựa trên điều bạn thấy khó, chứ không tự khẳng định bạn đã thành thạo.":"I recorded your self-report, not verified mastery. We can adjust the next task based on what was difficult.";
 }else{
  next.version=state.version;
  return {state,changed:false,action:"RESUME",reply:vi?"Bạn có thể bắt đầu mục tiêu khác bằng cách nói 'Tôi muốn...'":"You can switch to another goal by saying 'I want to...'",options:[]};
 }
 if(next.phase==="confirm")return {state:next,action,reply,changed:true,options:[
  {id:"yes",label:vi?"Đúng rồi":"Yes"},{id:"correct",label:vi?"Chưa đúng":"Not quite"},{id:"unsure",label:vi?"Tôi không chắc":"I'm not sure"}
 ]};
 return {state:next,action,reply,changed:true,options:choices(locale,next.phase)};
}
export function continueGoal(state,{message="",choice="",locale=state?.locale}={}){
 if(!state||typeof state!=="object")throw new Error("invalid_state");
 if(locale!==state.locale)throw new Error("locale_mismatch");
 const text=safeAnswer(message);
 // Goal switching takes precedence over forced progression through old questions.
 const explicit=!choice?statedGoal(text):"unknown";
 const previous=state.domain==="career"?"career":state.domain;
 const changedGoal=(explicit==="career"&&previous!=="career")||
   (explicit==="sales"&&previous!=="sales")||
   (explicit==="learning"&&previous!=="general");
 if(changedGoal){
  const started=beginGoal(extractGoal(text),locale);
  const next={...started.state,version:state.version+1,previousGoal:state.goal,shiftReason:"user_changed_goal"};
  const prefix=locale==="vi"?"À, mình hiểu rồi: bạn đang chuyển sang một mục tiêu khác. Xin lỗi vì đã bám vào câu hỏi cũ.\n\n":
   "I see — you're changing goals. Sorry I kept following the previous topic.\n\n";
  return {...started,state:next,reply:prefix+started.reply,changed:true,topicChanged:true};
 }
 // If the user corrects an assumption and includes an explicit goal from same
 // domain, clarify rather than swallowing it as a product or experience detail.
 if(!choice && /^(?:tôi\s*(?:nói|bảo)|ý\s*tôi\s*là|i\s*mean)/i.test(text) && statedGoal(text)!=="unknown"){
  const started=beginGoal(extractGoal(text),locale);
  const next={...started.state,version:state.version+1,previousGoal:state.goal,shiftReason:"user_restated_goal"};
  return {...started,state:next,reply:(locale==="vi"?"Cảm ơn bạn đã nói lại. Mình sẽ bắt đầu từ mục tiêu bạn vừa nêu, không tự gán ý cũ.\n\n":
  "Thanks for clarifying. I'll start from the goal you stated.\n\n")+started.reply,changed:true,topicChanged:true};
 }
 return state.schemaVersion===2?careerTurn(state,{message,choice,locale}):
  advanceDiscovery(state,{message,choice,locale});
}
