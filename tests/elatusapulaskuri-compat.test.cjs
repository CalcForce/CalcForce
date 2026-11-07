// Compatibility checks for the shared card lifecycle and both data models.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {JSDOM, VirtualConsole} = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'elatusapulaskuri.html'), 'utf8');
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => errors.push(error.message));
const dom = new JSDOM(html, {runScripts:'dangerously', url:'https://example.com/', virtualConsole});
const document = dom.window.document;
const legacyParent = id => ({id,name:id,gross:3000,taxMode:'manual',tax:20,livingMode:'manual',living:726,housing:600,housingMode:'rent'});
const legacyChild = id => ({id,name:id,age:'7-12',basic:422,basicMode:'auto',a:'a',b:'b',resident:'b',nightsA:8,nightsB:22,agreementMode:'income',benefitMode:'manual',benefit:100});
const revisedChild = id => ({...legacyChild(id),revisedChild:true,childBenefit:100,childSingleSupplement:0,housingCost:0,visitingNights:8});
async function load(data){
 await document.querySelector('#file').onchange({target:{files:[{text:async()=>JSON.stringify(data)}],value:'fixture.json'}});
}
function change(selector,value){
 const element = document.querySelector(selector);
 assert.ok(element,selector);
 element.value = String(value);
 element.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
}
(async()=>{
 try{
  await load({parents:[legacyParent('a'),legacyParent('b')],children:[legacyChild('old')]});
  assert.equal(document.querySelectorAll('.revised-parent,.revised-child').length,0);
  assert.ok(document.querySelector('[data-parent="a"] [data-field="gross"]'));
  assert.ok(document.querySelector('[data-child="old"] [data-field="benefit"]'));
  console.log('PASS legacy import retains legacy fields');

  change('[data-parent="a"] [data-field="gross"]',4000);
  change('[data-child="old"] [data-field="age"]','13-17');
  assert.equal(document.querySelector('[data-child="old"] [data-field="basic"]').value,'568');
  console.log('PASS legacy field changes and age calculation');

  document.querySelector('#addChild').click();
  assert.equal(document.querySelectorAll('.revised-child').length,1);
  assert.ok(document.querySelector('[data-child="old"] [data-field="benefit"]'));
  assert.ok(document.querySelector('.revised-child [data-field="childBenefit"]'));
  console.log('PASS adding current child preserves legacy sibling fields');

  await load({parents:[{...legacyParent('a'),revisedParent:true,earningsNet:3000},legacyParent('b')],children:[revisedChild('new'),legacyChild('old')]});
  assert.ok(document.querySelector('[data-parent="a"] [data-field="earningsNet"]'));
  assert.ok(document.querySelector('[data-parent="b"] [data-field="gross"]'));
  assert.ok(document.querySelector('[data-child="new"] [data-field="childBenefit"]'));
  assert.ok(document.querySelector('[data-child="old"] [data-field="benefit"]'));
  assert.equal(document.querySelectorAll('[data-parent="a"] .advanced-toggle').length,0);
  console.log('PASS mixed imports render each record with its own model');

  document.querySelector('[data-child="new"]').open = true;
  document.querySelector('[data-child="new"] [data-section="special"]').open = true;
  change('[data-child="new"] [data-field="age"]','13-17');
  assert.ok(document.querySelector('[data-child="new"]').open);
  assert.ok(document.querySelector('[data-child="new"] [data-section="special"]').open);
  change('[data-child="new"] [data-field="daycare"]',100);
  assert.match(document.querySelector('[data-child="new"] .child-needs-total').textContent,/568/);
  console.log('PASS shared lifecycle retains expansion and updates summaries');

  await load({parents:[legacyParent('a'),legacyParent('b')],children:[{...revisedChild('safe'),name:'<img src=x onerror=alert(1)>'}]});
  assert.equal(document.querySelector('[data-child="safe"] img'),null);
  assert.equal(document.querySelector('[data-child="safe"] > summary').textContent,'<img src=x onerror=alert(1)>');
  console.log('PASS shared rendering preserves escaped names');

  await load({parents:[],children:[]});
  assert.match(document.querySelector('#parents').textContent,/Ei vanhempia/);
  assert.match(document.querySelector('#children').textContent,/Ei lapsia/);
  console.log('PASS empty lists use shared empty-state rendering');
  assert.deepEqual(errors,[]);
  console.log('OK: 7 compatibility checks passed, no DOM runtime errors');
 }finally{dom.window.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
