const test=require("node:test");
const assert=require("node:assert/strict");
const model=require("./evidence-v07.js");
const item=(id,positive=false)=>({id,positive,action:"try",measure:"outcome"});
test("six supported sectors",()=>{for(const x of ["company","family","school","community","public","nonprofit"])assert.ok(model.extraFor(x).length>=3);});
test("missing data are not zero",()=>{const x=model.assess([item("a"),item("b")],{a:{freq:""}},"company");assert.equal(x.knownCount,0);assert.equal(x.usable,false);});
test("positive resources remain separate from concerns",()=>{const x=model.assess([item("a"),item("support",true)],{a:{freq:"2"},support:{freq:"3"}},"family");assert.equal(x.risks.length,1);assert.equal(x.positives.length,1);});
test("source declarations are not a causal proof",()=>{const x=model.assess([item("a")],{a:{freq:"2",evidence:2}},"company");assert.equal(x.sources,1);assert.ok(x.missing.length>0);});
test("three qualitative alternative paths",()=>{const x=model.scenarios(item("a"),5,2,50,"measure","target");assert.equal(x.length,3);assert.ok(x[1].body.includes("năm 2"));});
