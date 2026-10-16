// BuiEdu public practice sample: browser-local only; CSV, not an XLSX or paid AI result.
// BuiEdu real, zero-AI-cost Excel-compatible CSV practice artifact.
// This creates ACTUAL bytes; not an .xlsx and not an AI-generated file.
// All money is integer cents, totals recalculated independently, formulas never evaluated.
const MAX_ROWS=100;
function safeText(s,max=150){
 if(typeof s!=='string'||!s.trim()||s.length>max||/[\x00-\x1f\x7f]/.test(s))throw Error('invalid_cell');
 return s.trim();
}
function positiveInt(n,limit){
 if(!Number.isSafeInteger(n)||n<0||n>limit)throw Error('invalid_amount');
 return n;
}
function csvText(v){
 let s=String(v);
 // Prevent formula injection when opened in Excel/Sheets. Keep apostrophe inside
 // quoted CSV data; don't accept leading whitespace followed by a formula.
 if(/^[\s\uFEFF]*[=+\-@]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;
 return '"'+s.replaceAll('"','""')+'"';
}
function formatMoney(cents){
 const n=BigInt(cents),d=n/100n,frac=(n%100n).toString().padStart(2,'0');
 return d.toString()+'.'+frac;
}
export function createCheckedQuoteCsv({title='BuiEdu practice quotation',currency='AUD',items}={}){
 const name=safeText(title,120);
 if(!['AUD','USD','VND'].includes(currency))throw Error('unsupported_currency');
 if(!Array.isArray(items)||items.length<1||items.length>MAX_ROWS)throw Error('invalid_rows');
 const lines=[],normalized=[];
 let total=0n;
 for(const [index,item] of items.entries()){
  if(!item||typeof item!=='object')throw Error('invalid_row');
  const description=safeText(item.description,120);
  const qty=positiveInt(item.quantity,100000);
  const unit=positiveInt(item.unitPriceCents,1000000000);
  const lineTotal=BigInt(qty)*BigInt(unit);
  total+=lineTotal;
  if(total>BigInt(Number.MAX_SAFE_INTEGER))throw Error('total_overflow');
  normalized.push({row:index+1,description,quantity:qty,unitPriceCents:unit,
    lineTotalCents:Number(lineTotal)});
  lines.push([description,qty,formatMoney(BigInt(unit)),formatMoney(lineTotal)].map(csvText).join(','));
 }
 const content='\uFEFF'+[
  [name,'','',currency+' (sample data)'].map(csvText).join(','),
  ['Description','Quantity','Unit price ('+currency+')','Line total ('+currency+')'].map(csvText).join(','),
  ...lines,
  '',
  [ 'TOTAL','','',formatMoney(total)].map(csvText).join(','),
  ['Review note','Check quantities, prices, calculations and permissions before real use','',''].map(csvText).join(',')
 ].join('\r\n')+'\r\n';
 return Object.freeze({
  fileName:'buiedu-practice-quotation.csv',mimeType:'text/csv;charset=utf-8',
  content,bytes:new TextEncoder().encode(content),status:'CREATED',
  kind:'CSV_EXCEL_COMPATIBLE_NOT_XLSX',currency,
  calculatedTotalCents:Number(total),rows:normalized,
  validation:{arithmeticChecked:true,formulaCellsUsed:false,safeForCSVFormulaInjection:true,
   networkCallsMade:false}
 });
}
// Separate verifier can recompute every line from original structured source data.
// This is mathematical validation only, not external customer-price validation.
export function verifyCheckedQuoteCsv(result){
 if(!result||result.kind!=='CSV_EXCEL_COMPATIBLE_NOT_XLSX'||
    !(result.bytes instanceof Uint8Array)||result.bytes.length===0||
    !Array.isArray(result.rows))throw Error('invalid_artifact');
 let sum=0n;
 for(const row of result.rows){
  if(!Number.isSafeInteger(row.quantity)||!Number.isSafeInteger(row.unitPriceCents)||
     row.quantity<0||row.unitPriceCents<0)throw Error('invalid_artifact');
  const amt=BigInt(row.quantity)*BigInt(row.unitPriceCents);
  if(amt!==BigInt(row.lineTotalCents))throw Error('wrong_arithmetic');
  sum+=amt;
 }
 if(sum!==BigInt(result.calculatedTotalCents))throw Error('wrong_total');
 if(new TextDecoder().decode(result.bytes)!==result.content)throw Error('artifact_corrupted');
 return {verified:true,calculatedTotalCents:Number(sum),rows:result.rows.length};
}
