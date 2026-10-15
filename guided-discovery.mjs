// Public preview snapshot of ../engineering/adaptive-discovery.mjs. Keep in sync; no LLM calls and no persistent data.
// BuiEdu adaptive discovery policy v0.2 — deterministic experimental layer, no LLM calls.
// NOT CONNECTED to the production Companion Kernel or public preview.
// Hypotheses are labeled as unverified. Only user assertions go into state.
// Future LLM interpretation must return structured observations; policy and safety stay deterministic.
// No personal data stored here; host/application controls consent, auth, persistence and deletion.

const choices = {
  "vi": {
    "sales": {
      "bottleneck": [
        "Ít người hỏi mua",
        "Có người hỏi nhưng ít mua",
        "Khách mua rồi ít quay lại",
        "Tôi chưa biết vấn đề",
        "Khác"
      ]
    },
    "general": {
      "bottleneck": [
        "Tôi chưa biết bắt đầu",
        "Đã thử nhưng chưa hiệu quả",
        "Tôi không có nhiều thời gian",
        "Tôi chưa biết vấn đề",
        "Khác"
      ]
    },
    "confirm": [
      "Đúng rồi",
      "Chưa đúng",
      "Tôi không chắc"
    ],
    "skill": [
      "Chưa từng dùng AI",
      "Đã thử vài lần",
      "Dùng thường xuyên",
      "Bỏ qua"
    ],
    "practice": [
      "Tôi đã thử",
      "Tôi cần ví dụ dễ hơn",
      "Để sau"
    ],
    "observe": [
      "Tôi đã quan sát",
      "Tôi chưa biết cách",
      "Bỏ qua"
    ]
  },
  "en": {
    "sales": {
      "bottleneck": [
        "Few people ask to buy",
        "People ask but rarely buy",
        "Customers rarely return",
        "I'm not sure",
        "Something else"
      ]
    },
    "general": {
      "bottleneck": [
        "I don't know where to start",
        "I tried but it didn't work",
        "I have little time",
        "I'm not sure",
        "Something else"
      ]
    },
    "confirm": [
      "That sounds right",
      "That's not quite right",
      "I'm not sure"
    ],
    "skill": [
      "Never used AI",
      "Tried it a few times",
      "Use it regularly",
      "Skip"
    ],
    "practice": [
      "I tried it",
      "Show an easier example",
      "Maybe later"
    ],
    "observe": [
      "I observed it",
      "I need an example",
      "Skip"
    ]
  }
};

export function safeAnswer(message,max=500) {
 if(typeof message!=="string") throw new Error("invalid_message");
 const s=message.trim();
 if(s.length>max)throw new Error("message_too_long");
 return s;
}

export function classifyGoal(utterance){
 return /(?:bán\s*(?:được|hàng|nhiều)|doanh\s*thu|đơn\s*hàng|khách\s*mua|chốt\s*đơn|sell|sales|customers?\s*buy)/i.test(utterance)?"sales":"general";
}

export function optionsAt(state){
 const c=choices[state.locale];
 if(state.phase==="bottleneck")return c[state.domain].bottleneck.map((label,i)=>({id:["few","asks","repeat","unknown","other"][i],label}));
 if(state.phase==="confirm")return c.confirm.map((label,i)=>({id:["yes","correct","unsure"][i],label}));
 if(state.phase==="skill")return c.skill.map((label,i)=>({id:["never","some","regular","skip"][i],label}));
 if(state.phase==="practice")return c.practice.map((label,i)=>({id:["tried","help","later"][i],label}));
 if(state.phase==="observe")return c.observe.map((label,i)=>({id:["observed","help","skip"][i],label}));
 return [];
}

export function initialDiscovery(goal,locale="vi"){
 const verbatim=safeAnswer(goal);
 if(!verbatim)throw new Error("goal_required");
 if(!["vi","en"].includes(locale))throw new Error("unsupported_locale");
 const domain=classifyGoal(verbatim);
 const state={schemaVersion:1,version:0,locale,goal:verbatim,domain,phase:"bottleneck",bottleneck:null,detail:null,correction:null,skill:null,questionCount:0,evidence:null,provisional:true};
 const reply=locale==="vi"?(domain==="sales"?
  "Mình sẽ giúp bạn tìm đúng chỗ đang vướng, không vội khuyên chạy quảng cáo. Tình huống nào gần với thực tế của bạn nhất?":
  "Mình hiểu bạn muốn thay đổi điều gì đó. Để không đoán sai, tình huống nào giống bạn nhất?"):
  (domain==="sales"?"Let's find the real sticking point before suggesting tactics. Which situation sounds closest?":"Let's avoid guessing. Which situation is closest to yours?");
 return {state,action:"ASK",reply,options:optionsAt(state),changed:false};
}

