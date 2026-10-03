// 처음부터 엔딩까지 정답 경로로 자동 진행하고 단계별 상태와 오류를 출력한다.
// 사용: python3 -m http.server 8766 실행 후 node tools/playtest.js (다른 주소는 GAME_URL 환경변수)
const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
const reqs=[];p.on('response',r=>{if(r.url().includes('/assets/'))reqs.push(r.url().split('/').pop())});
await p.goto(''+(process.env.GAME_URL||'http://localhost:8766/')+'',{waitUntil:'load'});await p.waitForTimeout(800);
console.log('assets loaded at start:',reqs.join(', '));
const log=[];
const step=async(name,code)=>{try{await p.evaluate(code);}catch(e){errs.push(name+': '+e.message)}await p.waitForTimeout(50);const o=await p.evaluate(()=>({obj:document.querySelector('#objective').textContent,items:state.items.join(','),seals:state.seals.join(','),modal:document.querySelector('#overlay').classList.contains('hidden')?'':document.querySelector('#modal-title')?.textContent}));log.push(`[${name}] seals=${o.seals} items=${o.items} | modal=${o.modal} | obj=${o.obj}`);};
await step('start',()=>startGame());
await step('badge',()=>{interact('rules');take('badge')});
await step('drawer',()=>{interact('drawer');useItem('badge','drawer')});
await step('crank',()=>{move('audit');interact('window');take('crank')});
await step('pipes',()=>{move('hr');interact('org');useItem('crank','org');const p0=[...S().pipes];[0,1,3,4,6,7,8].forEach(i=>{for(let k=0;k<(4-p0[i])%4;k++)turnPipe(i)});tracePipe()});
await step('candle',()=>{closeModal();interact('candle');take('candle')});
await step('ice',()=>{move('facility');interact('ice');useItem('candle','ice');take('ice')});
await step('cold',()=>{combine('candle','ice')});
await step('mimic',()=>{closeModal();interact('mimic');useItem('cold','mimic')});
await step('clean',()=>{closeModal();combine('cloth','plate');[0,2,4,6,8].forEach(wipeCell)});
await step('shelf',()=>{closeModal();move('archive');interact('shelf');const want=[0,4,5,2,1,3];for(let pos=0;pos<6;pos++){const cur=SH().order.indexOf(want[pos]);if(cur!==pos){swapBook(pos);swapBook(cur);}}[0,5,2,1].forEach(id=>{const slot=SH().order.indexOf(id);swapBook(slot);flipBook();swapBook(slot);});checkShelf()});
await step('overlay',()=>{closeModal();combine('film','polished');while(S().rotation!==1){S().rotation=(S().rotation+1)%4;}save();workbench()});
await step('mirror',()=>{closeModal();move('audit');interact('mirror');useItem('polished','mirror');['key','crown','sun'].forEach(callRune);checkMirror()});
await step('ink',()=>{closeModal();move('archive');interact('blank');useItem('lantern','blank')});
await step('wires',()=>{closeModal();move('mail');interact('wiring');[1,0,1,1].forEach((v,i)=>{if(V().switches[i]!==v)flipRelay(i)});checkWires()});
await step('transit',()=>{closeModal();interact('transit');['b','d','f','t'].forEach(chooseTube);sendParcel()});
await step('blind',()=>{closeModal();move('exit');interact('blind');useItem('gear','blind');S().blind=true;save();render();});
await step('install',()=>{closeModal();interact('terminal');useItem('packet','terminal');useItem('lantern','terminal');E().turns=[1,3,2];save();exitPanel();attemptExit()});
console.log(log.join('\n'));console.log('final inventory:',await p.evaluate(()=>state.items.join(',')));await p.reload();await p.waitForTimeout(500);console.log('after reload modal:',await p.evaluate(()=>document.querySelector('#modal-title')?.textContent),'| bar:',await p.evaluate(()=>document.querySelector('#case-steps').textContent));console.log('ended=',await p.evaluate(()=>state.ended));
console.log('ERRORS:',errs.length?errs.join('\n'):'none');
await b.close();})();
