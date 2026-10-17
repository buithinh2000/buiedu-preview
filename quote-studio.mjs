// BuiEdu browser-only real work-product studio. No provider, auth or network.
// Learner can change quantities/prices and download a VERIFIED actual CSV,
// not a pretend AI-generated XLSX. Inputs never leave the browser.
import {createCheckedQuoteCsv,verifyCheckedQuoteCsv} from './workplace-spreadsheet-csv.mjs';
const MAX_ROWS=8;
const TEXT={
 en:{title:'My practice quotation',work:'Example service',material:'Example material',
  add:'Add a row',remove:'Remove',download:'Check & download CSV',
  invalid:'Check item names, whole-number quantities, and prices (up to 2 decimals).',
  ready:'Calculation verified. Download the actual CSV to open in Excel or Sheets.',
  saved:'CSV downloaded. Review the data before sending to anyone.',
  count:'Rows',total:'Calculated total',row:'Item',qty:'Quantity',price:'Unit price'},
 vi:{title:'Báo giá thực hành của tôi',work:'Công việc mẫu',material:'Vật tư mẫu',
  add:'Thêm dòng',remove:'Xóa',download:'Kiểm tra & tải CSV',
  invalid:'Kiểm tra tên hạng mục, số lượng nguyên và đơn giá (tối đa 2 chữ số thập phân).',
  ready:'Phép tính đã được kiểm tra. Tải file CSV thật để mở bằng Excel hoặc Sheets.',
  saved:'Đã tải CSV. Hãy kiểm tra nội dung trước khi gửi cho người khác.',
  count:'Số dòng',total:'Tổng tiền đã kiểm tra',row:'Hạng mục',qty:'Số lượng',price:'Đơn giá'}
};
export function parseQuotePriceCents(value){
 if(typeof value!=='string'||!/^\d{1,7}(?:\.\d{1,2})?$/.test(value.trim()))
  throw Error('invalid_quote_price');
 const [whole,part='']=value.trim().split('.');
 const cents=Number(whole)*100+Number(part.padEnd(2,'0'));
 if(!Number.isSafeInteger(cents)||cents>1000000000)
  throw Error('invalid_quote_price');
 return cents;
}
export function parseQuoteQuantity(value){
 if(typeof value!=='string'||!/^\d{1,5}$/.test(value.trim()))
  throw Error('invalid_quote_quantity');
 const n=Number(value.trim());
 if(!Number.isSafeInteger(n)||n<1||n>10000)throw Error('invalid_quote_quantity');
 return n;
}
function format(cents){const n=BigInt(cents);return (n/100n).toString()+'.'+(n%100n).toString().padStart(2,'0')}
export function createQuoteStudio(document,{saveFile=null}={}){
 const root=document.getElementById('quoteStudio'),rows=document.getElementById('quoteRows'),
  form=document.getElementById('quoteForm'),status=document.getElementById('quoteStatus'),
  preview=document.getElementById('quoteTotal'),title=document.getElementById('quoteTitle'),
  currency=document.getElementById('quoteCurrency'),
  add=document.getElementById('quoteAddRow'),
  download=document.getElementById('quoteDownload');
 if(!root||!rows||!form||!status||!preview||!title||!currency||!add||!download)
  throw Error('quote_studio_markup_required');
 const downloader=saveFile||((file)=>{
  const url=URL.createObjectURL(new Blob([file.bytes],{type:file.mimeType}));
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download=file.fileName;
  document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
 });
 let locale='en';
 let counter=0;
 const lineInputs=[];
 function makeInput({label,value,maxLength=120,inputMode='text'}){
  const outer=document.createElement('label');
  const caption=document.createElement('span');
  caption.textContent=label;
  const input=document.createElement('input');
  input.type='text';input.maxLength=maxLength;input.value=value;
  input.inputMode=inputMode;input.autocomplete='off';
  outer.append(caption,input);
  return {outer,input,caption};
 }
 function addRow({description='',quantity='1',unit='0.00'}={}){
  if(lineInputs.length>=MAX_ROWS)return;
  const key=++counter;
  const tr=document.createElement('div');tr.className='quote-row';tr.dataset.quoteRow=String(key);
  const d=makeInput({label:TEXT[locale].row,value:description});
  const q=makeInput({label:TEXT[locale].qty,value:quantity,maxLength:5,inputMode:'numeric'});
  const p=makeInput({label:TEXT[locale].price,value:unit,maxLength:10,inputMode:'decimal'});
  const remove=document.createElement('button');remove.type='button';
  remove.className='quote-remove';remove.textContent=TEXT[locale].remove;
  const record={tr,d,q,p,remove};
  remove.addEventListener('click',()=>{
   if(lineInputs.length<=1)return;
   const ix=lineInputs.indexOf(record);
   if(ix!==-1)lineInputs.splice(ix,1);
   tr.remove();refresh();
  });
  tr.append(d.outer,q.outer,p.outer,remove);rows.append(tr);
  lineInputs.push(record);
  for(const input of [d.input,q.input,p.input]){
   input.addEventListener('input',refresh);
  }
  refresh();
 }
 function read(){
  if(!['AUD','USD'].includes(currency.value)||lineInputs.length<1)throw Error('invalid_quote');
  const items=lineInputs.map(r=>({
   description:r.d.input.value,quantity:parseQuoteQuantity(r.q.input.value),
   unitPriceCents:parseQuotePriceCents(r.p.input.value)
  }));
  const artifact=createCheckedQuoteCsv({title:title.value,currency:currency.value,items});
  verifyCheckedQuoteCsv(artifact);
  return artifact;
 }
 function refresh(){
  add.disabled=lineInputs.length>=MAX_ROWS;
  try{
   const file=read();
   preview.textContent=currency.value+' '+format(file.calculatedTotalCents);
   download.disabled=false;
   status.textContent=TEXT[locale].ready;
  }catch{
   preview.textContent='—';download.disabled=true;
   status.textContent=TEXT[locale].invalid;
  }
 }
 function setLocale(next){
  locale=next==='vi'?'vi':'en';
  for(const r of lineInputs){
   r.d.caption.textContent=TEXT[locale].row;
   r.q.caption.textContent=TEXT[locale].qty;
   r.p.caption.textContent=TEXT[locale].price;
   r.remove.textContent=TEXT[locale].remove;
  }
  refresh();
 }
 function open(){
  root.hidden=false;
  if(!lineInputs.length){
   title.value=TEXT[locale].title;
   addRow({description:TEXT[locale].work,quantity:'2',unit:'125.00'});
   addRow({description:TEXT[locale].material,quantity:'3',unit:'49.00'});
  }
  refresh();
  root.scrollIntoView?.({behavior:'smooth',block:'nearest'});
 }
 add.addEventListener('click',()=>addRow());
 title.addEventListener('input',refresh);
 currency.addEventListener('change',refresh);
 form.addEventListener('submit',event=>{
  event.preventDefault();
  try{
   const file=read();
   downloader(file);
   status.textContent=TEXT[locale].saved;
  }catch{
   status.textContent=TEXT[locale].invalid;
  }
 });
 return Object.freeze({open,setLocale,isOpen:()=>!root.hidden,snapshot:()=>({
  open:!root.hidden,rows:lineInputs.length,currency:currency.value,
  valid:!download.disabled,total:preview.textContent
 })});
}