export function resolveChoice(state,choice,message){
 const valid=optionsAt(state);
 if(typeof choice==="string" && valid.some(o=>o.id===choice))return choice;
 const text=(message||"").trim().toLowerCase();
 if(!text)return null;
 if(state.phase==="bottleneck"){
  if(/không\s*biết|chưa\s*rõ|not\s*sure|don't know|không\s*chắc/.test(text))return "unknown";
  if(/ít\s*người|không\s*có\s*khách|chưa\s*ai|few\s*people|no\s*one/.test(text))return "few";
  if(/hỏi.*(?:không|chưa).*(?:mua|chốt)|hỏi.*ít\s*mua|ask.*(?:not|never|rarely).*buy/.test(text))return "asks";
  if(/không.*quay\s*lại|mua\s*1\s*lần|rarely\s*return|never\s*come\s*back/.test(text))return "repeat";
  return "other";
 }
 if(state.phase==="confirm")return /^(đúng|đúng rồi|yes|correct|exactly|ok)$/i.test(text)?"yes":/không\s*chắc|not\s*sure/.test(text)?"unsure":"correct";
 if(state.phase==="skill")return /chưa\s*từng|never|chưa\s*biết/.test(text)?"never":/thường\s*xuyên|regular/.test(text)?"regular":/bỏ\s*qua|skip/.test(text)?"skip":"some";
 if(state.phase==="practice")return /không\s*biết|giúp|ví\s*dụ|help|example/.test(text)?"help":/để\s*sau|later/.test(text)?"later":"tried";
 if(state.phase==="observe")return /giúp|ví\s*dụ|không\s*biết|help|example/.test(text)?"help":/bỏ\s*qua|skip/.test(text)?"skip":"observed";
 return null;
}

export function summarize(state){
 const vi=state.locale==="vi";
 const c=state.bottleneck;
 const map=vi?{
  few:"chưa có đủ người quan tâm để hỏi mua",
  asks:"đã có người hỏi nhưng chưa mua nhiều",
  repeat:"khách đã mua nhưng ít quay lại",
  other:"vấn đề bạn vừa mô tả chưa được phân loại chắc chắn"
 }:{
  few:"not enough people are asking about your offer",
  asks:"people ask but few purchase",
  repeat:"customers buy once but rarely return",
  other:"the difficulty you've described is not yet clear"
 };
 const context=state.detail? (vi?` Bạn nói đang bán/làm: “${state.detail}”.`:` You mentioned: “${state.detail}”.`):"";
 const core=state.domain==="sales"?(map[c]||map.other):
  (vi?"chưa đạt kết quả mong muốn với mục tiêu đã nêu":"you haven't reached the outcome you want yet");
 const correction=state.correction?(vi?` Bạn đã sửa lại: “${state.correction}”.`:` Your correction: “${state.correction}”.`):"";
 return vi?`Mình hiểu tạm thời là: ${core}.${context}${correction} Đây mới là giả thuyết từ lời bạn kể, không phải kết luận. Mình hiểu đúng chưa?`:
  `My tentative understanding: ${core}.${context}${correction} This is a hypothesis, not a diagnosis. Did I understand correctly?`;
}

export function taskFor(state){
 const vi=state.locale==="vi",sales=state.domain==="sales",key=state.bottleneck;
 if(!vi){
  if(!sales)return "Write one real task and its desired result. Ask an AI tool: 'Break this task into three small steps, ask me for missing context, and don't invent facts.' Check the first step yourself.";
  if(key==="few")return "Describe one item and one true customer benefit. Ask AI for three clear versions of the description; verify every claim before using one.";
  if(key==="asks")return "Write down one anonymized buyer question. Ask AI for two plausible concerns and a respectful answer; verify which concern really applies.";
  if(key==="repeat")return "Describe a safe post-purchase scenario. Ask AI to draft a helpful follow-up without pressure or spam. Check the tone.";
  return "Write one anonymized recent sales interaction and ask AI to list what is known, what is unknown, and one question worth asking.";
 }
 if(!sales)return "Chọn một việc thực tế đang cần làm. Dùng AI với câu: “Đây là việc tôi muốn làm: [mô tả]. Hãy chia thành 3 bước nhỏ, hỏi lại điều còn thiếu, đừng tự bịa dữ kiện.” Bạn tự kiểm tra bước đầu có khả thi không.";
 if(key==="few")return "Chọn một sản phẩm thật. Ghi 1 lợi ích có thể chứng minh, rồi nhờ AI: “Hãy viết 3 cách giới thiệu dễ hiểu cho sản phẩm này. Không bịa công dụng; hãy hỏi tôi những thông tin còn thiếu.” Chọn bản đúng sự thật nhất.";
 if(key==="asks")return "Nhớ lại một câu khách hỏi nhưng chưa mua (bỏ tên, số điện thoại). Nhờ AI: “Khách hỏi như sau: [câu hỏi]. Hãy đề xuất 2 lý do có thể khiến họ do dự và 2 cách trả lời chân thật, không thúc ép.” Đối chiếu với thực tế; AI chưa biết nguyên nhân thật.";
 if(key==="repeat")return "Nhờ AI: “Hãy soạn một tin nhắn sau mua ngắn, hữu ích, không thúc ép, phù hợp sản phẩm [loại]. Không đưa ưu đãi không có thật.” Đọc lại và chỉnh cho đúng khách hàng.";
 return "Ghi lại một tình huống bán hàng gần đây, ẩn thông tin khách. Nhờ AI: “Hãy phân biệt những gì đã biết với những gì chưa biết, rồi gợi ý một câu hỏi giúp hiểu vấn đề.” Đừng vội chi tiền quảng cáo.";
}

export function advanceDiscovery(state,{message="",choice="",locale=state.locale}={}){
 if(!state||state.schemaVersion!==1||!Number.isInteger(state.version)||state.version<0)throw new Error("invalid_state");
 if(locale!==state.locale||!["vi","en"].includes(locale))throw new Error("locale_mismatch");
 const text=safeAnswer(message);
 const selected=resolveChoice(state,choice,text);
 const vi=locale==="vi";
 if(!selected && !text)return {state,action:"ASK",reply:vi?"Bạn có thể chọn một gợi ý, hoặc trả lời bằng vài từ thôi.":"Choose an option or answer in a few words.",options:optionsAt(state),changed:false};
 const next={...state,version:state.version+1};
 let reply="",action="ASK";
 switch(state.phase){
  case "bottleneck":
   next.bottleneck=selected||"other";next.questionCount++;
   if(next.bottleneck==="unknown"){
    next.phase="observe";reply=vi?
      "Không sao nếu bạn chưa biết vướng ở đâu. Trong lần bán gần nhất, hãy chỉ quan sát: có người xem hàng không, có hỏi giá không, có mua không? Không cần con số chính xác. Mình sẽ dựa vào điều bạn quan sát, không tự đoán.":
      "It's fine not to know yet. In a recent sale, notice who saw the offer, who asked and who bought. Rough observations are enough; I won't guess.";
   } else {
    next.phase="context";reply=vi?(state.domain==="sales"?
      "Bạn đang bán sản phẩm hay dịch vụ gì? Một vài từ là đủ, ví dụ “bánh mì” hoặc “dịch vụ sửa nhà”.":
      "Bạn muốn cải thiện việc gì cụ thể? Ví dụ “viết email” hoặc “lập báo giá”."):
      (state.domain==="sales"?"What product or service do you sell? A few words are enough.":"Which specific task do you want to improve? A few words are fine.");
   }
   break;
  case "context":
   next.detail=text||null;next.questionCount++;next.phase="confirm";
   reply=summarize(next);break;
  case "confirm":
   next.questionCount++;
   if(selected==="yes"){
    next.phase="skill";next.provisional=false;
    reply=vi?"Để hướng dẫn vừa sức: bạn đã từng dùng ChatGPT hoặc một công cụ AI để làm việc này chưa?":"To match your experience, have you used ChatGPT or another AI tool for this before?";
   }else if(selected==="unsure"){
    next.phase="observe";reply=vi?"Vậy mình chưa kết luận. Bạn kể một tình huống gần đây: khách đã hỏi gì hoặc công việc vướng ở bước nào? Nếu chưa rõ, cứ chọn “Tôi chưa biết cách”.":"Let's keep it open. Tell me about a recent interaction or challenge, or choose 'I need an example'.";
   }else{
    next.phase="correct";reply=vi?"Cảm ơn đã sửa. Mình hiểu sai chỗ nào? Bạn chỉ cần nói một câu, ví dụ “có khách nhưng giá quá cao”.":
      "Thanks for correcting me. Which part did I misunderstand? One sentence is enough.";
   }break;
  case "correct":
   next.correction=text||null;next.phase="confirm";reply=summarize(next);break;
  case "skill":
   next.skill=selected||"some";next.phase="practice";action="PRACTICE";
   reply=(vi?(next.skill==="never"?
      "Bạn chưa cần học thuật ngữ AI. Mở ChatGPT hoặc một công cụ AI mà bạn tin cậy, tạo cuộc trò chuyện mới, rồi sao chép yêu cầu mẫu dưới đây. Không nhập thông tin riêng của khách.\n\n":
      "Thử ngay một bài thực hành nhỏ với AI, rồi tự kiểm tra câu trả lời.\n\n"):
      (next.skill==="never"?"Open an AI chat tool you trust and paste this example. Do not share customer details.\n\n":"Try this small task with an AI tool and check the result.\n\n"))
      +taskFor(next)
      +(vi?"\n\nKhi thử xong, chọn “Tôi đã thử”. Nếu chưa biết cách, chọn “Tôi cần ví dụ dễ hơn”.":
        "\n\nWhen you're done, choose 'I tried it', or ask for an easier example.");
   break;
  case "observe":
   if(selected==="help"){
    next.version=state.version;return {state,action:"ASK",reply:vi?
      "Ví dụ: hôm nay có 10 người xem sản phẩm, 2 người hỏi giá, chưa ai mua. Đây là ví dụ giả định. Bạn chỉ cần nhớ một bước gần giống vậy; không cần thống kê chính xác.":
      "For example, 10 people viewed an item, 2 asked the price and none bought. These are invented example numbers, not your actual results.",options:optionsAt(state),changed:false};
   }
   next.detail=text||state.detail;next.phase="confirm";next.questionCount++;reply=summarize(next);break;
  case "practice":
   if(selected==="help"){
    next.version=state.version;return {state,action:"PRACTICE",reply:vi?
      "Ví dụ dễ hơn: viết một câu mô tả việc bạn đang làm, rồi thêm “Hãy hỏi tôi một câu để hiểu rõ hơn, đừng tự giả định.” Bạn có thể làm với dữ liệu giả; không cần chia sẻ thông tin khách.":
      "Easier example: type one sentence about a task, followed by 'Ask me one question to understand it better; don't invent details.' Use made-up data.",options:optionsAt(state),changed:false};
   }
   if(selected==="later"){
    next.version=state.version;return {state,action:"RESUME",reply:vi?
      "Bạn có thể trở lại bài thực hành này khi thuận tiện. Chưa có kết quả nào được đánh dấu hoàn thành.":
      "You can return when ready. No outcome has been marked complete.",options:optionsAt(state),changed:false};
   }
   next.phase="reflect";reply=vi?"Bạn đã thử phần nào? Kết quả thực tế ra sao, và điều gì còn khó? Nếu chưa thử được, cứ nói vậy.":"What did you actually try, what happened and what felt difficult? It's fine if you couldn't complete it.";
   break;
  case "reflect":
   next.evidence={text,status:"self_reported"};next.phase="review";action="EVALUATE";
   reply=vi?"Mình đã ghi nhận điều bạn tự báo cáo, chưa coi đó là kết quả đã xác minh. Bước tiếp theo là so sánh với tình huống thật và sửa một điểm chưa hiệu quả.":
     "I've recorded your self-report, not verified success. Next, compare the result with reality and improve one weak point.";
   break;
  case "review":
   next.version=state.version;return {state,action:"RESUME",reply:vi?"Ta có thể chọn bài thực hành mới sau khi bạn xác nhận kết quả trước.":"We can choose the next task after you review your previous result.",options:[],changed:false};
  default:throw new Error("invalid_phase");
 }
 return {state:next,action,reply,options:optionsAt(next),changed:true};
}
