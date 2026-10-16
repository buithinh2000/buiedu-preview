// Offline BuiEdu career learning workspace — real exercises, no API/model.
// These fictional assessments demonstrate basic arithmetic only; they DO NOT
// establish readiness for a director role or persist across browser sessions.
const TRACKS=Object.freeze([
 {id:'metrics',vi:'Đọc số liệu bán hàng',en:'Read sales numbers',implemented:true},
 {id:'diagnosis',vi:'Tìm nguyên nhân',en:'Find root causes',implemented:false},
 {id:'coaching',vi:'Hướng dẫn đội ngũ',en:'Coach a team',implemented:false},
 {id:'planning',vi:'Lập kế hoạch',en:'Build a plan',implemented:false}
]);
const CASES=Object.freeze([
 {target:[10,10,10],actual:[10,2,7],correct:{total:19,gap:11,rate:63}},
 {target:[12,12,12],actual:[12,9,6],correct:{total:27,gap:9,rate:75}}
]);
function clampAnswer(value){
 if(typeof value!=='string'&&typeof value!=='number')throw Error('invalid_answer');
 const s=String(value).trim().replace(',','.');
 if(!/^\d+(?:\.\d+)?$/.test(s)||s.length>8)throw Error('invalid_answer');
 const n=Number(s);
 if(!Number.isFinite(n)||n>100000)throw Error('invalid_answer');
 return n;
}
export function newCareerWorkspace({goal,locale='vi'}){
 if(typeof goal!=='string'||!goal.trim()||goal.length>500||!['vi','en'].includes(locale))throw Error('invalid_goal');
 return {schemaVersion:1,goal:goal.trim(),locale,caseIndex:0,attempts:0,
  passedCases:[],assistanceUsed:false,status:'practice',
  messages:[]};
}
export function getCareerExercise(workspace){
 if(!workspace||workspace.schemaVersion!==1||!Number.isInteger(workspace.caseIndex)||
    workspace.caseIndex<0||workspace.caseIndex>1)throw Error('invalid_workspace');
 const index=workspace.caseIndex;
 const test=CASES[index];
 return {index,target:[...test.target],actual:[...test.actual],
   track:TRACKS.map(x=>({...x})),completed:workspace.passedCases.length,
   totalSteps:2,status:workspace.status,
   canClaimDirectorReady:false};
}
export function submitCareerMetrics(workspace,answers){
 const exercise=getCareerExercise(workspace);
 if(workspace.status!=='practice')throw Error('not_in_practice');
 if(!answers||typeof answers!=='object')throw Error('invalid_answer');
 const input={total:clampAnswer(answers.total),gap:clampAnswer(answers.gap),rate:clampAnswer(answers.rate)};
 const expected=CASES[exercise.index].correct;
 // Permit a half percentage point rounding tolerance, others must be exact.
 const checks={
  total:input.total===expected.total,
  gap:input.gap===expected.gap,
  rate:Math.abs(input.rate-(exercise.index===0?1900/30:2700/36))<=0.51
 };
 const passed=Object.values(checks).every(Boolean);
 const next={...workspace,attempts:workspace.attempts+1};
 if(passed){
  next.passedCases=[...workspace.passedCases,exercise.index];
  next.status=exercise.index===0?'ready_for_transfer':'completed';
 }
 return {state:next,passed,checks,expected:{...expected},
   stage:next.status,grade:passed?(exercise.index===0?'FIRST_CASE_CHECKED':'BASIC_METRICS_PRACTICED_TWICE'):'TRY_AGAIN',
   masteryClaim:false};
}
export function advanceCareerExercise(workspace){
 getCareerExercise(workspace);
 if(workspace.status!=='ready_for_transfer'||workspace.caseIndex!==0)throw Error('not_ready');
 return {...workspace,caseIndex:1,status:'practice',assistanceUsed:false};
}
export function getCareerHint(workspace){
 const exercise=getCareerExercise(workspace);
 if(workspace.status==='completed')throw Error('already_completed');
 const target=exercise.target.reduce((a,b)=>a+b,0);
 const actual=exercise.actual.reduce((a,b)=>a+b,0);
 const gap=target-actual;
 const vi=workspace.locale==='vi';
 return {state:{...workspace,assistanceUsed:true},
  // Real explanation, not credit for learner's skill.
  message:vi?
   'Gợi ý: cộng số đơn đã bán của A, B, C để ra thực tế. Tổng mục tiêu = '+target+'. Số còn thiếu = mục tiêu − thực tế. Phần trăm đạt = thực tế ÷ mục tiêu × 100. Hãy thử tự tính và nhập vào ba ô.':
   'Hint: add the orders sold by A, B, C. The team target is '+target+'. Gap = target − actual. Achievement % = actual ÷ target × 100. Try calculating the three answers.'
 };
}
export function getCareerSummary(workspace){
 const exercise=getCareerExercise(workspace);
 return {practiceCasesPassed:workspace.passedCases.length,required:2,
  practiceComplete:workspace.status==='completed',
  assistanceUsed:workspace.assistanceUsed,
  verifiedProfessionalQualification:false,
  certifiedByBuiEdu:false,
  note:workspace.locale==='vi'?
   'Đây chỉ là bài luyện số học trong tình huống giả định; chưa đánh giá năng lực giám đốc, giao tiếp, bán hàng hoặc lãnh đạo. Không lưu khi tải lại trang.':
   'This only checks arithmetic in fictional cases, not leadership, sales, or director competence. Progress disappears on page reload.'};
}