import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {copy} from '../i18n.mjs';
import {siteConfig} from '../config.mjs';
import {getAccessToken} from '../auth.mjs';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const js=await readFile(new URL('../main.mjs',import.meta.url),'utf8');
const css=await readFile(new URL('../styles.css',import.meta.url),'utf8');

test('Companion conversation is visible in the first page section',()=>{
  assert.match(html,/<section class="hero shell" id="try">/);
  assert.ok(html.indexOf('id="chat"') < html.indexOf('id="why"'));
  assert.ok(html.indexOf('id="chatFeed"') < html.indexOf('id="how"'));
  assert.equal((html.match(/id="chatFeed"/g)||[]).length,1);
  assert.equal((html.match(/id="previewForm"/g)||[]).length,1);
  assert.ok(!html.includes('class="try-area"'));
  assert.ok(css.includes('.chat-panel{') && css.includes('@media(max-width:760px)'));
});

test('There are no duplicate element IDs',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(ids.length,new Set(ids).size);
});

test('All rendered labels have Vietnamese and English translations',()=>{
  const keys=[...html.matchAll(/data-t="([^"]+)"/g)].map(x=>x[1]);
  for(const key of keys){
    assert.equal(typeof copy.vi[key],'string',key+' missing vi');
    assert.equal(typeof copy.en[key],'string',key+' missing en');
  }
  for(const l of ['vi','en']){
    for(const p of ['construction','education','business']){
      assert.equal(typeof copy[l].exampleGoals[p],'string');
    }
  }
});

test('Demo submits into a chat without impersonating a live model',async()=>{
  assert.match(js,/addTurn\('user',message\)/);
  assert.match(js,/addTurn\('assistant',advice/);
  assert.match(js,/if\(siteConfig.mode==='live'\)/);
  assert.match(html,/id="chatDemo"|data-t="chatDemo"/);
  assert.equal(siteConfig.mode,'preview');
  assert.equal(await getAccessToken(),null);
});

test('Public preview links work from a GitHub Pages subfolder',()=>{
  assert.doesNotMatch(html,/href="\/"(?:[^"]*)"/);
  assert.match(html,/href="\.\/"/);
  assert.match(html,/src="\.\/main\.mjs"/);
});
