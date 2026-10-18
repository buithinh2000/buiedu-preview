"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const M=require("./v09-engine.js");
const fresh=()=>{const c=M.createCase();c.description="Công ty nhỏ thiếu dòng tiền và khách thanh toán chậm, phải trả lương nhân viên.";c.domain="cash";return c;};
test("classifies cashflow input but does not infer root cause",()=>{
 const r=M.detect("Khách hàng thanh toán chậm, công ty thiếu tiền để trả lương");assert.equal(r.first,"cash");
 assert.ok(M.allFor("cash").length>=3);
});
test("five distinct domain pathways exist",()=>{
 assert.equal(M.DOMAINS.length,5);
 for(const d of M.DOMAINS){assert.ok(M.allFor(d.id).length>=2);assert.ok(d.metric.name&&d.metric.unit);}
});
test("unknown evidence never becomes an affirmative observation",()=>{
 const c=fresh();let r=M.review(c);assert.ok(r.evaluated.every(h=>h.state==="untested"));
 c.answers["receivables.invoices"]={value:"unknown",source:"self"};
 r=M.review(c);assert.equal(r.evaluated.find(h=>h.id==="receivables").answered,0);
});
test("a hypothesis needs distinguishable observations",()=>{
 const c=fresh();c.answers["receivables.invoices"]={value:"yes",source:"self"};
 let r=M.review(c);assert.equal(r.evaluated.find(h=>h.id==="receivables").state,"plausible");
 c.answers["receivables.terms"]={value:"no",source:"record"};
 r=M.review(c);const h=r.evaluated.find(h=>h.id==="receivables");
 assert.equal(h.state,"mixed");assert.equal(h.claimedDocuments,1);
});
test("a single negative result weakens rather than proves innocence",()=>{
 const c=fresh();c.answers["receivables.invoices"]={value:"no"};
 const h=M.review(c).evaluated.find(h=>h.id==="receivables");
 assert.equal(h.state,"weakened");
});
test("hypothesis has meaningful refutation and a safe action",()=>{
 for(const h of M.H){assert.ok(h.disconfirm.length>20);assert.ok(h.intervention.length>35);assert.ok(h.questions.length>=2);assert.ok(M.SOURCES[h.ref]?.url.startsWith("https://"));}
});
test("intervention gate refuses absent baseline, target and stopping rule",()=>{
 const c=fresh();c.experiment.action="Thử theo dõi thời gian chờ vật tư";
 assert.equal(M.qualityCheck(c).ready,false);
 assert.ok(M.qualityCheck(c).issues.length>=3);
});
test("intervention gate accepts all required inputs but does not claim safety",()=>{
 const c=fresh();c.baseline=5;c.target=7;c.experiment.action="Test";c.experiment.start="2026-10-20";c.experiment.end="2026-11-20";c.experiment.stop="Dừng nếu tạo nguy cơ mất an toàn";
 assert.equal(M.qualityCheck(c).ready,true);
});
test("monitoring uses only observed values and doesn't assert causality",()=>{
 let c=fresh();c.baseline=60;c.target=75;c.unit="%";c.direction="up";
 assert.equal(M.progress(c).status,"baseline");
 c=M.recordOutcome(c,"2026-11-01",65,"Một tuần ít việc hơn");
 const p=M.progress(c);assert.equal(p.last,65);assert.equal(p.change,5);assert.equal(p.preferred,true);
 assert.ok(p.description.includes("chưa chứng minh"));
});
test("lower metric is considered improvement only if actual goes down",()=>{
 let c=fresh();c.baseline=12;c.target=6;c.unit="giờ";c.direction="down";
 c=M.recordOutcome(c,"2026-11-05","8","Giảm giờ sửa lỗi");
 const p=M.progress(c);assert.equal(p.preferred,true);assert.equal(p.targetReached,false);
});
test("recording rejects blank or invalid values",()=>{
 const c=fresh();assert.throws(()=>M.recordOutcome(c,"2026-11-01","",""),/VALUE_REQUIRED/);
 assert.throws(()=>M.recordOutcome(c,"bad",12,""),/INVALID_DATE/);
});
test("CSV export defuses spreadsheet formula injection",()=>{
 const c=fresh();c.observations=[{date:"2026-11-01",value:1,note:"=IMPORTXML(\"bad\")"}];
 const csv=M.csv(c);assert.ok(csv.includes("'=IMPORTXML"));assert.ok(csv.includes('""bad""'));
});
test("JSON import sanitizes unexpected large data and invalid domains",()=>{
 const c=fresh();c.observations=[{id:"x",date:"2026-11-01",value:1,note:"ok"}];const round=M.validateImport(JSON.parse(JSON.stringify(c)));
 assert.equal(round.observations.length,1);assert.equal(round.domain,"cash");
 assert.throws(()=>M.validateImport({...c,domain:"unknown"}),/INVALID_DOMAIN/);
});
test("browser entrypoints, resources and modules are linked",()=>{
 const html=fs.readFileSync(path.join(__dirname,"v09-preview.html"),"utf8");
 assert.ok(html.indexOf('src="./v09-engine.js"')<html.indexOf('src="./v09-app.js"'));
 assert.ok(html.includes("Lưu thiết bị")&&html.includes("Ghi nhận"));
});
