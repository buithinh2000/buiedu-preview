import {copy} from './i18n.mjs';
import {siteConfig} from './config.mjs';
import {CompanionApi} from './companion-api.mjs';
import {getAccessToken} from './auth.mjs';
import {beginGoal,continueGoal} from './intent-router.mjs';
import {createCheckedQuoteCsv,verifyCheckedQuoteCsv} from './workplace-spreadsheet-csv.mjs';
import {createCareerDesk} from './career-desk-ui.mjs';

const $=id=>document.getElementById(id);
const language=$('language');
const form=$('previewForm');
const feed=$('chatFeed');
const starters=$('chatStarters');
const options=$('chatOptions');
const workExample=$('workExample');
const careerDesk=createCareerDesk(document);
const input=$('goal');
const submit=form.querySelector('button[type="submit"]');
const api=new CompanionApi({baseUrl:siteConfig.apiBaseUrl,getAccessToken});
let locale='vi';
let session=null;
let pendingTurn=null;
let goalId=null;

function addTurn(kind,message,{sample=false}={}){
  const turn=document.createElement('div');
  turn.className='chat-turn '+kind;
  if(kind==='assistant'){
    const avatar=document.createElement('span');
    avatar.className='chat-mark';
    avatar.setAttribute('aria-hidden','true');
    avatar.textContent='b';
    turn.append(avatar);
  }
  const bubble=document.createElement('p');
  bubble.className='chat-bubble';
  if(sample){
    const caption=document.createElement('span');
    caption.className='chat-context';
    caption.textContent=copy[locale].chatSample;
    bubble.append(caption);
  }
  // Only text nodes: no visitor text is interpreted as HTML.
  bubble.append(document.createTextNode(message));
  turn.append(bubble);
  feed.append(turn);
  while(feed.children.length>22)feed.children[1].remove();
  feed.scrollTop=feed.scrollHeight;
}

function displayOptions(list=[]){
  options.replaceChildren();
  options.hidden=!list.length;
  for(const {id,label} of list){
    const button=document.createElement('button');
    button.type='button';
    button.dataset.choice=id;
    button.textContent=label;
    options.append(button);
  }
}
function resetConversation(){
  session=null;
  pendingTurn=null;
  goalId=null;
  feed.replaceChildren();
  addTurn('assistant',copy[locale].chatGreeting);
  options.hidden=true;
  options.replaceChildren();
  starters.hidden=false;
  workExample.hidden=true;
  careerDesk.hide();
  input.value='';
}

function setLanguage(next){
  const previous=locale;
  locale=next==='en'?'en':'vi';
  const c=copy[locale];
  document.documentElement.lang=locale;
  for(const el of document.querySelectorAll('[data-t]')){
    const value=c[el.dataset.t];
    if(typeof value!=='string')continue;
    if(el.dataset.t==='heroTitle')el.innerHTML=value; // Only bundled, trusted i18n markup.
    else el.textContent=value;
  }
  input.placeholder=locale==='vi'?'Hãy chia sẻ mục tiêu của bạn...':'What would you like to achieve?';
  submit.setAttribute('aria-label',c.sendLabel);
  submit.title=c.sendLabel;
  feed.setAttribute('aria-label',locale==='vi'?'Cuộc trò chuyện BuiEdu':'BuiEdu conversation');
  if(previous!==locale || !feed.children.length)resetConversation();
}

function showDiscoveryResult(result){
  session=result.state;
  if(session.domain==='career'){
    careerDesk.show({goal:session.goal,locale:session.locale});
    const msg=session.locale==='vi'?
      'Mình đã mở khu học thực hành cho mục tiêu giám đốc kinh doanh. Bắt đầu bằng cách tính kết quả của một đội bán hàng bên trên. Không cần biết prompt; nếu chưa biết, bấm “Tôi chưa biết cách”.':
      'I opened a practical learning workspace for your sales director goal. Start by calculating a team’s sales figures above. No prompts needed; choose “I need help” if you are unsure.';
    addTurn('assistant',msg,{sample:true});
    displayOptions([]);
  }else{
    careerDesk.hide();
    addTurn('assistant',result.reply,{sample:true});
    displayOptions(result.options);
  }
  workExample.hidden=!(session.domain==='work'&&session.focus==='excel');
  starters.hidden=true;
}

