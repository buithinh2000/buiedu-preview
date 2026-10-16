import test from 'node:test';
import assert from 'node:assert/strict';
import {createCheckedQuoteCsv,verifyCheckedQuoteCsv}
 from '../workplace-spreadsheet-csv.mjs';
test('actually produces portable Excel-readable CSV bytes and recomputes total',()=>{
 const file=createCheckedQuoteCsv({title:'Báo giá học thử',items:[
  {description:'Item A',quantity:2,unitPriceCents:10000},
  {description:'Item B',quantity:3,unitPriceCents:5000}
 ]});
 assert.equal(file.kind,'CSV_EXCEL_COMPATIBLE_NOT_XLSX');
 assert.equal(file.status,'CREATED');
 assert.equal(file.mimeType,'text/csv;charset=utf-8');
 assert.equal(file.calculatedTotalCents,35000);
 assert.match(file.content,/350\.00/);
 assert.equal(verifyCheckedQuoteCsv(file).verified,true);
 assert.equal(verifyCheckedQuoteCsv(file).rows,2);
 assert.ok(file.bytes.length>100);
});
test('the file does not falsely claim to be an Excel xlsx workbook',()=>{
 const file=createCheckedQuoteCsv({items:[{description:'Sample',quantity:1,unitPriceCents:1}]});
 assert.match(file.fileName,/\.csv$/);
 assert.equal(file.validation.formulaCellsUsed,false);
 assert.equal(file.validation.networkCallsMade,false);
});
test('formula-like employee/customer data is escaped before CSV export',()=>{
 const file=createCheckedQuoteCsv({items:[
  {description:'=HYPERLINK("https://bad.test","x")',quantity:1,unitPriceCents:100},
  {description:' +SUM(A1:A5)',quantity:1,unitPriceCents:100},
  {description:'@SUM(1,2)',quantity:1,unitPriceCents:100}
 ]});
 assert.ok(file.content.includes("'=HYPERLINK"));
 assert.ok(file.content.includes("'+SUM"));
 assert.ok(file.content.includes("'@SUM"));
 assert.equal(verifyCheckedQuoteCsv(file).verified,true);
});
test('quotation text is RFC CSV escaped with doubled double quotes',()=>{
 const file=createCheckedQuoteCsv({items:[
  {description:'Work "materials"',quantity:1,unitPriceCents:135}
 ]});
 assert.ok(file.content.includes('Work ""materials""'));
 assert.equal(file.calculatedTotalCents,135);
 assert.ok(file.content.includes('1.35'));
});
test('invalid prices/quantities and zero or excessive row counts fail closed',()=>{
 assert.throws(()=>createCheckedQuoteCsv({items:[]}),/invalid_rows/);
 assert.throws(()=>createCheckedQuoteCsv({items:Array.from({length:101},()=>({description:'x',quantity:1,unitPriceCents:100}))}),/invalid_rows/);
 assert.throws(()=>createCheckedQuoteCsv({items:[{description:'A',quantity:-1,unitPriceCents:50}]}),/invalid_amount/);
 assert.throws(()=>createCheckedQuoteCsv({items:[{description:'A',quantity:1.5,unitPriceCents:50}]}),/invalid_amount/);
 assert.throws(()=>createCheckedQuoteCsv({items:[{description:'A',quantity:1,unitPriceCents:99.99}]}),/invalid_amount/);
});
test('currency and text control characters are bounded',()=>{
 assert.throws(()=>createCheckedQuoteCsv({currency:'TEST',items:[{description:'x',quantity:1,unitPriceCents:2}]}),/unsupported_currency/);
 assert.throws(()=>createCheckedQuoteCsv({items:[{description:'A\nB',quantity:1,unitPriceCents:2}]}),/invalid_cell/);
});
test('verification detects mutated money math or actual byte corruption',()=>{
 const file=createCheckedQuoteCsv({items:[{description:'A',quantity:5,unitPriceCents:123}]});
 const bad={...file,rows:file.rows.map(r=>({...r,lineTotalCents:500}))};
 assert.throws(()=>verifyCheckedQuoteCsv(bad),/wrong_arithmetic/);
 const changed={...file,calculatedTotalCents:1};
 assert.throws(()=>verifyCheckedQuoteCsv(changed),/wrong_total/);
 const corrupt={...file,bytes:new Uint8Array([1,2,3])};
 assert.throws(()=>verifyCheckedQuoteCsv(corrupt),/artifact_corrupted/);
});
test('large quote amount cannot overflow JavaScript safe integer',()=>{
 assert.throws(()=>createCheckedQuoteCsv({items:Array.from({length:100},
  ()=>({description:'x',quantity:100000,unitPriceCents:1000000000}))}),/total_overflow/);
});
