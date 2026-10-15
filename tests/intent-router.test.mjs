import test from 'node:test';
import assert from 'node:assert/strict';
import {beginGoal,continueGoal} from '../intent-router.mjs';

function turn(state,message,choice=''){return continueGoal(state,{message,choice,locale:state.locale})}

test('reported bug: sales discussion then switch to sales director, no fake product context',()=>{
 let r=beginGoal('Tôi không bán được hàng');
 r=turn(r.state,'','asks');  // user reports leads but few purchases
 r=turn(r.state,'có khách hỏi nhưng giá quá cao');
 r=turn(r.state,'','correct');
 r=turn(r.state,'tôi nói tôi muốn trở thành giám đốc kinh doanh');
 assert.equal(r.topicChanged,true);
 assert.equal(r.state.domain,'career');
 assert.equal(r.state.phase,'role');
 assert.equal(r.state.previousGoal,'Tôi không bán được hàng');
 assert.match(r.reply,/giám đốc kinh doanh/);
 assert.doesNotMatch(r.reply,/bạn đang bán\/làm|khách nhưng giá quá cao|giá quá cao|sản phẩm hay dịch vụ gì/);
 assert.ok(r.options.some(o=>o.id==='manager'));
});

test('a sales-director goal stated initially is not classified as sales conversion',()=>{
 const r=beginGoal('Tôi muốn trở thành giám đốc kinh doanh');
 assert.equal(r.state.domain,'career');
 assert.equal(r.state.phase,'role');
 assert.match(r.reply,/vị trí nào/);
 assert.doesNotMatch(r.reply,/khách mua|chốt đơn/);
});

test('career goal supersedes old step even during an exercise',()=>{
 let r=beginGoal('tôi muốn bán được hàng');
 r=turn(r.state,'','few');
 r=turn(r.state,'áo thun');
 r=turn(r.state,'','yes');
 r=turn(r.state,'','never');
 assert.equal(r.state.phase,'practice');
 r=turn(r.state,'Tôi muốn làm giám đốc kinh doanh');
 assert.equal(r.state.domain,'career');
 assert.equal(r.state.phase,'role');
 assert.equal(r.topicChanged,true);
});

test('leadership track asks about experience, not product sales',()=>{
 let r=beginGoal('tôi muốn trở thành giám đốc kinh doanh');
 r=turn(r.state,'','sales_staff');
 assert.equal(r.state.phase,'focus');
 assert.match(r.reply,/kỹ năng|phần nào/);
 r=turn(r.state,'','leadership');
 assert.equal(r.state.phase,'confirm');
 assert.match(r.reply,/giám đốc kinh doanh/);
 assert.ok(r.options.some(o=>o.id==='correct'));
 r=turn(r.state,'','yes');
 assert.equal(r.state.phase,'familiarity');
 r=turn(r.state,'','never');
 assert.equal(r.action,'PRACTICE');
 assert.equal(r.state.phase,'practice');
 assert.match(r.reply,/lãnh đạo|quản lý|hướng dẫn|đội nhóm/i);
 assert.match(r.reply,/không phải lời hứa thăng chức/i);
});

test('learner may correct the role instead of being trapped in confirmation',()=>{
 let r=beginGoal('tôi muốn làm giám đốc kinh doanh');
 r=turn(r.state,'','manager');
 r=turn(r.state,'','planning');
 r=turn(r.state,'','correct');
 assert.equal(r.state.phase,'role');
 assert.match(r.reply,/sửa/);
});

test('sales problem stays in existing sales discovery, no false pivot',()=>{
 let r=beginGoal('Tôi muốn bán được hàng');
 r=turn(r.state,'','asks');
 r=turn(r.state,'Khách nói giá quá cao');
 assert.equal(r.state.domain,'sales');
 assert.equal(r.state.phase,'confirm');
 assert.equal(r.topicChanged,undefined);
});

test('restating same sales goal as correction never stores it as product type',()=>{
 let r=beginGoal('Tôi muốn bán được hàng');
 r=turn(r.state,'','asks');
 r=turn(r.state,'Tôi nói tôi muốn bán được hàng nhiều hơn');
 assert.equal(r.topicChanged,true);
 assert.equal(r.state.domain,'sales');
 assert.equal(r.state.phase,'bottleneck');
 assert.equal(r.state.detail,null);
});

test('user may explicitly change back from career to a sales goal',()=>{
 let r=beginGoal('tôi muốn trở thành giám đốc kinh doanh');
 r=turn(r.state,'Tôi muốn bán được nhiều hàng');
 assert.equal(r.topicChanged,true);
 assert.equal(r.state.domain,'sales');
 assert.equal(r.state.phase,'bottleneck');
});

test('career learner can ask for easier example without reporting false success',()=>{
 let r=beginGoal('tôi muốn làm giám đốc kinh doanh');
 for(const choice of ['new','unsure','yes','never'])r=turn(r.state,'',choice);
 assert.equal(r.state.phase,'practice');
 const old=r.state.version;
 r=turn(r.state,'','help');
 assert.equal(r.changed,false);
 assert.equal(r.state.version,old);
 assert.match(r.reply,/Ví dụ siêu ngắn/);
 const resumed=turn(r.state,'','tried');
 const reflect=turn(resumed.state,'Tôi có thử nhưng chưa hiểu');
 assert.equal(reflect.state.evidence.status,'self_reported');
});

test('English sales manager pivot uses career context',()=>{
 let r=beginGoal('I want to sell more','en');
 r=continueGoal(r.state,{message:'Actually I want to be a sales director',locale:'en'});
 assert.equal(r.state.domain,'career');
 assert.equal(r.topicChanged,true);
 assert.match(r.reply,/career|sales director/i);
});

test('do not infer new career goal from price objection alone',()=>{
 let r=beginGoal('muốn bán được hàng');
 r=turn(r.state,'','asks');
 r=turn(r.state,'khách nói giá quá cao');
 assert.equal(r.state.phase,'confirm');
 assert.equal(r.state.domain,'sales');
});

test('state and input size remain guarded',()=>{
 const s=beginGoal('tôi muốn làm giám đốc kinh doanh').state;
 assert.throws(()=>continueGoal(s,{message:'x'.repeat(501),locale:'vi'}),/message_too_long/);
 assert.throws(()=>continueGoal(s,{message:'ok',locale:'en'}),/locale_mismatch/);
});
