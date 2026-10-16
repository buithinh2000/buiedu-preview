import {newCareerWorkspace,getCareerExercise,submitCareerMetrics,
 advanceCareerExercise,getCareerHint,getCareerSummary} from './learning-workspace.mjs';

// Only DOM wiring; never sends personal data or assigns job qualifications.
export function createCareerDesk(doc){
 const $=id=>doc.getElementById(id);
 const root=$('learningDesk'),form=$('metricsForm'),feedback=$('deskFeedback');
 let workspace=null;
 let lastGoal=null;
 const say=(vi,en)=>workspace.locale==='vi'?vi:en;
 function render(){
  if(!workspace)return;
  const exercise=getCareerExercise(workspace),summary=getCareerSummary(workspace);
  root.hidden=false;root.closest('.chat-panel')?.classList.add('has-learning');
  $('deskEyebrow').textContent=say('LỘ TRÌNH THỰC HÀNH · MÔ PHỎNG','LEARNING PATH · DEMO');
  $('deskTitle').textContent=say('Mục tiêu: Giám đốc kinh doanh','Goal: Sales director');
  $('deskScore').replaceChildren(doc.createTextNode(summary.practiceCasesPassed+'/2 '));
  const label=doc.createElement('span');label.textContent=say('bài số liệu đã đạt','metrics cases checked');
  $('deskScore').append(label);
  $('deskIntro').textContent=say(
   'Không cần biết AI hay prompt. Mình bắt đầu bằng một năng lực nhỏ: đọc số liệu bán hàng.',
   'No AI or prompt knowledge needed. Start with one small skill: reading sales numbers.');
  const map=$('deskMap');map.replaceChildren();
  exercise.track.forEach((x,i)=>{
   const chip=doc.createElement('div');
   chip.className='desk-step '+(x.implemented?'enabled':'planned');
   const mark=doc.createElement('strong');mark.textContent=String(i+1).padStart(2,'0');
   const desc=doc.createElement('span');desc.textContent=workspace.locale==='vi'?x.vi:x.en;
   const tag=doc.createElement('small');tag.textContent=x.implemented?
    (workspace.status==='completed'?say('Đã luyện 2 tình huống','2 exercises checked'):say('Đang thực hành','Practising')):
    say('Chưa triển khai','Not yet available');
   chip.append(mark,desc,tag);map.append(chip);
  });
  $('deskCaseTitle').textContent=exercise.index===0?
   say('Bài 1: Tính kết quả của một đội bán hàng','Case 1: Calculate a team’s sales results'):
   say('Bài 2: Tự áp dụng với đội khác','Case 2: Apply it to a new team');
  $('deskCaseInfo').textContent=say('Số liệu GIẢ ĐỊNH — không phải công ty thật',
   'FICTIONAL numbers — not real company data');
  $('deskColPerson').textContent=say('Nhân viên','Employee');
  $('deskColTarget').textContent=say('Mục tiêu (đơn)','Target (orders)');
  $('deskColActual').textContent=say('Đã bán (đơn)','Sold (orders)');
  const rows=$('deskRows');rows.replaceChildren();
  for(let i=0;i<exercise.actual.length;i++){
   const tr=doc.createElement('tr');
   for(const v of [String.fromCharCode(65+i),exercise.target[i],exercise.actual[i]]){
    const td=doc.createElement('td');td.textContent=String(v);tr.append(td);
   }
   rows.append(tr);
  }
  $('deskQuestion').textContent=say(
   'Nhìn bảng và điền ba kết quả. Bạn có thể bấm “Tôi chưa biết cách” để học trước.',
   'Read the table and enter three results. Choose “I need help” for a worked explanation.');
  $('deskTotalLabel').textContent=say('Tổng đơn đã bán','Total orders sold');
  $('deskGapLabel').textContent=say('Còn thiếu bao nhiêu?','How many short?');
  $('deskRateLabel').textContent=say('Đạt mục tiêu (%)','Target achieved (%)');
  $('deskSubmit').textContent=say('Kiểm tra bài làm','Check my answers');
  $('deskHint').textContent=say('Tôi chưa biết cách','I need help');
  $('deskNext').textContent=say('Thử tình huống mới →','Try a new case →');
  $('deskDisclaimer').textContent=summary.note;
  const done=workspace.status==='completed';
  const moving=workspace.status==='ready_for_transfer';
  $('deskSubmit').hidden=done||moving;
  $('deskHint').hidden=done||moving;
  $('deskNext').hidden=!moving;
  for(const input of form.querySelectorAll('input'))input.disabled=done||moving;
  if(done)feedback.textContent=say(
   'Bạn đã tự tính đúng cả hai bộ số liệu mẫu. Đây là bằng chứng luyện tập phép tính cơ bản trong phiên này, KHÔNG phải chứng nhận năng lực làm giám đốc.',
   'You correctly calculated both fictional cases. This checks basic arithmetic practice in this session, NOT director-level competence.');
 }
 function show({goal,locale}){
  if(!workspace||goal!==lastGoal||workspace.locale!==locale){
   workspace=newCareerWorkspace({goal,locale});
   lastGoal=goal;form.reset();feedback.textContent='';
  }
  render();
 }
 function hide(){
  workspace=null;lastGoal=null;root.hidden=true;
  root.closest('.chat-panel')?.classList.remove('has-learning');
  form.reset();feedback.textContent='';
 }
 function hint(){
  if(!workspace||workspace.status==='completed')return null;
  const result=getCareerHint(workspace);
  workspace=result.state;feedback.textContent=result.message;
  return result.message;
 }
 form.addEventListener('submit',ev=>{
  ev.preventDefault();
  if(!workspace||workspace.status!=='practice')return;
  try{
   const data=new FormData(form);
   const result=submitCareerMetrics(workspace,{
     total:data.get('total'),gap:data.get('gap'),rate:data.get('rate')
   });
   workspace=result.state;
   if(result.passed){
    feedback.textContent=result.stage==='completed'?
     say('Đúng cả hai bài! Bạn đã biết tính tổng, số còn thiếu và tỷ lệ hoàn thành trên hai ví dụ giả. Đây mới là kỹ năng số học, chưa phải đánh giá quản lý.',
      'Both cases correct! You practised totals, gaps and achievement rate. This checks arithmetic, not management readiness.'):
     say('Đúng rồi! Tổng 19, thiếu 11, đạt khoảng 63%. Giờ thử bài mới với số liệu khác, không chép đáp án cũ nhé.',
      'Correct: total 19, gap 11, about 63%. Now try a new dataset without copying the old answers.');
   }else{
    const names={total:say('tổng','total'),gap:say('số còn thiếu','gap'),rate:say('tỷ lệ %','percentage')};
    const bad=Object.entries(result.checks).filter(([,pass])=>!pass).map(([key])=>names[key]);
    feedback.textContent=say('Bạn cần kiểm tra lại: ','Please check: ')+bad.join(', ')+'. '+
     say('Bấm “Tôi chưa biết cách” để xem phương pháp tính.',
       'Use “I need help” to see the method.');
   }
   render();
  }catch{
   feedback.textContent=say('Hãy nhập cả ba số, không nhập chữ hoặc ký hiệu %.',
    'Enter all three numbers, without letters or a % sign.');
  }
 });
 $('deskHint').addEventListener('click',()=>{hint()});
 $('deskNext').addEventListener('click',()=>{
  if(!workspace||workspace.status!=='ready_for_transfer')return;
  workspace=advanceCareerExercise(workspace);form.reset();
  feedback.textContent=say('Bộ số liệu mới. Hãy làm lại ba phép tính mà không sao chép bài trước.',
   'New numbers. Try all three calculations again without copying the earlier answer.');
  render();
 });
 return {show,hide,hint,isActive:()=>Boolean(workspace),summary:()=>workspace?getCareerSummary(workspace):null};
}