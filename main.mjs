import {copy} from './i18n.mjs';
import {siteConfig} from './config.mjs';
import {CompanionApi} from './companion-api.mjs';
import {getAccessToken} from './auth.mjs';

const $=id=>document.getElementById(id);
const language=$('language');
const form=$('previewForm');
const feed=$('chatFeed');
const starters=$('chatStarters');
const input=$('goal');
const profession=$('profession');
const submit=form.querySelector('button[type="submit"]');
const api=new CompanionApi({baseUrl:siteConfig.apiBaseUrl,getAccessToken});
let locale='vi';
let pendingTurn=null;
let goalId=null;

function setLanguage(next){
  locale=next==='en'?'en':'vi';
  const c=copy[locale];
  document.documentElement.lang=locale;
  for(const el of document.querySelectorAll('[data-t]')){
    const value=c[el.dataset.t];
    if(typeof value!=='string')continue;
    // Only this trusted, bundled string contains intentional emphasis markup.
    if(el.dataset.t==='heroTitle')el.innerHTML=value;
    else el.textContent=value;
  }
  input.placeholder=locale==='vi'?'Hãy chia sẻ mục tiêu của bạn...':'What would you like to achieve?';
  submit.setAttribute('aria-label',c.sendLabel);
  submit.title=c.sendLabel;
  feed.setAttribute('aria-label',locale==='vi'?'Cuộc trò chuyện BuiEdu':'BuiEdu conversation');
}

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
  // Never use HTML for visitor-provided content or model responses.
  bubble.append(document.createTextNode(message));
  turn.append(bubble);
  feed.append(turn);
  // Retain at most 20 responses in this short-lived browser-only demo.
  while(feed.children.length>21)feed.children[1].remove();
  feed.scrollTop=feed.scrollHeight;
}

function previewTurn(message){
  const c=copy[locale];
  const role=profession.value;
  const advice=c.plan[role]||c.plan.other;
  addTurn('assistant',advice+'\n\n'+c.chatNext,{sample:true});
}

async function liveTurn(message){
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
  }finally{
    submit.disabled=false;
  }
}

form.addEventListener('submit',event=>{
  event.preventDefault();
  const message=input.value.trim();
  if(!message){input.focus();return;}
  if(submit.disabled)return;
  addTurn('user',message);
  input.value='';
  starters.hidden=true;
  if(siteConfig.mode==='live')void liveTurn(message);
  else previewTurn(message);
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
  if(!Object.hasOwn(copy[locale].exampleGoals,example))return;
  profession.value=example;
  input.value=copy[locale].exampleGoals[example];
  form.requestSubmit();
});

language.addEventListener('change',()=>setLanguage(language.value));
$('year').textContent=String(new Date().getFullYear());
setLanguage(language.value);
