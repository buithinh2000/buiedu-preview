import {copy} from './i18n.mjs';
import {siteConfig} from './config.mjs';
import {CompanionApi} from './companion-api.mjs';
import {getAccessToken} from './auth.mjs';
import {initialDiscovery,advanceDiscovery} from './guided-discovery.mjs';

const $=id=>document.getElementById(id);
const language=$('language');
const form=$('previewForm');
const feed=$('chatFeed');
const starters=$('chatStarters');
const options=$('chatOptions');
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
  addTurn('assistant',result.reply,{sample:true});
  displayOptions(result.options);
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
    const result=session?
      advanceDiscovery(session,{message,locale}):
      initialDiscovery(message,locale);
    showDiscoveryResult(result);
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
  const result=advanceDiscovery(session,{choice:button.dataset.choice,locale});
  showDiscoveryResult(result);
});
$('resetChat').addEventListener('click',resetConversation);
language.addEventListener('change',()=>setLanguage(language.value));
$('year').textContent=String(new Date().getFullYear());
setLanguage(language.value);
