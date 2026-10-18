"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const atlas=require("./v08-atlas.js");
const engine=require("./v08-reason.js");
const questions=(sector,focus)=>engine.questions(atlas,sector,focus);
const assess=(sector,focus,extra={})=>engine.assess({atlas,sectorId:sector,focusId:focus,answers:{},safety:"unknown",...extra});
test("exactly eight universal dimensions, no duplicated IDs",()=>{
assert.equal(atlas.dimensions.length,8);
assert.equal(new Set(atlas.dimensions.map(d=>d.id)).size,8);
});
test("six sectors each have outcome-dependent probes",()=>{
assert.equal(atlas.sectors.length,6);
for(const s of atlas.sectors){assert.ok(s.outcomes.length>=2);assert.ok(s.outcomes.every(f=>f.dims.length>=4));assert.ok(s.outcomes.every(f=>f.dims.every(id=>s.probes[id]&&s.probes[id].length===4)));}
});
test("family questions are not copied from company",()=>{
const a=questions("family","stability").map(x=>x.question);
const b=questions("company","people").map(x=>x.question);
assert.notDeepEqual(a,b);assert.ok(a.some(x=>x.includes("gia đình")||x.includes("nhà")||x.includes("chăm sóc")));
});
test("custom problem spans all dimensions",()=>{
assert.equal(questions("school","__custom").length,8);
});
test("unknown and absent are different",()=>{
let a=assess("company","execution",{answers:{roles:{signal:"unknown"}}});
let b=assess("company","execution",{answers:{roles:{signal:"absent"}}});
assert.equal(a.known.length,0);assert.equal(b.known.length,1);assert.equal(b.current.length,0);
});
test("evidence source is a user claim not verified fact",()=>{
const x=assess("company","execution",{answers:{roles:{signal:"present",source:"records",perspective:"decision"}}});
assert.equal(x.documented.length,1);assert.equal(x.views.length,1);assert.ok(x.caveats.some(a=>a.includes("nhiều góc nhìn")));
});
test("next question follows focus path and adapts after answers",()=>{
const q=questions("company","execution");
const first=engine.recommendNext(q,{});
assert.equal(first.id,q[0].id);
const next=engine.recommendNext(q,{[q[0].id]:{signal:"present",answeredAt:1}});
assert.equal(next.id,"incentives");
const rival=engine.recommendNext(q,{[q[0].id]:{signal:"absent",answeredAt:1}});
assert.equal(rival.id,"context");
});
test("safety overrides standard output even with missing data",()=>{
const x=assess("family","stability",{safety:"yes",answers:{}});
assert.equal(x.safetyPriority,true);assert.equal(x.gate,"Ưu tiên an toàn");
assert.equal(engine.plan(x).urgent,true);
});
test("three future branches remain qualitative without invented percent",()=>{
const x=assess("company","execution",{answers:{roles:{signal:"present"}},horizon:"36"});
const b=engine.branches(x,"roles","");
assert.equal(b.length,3);assert.ok(b[0].body.includes("3 năm"));
assert.ok(b.some(y=>y.body.includes("nguyên nhân")||y.body.includes("cơ chế")));
assert.ok(b.every(y=>!y.body.includes("85%")&&!y.body.includes("xác suất thành công")));
});
test("both negative observations and protective explanations remain inspectable",()=>{
const x=assess("school","learning",{answers:{capacity:{signal:"absent"},roles:{signal:"present"}}});
assert.equal(x.notObserved.length,1);assert.equal(x.current.length,1);
});
test("JSON export identifies unverified data and does not add identifiers",()=>{
const s=engine.exportSafe({sectorId:"company",focusId:"execution",goal:"Some goal",answers:{},ideas:[]});
const x=JSON.parse(s);
assert.ok(x.note.includes("unverified"));assert.equal(x.goal,"Some goal");assert.ok(!s.includes("apiKey"));
});
test("standalone preview has scripts in correct order and no paid API",()=>{
const h=fs.readFileSync(path.join(__dirname,"v08-preview.html"),"utf8");
assert.ok(h.indexOf('src="./v08-atlas.js"')<h.indexOf('src="./v08-reason.js"'));
assert.ok(h.indexOf('src="./v08-reason.js"')<h.indexOf('src="./v08-app.js"'));
assert.ok(h.includes("RESEARCH PROTOTYPE"));
});