async function sendLive(message){
  // Live mode is disabled by site/config.mjs and auth stub.
  if(!goalId)goalId=crypto.randomUUID();
  if(!pendingTurn||pendingTurn.message!==message||pendingTurn.locale!==locale){
    pendingTurn={message,locale,request:api.createTurn({goalId,message,locale})};
  }
  submit.disabled=true;
  try{
    const response=await pendingTurn.request.send();
    addTurn('assistant',response.reply);
    pendingTurn=null;
  }catch{
    addTurn('assistant',copy[locale].chatError);
  }finally{submit.disabled=false;}
}

function submitMessage(message){
  if(!message.trim()||submit.disabled)return;
  addTurn('user',message);
  input.value='';
  if(siteConfig.mode==='live'){
    options.hidden=true;starters.hidden=true;
    void sendLive(message);
  }else{
    if(session?.domain==='career'&&careerDesk.isActive()){
      const possible=continueGoal(session,{message,locale});
      if(possible.topicChanged&&possible.state.domain!=='career'){
        showDiscoveryResult(possible);
      }else if(/không\s*(?:biết|rành)|chưa\s*(?:biết|có\s*kinh\s*nghiệm)|i\s*(?:don't|dont|do not)\s*know|not\s*sure|no experience/i.test(message)){
        const tip=careerDesk.hint();
        addTurn('assistant',tip||copy[locale].chatNext,{sample:true});
      }else{
        addTurn('assistant',locale==='vi'?
         'Đây là bản thực hành số liệu có kiểm tra kết quả, chưa phải AI hội thoại tự do. Hãy thử điền ba ô trong khu học bên trên; bản AI thật sẽ cần hiểu câu hỏi của bạn và đổi bài học linh hoạt.':
         'This preview checks real calculations but is not a live open-ended AI tutor. Try the three fields above; the future AI tutor needs to understand your questions and adjust the lesson.',
         {sample:true});
      }
    }else{
      const result=session?
        continueGoal(session,{message,locale}):
        beginGoal(message,locale);
      showDiscoveryResult(result);
    }
  }
}

form.addEventListener('submit',event=>{
  event.preventDefault();
  const message=input.value.trim();
  if(!message){input.focus();return;}
  submitMessage(message);
});
input.addEventListener('keydown',event=>{
  if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){
    event.preventDefault();
    form.requestSubmit();
  }
});
starters.addEventListener('click',event=>{
  const button=event.target.closest('button[data-example]');
  if(!button)return;
  const example=button.dataset.example;
  const goal=copy[locale].exampleGoals[example];
  if(!goal)return;
  submitMessage(goal);
});
options.addEventListener('click',event=>{
  const button=event.target.closest('button[data-choice]');
  if(!button||!session||siteConfig.mode==='live')return;
  addTurn('user',button.textContent);
  const result=continueGoal(session,{choice:button.dataset.choice,locale});
  showDiscoveryResult(result);
});
$('resetChat').addEventListener('click',resetConversation);
$('downloadCsv').addEventListener('click',()=>{
  // Sample-only, no personal data, no model call, no backend request.
  const sample=createCheckedQuoteCsv({
    title:locale==='vi'?'BuiEdu - Báo giá minh họa':'BuiEdu - Example quotation',
    currency:'AUD',items:[
      {description:locale==='vi'?'Công việc mẫu A':'Sample work A',quantity:2,unitPriceCents:12500},
      {description:locale==='vi'?'Vật tư mẫu B':'Sample material B',quantity:3,unitPriceCents:4900}
    ]
  });
  verifyCheckedQuoteCsv(sample); // independently recalculate cents and bytes.
  const url=URL.createObjectURL(new Blob([sample.bytes],{type:sample.mimeType}));
  const link=document.createElement('a');
  link.href=url;link.download=sample.fileName;
  document.body.append(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),30000);
});

language.addEventListener('change',()=>setLanguage(language.value));
$('year').textContent=String(new Date().getFullYear());
setLanguage(language.value);
