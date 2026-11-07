// npm run test:refactor; jsdom style comparison, not visual browser testing.
const fs=require('fs'),assert=require('assert/strict'),{JSDOM,VirtualConsole}=require('jsdom'),css=require('css-tree');
const path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm');
const root=path.join(__dirname,'..');
// Pinned baseline: version 0.560. Requires repository history.
const htmls=[cp.execFileSync('git',['show','60abf375731b79fe90a7e7abf0d2f434619f9d1a:elatusapulaskuri.html'],{cwd:root,encoding:'utf8'}),fs.readFileSync(path.join(root,'elatusapulaskuri.html'),'utf8')];
function model(html){
 let code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 code=code.slice(0,code.indexOf("$('parents').addEventListener('click'"))
  .replace("(()=>{'use strict';","globalThis.api=(()=>{'use strict';")+'\nreturn {state,computeSupportModel};})();';
 const context={document:{getElementById:()=>({innerHTML:'',querySelectorAll:()=>[]}),querySelectorAll:()=>[]},console};
 vm.runInNewContext(code,context);return context.api;
}
const apis=htmls.map(model);let cases=0;
for(const income of [0,1000,2000,3333,4000,5000,7000,10000])for(const nights of [0,10,15])for(const extraCost of [0,100,500]){
 const outputs=apis.map(api=>{const parents=JSON.parse(JSON.stringify(api.state.parents)),children=JSON.parse(JSON.stringify(api.state.children));parents[0].earningsNet=income;children[0].nightsA=nights;children[0].nightsB=30-nights;children[0].daycare=extraCost;return JSON.stringify(api.computeSupportModel(parents,children))});
 assert.equal(outputs[0],outputs[1]);cases++;
}
console.log('PASS baseline calculation comparison: '+cases+' scenarios');
const live=htmls.map(h=>new JSDOM(h,{runScripts:'dangerously',url:'https://example.com/',virtualConsole:new VirtualConsole()}));
for(const id of ['parents','children'])assert.equal(live[0].window.document.getElementById(id).innerHTML,live[1].window.document.getElementById(id).innerHTML,id+' markup changed');console.log('PASS default parent/child markup identical');
const markup=live[0].window.document.body.innerHTML.replace(/<script>[\s\S]*?<\/script>/g,'');live.forEach(d=>d.window.close());
function flat(h,width,media){const ast=css.parse(h.match(/<style>([\s\S]*?)<\/style>/)[1]);return [...ast.children].flatMap(n=>{if(n.type!=='Atrule'||n.name!=='media')return css.generate(n);const q=css.generate(n.prelude);const m=q.match(/max-width:(\d+)px/);return (q==='print'?media==='print':m?width<=Number(m[1]):false)?[...n.block.children].map(x=>css.generate(x)):[]}).join('\n')}
const properties=['display','position','color','background-color','font-size','font-weight','line-height','width','max-width','min-width','height','min-height','padding','margin','border','border-radius','text-align','overflow','white-space','flex','gap'];
const select='.app,header,header strong,.panel,.app-menu,.menu-trigger,.warning,.card-body,.parent-card,.child-card,.parent-extra,.child-extra,summary,.field-label,.field-input,.revised-total,.field-help,.section-number';
let count=0;
for(const width of [320,420,600,700,1024])for(const theme of ['ocean','light','forest'])for(const media of ['screen','print']){
 const doms=htmls.map(h=>new JSDOM('<style>'+flat(h,width,media)+'</style>'+markup,{virtualConsole:new VirtualConsole()}));
 const snapshots=doms.map(d=>{const doc=d.window.document;doc.body.dataset.theme=theme;doc.querySelectorAll('details').forEach(x=>x.open=true);const all=[...doc.querySelectorAll(select)];const seen=new Set();return all.filter(el=>{const key=el.tagName+' '+el.className; if(seen.has(key))return false;seen.add(key);return true}).map(el=>{const st=d.window.getComputedStyle(el);return [el.tagName,el.className,...properties.map(p=>st.getPropertyValue(p))]})});
 assert.deepEqual(snapshots[1],snapshots[0],width+'/'+theme+'/'+media);count++;doms.forEach(d=>d.window.close());
}
console.log('PASS style comparison: '+count+' width/theme/media combinations (jsdom, not browser rendering)');
