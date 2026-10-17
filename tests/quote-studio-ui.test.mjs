import test from 'node:test';
import assert from 'node:assert/strict';
import {createQuoteStudio} from '../quote-studio.mjs';
import {verifyCheckedQuoteCsv} from '../workplace-spreadsheet-csv.mjs';
class Element {
 constructor(tag='div'){
  this.tagName=tag;this.children=[];this.listeners={};this.value='';this.textContent='';
  this.hidden=false;this.disabled=false;this.dataset={};this.parent=null;
 }
 append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node)}}
 remove(){if(this.parent){this.parent.children=this.parent.children.filter(x=>x!==this);this.parent=null}}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
 fire(type){for(const cb of this.listeners[type]||[])cb({preventDefault(){},target:this})}
 scrollIntoView(){}
}
function fixture(){
 const names=['quoteStudio','quoteRows','quoteForm','quoteStatus','quoteTotal',
  'quoteTitle','quoteCurrency','quoteAddRow','quoteDownload'];
 const nodes=new Map(names.map(x=>[x,new Element()]));
 nodes.get('quoteStudio').hidden=true;
 nodes.get('quoteCurrency').value='AUD';
 const doc={
  body:new Element('body'),
  getElementById:x=>nodes.get(x)||null,
  createElement:tag=>new Element(tag)
 };
 const downloads=[];
 const ui=createQuoteStudio(doc,{saveFile:file=>downloads.push(file)});
 return {ui,nodes,downloads};
}
function field(nodes,rowIndex,fieldIndex){
 // Row is one container of three <label> with <span> then <input>.
 return nodes.get('quoteRows').children[rowIndex].children[fieldIndex].children[1];
}
test('UI opens a real quote with validated fictional data and no fake AI',()=>{
 const f=fixture();
 assert.equal(f.ui.snapshot().open,false);
 f.ui.setLocale('en');
 f.ui.open();
 assert.equal(f.ui.snapshot().rows,2);
 assert.equal(f.ui.snapshot().total,'AUD 397.00');
 assert.equal(f.ui.snapshot().valid,true);
 assert.equal(f.nodes.get('quoteTitle').value,'My practice quotation');
 field(f.nodes,0,1).value='4';field(f.nodes,0,1).fire('input');
 assert.equal(f.ui.snapshot().total,'AUD 647.00');
 assert.equal(f.downloads.length,0);
});
test('invalid price blocks actual CSV download without modifying user fields',()=>{
 const f=fixture();f.ui.open();
 const input=field(f.nodes,0,2);
 input.value='=SUM(1,3)';input.fire('input');
 assert.equal(f.ui.snapshot().valid,false);
 assert.equal(f.ui.snapshot().total,'—');
 f.nodes.get('quoteForm').fire('submit');
 assert.equal(f.downloads.length,0);
 input.value='5.25';input.fire('input');
 assert.equal(f.ui.snapshot().total,'AUD 157.50');
 assert.equal(f.ui.snapshot().valid,true);
});
test('add/remove, locale switch and actual byte-download all work in-browser',()=>{
 const f=fixture();f.ui.open();
 f.nodes.get('quoteAddRow').fire('click');
 assert.equal(f.ui.snapshot().rows,3);
 assert.equal(f.ui.snapshot().valid,false);
 const text=field(f.nodes,2,0),qty=field(f.nodes,2,1),price=field(f.nodes,2,2);
 text.value='Sample new line';text.fire('input');
 qty.value='3';qty.fire('input');
 price.value='10.50';price.fire('input');
 assert.equal(f.ui.snapshot().total,'AUD 428.50');
 f.ui.setLocale('vi');
 assert.equal(text.value,'Sample new line','locale must never rewrite learner data');
 f.nodes.get('quoteForm').fire('submit');
 assert.equal(f.downloads.length,1);
 assert.equal(verifyCheckedQuoteCsv(f.downloads[0]).verified,true);
 assert.equal(f.downloads[0].calculatedTotalCents,42850);
 const remove=f.nodes.get('quoteRows').children[2].children[3];
 remove.fire('click');
 assert.equal(f.ui.snapshot().rows,2);
 assert.equal(f.ui.snapshot().total,'AUD 397.00');
});
