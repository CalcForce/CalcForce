// npm ci && npm test; DOM checks do not replace browser visual testing.
const fs=require('fs'),assert=require('assert/strict'),{JSDOM,VirtualConsole}=require('jsdom'),css=require('css-tree');
const html=fs.readFileSync(require('path').join(__dirname,'..','elatusapulaskuri.html'),'utf8');
const errors=[];const ast=css.parse(html.match(/<style>([\s\S]*?)<\/style>/)[1],{parseCustomProperty:true,onParseError:e=>errors.push(e.message)});css.walk(ast,n=>{if(n.type==='Raw')errors.push('Raw/unparsed CSS: '+n.value)});assert.deepEqual(errors,[]);console.log('PASS CSS parses without invalid fragments');
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{url:'https://example.com/?test=1',runScripts:'dangerously',virtualConsole:vc});const doc=dom.window.document;
assert.match(doc.querySelector('#regression-tests')?.textContent||'',/24 \/ 24/);
function input(selector,value){const el=doc.querySelector(selector);assert.ok(el,selector);el.value=String(value);el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));el.dispatchEvent(new dom.window.Event('change',{bubbles:true}));return el}
const p='[data-parent="parent-tero"]',c='[data-child="child-venla"]';
input(p+' [data-field="earningsNet"]',3000);assert.match(doc.querySelector(p+' [data-total="income"]').textContent,/3\s?000/);console.log('PASS parent total updates');
input(c+' [data-field="daycare"]',100);assert.match(doc.querySelector(c+' .child-needs-total').textContent,/294/);console.log('PASS child total updates');
input(c+' [data-field="childBenefit"]',0);assert.match(doc.querySelector(c+' .child-needs-total').textContent,/389/);console.log('PASS deduction updates');
input(c+' [data-field="agreementMode"]','agreed');const pct=input(c+' [data-field="agreementValue"]',150);assert.equal(pct.value,'100');console.log('PASS percent clamps at 100');
console.log('PASS embedded regression suite: 24/24');
const original=doc.querySelector(p+' [data-field="earningsNet"]');original.focus();input(p+' [data-field="earningsNet"]',3500);assert.equal(doc.activeElement,original);console.log('PASS editing preserves input focus');
input(p+' [data-field="housing"]',100);assert.match(doc.querySelector(p+' [data-total="expenses"]').textContent,/826/);console.log('PASS expense total updates');
doc.querySelector('#addChild').click();const added=[...doc.querySelectorAll('#children .child-card')].at(-1);assert.ok(added.classList.contains('revised-child'));assert.ok(added.open);input('[data-child="'+added.dataset.child+'"] [data-field="daycare"]',120);assert.match(added.querySelector('.child-needs-total').textContent,/482/);console.log('PASS added child uses current model and live totals');
added.querySelector('[data-action="remove-child"]').click();assert.equal(doc.querySelectorAll('#children .child-card').length,5);console.log('PASS child removal');
doc.querySelector('#menuTrigger').click();assert.equal(doc.querySelector('#appMenu').hidden,false);assert.equal(doc.querySelector('#menuTrigger').getAttribute('aria-expanded'),'true');doc.body.click();assert.equal(doc.querySelector('#appMenu').hidden,true);console.log('PASS menu opening and closing');
for(const theme of ['light','forest','ocean']){input('#theme',theme);assert.equal(doc.body.dataset.theme,theme)}console.log('PASS all three theme selections');
assert.deepEqual(errors,[]);console.log('PASS no DOM runtime errors');dom.window.close();
