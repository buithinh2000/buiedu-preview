import test from 'node:test';
import assert from 'node:assert/strict';
import {initialDiscovery,advanceDiscovery} from '../guided-discovery.mjs';

function run(goal,turns,locale='vi'){
 let result=initialDiscovery(goal,locale);
 for(const turn of turns)result=advanceDiscovery(result.state,turn);
 return result;
}
test('user can say only "I want to sell more", get a useful question not a marketing lecture',()=>{
 const result=initialDiscovery('Tôi muốn bán được nhiều hàng');
 assert.equal(result.state.domain,'sales');
 assert.equal(result.state.phase,'bottleneck');
 assert.equal(result.options.length,5);
 assert.doesNotMatch(result.reply,/nên chạy quảng cáo Facebook|chắc chắn do/);
});
test('high-information bottleneck branches tailor the next question',()=>{
 for(const choice of ['few','asks','repeat']){
  const r=run('tôi muốn bán được hàng',[{choice}]);
  assert.equal(r.state.bottleneck,choice);
  assert.equal(r.state.phase,'context');
  assert.match(r.reply,/bán sản phẩm hay dịch vụ/);
 }
});
test('non-experts may answer "I do not know" without being stranded',()=>{
 const r=run('tôi muốn tăng doanh thu',[{choice:'unknown'}]);
 assert.equal(r.state.phase,'observe');
 assert.match(r.reply,/quan sát/);
 assert.equal(r.state.provisional,true);
 assert.ok(r.options.some(o=>o.id==='help'));
});
test('observation help uses hypothetical data without inventing user results',()=>{
 const a=run('Tôi muốn bán được hàng',[{choice:'unknown'}]);
 const b=advanceDiscovery(a.state,{choice:'help'});
 assert.equal(b.changed,false);
 assert.strictEqual(b.state,a.state);
 assert.match(b.reply,/ví dụ giả định/i);
});
test('restate explicitly labels hypothesis and invites correction',()=>{
 const r=run('muốn bán nhiều hàng',[{choice:'asks'},{message:'tôi bán bánh mì'}]);
 assert.equal(r.state.phase,'confirm');
 assert.match(r.reply,/giả thuyết/);
 assert.match(r.reply,/tôi bán bánh mì/);
 assert.ok(r.options.some(o=>o.id==='correct'));
 assert.equal(r.state.provisional,true);
});
test('learner correction is recorded separately, not treated as confirmed',()=>{
 const r=run('muốn bán hàng',[{choice:'asks'},{message:'áo thun'},{choice:'correct'},{message:'vấn đề là hàng giao chậm'}]);
 assert.equal(r.state.phase,'confirm');
 assert.equal(r.state.correction,'vấn đề là hàng giao chậm');
 assert.equal(r.state.provisional,true);
});
test('after confirmation novice gets guided practice in plain language',()=>{
 const r=run('Tôi muốn bán được hàng',[
  {choice:'few'},{message:'bánh mì'},{choice:'yes'},{choice:'never'}
 ]);
 assert.equal(r.state.phase,'practice');
 assert.equal(r.state.skill,'never');
 assert.equal(r.action,'PRACTICE');
 assert.match(r.reply,/Mở ChatGPT/);
 assert.match(r.reply,/Không bịa/);
});
test('different bottlenecks produce different practice plans',()=>{
 const responses=[];
 for(const choice of ['few','asks','repeat']){
  const r=run('muốn bán hàng',[{choice},{message:'trà sữa'},{choice:'yes'},{choice:'some'}]);
  responses.push(r.reply);
 }
 assert.equal(new Set(responses).size,3);
});
test('learner can request a simpler example without losing progress',()=>{
 const a=run('muốn bán hàng',[{choice:'asks'},{message:'giày'},{choice:'yes'},{choice:'never'}]);
 const b=advanceDiscovery(a.state,{choice:'help'});
 assert.equal(b.changed,false);
 assert.equal(b.state.version,a.state.version);
 assert.match(b.reply,/Ví dụ dễ hơn/);
});
test('self-reported practice is not misrepresented as verified',()=>{
 const r=run('muốn bán hàng',[
  {choice:'asks'},{message:'bánh mì'},{choice:'yes'},{choice:'never'},
  {choice:'tried'},{message:'tôi viết được bản nháp'}
 ]);
 assert.equal(r.state.evidence.status,'self_reported');
 assert.match(r.reply,/chưa coi đó là kết quả đã xác minh/);
});
test('generic goals and English follow safe alternative paths',()=>{
 const r=initialDiscovery('I want to be more confident at work','en');
 assert.equal(r.state.domain,'general');
 assert.equal(r.options.length,5);
 const result=run('I want to sell more',[{choice:'asks'},{message:'handmade shirts'},{choice:'yes'},{choice:'never'}],'en');
 assert.equal(result.action,'PRACTICE');
 assert.match(result.reply,/Open an AI chat tool/);
});
test('empty input cannot advance a stage and invalid locale rejected',()=>{
 const s=initialDiscovery('muốn học AI').state;
 const r=advanceDiscovery(s,{message:'  '});
 assert.equal(r.changed,false);
 assert.strictEqual(r.state,s);
 assert.throws(()=>advanceDiscovery(s,{message:'test',locale:'en'}),/locale_mismatch/);
 assert.throws(()=>initialDiscovery('x'.repeat(501)),/message_too_long/);
});
