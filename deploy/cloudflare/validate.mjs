// BuiEdu ONLY: validate public Cloudflare artifact independently of repo tree.
// No Render, Civilization Lab, paid AI, hard-coded bearer or pretend live login.
import {readdirSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {strict as assert} from 'node:assert';
const dir=process.argv[2];
assert.equal(dir,'dist-buiedu','unexpected_release_directory');
const allowed=new Set([
 'index.html','styles.css','main.mjs','i18n.mjs','config.mjs',
 'auth.mjs','companion-api.mjs','guided-discovery.mjs',
 'intent-router.mjs','workplace-spreadsheet-csv.mjs',
 'learning-workspace.mjs','career-desk-ui.mjs','quote-studio.mjs',
 '_headers','.nojekyll'
]);
const names=readdirSync(dir);
assert.equal(names.length,allowed.size,'unexpected bundled files');
for(const file of names){
 assert(allowed.has(file),'foreign_venture_or_unreviewed_asset_'+file);
 assert(statSync(join(dir,file)).isFile(),'bundled_directory_denied');
}
const get=file=>readFileSync(join(dir,file),'utf8');
const html=get('index.html'),config=get('config.mjs'),auth=get('auth.mjs');
assert(html.includes('<title>BuiEdu'),'wrong_product');
assert(!html.includes('civilization-lab'),'foreign_venture_link');
assert(config.includes("mode:'preview'"),'must_remain_disabled_until_live_auth');
assert(config.includes("apiBaseUrl:''"),'unapproved_public_api_target');
assert(config.includes("authProvider:'not-configured'"),'unverified_identity');
assert(auth.includes('return null'),'production_login_not_ready');
assert(get('_headers').includes("frame-ancestors 'none'"),'frame_policy_missing');
assert(get('_headers').includes('X-Robots-Tag: noindex'),'public_launch_not_approved');
for(const file of [...allowed].filter(x=>x.endsWith('.mjs'))){
 const body=get(file);
 assert(!/(?:sk-proj-|BEGIN PRIVATE KEY|OPENAI_API_KEY\s*[=:]|CLOUDFLARE_API_TOKEN\s*[=:]|AWS_SECRET_ACCESS_KEY\s*[=:])/.test(body),
  'secret_or_private_env_in_public_bundle_'+file);
 assert(!/render\.com|onrender\.com|civilization-lab/i.test(body),
  'legacy_or_foreign_venture_in_public_bundle_'+file);
 for(const [,dep] of body.matchAll(/\bfrom\s+['"]\.\/([^'"]+)['"]/g))
  assert(allowed.has(dep),'unreviewed_import_'+file+'_'+dep);
}
console.log('BUIEDU_CLOUDFLARE_PUBLIC_ALLOWLIST_15_OF_15_PASS');
console.log('BUIEDU_CLOUDFLARE_NO_LIVE_AUTH_OR_AI_CLAIM_PASS');
