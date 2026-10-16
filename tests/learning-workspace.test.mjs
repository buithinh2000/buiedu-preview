import test from 'node:test';
import assert from 'node:assert/strict';
import {newCareerWorkspace,getCareerExercise,submitCareerMetrics,advanceCareerExercise,getCareerHint,getCareerSummary}
 from '../learning-workspace.mjs';
const start=()=>newCareerWorkspace({goal:'Tôi muốn trở thành giám đốc kinh doanh',locale:'vi'});
test('learner gets a skill map and a real quantitative exercise, not a chat-only reply',()=>{
 const w=start(),e=getCareerExercise(w);
 assert.equal(e.track.length,4);
 assert.equal(e.track.filter(x=>x.implemented).length,1);
 assert.deepEqual(e.target,[10,10,10]);
 assert.deepEqual(e.actual,[10,2,7]);
 assert.equal(e.status,'practice');
 assert.equal(e.completed,0);
});
test('a no-experience learner gets a mathematical hint without fake mastery',()=>{
 const w=start(),h=getCareerHint(w);
 assert.match(h.message,/cộng|mục tiêu/);
 assert.equal(h.state.status,'practice');
 assert.equal(h.state.assistanceUsed,true);
 assert.equal(getCareerSummary(h.state).practiceComplete,false);
});
test('wrong answers identify exactly which calculations need practice',()=>{
 const w=start();const r=submitCareerMetrics(w,{total:'19',gap:'9',rate:'50'});
 assert.equal(r.passed,false);
 assert.deepEqual(r.checks,{total:true,gap:false,rate:false});
 assert.equal(r.state.passedCases.length,0);
 assert.equal(r.state.attempts,1);
});
test('answers are calculated rather than accepted through self-report or clicking buttons',()=>{
 const r=submitCareerMetrics(start(),{total:'19',gap:'11',rate:'63.3'});
 assert.equal(r.passed,true);
 assert.equal(r.stage,'ready_for_transfer');
 assert.equal(r.grade,'FIRST_CASE_CHECKED');
 assert.equal(r.masteryClaim,false);
 assert.equal(r.state.passedCases.length,1);
});
test('a second new dataset must be solved for the basic exercise to be completed',()=>{
 let w=submitCareerMetrics(start(),{total:'19',gap:'11',rate:'63'}).state;
 assert.throws(()=>submitCareerMetrics(w,{total:'19',gap:'11',rate:'63'}),/not_in_practice/);
 w=advanceCareerExercise(w);
 const second=getCareerExercise(w);
 assert.deepEqual(second.target,[12,12,12]);
 assert.deepEqual(second.actual,[12,9,6]);
 const fail=submitCareerMetrics(w,{total:19,gap:11,rate:63});
 assert.equal(fail.passed,false);
 const pass=submitCareerMetrics(fail.state,{total:27,gap:9,rate:75});
 assert.equal(pass.passed,true);
 assert.equal(pass.state.status,'completed');
 const summary=getCareerSummary(pass.state);
 assert.equal(summary.practiceCasesPassed,2);
 assert.equal(summary.practiceComplete,true);
 assert.equal(summary.verifiedProfessionalQualification,false);
 assert.equal(summary.certifiedByBuiEdu,false);
});
test('the second case cannot be skipped',()=>{
 assert.throws(()=>advanceCareerExercise(start()),/not_ready/);
});
test('after completion no learner can farm grades through repeat submission',()=>{
 let w=submitCareerMetrics(start(),{total:19,gap:11,rate:63}).state;
 w=advanceCareerExercise(w);
 w=submitCareerMetrics(w,{total:27,gap:9,rate:75}).state;
 assert.throws(()=>submitCareerMetrics(w,{total:27,gap:9,rate:75}),/not_in_practice/);
});
test('basic input validation rejects formula injection and arbitrary text',()=>{
 const w=start();
 for(const v of ['=1+2','20%','Infinity','<img src=x>','1e9','','-1'])
  assert.throws(()=>submitCareerMetrics(w,{total:v,gap:11,rate:63}),/invalid_answer/);
});
test('decimal comma and ordinary round-off are accepted',()=>{
 const r=submitCareerMetrics(start(),{total:'19',gap:'11',rate:'63,33'});
 assert.equal(r.passed,true);
});
test('rounding wildly incorrect percent never passes',()=>{
 const r=submitCareerMetrics(start(),{total:19,gap:11,rate:66});
 assert.equal(r.passed,false);
 assert.equal(r.checks.rate,false);
});
test('practice state is not mutated while computing a grade',()=>{
 const w=start(),snap=JSON.stringify(w);
 submitCareerMetrics(w,{total:19,gap:11,rate:63});
 assert.equal(JSON.stringify(w),snap);
});
test('English learner can receive the same checked activity and truthful limitations',()=>{
 const w=newCareerWorkspace({goal:'I want to become a sales director',locale:'en'});
 assert.match(getCareerHint(w).message,/target|actual|calculate/i);
 assert.match(getCareerSummary(w).note,/not leadership|not.*director/i);
});
