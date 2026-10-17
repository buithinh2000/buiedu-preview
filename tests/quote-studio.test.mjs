import test from 'node:test';
import assert from 'node:assert/strict';
import {parseQuotePriceCents,parseQuoteQuantity}
 from '../quote-studio.mjs';
import {createCheckedQuoteCsv,verifyCheckedQuoteCsv}
 from '../workplace-spreadsheet-csv.mjs';
test('quote studio converts decimal strings exactly into cents',()=>{
 assert.equal(parseQuotePriceCents('0'),0);
 assert.equal(parseQuotePriceCents('49'),4900);
 assert.equal(parseQuotePriceCents('49.90'),4990);
 assert.equal(parseQuotePriceCents('0.05'),5);
 assert.equal(parseQuotePriceCents(' 125.00 '),12500);
 assert.equal(parseQuoteQuantity('2'),2);
 assert.equal(parseQuoteQuantity(' 10000 '),10000);
});
test('quote studio rejects invalid prices, formulas, scientific notation and invalid quantities',()=>{
 for(const price of ['-5','+5','=SUM(1,2)','1e6','1,000','1.234','.99','NaN','Infinity','','10000000','10000000.00']){
  assert.throws(()=>parseQuotePriceCents(price),/invalid_quote_price/);
 }
 for(const qty of ['0','-2','2.3','1e4','10001','','=1+1']){
  assert.throws(()=>parseQuoteQuantity(qty),/invalid_quote_quantity/);
 }
});
test('user-edited prices create TRUE verifiable CSV bytes; external network not called',()=>{
 const items=[
  {description:'Room 1 plastering',quantity:2,unitPriceCents:parseQuotePriceCents('125.00')},
  {description:'Sample materials',quantity:3,unitPriceCents:parseQuotePriceCents('49.00')}
 ];
 const file=createCheckedQuoteCsv({title:'My practice quotation',items,currency:'AUD'});
 assert.equal(file.calculatedTotalCents,39700);
 assert.equal(file.status,'CREATED');
 assert.equal(file.kind,'CSV_EXCEL_COMPATIBLE_NOT_XLSX');
 assert.deepEqual(verifyCheckedQuoteCsv(file),{verified:true,calculatedTotalCents:39700,rows:2});
 assert.equal(file.validation.networkCallsMade,false);
 assert.match(file.content,/397\.00/);
 const changed=createCheckedQuoteCsv({title:'My practice quotation',currency:'AUD',
  items:[{...items[0],quantity:3},items[1]]});
 assert.equal(verifyCheckedQuoteCsv(changed).calculatedTotalCents,52200);
 assert.notEqual(file.content,changed.content);
});
test('CSV injection remains escaped even for user-supplied item descriptions',()=>{
 const file=createCheckedQuoteCsv({items:[
  {description:'=HYPERLINK("evil","click")',quantity:1,unitPriceCents:500},
  {description:'@macro',quantity:1,unitPriceCents:300}
 ]});
 assert.match(file.content,/"'=HYPERLINK\(""evil"",""click""\)"/);
 assert.match(file.content,/"'@macro"/);
 assert.equal(verifyCheckedQuoteCsv(file).verified,true);
});
test('independent CSV verifier catches manipulated line items, bytes and totals',()=>{
 const file=createCheckedQuoteCsv({items:[
  {description:'Approved fictional sample',quantity:2,unitPriceCents:10000}
 ]});
 const mut=x=>({
  ...file,
  rows:file.rows.map(row=>({...row})),
  bytes:new Uint8Array(file.bytes)
 ,...x
 });
 assert.throws(()=>verifyCheckedQuoteCsv(mut({calculatedTotalCents:22000})),/wrong_total/);
 assert.throws(()=>verifyCheckedQuoteCsv(mut({rows:[
  {...file.rows[0],lineTotalCents:21000}
 ]})),/wrong_arithmetic/);
 const forgedContent=file.content.replace('200.00','999.00');
 // Attacker changing both bytes and text MUST NOT pass source reconstruction.
 assert.throws(()=>verifyCheckedQuoteCsv(mut({
  content:forgedContent,bytes:new TextEncoder().encode(forgedContent)
 })),/artifact_corrupted/);
});
