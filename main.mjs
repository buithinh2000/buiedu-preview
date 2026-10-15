import {copy} from './i18n.mjs';
import {siteConfig} from './config.mjs';
import {CompanionApi} from './companion-api.mjs';
import {getAccessToken} from './auth.mjs';

const $=id=>document.getElementById(id);
const language=$('language');
const form=$('previewForm');
const result=$('previewResult');
const siteApi=new CompanionApi({baseUrl:siteConfig.apiBaseUrl,getAccessToken});
let locale='vi';
let pendingTurn=null;
let goalId=null;

function setLanguage(next){
  locale=next==='en'?'en':'vi';
  document.documentElement.lang=locale;
  const c=copy[locale];
  for(const el of document.querySelectorAll('[data-t]')){
    const value=c[el.dataset.t];
    if(typeof value!=='string')continue;
    if(el.dataset.t==='heroTitle')el.innerHTML=value; // Only trusted local i18n strings.
    else el.textContent=value;
  }
  $('goal').placeholder=$('goal').dataset['placeholder'+(locale==='vi'?'Vi':'En')];
  if(!result.hidden && siteConfig.mode==='preview')renderPreview();
}
function appendText(element,text){
  element.textContent=text;
}
function renderPreview(){
  const c=copy[locale];
  const profession=$('profession').value;
  const entered=$('goal').value.trim();
  appendText($('resultTitle'),c.resultTitle);
  // No user text is interpreted as HTML or sent to a network endpoint.
  appendText($('resultBody'),c.plan[profession]||c.plan.other);
  result.hidden=false;
  result.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function renderLive(){
  // The client is pre-wired, but auth is deliberately disabled until verified backend.
  if(!goalId)goalId=crypto.randomUUID();
  const message=$('goal').value.trim();
  if(!pendingTurn||pendingTurn.message!==message||pendingTurn.locale!==locale){
    pendingTurn={message,locale,request:siteApi.createTurn({goalId,message,locale})};
  }
  const button=form.querySelector('button[type=submit]');
  button.disabled=true;
  try{
    const outcome=await pendingTurn.request.send();
    appendText($('resultTitle'),copy[locale].resultTitle);
    appendText($('resultBody'),outcome.reply);
    result.hidden=false;
    pendingTurn=null;
  }catch{
    // No tokens, exception internals or user-entered data are sent to error logs.
    appendText($('resultTitle'),locale==='vi'?'Chưa thể kết nối':'Connection unavailable');
    appendText($('resultBody'),locale==='vi'?'BuiEdu chưa mở đăng nhập và API công khai. Tiến độ chưa được lưu.':'BuiEdu sign-in and the public API are not enabled yet. Your progress was not saved.');
    result.hidden=false;
  }finally{button.disabled=false}
}
language.addEventListener('change',()=>setLanguage(language.value));
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!$('goal').value.trim()){ $('goal').focus();return; }
  if(siteConfig.mode==='live')void renderLive();
  else renderPreview();
});
$('resetPreview').addEventListener('click',()=>{
  result.hidden=true;
  $('goal').value='';
  pendingTurn=null;
  $('goal').focus();
});
$('year').textContent=String(new Date().getFullYear());
setLanguage(language.value);
