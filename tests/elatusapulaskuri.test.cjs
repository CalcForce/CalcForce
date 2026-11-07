// Run from repository root: node tests/elatusapulaskuri.test.cjs
// Regression checks for the calculator's calculation engine. No npm dependencies.
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'elatusapulaskuri.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(script, 'Calculator JavaScript must exist');
const end = script[1].indexOf("$('parents').addEventListener('click'");
assert.ok(end > 0, 'Calculator initialization boundary must exist');
const source = script[1].slice(0, end)
  .replace("(()=>{'use strict';", "globalThis.testApi=(()=>{'use strict';")
  + '\nreturn {computeSupportModel,state};})();';
const context = {
  document: {getElementById: () => ({innerHTML:'',querySelectorAll:()=>[]}),querySelectorAll:()=>[]},
  console
};
vm.runInNewContext(source, context, {filename:'elatusapulaskuri.html',timeout:2000});
const {computeSupportModel,state} = context.testApi;
const clone = x => JSON.parse(JSON.stringify(x));
const run = (change=()=>{}) => {
  const parents=clone(state.parents),children=clone(state.children);
  change(parents,children);
  return computeSupportModel(parents,children);
};
const child = (result,name) => {
  const row=result.rows.find(x=>x.name===name);
  assert.ok(row, 'Missing child: '+name);
  return row;
};
const near = (actual,expected) => assert.ok(Math.abs(actual-expected)<0.011,
  'Expected '+expected+', got '+actual);
let count=0;
const check=(label,fn)=>{fn();count++;console.log('PASS',label)};
check('Five default children and no warnings',()=>{
  const result=run();
  assert.equal(result.rows.length,5);
  assert.equal(result.warnings.length,0);
});
check('Child needs in baseline',()=>{
  const result=run();
  // 362 basic costs - 94.88 child benefit - 73.30 supplement.
  near(child(result,'Venla').need,193.82);
  near(child(result,'Eetu').need,193.82);
});
check('Agreed 50/50 support for other children',()=>{
  const result=run();
  for(const [name,amount] of [['Arttu',247.35],['Vilho',247.35],['Alma',174.35]]){
    const row=child(result,name);
    near(row.aa,amount);
    near(row.bb,amount);
  }
});
check('Other children do not become Enni children',()=>{
  const result=run();
  for(const name of ['Arttu','Vilho','Alma']){
    const row=child(result,name);
    assert.equal(row.b,'parent-other-children');
  }
});
check('Manual child benefit changes net need',()=>{
  const before=child(run(),'Venla').need;
  const after=child(run((p,c)=>{c[0].childBenefit=0}),'Venla').need;
  assert.ok(after>before);
  near(after,288.7);
});
check('Higher income raises support payment',()=>{
  const low=child(run(),'Eetu').payment;
  const high=child(run((p)=>{p[0].earningsNet=7000}),'Eetu').payment;
  assert.ok(high>low);
  assert.ok(high<=child(run(p=>{p[0].earningsNet=7000}),'Eetu').need);
});
check('Shared residence activates shared calculation',()=>{
  const row=child(run((p,c)=>{c[0].livingArrangement='shared';c[0].nightsA=15;c[0].nightsB=15}),'Venla');
  assert.equal(row.shared,true);
  assert.ok(row.payment>=0);
});
check('Care nights change care deduction',()=>{
  const normal=child(run(p=>{p[0].earningsNet=7000}),'Eetu');
  const changed=child(run((p,c)=>{p[0].earningsNet=7000;c[1].nightsA=10;c[1].nightsB=20}),'Eetu');
  assert.ok(changed.deduction>normal.deduction);
  assert.ok(changed.payment<normal.payment);
});
check('Zero children returns zero rows',()=>{
  const result=run((p,c)=>{c.splice(0)});
  assert.equal(result.rows.length,0);
});
check('All amounts finite over income scenarios',()=>{
  for(const gross of [0,1000,2000,3333,4000,5000,7000,10000]){
    const result=run(p=>{p[0].earningsNet=gross});
    for(const row of result.rows){
      for(const field of ['need','aa','bb','payment']){
        if(row[field]!=null)assert.ok(Number.isFinite(row[field]),field+' not finite');
      }
    }
  }
});
console.log('OK:',count,'regression tests passed');
