import test from 'node:test';
import assert from 'node:assert/strict';
import {beginGoal,continueGoal} from '../intent-router.mjs';
const respond=(r,{text='',choice='',locale=r.state.locale}={})=>continueGoal(r.state,{message:text,choice,locale});

test('Vietnamese user goal is treated as a career aspiration, not a sales conversion problem',()=>{
 const r=beginGoal('tôi muốn trở thành sale director','en');
 assert.equal(r.state.domain,'career');
 assert.equal(r.state.phase,'position');
 assert.equal(r.state.locale,'vi');
 assert.match(r.reply,/giám đốc kinh doanh/i);
 assert.doesNotMatch(r.reply,/viết prompt|mở.*AI|bán thêm vài đơn hàng/i);
 assert.ok(r.options.some(x=>x.id==='unknown'));
});
test('English career aspiration immediately explains the director role',()=>{
 const r=beginGoal('I want to be a sales director','en');
 assert.equal(r.state.domain,'career');
 assert.equal(r.state.phase,'position');
 assert.match(r.reply,/planning|team|targets/i);
 assert.doesNotMatch(r.reply,/specific task|paste.*prompt/i);
});
test('screenshots: learner says they know nothing, receives an in-chat example rather than a new intake',()=>{
 let r=beginGoal('tôi muốn trở thành sale director','en');
 r=respond(r,{text:"i dont know i just want to become a director, now i dont know everything",locale:'en'});
 assert.equal(r.state.domain,'career');
 assert.equal(r.state.phase,'scenario');
 assert.match(r.reply,/FICTIONAL|GIẢ ĐỊNH/);
 assert.match(r.reply,/3|three/i);
 assert.doesNotMatch(r.reply,/open an AI tool|chatgpt|use a prompt|copy and paste/i);
 assert.ok(r.options.some(x=>x.id==='unknown'));
});
test('not knowing the practice answer gives a hint without marking any competency',()=>{
 let r=beginGoal('I want to be a sales director','en');
 r=respond(r,{choice:'unknown'});
 const phase=r.state.phase,version=r.state.version;
 r=respond(r,{text:"I don't know"});
 assert.equal(r.state.phase,phase);
 assert.equal(r.state.version,version);
 assert.match(r.reply,/Hint|Gợi ý/);
 assert.ok(!r.state.verified);
});
test('the useful coaching answer explains why and offers sales-number practice',()=>{
 let r=beginGoal('I want to be a sales director','en');
 r=respond(r,{choice:'new'});
 r=respond(r,{choice:'explore'});
 assert.equal(r.state.phase,'numbers');
 assert.equal(r.action,'PRACTICE');
 assert.match(r.reply,/30/);assert.match(r.reply,/19/);assert.match(r.reply,/11/);
 assert.match(r.reply,/cause|why|reason/i);
 assert.ok(r.options.some(x=>x.id==='numbers'));
});
test('poor manager answer should never be framed as proven good or called mastery',()=>{
 let r=beginGoal('Tôi muốn làm giám đốc kinh doanh');
 r=respond(r,{choice:'sales'});
 r=respond(r,{choice:'pressure'});
 assert.equal(r.state.phase,'numbers');
 assert.match(r.reply,/không thể kết luận/i);
 assert.equal(r.state.verified,false);
});
test('learning should continue to an in-chat exercise, not redirect to other tools',()=>{
 let r=beginGoal('I want to be a sales director','en');
 r=respond(r,{choice:'lead'});
 r=respond(r,{choice:'explore'});
 r=respond(r,{choice:'coaching'});
 assert.equal(r.state.phase,'reflect');
 assert.match(r.reply,/Which question|Practice/i);
 assert.doesNotMatch(r.reply,/open.*AI|paste.*prompt/i);
});
test('reported attempt remains self-reported and not verified',()=>{
 let r=beginGoal('I want to be a sales director','en');
 for(const choice of ['new','explore','numbers'])r=respond(r,{choice});
 r=respond(r,{text:'63 percent',locale:'en'});
 assert.equal(r.state.phase,'review');
 assert.equal(r.state.report.status,'self_reported');
 assert.equal(r.state.verified,false);
});
test('same career intent repeated with incomplete details does not restart role questionnaire',()=>{
 let r=beginGoal('tôi muốn trở thành giám đốc kinh doanh','vi');
 r=respond(r,{text:'tôi chưa biết mình cần học gì'});
 assert.equal(r.state.phase,'scenario');
 r=respond(r,{text:'i still dont know, I just want to become a director',locale:'en'});
 assert.equal(r.state.phase,'scenario');
 assert.ok(r.reply.length>20);
});
test('switch from poor sales results to director aspiration takes priority over old question',()=>{
 let r=beginGoal('Tôi không bán được hàng','vi');
 r=respond(r,{choice:'asks'});
 r=respond(r,{text:'Tôi nói tôi muốn trở thành giám đốc kinh doanh'});
 assert.equal(r.topicChanged,true);
 assert.equal(r.state.domain,'career');
 assert.equal(r.state.phase,'position');
 assert.equal(r.state.previousGoal,'Tôi không bán được hàng');
 assert.doesNotMatch(r.reply,/khách hàng nói giá quá cao/i);
});
test('explicitly changing career goal to sales keeps the new sales topic',()=>{
 let r=beginGoal('tôi muốn trở thành giám đốc kinh doanh','vi');
 r=respond(r,{text:'Tôi muốn bán được nhiều hàng'});
 assert.equal(r.topicChanged,true);
 assert.equal(r.state.domain,'sales');
 assert.equal(r.state.phase,'obstacle');
});
test('an ordinary sales conversation receives diagnosis questions, not career claims',()=>{
 let r=beginGoal('Tôi bán hàng không được','vi');
 assert.equal(r.state.domain,'sales');
 r=respond(r,{choice:'asks'});
 assert.equal(r.state.phase,'smallPractice');
 assert.match(r.reply,/GIẢ ĐỊNH/);
 assert.doesNotMatch(r.reply,/giám đốc kinh doanh/i);
});
test('people who do not know their sales obstacle still get a small worked example',()=>{
 let r=beginGoal('I want to sell more','en');
 r=respond(r,{choice:'unknown'});
 assert.match(r.reply,/FICTIONAL/);
 assert.equal(r.state.phase,'smallPractice');
 assert.doesNotMatch(r.reply,/open ChatGPT|ask an AI tool/i);
});
test('novice who wants Excel can start with a checked simple practice',()=>{
 let r=beginGoal('Tôi không biết AI giúp gì','vi');
 assert.equal(r.state.domain,'work');
 r=respond(r,{choice:'excel'});
 assert.equal(r.state.phase,'guided');
 assert.match(r.reply,/350/);
 assert.match(r.reply,/Excel/);
});
test('an unrecognized goal is not interpreted as an imaginary task',()=>{
 const r=beginGoal('Tôi muốn thay đổi cuộc sống','vi');
 assert.equal(r.state.domain,'work');
 assert.match(r.reply,/chưa biết chính xác|không đoán/i);
 assert.ok(r.options.some(x=>x.id==='unknown'));
});
test('a learner who is confused after an Office example can ask for help without phony success',()=>{
 let r=beginGoal('I want to use AI for work','en');
 r=respond(r,{choice:'writing'});
 r=respond(r,{choice:'example'});
 assert.equal(r.action,'SUPPORT');
 assert.equal(r.state.phase,'guided');
 assert.doesNotMatch(r.reply,/you have mastered|you passed/i);
});
test('career goal classification is not triggered by casual mentions of a boss',()=>{
 const r=beginGoal('Giám đốc kinh doanh nói tôi cần làm báo cáo','vi');
 assert.equal(r.state.domain,'work');
});
test('locale may change naturally when a learner switches from Vietnamese to English',()=>{
 let r=beginGoal('Tôi muốn trở thành giám đốc kinh doanh','en');
 assert.equal(r.state.locale,'vi');
 r=respond(r,{text:"I don't know",locale:'en'});
 assert.equal(r.state.locale,'en');
 assert.match(r.reply,/FICTIONAL/);
});
test('empty goal, unbounded input, stale state and invalid language are rejected',()=>{
 assert.throws(()=>beginGoal(''),/goal_required/);
 assert.throws(()=>beginGoal('x'.repeat(501)),/message_too_long/);
 assert.throws(()=>beginGoal('test','xx'),/unsupported_locale/);
 assert.throws(()=>continueGoal({schemaVersion:1},{message:'ok'}),/invalid_state/);
});
test('the rule demo makes no claim to have sent emails or generated real AI files',()=>{
 let r=beginGoal('Tôi muốn dùng AI để làm email','vi');
 r=respond(r,{choice:'writing'});
 assert.doesNotMatch(r.reply,/đã gửi|đã tạo file|hoàn thành email/i);
});
