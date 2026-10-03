/* 마왕성 퇴근 심사 · 그림자 분실 사건
 * 단일 게임 스크립트. 섹션 순서가 곧 실행 순서입니다.
 * 00 core → 01 story → 02 episode → 03 visual puzzles → 04 art → 05 polish → 06 audio → 07 world → 08 fixes → 09 boot
 */

// ===== 00 core: 공용 상태·모달·기본 렌더 =====
const fresh=()=>({started:false,room:'hr',seals:[],items:[],hints:{},ended:false});
let state=fresh(),selected=null,sound=false,audio=null,lastFocus=null;
const $=s=>document.querySelector(s);const has=s=>state.seals.includes(s);
const itemNames={candle:['♨','불씨 양초'],ice:['❄','만년빙'],cold:['✧','차가운 불꽃']};
function save(){}
function tone(){}
let toastTimer;function toast(t){$('#toast').textContent=t;$('#toast').classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.add('hidden'),3500);}
function modal(title,body,extra=''){lastFocus=document.activeElement;$('#modal').className='modal '+extra;$('#modal').innerHTML=`<button class="close" aria-label="닫기" onclick="closeModal()">×</button><div class="eyebrow">DEPARTMENT OF EVIL</div><h2 id="modal-title">${title}</h2>${body}`;$('#overlay').classList.remove('hidden');$('#modal').querySelector('button').focus();}
function closeModal(){$('#overlay').classList.add('hidden');lastFocus?.focus();}
document.addEventListener('keydown',e=>{if(!$('#overlay').classList.contains('hidden')&&e.key==='Escape')closeModal();});
function seal(id){if(has(id))return;state.seals.push(id);save();render();}
const rooms={
 hr:{en:'01 / HUMAN RESOURCES',title:'인사부 · 끝나지 않는 첫 출근',note:'',art:()=>'',spots:[]},
 facility:{en:'02 / FACILITIES',title:'시설부 · 입이 있는 비품',note:'',art:()=>'',spots:[]},
 audit:{en:'03 / INTERNAL AUDIT',title:'감사부 · 주인 없는 반사면',note:'',art:()=>'',spots:[]},
 exit:{en:'04 / THE WAY HOME',title:'성문 · 둘이서 나가는 문',note:'',art:()=>'',spots:[]}
};
function render(){const r=rooms[state.room];$('#room-en').textContent=r.en;$('#room-title').textContent=r.title;$('#narration').textContent=r.note;$('#stage').innerHTML=r.art()+r.spots.map(([label,x,y,w,h,id])=>`<button class="hotspot" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%" onclick="interact('${id}')" aria-label="${label}"><span class="tag">${label}</span></button>`).join('');$('#inventory').innerHTML=state.items.length?state.items.map(id=>`<button class="item ${selected===id?'selected':''}" onclick="selectItem('${id}')"><span>${itemNames[id][0]}</span>${itemNames[id][1]}</button>`).join(''):'<div class="sub">아직 비어 있습니다.<br>방 안의 물건을 살펴보세요.</div>';}
function move(){}
function selectItem(){}
function interact(){}
function ending(){}
function intro(){}
function resetPrompt(){modal('처음으로 돌아갈까요?','<p>지금까지 모은 물건과 해결한 장치, 저장된 진행이 초기화됩니다.</p><div class="actions"><button class="secondary" onclick="closeModal()">계속 플레이</button><button class="primary" onclick="resetGame()">초기화하고 시작</button></div>');}
function resetGame(){}
$('#restart').onclick=resetPrompt;
function startGame(){state.started=true;save();closeModal();render();}

// ===== 01 story: 사건·장치·퍼즐 =====
// Object-based edition. Earlier editions keep their own saves.
const STORY_KEY='demon-office-objects-v4';
const newStory=()=>({...fresh(),story:{pipes:[1,1,2,2,1,0,3,1,1],crank:false,drawer:false,thawed:false,books:[2,0,3,1],archive:false,clean:false,overlay:false,rotation:0,mirror:[],shadow:false,gear:false,blind:false,lamp:null,screen:0,notes:'',clues:[],pin:null,hints:{}}});
try{const s=JSON.parse(localStorage.getItem(STORY_KEY));state=s?.story&&Array.isArray(s.items)?s:newStory();}catch{state=newStory();}
const S=()=>state.story;
const owns=id=>state.items.includes(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
save=function(){try{localStorage.setItem(STORY_KEY,JSON.stringify(state));}catch{$('#save-status').textContent='현재 창에서 진행 중 · 저장 불가';}};
let office=false,activeObject=null,bookPick=null;
try{office=localStorage.getItem('office-mode')==='true';}catch{}
const modeButton=document.createElement('button');modeButton.className='quiet';document.querySelector('.top-actions').prepend(modeButton);
function setOffice(v){office=v;document.body.classList.toggle('office-mode',v);document.title=v?'업무관리대장 — 문서 검토':'마왕성 퇴근 심사 · 그림자 분실 사건';modeButton.textContent=v?'일반 보기 · F2':'업무 모드 · F2';document.querySelector('.brand').textContent=v?'업무관리대장':'♜ 마왕성 퇴근 심사';if(v){sound=false;audio?.suspend();$('#sound').textContent='소리 켜기';}try{localStorage.setItem('office-mode',String(v));}catch{}}
modeButton.onclick=()=>setOffice(!office);document.addEventListener('keydown',e=>{if(e.key==='F2'){e.preventDefault();setOffice(!office);}});setOffice(office);
Object.assign(itemNames,{packet:['▤','퇴실 원본 봉투'],badge:['▣','임시 사원증'],cloth:['▱','광택 천'],lantern:['◈','휴대등'],crank:['↳','황동 손잡이'],film:['▧','구멍 난 투명판'],gear:['⚙','차광막 톱니'],plate:['▰','그을린 명판'],polished:['▦','닦은 명판']});
const glyphs={moon:'☾',key:'⚿',feather:'❧',sun:'☀',wave:'≋',eye:'◉',crown:'♛',flame:'♨',leaf:'♧'};
const names={moon:'달',key:'열쇠',feather:'깃털',sun:'태양',wave:'물결',eye:'눈',crown:'왕관',flame:'불꽃',leaf:'잎'};
const face=['moon','eye','key','feather','sun','crown','wave','flame','leaf'];
const docs={
 rules:['퇴실 사고 접수','18:04 — 직원은 출구를 통과했으나 그림자가 반대쪽에 남음.\n시설부의 등록 명판 소실 확인.\n복구 절차: 명판 회수 → 반사경으로 본인 대조 → 그림자 동반 퇴실.\n비품이 증거물을 삼키는 사고는 이번 달 세 번째다.'],
 route:['접힌 복도의 정비도','시설부 연결관은 왼쪽 위에서 들어와 오른쪽 아래로 나간다.\n회전축은 황동 사각형. 손잡이 분실 시 창문 비품을 확인할 것.\n누수로 지워진 연필선: ① ─ ②\n　　　　　　　　　│\n　　　　　　　 ④ ─ ⑤\n　　　　　　　 │\n　　　　　　　 ⑦ ─ ⑧ ─ ⑨'],
 cooling:['냉각 보관 기록','만년빙은 닿은 물체에서 열만 빼앗는다. 빛과 형태는 보존된다.\n지난번엔 촛불을 넣었다. 불이 안 꺼져서 냉장고인지 전등인지 모르게 됐다.\n손잡이에 성에가 끼면 작은 열원으로 녹일 것.'],
 feeding:['미믹의 반려 식단','등불: 유리 씹힘.\n얼음: 차갑지만 어두움.\n횃불: 혀 데임.\n“밝은 건 좋은데, 뜨거운 건 싫다니까요.”'],
 shelf:['반납대의 쪽지','서가 칸은 다섯, 반납된 책은 여섯. 한 권은 이 서가의 책이 아니다.\n책등 양끝의 문양은 원래 한 줄로 이어져 있었다. 왼쪽 고정 장식은 달, 오른쪽은 열쇠.\n이웃한 문양이 같을 때만 철침이 물린다. 급하게 꽂은 책은 거꾸로 들어가 있을 수 있다.\n자료실장: 책 제목은 안 읽어도 됩니다. 어차피 전부 회의록이에요.'],
 registration:['명판 판독 지침','격자의 문양은 위쪽 행부터, 각 행에서는 왼쪽부터 읽는다.\n구멍 난 대조판과 명판의 잘린 모서리를 맞출 것.\n그림자는 유리 너머에서 읽는다. 반사면의 좌우를 잊지 말 것.'],
 light:['경비원의 관측 일지','창빛과 휴대등이 함께 켜지면 그림자가 둘로 갈라진다.\n출구의 센서는 오른쪽에 있다. 그림자는 광원의 반대편으로 뻗는다.\n멀리 있는 등: 작은 그림자. 가까이 있는 등: 큰 그림자.\n높이가 센서 틀에 맞지 않으면 문이 열리지 않았다.'],
 plate:['명판 문양의 사본','오른쪽 위 모서리가 잘려 있다.\n달　　눈　　열쇠\n깃털　태양　왕관\n물결　불꽃　잎'],
 film:['대조판의 사본','기준 상태: 왼쪽 위 모서리가 잘림.\n구멍은 왼쪽 위 · 위 가운데 · 정중앙.\n모서리를 맞춘 뒤 구멍으로 보이는 문양만 판독한다.']
};
function discover(id){if(!S().clues.includes(id)){S().clues.push(id);save();}}
function readDoc(id){discover(id);panel(docs[id][0],`<div class="document-body">${esc(docs[id][1])}</div><button class="secondary" onclick="pinDoc('${id}')">이 자료를 옆에 고정</button>`);}
function pinDoc(id){S().pin=S().pin===id?null:id;save();notebook();}
function pinned(){const d=docs[S().pin];return d?`<aside class="pinned-clue"><strong>고정한 자료 · ${esc(d[0])}</strong><div>${esc(d[1])}</div><button class="secondary" onclick="S().pin=null;save();this.closest('.pinned-clue').remove()">고정 해제</button></aside>`:'';}
function panel(title,body,target=null){activeObject=target;modal(title,`<div class="object-layout"><div>${body}${target?useBar(target):''}</div>${pinned()}</div>`,'object-modal');}
function useBar(target){return `<div class="tool-tray"><label for="use-item">이곳에 사용할 소지품</label><div><select id="use-item"><option value="">물건 선택</option>${state.items.map(id=>`<option value="${id}" ${selected===id?'selected':''}>${itemNames[id][1]}</option>`).join('')}</select><button class="secondary" onclick="useItem(document.getElementById('use-item').value,'${target}')">사용</button></div><p class="use-feedback" role="status" id="use-feedback"></p></div>`;}
function reject(message){const el=$('#use-feedback');if(el)el.textContent=message;else toast(message);}
function grant(id){if(!owns(id))state.items.push(id);save();render();}
function remove(id){state.items=state.items.filter(x=>x!==id);if(selected===id)selected=null;}
function eventPanel(title,text){save();render();panel(title,`<p>${text}</p><button class="primary" onclick="closeModal()">계속 탐색</button>`);}
function take(id){grant(id);toast(itemNames[id][1]+' 획득');closeModal();}
function notebook(){panel('조사 수첩',`<p>읽은 자료만 기록됩니다. 자료 하나를 고정하면 다른 장치를 조사하면서 비교할 수 있습니다.</p><div class="clue-list">${S().clues.map(id=>`<button class="secondary" onclick="readDoc('${id}')">${docs[id][0]}${S().pin===id?' · 고정됨':''}</button>`).join('')||'아직 발견한 자료가 없습니다.'}</div><label for="personal-notes">내 메모</label><textarea id="personal-notes" rows="4" oninput="S().notes=this.value;save()">${esc(S().notes)}</textarea>`);}
$('#approval').textContent='조사 수첩';$('#approval').onclick=notebook;

// The archive is a playable schematic room, with no background image.
rooms.archive={en:'기록 보관실',title:'기록실 · 반납되지 않은 이름',note:'누군가 책을 순서 없이 밀어 넣었다. 책등 사이의 철침이 서로 걸려 서랍을 붙잡고 있다.',art:()=>'',spots:[['철침 서가',5,34,52,32,'shelf'],['반납대 쪽지',64,33,29,20,'shelfNote'],['판독 작업대',8,78,46,18,'workbench'],['판독 지침',64,67,29,28,'registration']]};
const shelfBooks=[['eye','moon','보안 회의'],['key','wave','퇴근 회의'],['wave','sun','시설 회의'],['eye','wave','감사 회의'],['eye','feather','급식 회의'],['sun','feather','야근 회의']];
function SH(){if(!S().shelf)S().shelf={order:[3,1,0,5,2,4],flip:[0,0,0,0,0,0]};return S().shelf;}
function bookEnds(id){const [a,b]=shelfBooks[id];return SH().flip[id]?[b,a]:[a,b];}
rooms.hr.spots.push(['책상 서랍',31,66,25,17,'drawer']);
rooms.audit.spots=[['반사면 관리 기록',10,34,18,32,'registration'],['이름 반사경',31,10,30,67,'mirror'],['창문 걸쇠',77,7,18,28,'window']];
rooms.exit.spots=[['차광막 기어함',3,8,21,28,'blind'],['성문과 광학 센서',32,15,35,68,'terminal'],['경비 관측 일지',75,49,21,28,'light']];
rooms.hr.note='문을 나서려던 순간 그림자만 남았다. 책상 위 사고 접수철에 내 사원증이 끼워져 있다.';
rooms.audit.title='감사부 · 주인 없는 반사면';rooms.audit.note='거울 아래에는 명판 홈이 있다. 창문의 손잡이는 복도 회전축과 비슷한 사각형이다.';
rooms.facility.note='미믹의 이빨 사이에서 내 명판이 반짝인다. 식판에는 거절한 음식들이 그대로 쌓여 있다.';
rooms.exit.title='성문 · 둘이서 나가는 문';rooms.exit.note='문 옆에는 작은 사람이 그려진 센서가 있다. 경비원이 남긴 관측 일지가 바람에 흔들린다.';
const oldRender=render;
render=function(){oldRender();const order=['hr','archive','audit','facility','exit'];$('#nav').innerHTML=order.map(id=>`<button class="nav ${state.room===id?'active':''}" ${id==='facility'&&!has('hr')?'disabled':''} onclick="move('${id}')">${{hr:'인사부',archive:'기록실',audit:'감사부',facility:'시설부',exit:'성문'}[id]}${id==='facility'&&!has('hr')?' · 복도 단절':''}</button>`).join('');$('#stage').classList.toggle('schematic',state.room==='archive');$('#item-note').textContent=selected?`${itemNames[selected][1]} 선택 중 · 사물을 조사하고 ‘사용’하세요.`:'소지품을 누르면 조사·뒤집기·조합이 가능합니다.';$('#objective').textContent=state.ended?'본인과 그림자, 모두 퇴실했습니다.':S().shadow?'돌아온 그림자를 성문의 센서에 맞춰야 한다.':has('facility')?'명판은 회수했다. 기록실과 반사경에서 이름을 복구할 방법을 찾자.':has('hr')?'미믹에게서 명판을 회수하자. 기록실의 판독 도구도 필요할 것 같다.':'시설부 복도가 끊어졌다. 인사부·기록실·감사부를 먼저 살펴보자.';$('#seals').innerHTML=[['hr','통로 복구'],['facility','명판 회수'],['audit','그림자 복원']].map(([id,label])=>`<div class="seal ${has(id)?'done':''}">${label}${has(id)?' ✓':''}</div>`).join('');$('#seal-count').textContent=`사건 진행 ${state.seals.length} / 3${S().archive?' · 판독 도구 확보':''}`;$('#narration').textContent=state.room==='hr'&&has('hr')?'벽이 물러나 시설부 통로가 생겼다. 열린 통로에서 미믹이 재채기하는 소리가 들린다.':rooms[state.room].note;const status=document.createElement('div');status.className='world-status';status.textContent=state.room==='facility'?(has('facility')?'명판 회수 완료':S().thawed?'보관함 해동됨':'보관함 동결'):state.room==='archive'?(S().archive?'잠금 해제 · 작업대 사용 가능':'서가 철침 잠김'):state.room==='audit'?(S().shadow?'그림자 복원됨':'반사경 대기'):state.room==='exit'?(S().blind?'차광막 닫힘':'창빛 유입'):has('hr')?'시설부 통로 연결':'시설부 통로 단절';$('#stage').append(status);};
move=function(id){if(!rooms[id]||(id==='facility'&&!has('hr')))return;state.room=id;selected=null;save();render();};
resetGame=function(){state=newStory();selected=null;bookPick=null;save();render();intro();};
intro=function(){panel('퇴근하려다, 그림자를 잃었다.',`<p>18시 04분. 몸은 성문을 나섰지만 그림자는 따라오지 않았다.</p><p>뼈 대리가 사고 접수철을 내민다.<br>“이름이 지워진 그림자는 못 나갑니다. 시설부에서 명판부터 찾아오세요. 그쪽 복도도 좀… 접혔지만요.”</p><div class="clue">사물을 조사하고, 도구를 사용해 공간을 바꾸세요.<br>자료는 수첩에 남고, 하나를 고정해 비교할 수 있습니다.<br>시간 제한 없음 · F2 업무 모드 · 소리 없이 모든 퍼즐 해결 가능</div><button class="primary" onclick="startGame()">접수철을 받아 든다</button><p class="sub">새 사건판은 이전 진행과 별도로 저장됩니다.</p>`);};
const itemDetails={badge:['사진 대신 빈 실루엣. 인사부 발급 임시 사원증이다.','뒷면 아래에 얇은 접점이 있다. 각인: “본인 서랍 접근용”.'],cloth:['금속 광택용 천. 모서리에 검댕이 묻어 있다.','세탁 금지. 물에 담그면 저주가 빠집니다.'],lantern:['휴대용 작업등. 넓은 받침이 달려 있다.','광원 시험: 같은 물체도 빛과의 거리에 따라 그림자 크기가 달라진다.'],crank:['끝이 사각형인 황동 손잡이.','창문과 정비축에 공용으로 쓰는 규격이다.'],candle:['추위에도 꺼지지 않는 불씨. 손을 가까이 대면 뜨겁다.','불씨 영구 보증. 촛농은 보증하지 않습니다.'],ice:['푸른 얼음. 가까이 대면 손의 열기가 빠져나간다.','표면 아래 작은 빛이 그대로 비친다.'],cold:['얼음 안에 불씨가 타오른다. 빛은 밝고 손은 차갑다.','유리도 촛농도 없다. 한입 크기다.'],gear:['차광막 수리용 톱니. 중앙에 홈이 있다.','기록실 대출 비품. 경비실 반납 예정.'],plate:['검은 검댕 아래에 아홉 칸이 희미하게 보인다.','목걸이 고리에 내 사원번호가 적혀 있다.'],polished:['아홉 문양이 새겨진 명판. 오른쪽 위 모서리가 잘려 있다.','반사면 대조용. 문양의 이름이 본인의 이름을 대신한다.'],film:['아홉 칸 가운데 세 곳이 뚫린 투명판. 왼쪽 위 모서리가 잘려 있다.','같은 규격의 명판 위에 겹쳐 판독한다.']};
selectItem=function(id){if(!owns(id))return;selected=id;render();inspectItem(id);};
function inspectItem(id,back=false){if(!owns(id))return;const d=itemDetails[id];if(id==='polished')discover('plate');if(id==='film')discover('film');panel(itemNames[id][1],`<div class="item-exhibit">${itemNames[id][0]}<small>${back?'뒷면':'앞면'}</small></div><p>${d[back?1:0]}</p>${id==='polished'&&!back?plateGrid(false):''}${id==='film'&&!back?'<div class="document-body">◯　◯　■<br>■　◯　■<br>■　■　■</div>':''}<div class="actions"><button class="secondary" onclick="inspectItem('${id}',${!back})">뒤집기</button><button class="secondary" onclick="selected='${id}';render();closeModal()">손에 들고 돌아가기</button></div><div class="tool-tray"><label for="combine-item">다른 소지품과 조합</label><select id="combine-item">${state.items.filter(x=>x!==id).map(x=>`<option value="${x}">${itemNames[x][1]}</option>`).join('')}</select><button class="secondary" onclick="combine('${id}',document.getElementById('combine-item').value)">조합</button><p id="use-feedback" role="status"></p></div>`);}
function combine(a,b){if(!owns(a)||!owns(b)||a===b)return;const pair=[a,b];if(pair.includes('candle')&&pair.includes('ice')){remove('candle');remove('ice');grant('cold');eventPanel('불씨는 남고, 열기만 사라졌다','양초의 불씨가 얼음 안으로 스며든다. 손바닥에 올려놓아도 뜨겁지 않다.');return;}if(pair.includes('cloth')&&pair.includes('plate')){remove('plate');S().clean=true;grant('polished');discover('plate');eventPanel('검댕 아래에 아홉 문양','명판을 닦자 문양이 드러났다. 다 읽기에는 너무 많다. 오른쪽 위 모서리가 비스듬히 잘려 있다.');return;}if(pair.includes('film')&&pair.includes('polished')){S().overlay=true;save();workbench();return;}reject('맞물리는 부분도, 눈에 띄는 변화도 없다. 두 물건의 성질을 다시 살펴보자.');}
function useItem(id,target){if(!id||!owns(id)){reject('사용할 소지품을 골라주세요.');return;}
 if(target==='drawer'&&id==='badge'){if(S().drawer){reject('이미 열린 서랍이다.');return;}S().drawer=true;grant('cloth');grant('lantern');eventPanel('접점이 맞물리며 서랍이 열렸다','광택 천과 휴대등을 챙겼다. 바닥에는 “퇴근 전에 빌린 물건 반납”이라고 적혀 있다. 오늘은 예외로 하자.');return;}
 if(target==='org'&&id==='crank'){S().crank=true;remove(id);save();pipePanel();return;}
 if(target==='ice'&&id==='candle'){S().thawed=true;save();render();interact('ice');return;}
 if(target==='mimic'&&id==='cold'){remove(id);seal('facility');grant('plate');eventPanel('시설부가 증거물을 반납했다','미믹이 푸른 불씨를 삼켰다. 이빨 사이에서 그을린 명판이 튀어나왔다.\n“소화가 안 돼서 갖고 있었어요. 증거 인멸은 아닙니다.”');return;}
 if(target==='mimic'){reject(id==='ice'?'미믹이 코를 찡그린다. “차갑긴 한데, 어두워요.”':id==='candle'?'미믹이 혀를 숨긴다. “그거 때문에 데었다니까!”':'미믹이 입을 닫는다. “식판 옆 반려 목록 좀 읽어주세요.”');return;}
 if(target==='workbench'&&(id==='film'||id==='polished')){if(!owns('film')||!owns('polished')){reject('작업대의 안내에는 명판과 대조판, 두 장을 겹치라고 적혀 있다.');return;}S().overlay=true;save();workbench();return;}
 if(target==='mirror'&&id==='polished'){if(!S().overlay){reject('아홉 문양이 모두 비친다. 세 문양만 남겨 읽을 대조판이 필요하다.');return;}S().mirrorMounted=true;save();mirrorPanel();return;}
 if(target==='blind'&&id==='gear'){S().gear=true;remove(id);save();render();interact('blind');return;}
 if(target==='terminal'&&id==='lantern'){S().lamp='far';save();exitPanel();return;}
 reject(target==='drawer'?'열쇠 구멍이 아니라 얇은 접점 슬롯이다.':target==='org'?'회전축은 사각형이다. 손으로는 돌아가지 않는다.':target==='ice'?'내용물보다 손잡이의 성에가 먼저 문제다.':target==='mirror'?'홈에는 얇은 금속 명판만 들어갈 것 같다.':'이 물건으로는 장치가 움직이지 않는다.');
}

// A traversable light circuit changes the room connection, rather than awarding a code.
const pipeBase=[['W','E'],['W','S'],['N','E'],['E','S'],['N','W'],['N','S'],['N','E'],['W','E'],['W','E']];
const dirs=['N','E','S','W'],opposite={N:'S',E:'W',S:'N',W:'E'};
function ports(i){return pipeBase[i].map(d=>dirs[(dirs.indexOf(d)+S().pipes[i])%4]);}
function pipePanel(){if(has('hr')){panel('열린 시설부 통로','<p>조직도 뒤편의 연결관에 빛이 흐른다. 벽 너머로 시설부의 문이 보인다.</p>');return;}panel('조직도 뒤편 · 접힌 복도',`<p>${S().crank?'손잡이가 회전축에 맞물려 있다. 조각을 돌리면 벽 너머의 복도도 움직인다.':'회전축의 손잡이가 빠져 있다. 축 끝은 사각형이다.'}</p><div class="pipe-board"><div class="pipe-port inlet">입구 →</div><div class="pipe-grid">${pipeBase.map((_,i)=>`<button class="pipe-tile" ${S().crank?'':'disabled'} onclick="turnPipe(${i})" aria-label="${i+1}번 복도 회전, 연결 ${ports(i).join(',')}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="8" fill="currentColor"/>${ports(i).map(d=>`<path d="M50 50L${{N:'50 0',E:'100 50',S:'50 100',W:'0 50'}[d]}" stroke="currentColor" stroke-width="12"/>`).join('')}</svg><small>${i+1}</small></button>`).join('')}</div><div class="pipe-port outlet">→ 시설부</div></div><p class="sub">조각을 누르면 90도 회전합니다. 모든 칸을 지날 필요는 없습니다.</p><p id="pipe-result" role="status"></p><div class="actions"><button class="secondary" onclick="readDoc('route')">옆의 정비도 읽기</button><button class="primary" ${S().crank?'':'disabled'} onclick="tracePipe()">통로에 빛 흘리기</button></div>`,'org');}
function turnPipe(i){S().pipes[i]=(S().pipes[i]+1)%4;save();pipePanel();$('#modal').querySelectorAll('.pipe-tile')[i].focus();}
function tracePipe(){let todo=ports(0).includes('W')?[0]:[],seen=new Set();while(todo.length){const i=todo.shift();if(seen.has(i))continue;seen.add(i);for(const d of ports(i)){let j=d==='N'?i-3:d==='S'?i+3:d==='E'?i+1:i-1;if(j<0||j>8||(d==='E'&&i%3===2)||(d==='W'&&i%3===0))continue;if(ports(j).includes(opposite[d]))todo.push(j);}}document.querySelectorAll('.pipe-tile').forEach((el,i)=>el.classList.toggle('lit',seen.has(i)));if(!seen.has(8)||!ports(8).includes('E')){$('#pipe-result').textContent=seen.size?`빛이 ${seen.size}칸을 지난 곳에서 멎었다. 밝아진 끝을 확인하자.`:'왼쪽 위 입구부터 막혀 있다.';return;}seal('hr');eventPanel('복도가 펴지며 새 문이 나타났다','빛이 끝까지 흐르자 벽이 바깥으로 밀려났다. 이제 시설부에 갈 수 있다.\n뼈 대리: “조직 개편이 끝났네요. 이번에는 건물이 먼저 퇴근할 뻔했어요.”');}

function shelfPanel(){if(S().archive){panel('철침이 풀린 서가','<p>책등의 문양이 한 줄로 이어졌다. 아래 서랍에서 투명 대조판과 차광막 톱니를 챙겼다.</p>');return;}const sh=SH();const book=(slot)=>{const id=sh.order[slot];const [l,r]=bookEnds(id);return `<button class="puzzle-book ${bookPick===slot?'chosen':''} ${sh.flip[id]?'flipped':''}" aria-label="${slot<5?slot+1+'번째 칸':'반납 카트'}: ${shelfBooks[id][2]}${sh.flip[id]?' (거꾸로)':''}, 왼쪽 ${names[l]}, 오른쪽 ${names[r]}" onclick="swapBook(${slot})"><b>${glyphs[l]}</b><span>${shelfBooks[id][2]}</span><b>${glyphs[r]}</b></button>`;};
 panel('반납 서가',`<p>서가에는 다섯 칸이 있고, 반납 카트에는 한 권이 남아 있다. 철침은 다섯 권을 모두 관통해야 아래 서랍까지 닿는다.</p><p class="sub">책 두 권(카트 포함)을 차례로 누르면 자리를 바꿉니다. 책을 하나 고른 뒤 ‘뒤집기’를 누르면 앞뒤가 바뀝니다.</p><div class="shelf-end">고정 장식 ${glyphs.moon} <span>${glyphs.key} 고정 장식</span></div><div class="book-puzzle">${[0,1,2,3,4].map(book).join('')}</div><div class="shelf-cart"><small>반납 카트</small>${book(5)}</div><p id="shelf-feedback" role="status"></p><div class="actions"><button class="secondary" ${bookPick===null?'disabled':''} onclick="flipBook()">고른 책 뒤집기</button><button class="secondary" onclick="readDoc('shelf')">반납대 쪽지 읽기</button><button class="primary" onclick="checkShelf()">책을 안쪽으로 밀기</button></div>`);}
function swapBook(i){const o=SH().order;if(bookPick===null){bookPick=i;}else if(bookPick===i){bookPick=null;}else{[o[i],o[bookPick]]=[o[bookPick],o[i]];bookPick=null;save();}shelfPanel();}
function flipBook(){if(bookPick===null)return;const id=SH().order[bookPick];SH().flip[id]=1-SH().flip[id];save();shelfPanel();}
function checkShelf(){const b=SH().order.slice(0,5).map(bookEnds);const joins=[b[0][0]==='moon',...b.slice(1).map((x,i)=>b[i][1]===x[0]),b[4][1]==='key'];if(!joins.every(Boolean)){$('#shelf-feedback').textContent=`철침 ${joins.filter(Boolean).length} / 6곳이 맞물린다. 나머지 이음새에서 책이 걸린다.`;return;}S().archive=true;bookPick=null;grant('film');grant('gear');eventPanel('책 뒤에서 서랍이 밀려 나왔다','구멍 난 투명판과 작은 톱니가 들어 있다. 톱니에는 “성문 차광막 반납용”이라는 꼬리표가 달려 있다.\n서랍 바닥의 판독 지침도 살펴보자.');}
function holes(){let h=[0,1,4];for(let n=0;n<S().rotation;n++)h=h.map(i=>(i%3)*3+2-Math.floor(i/3));return h;}
function plateGrid(mask,reflected=false){const h=holes();return `<div class="plate-grid ${mask?'masked':''} ${reflected?'reflected':''}"><span class="plate-notch">${reflected?'◪ 명판 모서리(반사)':'명판 모서리 ◩'}</span>${Array.from({length:9},(_,i)=>{const src=reflected?Math.floor(i/3)*3+2-i%3:i;return `<div class="glyph-cell ${mask&&!h.includes(src)?'covered':''}"><span>${mask&&!h.includes(src)?'·':glyphs[face[src]]}</span><small>${mask&&!h.includes(src)?'가림':names[face[src]]}</small></div>`;}).join('')}</div>`;}
function workbench(){if(!owns('polished')){panel('명판 판독 작업대',`<p>작업등 아래에 아홉 칸짜리 받침이 있다. 금속판을 올려 판독하는 자리 같다.</p><button class="secondary" onclick="readDoc('registration')">판독 지침 읽기</button>`,'workbench');return;}discover('plate');panel('판독 작업대',`<p>${S().overlay?'명판 위에 투명판을 겹쳤다. 두 판의 잘린 모서리를 살펴보자.':'닦은 명판을 받침에 올렸다. 문양은 아홉 개, 반사경의 입력 홈은 세 개다.'}</p>${plateGrid(S().overlay)}${S().overlay?`<div class="alignment"><span>명판 모서리: 오른쪽 위</span><span>투명판 모서리: ${['왼쪽 위','오른쪽 위','오른쪽 아래','왼쪽 아래'][S().rotation]}</span></div><button class="secondary" onclick="S().rotation=(S().rotation+1)%4;save();workbench()">투명판 90° 돌리기</button>`:''}<div class="actions"><button class="secondary" onclick="readDoc('registration')">판독 지침 읽기</button><button class="secondary" onclick="readDoc('plate')">명판 사본 보기</button></div>`,'workbench');}
function mirrorPanel(){if(S().shadow){panel('이제 나를 따라오는 그림자','<p>거울 속 사람이 나와 동시에 손을 든다. 발밑으로 그림자가 돌아왔다. 이제 성문의 센서를 작동시킬 수 있다.</p>');return;}panel('이름 반사경',`<p>${S().mirrorMounted?'명판을 홈에 끼웠다. 투명판은 유리에 비치지 않는다. 아홉 문양이 모두, 좌우가 뒤집힌 채 떠오른다.':'거울 아래의 홈은 비어 있다. 옆에 세 개의 작은 입력창이 있다.'}</p>${S().mirrorMounted?plateGrid(false,true):'<div class="empty-mirror">이름 없는 그림자<br><small>명판 대조 대기</small></div>'}<div class="rune-input">${[0,1,2].map(i=>`<span>${glyphs[S().mirror[i]]||'—'}</span>`).join('')}</div><div class="rune-keys">${['moon','key','feather','sun','wave','eye','crown','flame','leaf'].map(id=>`<button class="secondary" onclick="callRune('${id}')">${glyphs[id]} ${names[id]}</button>`).join('')}</div><div class="actions"><button class="secondary" onclick="S().mirror=[];save();mirrorPanel()">입력 지우기</button><button class="primary" onclick="checkMirror()">이름 부르기</button><button class="secondary" onclick="readDoc('registration')">관리 기록 읽기</button></div><p id="mirror-feedback" role="status"></p>`,'mirror');}
function callRune(id){if(S().mirror.length===3)S().mirror=[];S().mirror.push(id);save();mirrorPanel();}
function checkMirror(){if(!S().mirrorMounted){$('#mirror-feedback').textContent='대조할 명판이 없어 유리가 반응하지 않는다.';return;}if(S().rotation!==1){$('#mirror-feedback').textContent='명판과 대조판의 가장자리가 어긋나 유리가 흐려진다. 작업대에서 모서리를 확인하자.';return;}if(S().mirror.join()!=='key,crown,sun'){$('#mirror-feedback').textContent='그림자가 손을 뻗었다가 멈춘다. 작업대 구멍으로 본 세 문양이 유리 속에서는 어느 칸에 있을까.';return;}S().shadow=true;seal('audit');eventPanel('유리 너머에서 누군가 걸어 나왔다','검은 형체가 발뒤꿈치에 붙었다. 한 발 움직이자 따라온다.\n거울 속의 내가 쪽지를 내민다. “성문에서는 내가 먼저 갈게. 원본 도안만 좀 찾아줘.”');}

function shadowSize(){return S().lamp==='near'?3:S().lamp==='middle'?2:S().lamp==='far'?1:0;}
function exitPanel(){const size=shadowSize(),right=S().screen===0;panel('성문 · 그림자 대조 센서',`<p>오른쪽 벽의 틀은 사람 모양이다. 바닥에는 등 받침을 놓을 홈 세 개와 방향 레일이 있다.</p><div class="shadow-lab ${right?'':'light-right'} ${S().blind?'':'double-light'}"><div class="light-source">${S().lamp?'◈':'빈 받침'}</div><div class="person">♟</div><div class="sensor ${S().blind&&S().shadow&&size===2&&right?'aligned':''}"><span class="projected" style="transform:scale(${S().shadow&&right&&size?size/2:0})">♟</span><small>센서 틀</small></div></div><div class="device-readout">창빛: ${S().blind?'차단됨':'유입 중'} / 등 위치: ${{near:'가까이',middle:'중간',far:'멀리'}[S().lamp]||'미설치'}<br>${!S().shadow?'바닥에 그림자가 없다.':!size?'등 받침이 비어 있다.':!S().blind?'창빛 때문에 윤곽이 두 겹이다.':!right?'그림자가 왼쪽 벽으로 향한다.':size===1?'그림자가 센서보다 작다.':size===3?'그림자가 센서 밖으로 넘친다.':'그림자의 윤곽이 센서에 맞는다.'}</div>${S().lamp?`<div class="actions">${[['far','멀리'],['middle','중간'],['near','가까이']].map(([k,n])=>`<button class="secondary" onclick="S().lamp='${k}';save();exitPanel()">등을 ${n}${S().lamp===k?' ✓':''}</button>`).join('')}<button class="secondary" onclick="S().screen=1-S().screen;save();exitPanel()">등을 ${right?'오른쪽':'왼쪽'} 레일로</button></div>`:''}<div class="actions"><button class="secondary" onclick="interact('blind')">차광막 기어함</button><button class="secondary" onclick="readDoc('light')">경비 일지 읽기</button><button class="primary" onclick="attemptExit()">문 손잡이 당기기</button></div><p id="exit-feedback" role="status"></p>`,'terminal');}
function attemptExit(){if(!S().shadow||!S().blind||S().lamp!=='middle'||S().screen!==0){$('#exit-feedback').textContent='잠금쇠는 그대로다. 센서와 그림자의 윤곽을 비교해보자.';return;}state.ended=true;save();render();ending();}
ending=function(){panel('본인과 그림자, 모두 퇴실.',`<div class="ending-stamp">18:04 사건 종결</div><p>그림자가 완성된 인영 안으로 들어갔다. 잠금쇠가 풀리고, 이번에는 둘 다 문을 나섰다.</p><p>뒤에서 뼈 대리가 외친다.<br>“반납대에 물건은 두고 가셨어요?”<br>그림자가 대신 손을 흔들었다. 오늘의 대답은 그걸로 충분했다.</p><button class="primary" onclick="closeModal()">퇴근하기</button><button class="secondary" onclick="notebook()">조사 수첩 돌아보기</button>`);};

interact=function(id){switch(id){
 case'org':pipePanel();break;
 case'skeleton':panel('뼈 대리',`<p>“명판이 없어져서 본인 확인이 안 되나 봐요. 미믹이 점심에 금속을 씹던데.”</p><p>“기록실과 감사부는 걸어갈 수 있어요. 시설부만 접혀 버렸죠. 손잡이를 빌려 쓴 사람이 있을 텐데…”</p><button class="secondary" onclick="readDoc('rules')">사고 접수 기록 보기</button>`);break;
 case'rules':discover('rules');panel('사고 접수철',`<div class="document-body">${esc(docs.rules[1])}</div><p>서류에 임시 사원증이 끼워져 있다.</p>${owns('badge')?'<p class="sub">사원증은 챙겼다.</p>':'<button class="primary" onclick="take(\'badge\')">사원증 챙기기</button>'}<button class="secondary" onclick="readDoc('rules')">기록 고정하기</button>`);break;
 case'drawer':panel('개인 비품 서랍',S().drawer?'<p>천과 휴대등을 챙긴 자리다.</p>':'<p>손잡이 옆에 얇은 접점 슬롯이 있다. “인사부 발급 / 본인 비품함”이라고 적혀 있다.</p>','drawer');break;
 case'candle':panel('불씨 양초',`<p>꺼지지 않는 불씨. 손을 가까이 대면 열기가 느껴진다.</p>${owns('candle')||owns('cold')||has('facility')?'<p>양초를 가져간 자리다.</p>':'<button class="primary" onclick="take(\'candle\')">챙기기</button>'}`);break;
 case'window':panel('감사부 창문',`<p>창은 열려 있고 황동 손잡이는 분리되어 창틀 위에 놓여 있다. 축 끝이 사각형이다.</p>${owns('crank')||S().crank?'<p>손잡이를 가져간 자리다.</p>':'<button class="primary" onclick="take(\'crank\')">손잡이 챙기기</button>'}`);break;
 case'ice':panel('만년빙 보관함',`<p>${S().thawed?'손잡이의 성에가 녹아 문이 열린다. 안의 푸른 얼음은 멀쩡하다.':'안쪽에 얼음이 보이지만 손잡이가 서리에 붙었다.'}</p>${S().thawed&&!owns('ice')&&!owns('cold')&&!has('facility')?'<button class="primary" onclick="take(\'ice\')">얼음 꺼내기</button>':''}<button class="secondary" onclick="readDoc('cooling')">옆의 냉각 기록 읽기</button>`,'ice');break;
 case'mimic':panel('미믹 주임',`<p>${has('facility')?'“명판 돌려드렸잖아요. 빈 접시까지 가져가실 건 아니죠?”':'이빨 사이에 금속판이 끼어 있다.\n“꺼내 드릴 수는 있는데, 우선 제대로 된 저녁 좀 주세요.”'}</p><button class="secondary" onclick="readDoc('feeding')">식판의 반려 목록 살펴보기</button>`,has('facility')?null:'mimic');break;
 case'diet':readDoc('feeding');break;
 case'shelf':shelfPanel();break;
 case'shelfNote':readDoc('shelf');break;
 case'workbench':workbench();break;
 case'registration':case'auditRules':readDoc('registration');break;
 case'mirror':mirrorPanel();break;
 case'light':case'tomorrow':readDoc('light');break;
 case'blind':panel('차광막 기어함',`<p>${S().gear?'교체한 톱니가 맞물려 있다. 손잡이가 움직인다.':'톱니 하나가 빠져 줄을 당겨도 헛돈다. 꼬리표: “교체품은 기록실 반납 서랍”.'}</p>${S().gear?`<button class="primary" onclick="S().blind=!S().blind;save();render();interact('blind')">차광막 ${S().blind?'열기':'닫기'}</button><p>${S().blind?'창빛이 차단되었다.':'창빛이 바닥을 비춘다.'}</p>`:''}<button class="secondary" onclick="exitPanel()">센서로 돌아가기</button>`,'blind');break;
 case'terminal':exitPanel();break;
 default:readDoc('rules');
}};
$('#help').onclick=()=>panel('조사 방법','<p>방 안의 이름표를 누르면 조사합니다.\n소지품을 누르면 앞뒤를 살피거나 다른 물건과 조합할 수 있습니다.\n장치 조사창 아래에서 사용할 물건을 골라 ‘사용’을 누르세요.\n읽은 문서는 조사 수첩에 남습니다. 하나를 고정하면 다른 장치와 나란히 볼 수 있습니다.\n기록실·감사부·성문은 처음부터 탐색할 수 있습니다.</p><div class="clue">F2 업무 모드 · Esc 조사창 닫기<br>시간 제한 없음 · 소리 필수 퍼즐 없음 · 진행 자동 저장</div>');
// A placeholder allows saves in the mail room to load before section 02.
rooms.mail={en:'문서 수발실',title:'수발실 · 돌아오지 않은 원본',note:'관송기 안에서 봉투가 부딪히는 소리가 난다.',art:()=>'',spots:[]};
save();render();

// ===== 02 episode: 수발실·필름 판독·힌트 체계 =====
// Compatible extension: keep collected objects and solved puzzles from v4.
const episodeDefaults=()=>({ink:false,wiring:[0,1,2],power:false,route:[0,0,0],parcel:false,installed:false,turns:[0,0,0],hintCounts:{},migrated:true});
function E(){if(!S().episode)S().episode=episodeDefaults();return S().episode;}
if(!S().episode&&state.ended)state.ended=false;
E();
Object.assign(docs,{
 light:['성문 필름 판독 일지','성문은 퇴실 원본에 찍힌 인영과 돌아온 그림자를 대조한다.\n원본 봉투에는 인영 도안과 회전 필름 세 장이 들어 있다.\n필름의 검은 칸을 겹친 모양이 원본의 검은 칸과 같아야 한다. 색은 구별을 도울 뿐 판독에는 영향을 주지 않는다.\n창빛은 필름의 빈 칸까지 밝힌다. 차광막을 닫고 작업등 하나만 사용할 것.\n원본 보관처: 문서 수발실 관송기.'],
 transit:['관송관 약도','수발실 → 첫 중계소 → 두 번째 중계소 → 보관 창구\n도장과 목적지: 물결 ≋ = 수로 / 잎 ♧ = 온실 / 달 ☾ = 야간창구\n눈 ◉ = 본관 / 불꽃 ♨ = 소각실 / 왕관 ♛ = 집무실\n우회 경로는 기록실의 빈 운송장에 별도로 적혀 있다.\n도착 실패 시 봉투는 출발점으로 자동 회수된다.'],
 wires:['비상 배선도','선을 따라 출력 단자까지 연결한다. 교차하는 선은 서로 연결되지 않는다.\n왼쪽 위에서 시작하는 실선 ─ 는 위쪽에서 오른쪽 아래까지 내려간다.\n가운데에서 시작하는 점선 ··· 은 위로 올라가 오른쪽 위에 닿는다.\n아래에서 시작하는 이중선 ═ 는 가운데로 올라가 오른쪽 가운데에 닿는다.'],
 ink:['빛에 드러난 운송장','시설부 사고 기록 / 퇴실 원본 임시 이송\n본관은 폐쇄됐다. 물길을 지나 식물이 있는 방으로 우회한다. 마지막은 밤에만 여는 창구.\n겉봉이 비어 보여도 폐기하지 말 것. 역광용 잉크로 인쇄됨.'],
 blank:['빈 운송장의 꼬리표','문서 수발실 반송분.\n역광용 잉크 — 종이 뒤에 작업등을 대면 글씨가 나타난다.\n시설부 사고 원본은 일반 배송 경로로 보내지 말 것.']
});
itemNames.packet=['▤','퇴실 원본 봉투'];
itemDetails.packet=['퇴실 원본 도안과 회전 필름 세 장. 성문 판독기에 맞는 크기다.','문서 수발실 보관. 원본과 복사본을 함께 겹쳐 사용하십시오.'];
itemDetails.lantern=['휴대용 작업등. 종이를 뒤에서 비추거나 필름 판독기에 사용할 수 있다.','역광용 잉크는 빛을 통과시키면 드러난다.'];

// Document/hint views keep an explicit return snapshot, including puzzle inputs.
let currentView=null,documentOrigin=null,currentDocument=null;
const corePanel=panel;
const problemForTitle={
 '조직도 뒤편 · 접힌 복도':'pipes','개인 비품 서랍':'drawer','만년빙 보관함':'ice','미믹 주임':'food','반납 서가':'shelf','판독 작업대':'plate','명판 판독 작업대':'plate','이름 반사경':'mirror','차광막 기어함':'blind','성문 · 인영 필름 판독기':'final','빈 운송장':'ink','관송기 배전함':'wiring','문서 관송기':'transit','그을린 명판':'clean','불씨 양초':'food','만년빙':'food','닦은 명판':'plate','구멍 난 투명판':'plate'
};
panel=function(title,body,target=null){const key=problemForTitle[title]||null;currentView={title,body,target,key};documentOrigin=null;currentDocument=null;corePanel(title,body+ (key?`<div class="problem-help"><button class="secondary" onclick="showProblemHint('${key}')">이 문제의 힌트</button><span>관찰 → 연결 → 해답 · 3단계</span></div>`:''),target);};
function returnToProblem(){const v=documentOrigin||currentView;documentOrigin=null;currentDocument=null;if(v)panel(v.title,v.body,v.target);else closeModal();}
readDoc=function(id){discover(id);if(!documentOrigin)documentOrigin=currentView;currentDocument=id;corePanel(docs[id][0],`<button class="secondary return-problem" onclick="returnToProblem()">← ${documentOrigin?.key?'문제로':'이전 화면으로'} 돌아가기</button><div class="document-body">${esc(docs[id][1])}</div><div class="actions"><button class="secondary" onclick="pinDoc('${id}')">${S().pin===id?'고정 해제':'자료를 옆에 고정'}</button><button class="primary" onclick="returnToProblem()">읽고 돌아가기</button></div>`);};
pinDoc=function(id){S().pin=S().pin===id?null:id;save();readDoc(id);};
const problemHints={
 pipes:['회전축과 다른 방의 분리된 손잡이 모양을 비교하세요.','감사부 창틀의 황동 손잡이를 조직도에 사용하세요. 옆 정비도를 고정하면 경로를 비교할 수 있습니다.','1→2→5→4→7→8→9 순서로 연결하고 빛을 흘리세요. 각 조각의 열린 끝이 맞닿아야 합니다.'],
 drawer:['손잡이 옆은 열쇠 구멍이 아닌 접점 슬롯입니다.','사고 접수철에서 임시 사원증을 챙기고 뒷면을 살펴보세요.','장치 아래에서 임시 사원증을 골라 사용하세요. 천과 휴대등을 얻습니다.'],
 ice:['얼음 자체보다 손잡이의 성에가 문제입니다.','인사부에서 작은 열원을 가져오세요.','불씨 양초를 보관함에 사용하고, 얼음을 꺼내세요.'],
 food:['반려 식단을 보면 밝음과 차가움이 동시에 필요합니다.','냉각 기록을 읽어보세요. 만년빙은 빛을 없애지 않습니다.','불씨 양초와 만년빙을 소지품 조사창에서 조합한 뒤, 차가운 불꽃을 미믹에게 사용하세요.'],
 clean:['금속판에 묻은 검댕을 제거해야 합니다.','인사부의 개인 비품 서랍에 청소 도구가 있습니다.','광택 천과 그을린 명판을 조합하세요.'],
 shelf:['고정 장식(달·열쇠)과 책등 양끝을 비교하세요. 책은 뒤집을 수 있고, 다섯 칸에는 다섯 권만 들어갑니다.','달 문양이 있는 책은 한 권뿐이니 거기서 출발하세요. 눈과 물결은 갈림길입니다. 열쇠까지 다섯 권으로 이어지는 쪽을 고르세요.','보안(뒤집기) → 급식 → 야근(뒤집기) → 시설(뒤집기) → 퇴근(뒤집기) 순서로 꽂고, 감사 회의는 카트에 두세요.'],
 plate:['문양은 아홉 개지만 대조판 구멍은 세 개입니다. 두 판의 모서리를 비교하세요.','명판을 천으로 닦고, 기록실 서가의 투명판과 겹치세요.','투명판 모서리를 오른쪽 위로 맞춥니다. 손에 든 판에서는 열쇠·태양·왕관이 보입니다. 거울에서는 같은 순서일까요?'],
 mirror:['반사경에는 아홉 문양이 모두 비칩니다. 어떤 세 칸을 읽을지는 기록실 작업대에서 정해집니다.','작업대에서 투명판 구멍으로 보이는 세 칸의 위치를 기억한 뒤, 거울은 좌우가 뒤집힌다는 점을 적용하세요. 읽는 순서는 위쪽 행부터, 각 행은 왼쪽부터입니다.','거울의 위쪽 행부터 읽으면 열쇠 → 왕관 → 태양입니다. 입력 후 이름을 부르세요.'],
 blind:['기어함에서 빠진 부품의 꼬리표를 읽어보세요.','기록실 서가 아래에 반납된 부품이 있습니다.','서가 퍼즐로 얻은 차광막 톱니를 사용한 뒤 차광막을 닫으세요.'],
 ink:['빈 종이도 빛을 비추는 방식에 따라 다르게 보일 수 있습니다.','사원증으로 인사부 비품 서랍을 열면 작업등을 얻습니다.','휴대등을 빈 운송장에 사용하세요. 나타난 우회 경로를 관송관 약도와 비교합니다.'],
 wiring:['교차점은 접속점이 아닙니다. 한 선씩 끝까지 따라가세요.','실선은 아래 단자, 점선은 위 단자, 이중선은 가운데 단자로 이어집니다.','위 소켓에 점선, 가운데에 이중선, 아래에 실선을 꽂고 전원을 넣으세요.'],
 transit:['전원이 먼저 필요합니다. 배송 경로는 운송장, 목적지 기호는 관송관 약도에 있습니다.','기록실의 빈 운송장에 휴대등을 사용하세요. 물길·식물이 있는 방·밤 창구가 각각 어떤 기호인지 찾으세요.','배전함 복구 후 물결 → 잎 → 달로 다이얼을 맞추고 봉투를 호출하세요.'],
 final:['오른쪽은 원본 도안, 왼쪽은 세 필름을 겹친 결과입니다. 원근감 대신 검은 칸 위치를 비교하세요.','원본 봉투·휴대등을 설치하고 차광막을 닫으세요. 각 필름은 자기 중심을 기준으로 90도씩 회전합니다.','필름 A를 90°, B를 270°, C를 180°로 맞추세요. 그림자를 되찾은 상태에서 문 손잡이를 당깁니다.']
};
function showProblemHint(key){const origin=currentView;documentOrigin=origin;currentDocument=null;const n=Math.min(E().hintCounts[key]||0,2);E().hintCounts[key]=n+1;save();corePanel(`문제 힌트 · ${n+1} / 3`,`<p>${problemHints[key][n]}</p><div class="actions"><button class="primary" onclick="returnToProblem()">문제로 돌아가기</button>${n<2?`<button class="secondary" onclick="showProblemHint('${key}')">다음 단계 힌트</button>`:''}</div>`);}
const roomProblems={hr:['drawer','pipes'],archive:['shelf','plate','ink'],audit:['mirror'],facility:['ice','food','clean'],mail:['wiring','transit'],exit:['blind','final']};
const problemLabels={drawer:'개인 비품 서랍',pipes:'접힌 복도',shelf:'반납 서가',plate:'명판 판독',ink:'빈 운송장',mirror:'이름 반사경',ice:'얼어붙은 보관함',food:'미믹의 식사',clean:'명판 세척',wiring:'관송기 배전함',transit:'관송기 경로',blind:'차광막 수리',final:'인영 필름'};
$('#hint').onclick=()=>{if(!$('#overlay').classList.contains('hidden')&&currentView?.key){showProblemHint(currentView.key);return;}panel('어느 장치에서 막혔나요?',`<div class="clue-list">${roomProblems[state.room].map(k=>`<button class="secondary" onclick="showProblemHint('${k}')">${problemLabels[k]}</button>`).join('')}</div>`);};

rooms.archive.spots.push(['빈 운송장',60,8,33,20,'blank']);
rooms.mail={en:'문서 수발실',title:'수발실 · 돌아오지 않은 원본',note:'인영 원본이 관송기 어딘가에 갇혀 있다. 배전함은 꺼져 있고, 반송 표시는 본관 폐쇄를 가리킨다.',art:()=>`<div class="mail-scene"><strong>문서 수발실</strong><p>잃어버린 서류는 스스로 돌아오지 않습니다.</p><div class="mail-network"><span>전원 ${E().power?'●':'○'}</span><i>───</i><span>관송관</span><i>───</i><span>${E().parcel?'원본 회수됨':'원본 대기'}</span></div></div>`,spots:[['배전함',4,36,26,27,'wiring'],['관송기',37,35,32,34,'transit'],['관송관 약도',73,32,24,28,'transitDoc']]};
rooms.exit.note='성문은 돌아온 그림자와 원본 인영을 대조한다. 원본은 수발실에 보관되어 있다.';
rooms.exit.spots=rooms.exit.spots.map(x=>x[5]==='terminal'?['인영 필름 판독기',...x.slice(1)]:x);
const coreRender=render;
render=function(){E();coreRender();const order=['hr','archive','audit','facility','mail','exit'];$('#nav').innerHTML=order.map(id=>`<button class="nav ${state.room===id?'active':''}" ${(id==='facility'||id==='mail')&&!has('hr')?'disabled':''} onclick="move('${id}')">${{hr:'인사부',archive:'기록실',audit:'감사부',facility:'시설부',mail:'수발실',exit:'성문'}[id]}${(id==='facility'||id==='mail')&&!has('hr')?' · 단절':''}</button>`).join('');if(state.room==='mail'){$('#stage').classList.add('schematic');$('#stage .world-status').textContent=E().parcel?'퇴실 원본 회수 완료':E().power?'관송기 전원 정상':'관송기 전원 차단';}if(S().shadow&&!state.ended)$('#objective').textContent=E().parcel?'원본 필름을 성문에 설치해 그림자와 대조하자.':'그림자는 돌아왔다. 수발실에서 퇴실 원본을 회수하자.';};
const coreMove=move;move=function(id){if(id==='mail'&&!has('hr'))return;currentView=null;documentOrigin=null;coreMove(id);};
const coreReset=resetGame;resetGame=function(){currentView=null;documentOrigin=null;coreReset();};
const coreInteract=interact;
interact=function(id){if(id==='blank'){blankPanel();return;}if(id==='wiring'){wiringPanel();return;}if(id==='transit'){transitPanel();return;}if(id==='transitDoc'){readDoc('transit');return;}coreInteract(id);};
function blankPanel(){panel('빈 운송장',`<p>${E().ink?'역광 아래로 숨겨진 글씨가 드러난다.':'빈 종이 모서리에 “역광 인쇄”라는 압인이 있다. 지운 흔적은 없다.'}</p>${E().ink?`<div class="document-body">${esc(docs.ink[1])}</div><button class="secondary" onclick="readDoc('ink')">발견한 경로 기록하기</button>`:`<button class="secondary" onclick="readDoc('blank')">꼬리표 읽기</button>`}`,'blank');}
const coreUseItem=useItem;
useItem=function(id,target){if(!owns(id)){reject('소지품을 먼저 선택하세요.');return;}if(target==='blank'&&id==='lantern'){E().ink=true;discover('ink');save();blankPanel();return;}if(target==='terminal'&&id==='packet'){E().installed=true;save();exitPanel();return;}if(target==='terminal'&&id==='lantern'){S().lamp='installed';save();exitPanel();return;}coreUseItem(id,target);};

const wireLabels=['실선 ─','점선 ···','이중선 ═'];
function wiringPanel(){panel('관송기 배전함',`<p>빠진 플러그 세 개와 출력 소켓 세 개. 배전함 뚜껑 안쪽에 선이 그려져 있다. 교차점에는 연결 표시가 없다.</p><svg class="wiring-map" viewBox="0 0 360 180" role="img" aria-label="실선은 위에서 아래로, 점선은 가운데에서 위로, 이중선은 아래에서 가운데로 연결"><path d="M55 30 H115 V150 H305" fill="none" stroke="#4b586d" stroke-width="4"/><path d="M55 90 H160 V30 H305" fill="none" stroke="#8b4e42" stroke-width="4" stroke-dasharray="6 6"/><path d="M55 145 H205 V85 H305 M55 153 H213 V93 H305" fill="none" stroke="#3c6b5b" stroke-width="2"/>${wireLabels.map((l,i)=>`<text x="5" y="${35+i*60}" font-size="12">${l}</text><circle cx="310" cy="${30+i*60}" r="8" fill="#555"/><text x="325" y="${35+i*60}" font-size="12">${['위','중','아래'][i]}</text>`).join('')}</svg><div class="socket-list">${[0,1,2].map(i=>`<label>${['위','가운데','아래'][i]} 소켓<select ${E().power?'disabled':''} onchange="E().wiring[${i}]=Number(this.value);save();wiringPanel()">${wireLabels.map((l,j)=>`<option value="${j}" ${E().wiring[i]===j?'selected':''}>${l}</option>`).join('')}</select></label>`).join('')}</div><p id="wire-feedback" role="status">${E().power?'관송기의 전원등이 켜져 있다.':''}</p><div class="actions"><button class="secondary" onclick="readDoc('wires')">배선 메모 읽기</button><button class="primary" onclick="checkWires()">전원 넣기</button></div>`);}
function checkWires(){if(E().wiring.join()!=='1,2,0'){$('#wire-feedback').textContent=new Set(E().wiring).size<3?'같은 플러그를 두 소켓에 꽂을 수 없다.':'차단기가 내려간다. 배전함 뚜껑의 선을 끝까지 따라가보자.';return;}E().power=true;save();render();wiringPanel();}
const routeOptions=[['eye','wave','flame'],['leaf','moon','crown'],['flame','eye','moon']];
function transitPanel(){panel('문서 관송기',`<p>${E().parcel?'회수함에 퇴실 원본이 도착했다. 봉투는 챙겼다.':'사원번호 00404의 원본 봉투가 반송 대기 중이다. 우회 지점을 맞춰 호출해야 한다.'}</p><div class="transit-stages">${routeOptions.map((opts,i)=>`<div><small>${['첫 중계소','두 번째 중계소','보관 창구'][i]}</small><button class="secondary" ${E().parcel?'disabled':''} onclick="E().route[${i}]=(E().route[${i}]+1)%3;save();transitPanel()">${glyphs[opts[E().route[i]]]} ${names[opts[E().route[i]]]} ↻</button></div>`).join('')}</div><div class="parcel-track">${[0,1,2,3].map((n)=>`<span id="parcel-step-${n}">${['출발','중계 1','중계 2','회수함'][n]}</span>`).join('')}</div><p id="transit-feedback" role="status">${E().power?'전원 정상':'전원 없음 · 배전함을 확인하세요.'}</p><div class="actions"><button class="secondary" onclick="readDoc('transit')">관송관 약도 읽기</button><button class="primary" ${!E().power||E().parcel?'disabled':''} onclick="sendParcel()">원본 봉투 호출</button></div>`);}
function sendParcel(){const picks=routeOptions.map((o,i)=>o[E().route[i]]);const expected=['wave','leaf','moon'];let reached=0;while(reached<3&&picks[reached]===expected[reached])reached++;for(let i=0;i<=reached;i++)$('#parcel-step-'+i).classList.add('reached');if(reached!==3){$('#transit-feedback').textContent=`${reached===0?'출발 직후':reached+'번째 중계소 뒤'}에 반송됐다. 우회 경로와 목적지 도장을 비교해보자.`;return;}E().parcel=true;grant('packet');eventPanel('회수함에서 내 이름의 봉투가 나왔다','봉투 안에는 퇴실 원본 도안과 세 장의 필름이 들어 있다.\n“퇴실 판독용 / 성문에 설치.” 드디어 그림자에게도 신분증이 생겼다.');}

// Flat mask composition: all rotations are visible, no simulated depth required.
const filmMasks=[[2,7,12,11],[6,7,8,13],[16,17,12]];
function rotateMask(mask,turn){let a=[...mask];for(let k=0;k<turn;k++)a=a.map(i=>(i%5)*5+4-Math.floor(i/5));return a;}
function combinedMask(turns){return new Set(filmMasks.flatMap((m,i)=>rotateMask(m,turns[i])));}
const targetMask=combinedMask([1,3,2]);
function maskGrid(cells,label,preview=false){return `<div class="mask-grid" role="img" aria-label="${label}">${Array.from({length:25},(_,i)=>{const members=preview?filmMasks.map((m,j)=>rotateMask(m,E().turns[j]).includes(i)?String.fromCharCode(65+j):'').filter(Boolean).join(''):'';return `<span class="${cells.has(i)?'filled':''}" title="${Math.floor(i/5)+1}행 ${i%5+1}열${members?' · '+members:''}">${members}</span>`;}).join('')}</div>`;}
exitPanel=function(){panel('성문 · 인영 필름 판독기',`<p>필름 세 장을 겹치면 하나의 인영이 된다. 원본 도안과 검은 칸의 위치가 같아야 문이 열린다.</p><div class="final-status"><span>${S().shadow?'✓':'○'} 본인 그림자</span><span>${E().installed?'✓':'○'} 원본 봉투 설치</span><span>${S().lamp?'✓':'○'} 작업등 설치</span><span>${S().blind?'✓':'○'} 창빛 차단</span></div>${E().installed?`<div class="mask-comparison"><div><h3>지금 겹친 필름</h3>${maskGrid(combinedMask(E().turns),'현재 겹친 필름',true)}</div><div><h3>퇴실 원본 도안</h3>${maskGrid(targetMask,'맞춰야 할 원본 도안')}</div></div><div class="film-controls">${filmMasks.map((m,i)=>`<div><strong>필름 ${String.fromCharCode(65+i)} · ${E().turns[i]*90}°</strong>${maskGrid(new Set(rotateMask(m,E().turns[i])),'필름 '+String.fromCharCode(65+i))}<button class="secondary" onclick="E().turns[${i}]=(E().turns[${i}]+1)%4;save();exitPanel()">90° 돌리기</button></div>`).join('')}</div>`:'<div class="empty-mirror">원본 봉투 미설치<small>문서 수발실에서 원본 도안과 필름을 회수하세요.</small></div>'}<div class="actions"><button class="secondary" onclick="interact('blind')">차광막 기어함</button><button class="secondary" onclick="readDoc('light')">판독 일지 읽기</button><button class="primary" onclick="attemptExit()">문 손잡이 당기기</button></div><p id="exit-feedback" role="status"></p>`,'terminal');};
attemptExit=function(){const el=$('#exit-feedback');if(!S().shadow){el.textContent='대조할 그림자가 없다. 감사부 반사경에서 그림자를 되찾아야 한다.';return;}if(!E().installed){el.textContent='수발실에서 회수한 퇴실 원본 봉투를 이 장치에 사용하세요.';return;}if(!S().lamp){el.textContent='작업등 받침이 비어 있다. 휴대등을 사용하세요.';return;}if(!S().blind){el.textContent='창빛이 필름의 빈 칸까지 비춘다. 차광막을 닫아야 한다.';return;}const actual=combinedMask(E().turns);if(actual.size!==targetMask.size||[...targetMask].some(i=>!actual.has(i))){el.textContent='원본과 다른 칸이 있다. 세 필름의 모양을 각각 살펴보자.';return;}state.ended=true;save();render();ending();};
save();render();

// ===== 03 visual puzzles: 배전함·관송관 =====
// Deterministic interactive diagrams. Prior solved states remain solved.
function V(){if(!E().visual)E().visual={switches:E().power?[1,0,1,1]:[0,0,0,0],path:E().parcel?['s','b','d','f','t']:['s'],tested:false};return E().visual;}
const relayPairs=[[0,2],[1,3],[0,1],[2,3]];
const signalSymbols=['●','▲','■','✦'];
const signalColors=['#53c8cf','#edaf5e','#d588c6','#96bf6e'];
const desiredSignals=[1,2,3,0];
function relayStages(){let values=[0,1,2,3],stages=[values.slice()];relayPairs.forEach(([a,b],i)=>{if(V().switches[i])[values[a],values[b]]=[values[b],values[a]];stages.push(values.slice());});return stages;}
function relayBoard(){const stages=relayStages();let paths='';for(let k=0;k<4;k++){const [a,b]=relayPairs[k];for(let row=0;row<4;row++){const dest=V().switches[k]?(row===a?b:row===b?a:row):row;const x=85+k*110,y=65+row*62,ny=65+dest*62;const sig=stages[k][row];paths+=`<path d="M${x} ${y} C${x+42} ${y} ${x+68} ${ny} ${x+110} ${ny}" fill="none" stroke="#142433" stroke-width="11"/><path d="M${x} ${y} C${x+42} ${y} ${x+68} ${ny} ${x+110} ${ny}" fill="none" stroke="${V().tested?signalColors[sig]:'#6c8390'}" stroke-width="4"/>`;}}
 return `<svg class="relay-board" viewBox="0 0 630 320" role="img" aria-label="네 개의 교차 스위치 회로. 왼쪽 신호가 스위치를 거쳐 오른쪽 단자로 전달됩니다."><rect width="630" height="320" rx="8" fill="#1c2d3c"/>${paths}${[0,1,2,3].map(r=>`<text x="32" y="${72+r*62}" fill="${signalColors[r]}" font-size="25">${signalSymbols[r]}</text><path d="M60 ${65+r*62}H85 M525 ${65+r*62}H553" stroke="#8094a1" stroke-width="4"/><circle cx="560" cy="${65+r*62}" r="15" fill="${V().tested?(stages[4][r]===desiredSignals[r]?'#71d9a7':'#e27475'):'#3d4f5c'}"/><text x="592" y="${73+r*62}" text-anchor="middle" fill="#f5f3ed" font-size="25">${signalSymbols[desiredSignals[r]]}</text>`).join('')}${[0,1,2,3].map(i=>`<text x="${140+i*110}" y="27" text-anchor="middle" fill="#e9ecef" font-size="14">${['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][i]}</text>`).join('')}<text x="22" y="300" fill="#cedce4" font-size="12">입력 신호</text><text x="510" y="300" fill="#cedce4" font-size="12">출력 각인</text></svg>`;
}
wiringPanel=function(){panel('관송기 배전함',`<p>오른쪽 단자의 각인은 원래 연결된 신호다. 네 개의 스위치가 각각 두 선의 길을 교환한다. 왼쪽 신호를 같은 각인의 단자로 보내야 한다.</p>${relayBoard()}<div class="relay-controls">${[0,1,2,3].map(i=>`<button class="secondary ${V().switches[i]?'engaged':''}" onclick="flipRelay(${i})"><b>${['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][i]}</b><span>${V().switches[i]?'╳ 교차':'Ⅱ 직결'}</span></button>`).join('')}</div><div class="relay-results">${V().tested?relayStages()[4].map((s,r)=>`<span>${signalSymbols[s]} → ${signalSymbols[desiredSignals[r]]} ${s===desiredSignals[r]?'✓':'불일치'}</span>`).join(''):'전원을 넣으면 전류가 흐르는 선과 각 단자의 반응이 표시됩니다.'}</div><div class="actions"><button class="secondary" onclick="readDoc('wires')">뚜껑의 주의사항</button><button class="primary" onclick="checkWires()">전원 넣기</button></div><p id="wire-feedback" role="status">${E().power?'관송기 전원은 복구되어 있습니다.':''}</p>`);};
function flipRelay(i){V().switches[i]=1-V().switches[i];V().tested=false;save();wiringPanel();}
checkWires=function(){V().tested=true;const solved=relayStages()[4].every((s,i)=>s===desiredSignals[i]);if(solved)E().power=true;save();render();wiringPanel();$('#wire-feedback').textContent=solved?'네 단자에 올바른 신호가 들어왔다. 관송기가 깨어난다.':'붉게 켜진 단자는 다른 신호를 받았다. 그 선을 거슬러 올라가 스위치를 살펴보자.';};
docs.wires=['배전함 뚜껑의 주의사항','교차 스위치는 두 선의 목적지를 서로 바꾼다. 그 외의 선은 통과한다.\n선이 교차하는 지점에는 접속점이 없다.\n오른쪽 단자 옆 각인은 필요한 입력 신호다.\n전원 시험: 일치하면 녹색, 불일치하면 적색. 기호와 글자로도 결과를 확인할 수 있다.'];

const tubeNodes={
 s:{x:42,y:175,label:'발송함',edges:['a','b']},
 a:{x:175,y:65,label:'상층관',hazard:'water',mark:'물방울',edges:['c','d']},
 b:{x:175,y:290,label:'하층관',edges:['d','e']},
 c:{x:330,y:55,label:'보일러 옆',hazard:'heat',mark:'열기',edges:['f']},
 d:{x:330,y:175,label:'중앙 우회관',edges:['f','g']},
 e:{x:330,y:305,label:'세척실 위',hazard:'water',mark:'수증기',edges:['g']},
 f:{x:495,y:100,label:'암실 옆',edges:['t']},
 g:{x:495,y:260,label:'채광창 옆',hazard:'light',mark:'햇빛',edges:['t']},
 t:{x:650,y:175,label:'회수함',edges:[]}
};
function tubeMap(interactive){const path=V().path;let lines='';for(const [id,n] of Object.entries(tubeNodes))for(const next of n.edges){const m=tubeNodes[next];const traced=path.some((p,i)=>p===id&&path[i+1]===next);lines+=`<path d="M${n.x} ${n.y} L${m.x} ${m.y}" stroke="${traced?'#57ddd1':'#748594'}" stroke-width="${traced?7:3}" fill="none"/>`;}
 const last=path.at(-1);return `<div class="tube-scroll"><div class="tube-map"><svg viewBox="0 0 700 360" aria-hidden="true">${lines}</svg>${Object.entries(tubeNodes).map(([id,n])=>`<button class="tube-node ${path.includes(id)?'selected':''} ${interactive&&tubeNodes[last].edges.includes(id)?'available':''}" style="left:${n.x/7}%;top:${n.y/3.6}%" onclick="${interactive?`chooseTube('${id}')`:`tubeEvidence('${id}')`}" aria-label="${n.label}${n.mark?' · '+n.mark:''}"><b>${id==='s'?'▣':id==='t'?'▤':n.hazard==='water'?'♒':n.hazard==='heat'?'♨':n.hazard==='light'?'☀':'○'}</b><span>${n.label}</span>${n.mark?`<small>${n.mark}</small>`:''}</button>`).join('')}</div></div>`;}
docs.ink=['빛에 드러난 운송장','내용물: 그림자 감광 필름 원본.\n시험편 사고: 물에 젖은 필름은 인영이 번졌다. 뜨거워진 필름은 수축했다. 빛에 노출된 필름은 하얗게 날아갔다.\n방습·차광 케이스 파손. 이번 운송에는 보호 기능이 없다.\n회수함까지 원형을 보존할 수 있는 관을 선택할 것.'];
docs.transit=['관송관 약도','관은 왼쪽 발송함에서 오른쪽 회수함으로 이어진다.\n♒: 물방울 또는 수증기 흔적 / ♨: 고열 / ☀: 채광\n동그라미는 흔적이 발견되지 않은 중계함.\n운송물마다 견딜 수 있는 환경이 다르다. 기록실의 빈 운송장에서 내용물을 확인할 것.'];
rooms.mail.note='벽의 관송관 약도에는 물방울과 그을음 자국이 남아 있다. 봉투가 무엇을 담고 있는지 알아야 안전한 관을 고를 수 있다.';
transitPanel=function(){panel('문서 관송기',`<p>연결된 중계함을 눌러 봉투가 지나갈 길을 정하세요. 선택한 지점을 다시 누르면 그 뒤의 경로를 지웁니다.</p>${tubeMap(true)}<div class="device-readout">선택 경로: ${V().path.map(id=>tubeNodes[id].label).join(' → ')}</div><div class="actions"><button class="secondary" onclick="V().path=['s'];save();transitPanel()">경로 지우기</button><button class="secondary" onclick="readDoc('transit')">벽의 약도 조사</button><button class="primary" ${E().power?'':'disabled'} onclick="sendParcel()">봉투 운송</button></div><p id="transit-feedback" role="status">${E().parcel?'원본 봉투를 이미 회수했습니다. 경로를 다시 살펴볼 수 있습니다.':E().power?'전원 정상 · 회수함까지 경로를 지정하세요.':'전원이 없습니다. 배전함부터 복구하세요.'}</p>`);};
function chooseTube(id){const path=V().path;if(path.includes(id)){V().path=path.slice(0,path.indexOf(id)+1);}else if(tubeNodes[path.at(-1)].edges.includes(id)){path.push(id);}else{toast('현재 경로 끝과 관으로 연결된 중계함을 선택하세요.');return;}save();transitPanel();}
sendParcel=function(){if(!E().power)return;const msg=$('#transit-feedback');if(V().path.at(-1)!=='t'){msg.textContent='경로가 회수함에 닿지 않았습니다.';return;}const broken=V().path.find(id=>tubeNodes[id].hazard);if(broken){const n=tubeNodes[broken];msg.textContent=`${n.label}의 감지기가 운송을 중단했다. ${ {water:'수분이 케이스 틈으로 들어오려 한다.',heat:'필름 포장이 열에 뒤틀린다.',light:'감광 표시가 빛에 반응한다.'}[n.hazard]} 원본은 발송함으로 회수됐다.`;return;}if(E().parcel){msg.textContent='안전한 경로입니다. 원본 봉투는 소지품에 있습니다.';return;}E().parcel=true;grant('packet');eventPanel('손상 없이 도착한 원본','봉투가 선택한 관을 따라 회수함으로 미끄러져 나왔다. 필름에는 얼룩도 그을음도 없다.\n원본 도안과 세 장의 필름을 성문 판독기에 사용할 수 있다.');};
const textReadDoc=readDoc;
readDoc=function(id){if(id!=='transit'){textReadDoc(id);return;}discover(id);if(!documentOrigin)documentOrigin=currentView;currentDocument=id;corePanel('관송관 약도',`<button class="secondary" onclick="returnToProblem()">← 이전 화면으로</button><p>정비사가 관 주변에서 발견한 흔적을 표시했다. 중계함을 눌러 자세히 조사할 수 있다.</p>${tubeMap(false)}<p id="tube-evidence" role="status">이 지도에는 배송 순서가 없다. 운송장 속 내용물과 흔적을 비교하자.</p><div class="actions"><button class="secondary" onclick="pinDoc('transit')">범례 고정 / 해제</button><button class="primary" onclick="returnToProblem()">조사를 마치고 돌아가기</button></div>`);};
function tubeEvidence(id){const n=tubeNodes[id];$('#tube-evidence').textContent=n.label+': '+({a:'연결관 아래에 물방울이 맺혀 있다.',b:'관은 서늘하고 마른 상태다.',c:'외벽의 페인트가 열에 벗겨져 있다.',d:'우회관 안쪽에 습기나 열 흔적이 없다.',e:'세척실에서 올라온 증기가 관 안에 맺힌다.',f:'차광 덮개가 관 전체를 가리고 있다.',g:'유리관에 햇빛이 그대로 들어온다.',s:'반송된 봉투를 출발시키는 곳.',t:'성문으로 가져갈 원본을 받는 곳.'}[id]);}
problemHints.wiring=['스위치를 누르면 두 선이 서로 교차합니다. 선의 변화부터 살펴보세요.','출력은 위부터 ▲·■·✦·●를 요구합니다. 전원 시험 후 잘못 도착한 신호를 거슬러 올라가 보세요.','Ⅰ 교차, Ⅱ 직결, Ⅲ 교차, Ⅳ 교차로 맞추고 전원을 넣으세요.'];
problemHints.transit=['관송관 약도는 길과 흔적을 보여줍니다. 봉투 내용물의 약점은 다른 자료에 있습니다.','기록실의 빈 운송장에 휴대등을 사용하세요. 물·열·빛을 피할 수 있는 관을 찾아야 합니다.','발송함 → 하층관 → 중앙 우회관 → 암실 옆 → 회수함을 선택하고 운송하세요.'];
problemHints.ink=['운송장의 글씨는 지워진 것이 아니라 감춰져 있습니다.','휴대등으로 종이를 뒤에서 비추세요.','빈 운송장에 휴대등을 사용하면 필름이 물·열·빛에 손상된다는 기록이 나타납니다.'];
V();save();

// ===== 04 art: 배경 그림과 조사 지점 =====
// Presentation only. Puzzle state and saved progress stay in sections 01-02.
for(const id of ['hr','facility','audit','exit','archive','mail']){
 rooms[id].art=()=>`<img class="scene-art" src="assets/${id}-anime.webp" alt="${rooms[id].title} — 애니메이션풍 야간 사무실">`;
}
rooms.hr.spots=[['조직도',5,8,23,34,'org'],['뼈 대리',58,27,17,25,'skeleton'],['불씨 양초',6,40,8,17,'candle'],['사고 접수철',82,8,15,26,'rules'],['개인 비품 서랍',41,57,23,25,'drawer']];
rooms.facility.spots=[['만년빙 보관함',2,10,21,65,'ice'],['미믹 주임',27,30,22,27,'mimic'],['반려 식단',43,17,9,20,'diet']];
rooms.audit.spots=[['관리 기록',3,14,11,24,'registration'],['이름 반사경',24,4,15,70,'mirror'],['창문 손잡이',80,41,10,10,'window']];
rooms.exit.spots=[['차광막 기어함',21,38,6,14,'blind'],['성문',38,13,16,47,'door'],['인영 필름 판독기',68,55,29,27,'terminal'],['판독 일지',85,66,13,14,'light']];
rooms.archive.spots=[['철침 서가',8,24,17,33,'shelf'],['반납대 쪽지',83,10,9,23,'shelfNote'],['판독 작업대',38,63,44,22,'workbench'],['판독 지침',93,17,6,17,'registration'],['빈 운송장',85,53,12,9,'blank']];
rooms.mail.spots=[['배전함',5,16,15,48,'wiring'],['문서 관송기',28,37,29,42,'transit'],['관송관 약도',72,5,26,30,'transitDoc']];
// Numbered targets match the props in all six room illustrations.
const artRender=render;
render=function(){artRender();const room=rooms[state.room];const stage=$('#stage');stage.classList.remove('schematic');
 const status=stage.querySelector('.world-status');
 let statusHost=$('#room-state');if(!statusHost){statusHost=document.createElement('div');statusHost.id='room-state';document.querySelector('.room-head').append(statusHost);}
 statusHost.replaceChildren();if(status)statusHost.append(status);
 let rail=$('#scene-targets');if(!rail){rail=document.createElement('div');rail.id='scene-targets';rail.setAttribute('aria-label','조사할 대상');stage.after(rail);}
 rail.innerHTML=room.spots.map(([label,x,y,w,h,id],i)=>`<button onclick="interact('${id}')"><b>${String(i+1).padStart(2,'0')}</b><span>${label}</span></button>`).join('');
 stage.querySelectorAll('.hotspot').forEach((el,i)=>{el.dataset.number=String(i+1).padStart(2,'0');el.title=room.spots[i][0];});
};
render();

// ===== 05 polish: 진행 기록·명판 닦기·수첩 =====
// Final interaction pass: no new raster assets or changes to puzzle solutions.
function P(){if(!S().polish)S().polish={wiped:[],journal:[],seen:{}};return S().polish;}
const milestones=()=>({drawer:S().drawer,corridor:has('hr'),shelf:S().archive,ice:S().thawed,nameplate:has('facility'),clean:S().clean,ink:E().ink,power:E().power,parcel:E().parcel,shadow:S().shadow,blind:S().gear,exit:state.ended});
const milestoneText={drawer:'사원증으로 비품 서랍을 열었다.',corridor:'접힌 복도가 펴져 시설부와 수발실로 이어졌다.',shelf:'서가 철침이 풀리고 반납 서랍이 열렸다.',ice:'보관함 손잡이의 성에가 녹았다.',nameplate:'미믹에게서 내 명판을 돌려받았다.',clean:'검댕 아래 아홉 문양이 드러났다.',ink:'운송장의 숨은 글씨를 발견했다.',power:'관송기의 전원이 돌아왔다.',parcel:'퇴실 원본 봉투가 회수함에 도착했다.',shadow:'거울 너머의 그림자가 돌아왔다.',blind:'차광막의 톱니를 수리했다.',exit:'본인과 그림자가 모두 퇴실했다.'};
// Each launch begins with discovery; the toggle remains available during play.
let explore=true;
const exploreButton=document.createElement('button');exploreButton.className='quiet';document.querySelector('.top-actions').prepend(exploreButton);
function setExplore(v){explore=v;document.body.classList.toggle('exploration-mode',v);exploreButton.textContent=v?'탐색 표시: 직접 찾기':'탐색 표시: 번호';exploreButton.setAttribute('aria-pressed',String(v));try{localStorage.setItem('escape-explore-mode',String(v));}catch{}if(v)toast('물건 위에 마우스를 올리거나 Tab으로 이동하면 조사 지점이 나타납니다. 업무 모드에서는 목록을 유지합니다.');}
exploreButton.onclick=()=>setExplore(!explore);document.body.classList.toggle('exploration-mode',explore);exploreButton.textContent=explore?'탐색 표시: 직접 찾기':'탐색 표시: 번호';
const beforePolishRender=render;
render=function(){P();beforePolishRender();let changed=false;for(const [k,v] of Object.entries(milestones())){if(v&&!P().seen[k]){P().seen[k]=true;P().journal.push(milestoneText[k]);changed=true;}}if(changed)save();
 const statuses={org:has('hr')?'통로 연결':null,drawer:S().drawer?'열림':null,shelf:S().archive?'철침 해제':null,ice:S().thawed?'해동됨':null,mimic:has('facility')?'명판 회수':null,mirror:S().shadow?'그림자 복원':null,wiring:E().power?'전원 정상':null,transit:E().parcel?'봉투 회수':null,blank:E().ink?'잉크 발견':null,blind:S().blind?'차광 중':S().gear?'수리됨':null};
 const stage=$('#stage');stage.dataset.room=state.room;
 stage.classList.toggle('power-restored',state.room==='mail'&&E().power);
 stage.classList.toggle('shadow-restored',state.room==='audit'&&S().shadow);
 rooms[state.room].spots.forEach((spot,i)=>{const message=statuses[spot[5]];if(!message)return;const target=stage.querySelectorAll('.hotspot')[i];if(target){target.classList.add('resolved');target.setAttribute('aria-label',spot[0]+' · '+message);const mark=document.createElement('span');mark.className='object-result';mark.textContent='✓';mark.setAttribute('aria-hidden','true');target.append(mark);}const rail=$('#scene-targets').children[i];if(rail){const badge=document.createElement('small');badge.className='result-label';badge.textContent=message;rail.append(badge);}});
 if(state.room==='facility'&&S().thawed){const fx=document.createElement('div');fx.className='fridge-thawed';fx.setAttribute('aria-hidden','true');stage.append(fx);}
 if(state.room==='mail'&&E().power){const led=document.createElement('div');led.className='machine-led';led.setAttribute('aria-hidden','true');stage.append(led);}
};

// Physical inspection gesture, with equivalent keyboard/click input.
problemForTitle['명판 닦기']='clean';
const combineBeforePolish=combine;
combine=function(a,b){if(owns(a)&&owns(b)&&[a,b].includes('cloth')&&[a,b].includes('plate')){cleaningPanel();return;}combineBeforePolish(a,b);};
function soot(){if(!Array.isArray(P().soot))P().soot=Array(9).fill(1);return P().soot;}
const sootReach=i=>[i,i-3,i+3,i%3?i-1:-1,i%3<2?i+1:-1].filter(j=>j>=0&&j<9);
function cleaningPanel(focus=null){if(S().clean){inspectItem('polished');return;}if(!owns('plate')||!owns('cloth'))return;const sc=soot();const clean=sc.filter(x=>!x).length;panel('명판 닦기',`<p>광택 천을 대고 문지르면 그 칸의 검댕은 닦이지만, 밀려난 검댕이 위·아래·왼쪽·오른쪽 칸으로 번진다. 이미 닦인 칸에 번지면 다시 더러워진다.</p><div id="cleaning-board" aria-label="천으로 닦을 명판">${face.map((id,i)=>`<button data-wipe="${i}" class="soot-cell ${sc[i]?'':'wiped'}" onclick="wipeCell(${i})" aria-label="${i+1}번 칸 ${sc[i]?'검댕 묻음':'깨끗함'} · 문지르기"><span>${glyphs[id]}</span><small>${names[id]}</small></button>`).join('')}</div><p id="cleaning-progress" role="status">${clean} / 9칸이 깨끗하다.</p><div class="actions"><button class="secondary" onclick="P().soot=Array(9).fill(1);save();cleaningPanel()">검댕을 처음 상태로</button></div>`);if(focus!==null)document.querySelector(`[data-wipe="${focus}"]`)?.focus();}
function wipeCell(i){if(S().clean||!owns('plate')||!owns('cloth'))return;const sc=soot();sootReach(i).forEach(j=>sc[j]=1-sc[j]);save();if(sc.every(x=>!x)){remove('plate');S().clean=true;grant('polished');discover('plate');eventPanel('명판이 제 모습을 드러냈다','천이 새까맣게 변했다. 금속판에는 아홉 문양과 비스듬히 잘린 모서리가 남아 있다.');return;}cleaningPanel(i);}
const returnBeforePolish=returnToProblem;
returnToProblem=function(){if((documentOrigin||currentView)?.title==='명판 닦기'){documentOrigin=null;currentDocument=null;cleaningPanel();return;}returnBeforePolish();};
problemHints.clean=['문지른 칸과 그 상하좌우 칸의 상태가 뒤집힙니다. 같은 칸을 두 번 문지르면 원래대로 돌아갑니다.','문지르는 순서는 결과에 영향을 주지 않습니다. 어느 칸을 문지를지만 정하세요. 모서리는 3칸, 가장자리는 4칸, 가운데는 5칸을 바꿉니다.','처음 상태에서 네 모서리와 가운데, 다섯 칸을 한 번씩 문지르세요.'];

// Keep evidence, remove accidental solution paragraphs from ordinary documents.
docs.route=['접힌 복도의 정비도','시설부 연결관은 왼쪽 위에서 들어와 오른쪽 아래로 나간다.\n회전축 규격: 황동 사각형. 창문 비품과 동일 규격.\n조각의 열린 끝이 맞닿아야 통과할 수 있다. 사용하지 않는 복도는 연결하지 않아도 된다.\n작업 후에는 반드시 입구의 빛으로 연결 상태를 확인할 것.'];
docs.cooling=['냉각 보관 기록','만년빙 시험 결과\n금속 조각: 차가워짐.\n발광 시료: 온도는 내려갔지만 빛은 그대로 남음.\n용기 형태: 변화 없음.\n보관함 손잡이의 성에는 일반적인 얼음과 동일한 성질을 보인다.'];
docs.ink=['빛에 드러난 운송장','내용물: 그림자 감광 필름 원본.\n시험편 사고: 물에 젖은 필름은 인영이 번졌다. 뜨거워진 필름은 수축했다. 빛에 노출된 필름은 하얗게 날아갔다.\n방습·차광 케이스 파손. 이번 운송에는 보호 기능이 없다.'];
itemDetails.badge=['사진 대신 빈 실루엣. 인사부 발급 임시 사원증이다.','뒷면 아래에 얇은 금속 접점이 있다. 닳은 자국이 일정한 간격으로 나 있다.'];
itemDetails.cloth=['금속 광택용 천. 모서리에 검댕이 묻어 있다.','세탁 금지. 문지르면 검댕이 닦이는 대신 옆으로 밀려난다는 사용 후기가 붙어 있다.'];
itemDetails.crank=['끝이 사각형인 황동 손잡이.','축에 작은 사각형 규격 표식이 있다.'];

// Notebook records observations, not automatically generated answers.
notebook=function(){panel('조사 수첩',`<div class="notebook-history"><h3>내가 바꾼 것들</h3>${P().journal.length?`<ol>${P().journal.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>`:'<p>아직 기록된 변화가 없다.</p>'}</div><h3>발견한 자료</h3><div class="clue-list">${S().clues.map(id=>`<button class="secondary" onclick="readDoc('${id}')">${docs[id][0]}${S().pin===id?' · 고정됨':''}</button>`).join('')||'<p>읽은 자료가 여기에 남습니다.</p>'}</div><label for="personal-notes">내 메모</label><textarea id="personal-notes" rows="4" oninput="S().notes=this.value;save()">${esc(S().notes)}</textarea>`);};
$('#approval').onclick=notebook;
const previousHelp=$('#help').onclick;
$('#help').onclick=()=>{previousHelp();const note=document.createElement('p');note.className='sub';note.textContent='탐색 표시를 바꾸면 조사 번호를 숨길 수 있습니다. 해결한 대상에는 ✓와 결과가 남습니다. 수첩에서 지금까지 바꾼 것들을 확인하세요.';$('#modal').append(note);};
// The original focus loop only handled buttons. Replace it for all modal controls.
document.addEventListener('keydown',e=>{if(e.key!=='Tab'||$('#overlay').classList.contains('hidden'))return;const nodes=[...$('#modal').querySelectorAll('button:not(:disabled),select:not(:disabled),textarea:not(:disabled),input:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}e.stopImmediatePropagation();},true);
P();render();save();

// ===== 06 audio: 합성 BGM·효과음 =====
// Original procedural score and effects. No recordings, downloads or external services.
const gameAudio=(()=>{
 const defaults={enabled:false,music:.28,effects:.55};let cfg={...defaults};
 try{const x=JSON.parse(localStorage.getItem('escape-audio-v1'));if(x)cfg={enabled:false,music:Math.max(0,Math.min(1,Number(x.music)||0)),effects:Math.max(0,Math.min(1,Number(x.effects)||0))};}catch{}
 let ctx,bgm,fx,master,timer,next=0,step=0,noise,lastEffect=0;
 const beat=60/78, eighth=beat/2;
 const chords=[[50,57,60,65],[55,62,65,69],[48,55,59,64],[53,60,64,69],[46,53,57,60],[52,59,62,67],[45,52,55,60],[45,52,58,61]];
 const melodies=[[77,null,76,null,72,null,69,null],[74,null,null,77,null,76,74,null],[76,null,71,null,72,null,null,null],[76,null,null,79,76,null,72,null],[72,null,69,null,65,null,null,null],[74,null,71,null,67,null,69,null],[72,null,null,71,69,null,67,null],[70,null,73,null,76,null,null,null]];
 const hz=n=>440*Math.pow(2,(n-69)/12);
 function persist(){try{localStorage.setItem('escape-audio-v1',JSON.stringify(cfg));}catch{}}
 function ready(){if(ctx)return true;const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;ctx=new C();audio=ctx;master=ctx.createGain();master.gain.value=.65;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=5;master.connect(comp);comp.connect(ctx.destination);bgm=ctx.createGain();fx=ctx.createGain();bgm.connect(master);fx.connect(master);noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const a=noise.getChannelData(0);let seed=404;for(let i=0;i<a.length;i++){seed=(seed*1664525+1013904223)>>>0;a[i]=seed/2147483648-1;}volumes();return true;}
 function volumes(){if(!ctx)return;const now=ctx.currentTime;bgm.gain.setTargetAtTime(cfg.music,now,.08);fx.gain.setTargetAtTime(cfg.effects,now,.02);master.gain.setTargetAtTime((cfg.enabled && !office && !document.hidden) ? .65 : 0,now,.04);}
 function note(midi,t,duration,level,channel=bgm,type='sine',slide=null){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(hz(midi),t);if(slide!==null)o.frequency.exponentialRampToValueAtTime(hz(slide),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(channel);o.start(t);o.stop(t+duration+.025);o.onended=()=>{o.disconnect();g.disconnect();};}
 function hiss(t,duration,level,freq=2400){const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=noise;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=.7;g.gain.setValueAtTime(level,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);src.connect(filter);filter.connect(g);g.connect(fx);src.start(t);src.stop(t+duration);src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect();};}
 function playStep(n,t){const bar=Math.floor(n/8)%16,chord=chords[bar%8],pos=n%8;if(pos===0||pos===5)chord.slice(1).forEach((p,j)=>{note(p,t+j*.012,1.1,.075);note(p+12,t+j*.012,.35,.016);});if(pos===0||pos===4)note(chord[0]-12,t,.55,.19,bgm,'triangle');const melody=melodies[bar%8][pos];if(melody!==null&&(bar<8||pos%2===0))note(melody,t,.58,.09,bgm);}
 function tick(){if(!ctx||ctx.state!=='running'||!cfg.enabled||office||document.hidden||!state.started||state.ended)return;if(next<ctx.currentTime)next=ctx.currentTime+.06;while(next<ctx.currentTime+.25){playStep(step,next);next+=eighth*(step%2===0?1.10:.90);step++;}}
 function schedule(){if(timer)clearInterval(timer);if(ctx){next=ctx.currentTime+.08;timer=setInterval(tick,100);tick();}}
 async function enable(v){if(office&&v){toast('업무 모드에서는 무음입니다. 일반 보기로 바꾼 뒤 소리를 켜세요.');return;}cfg.enabled=Boolean(v);sound=cfg.enabled;persist();if(!v){volumes();if(timer)clearInterval(timer);timer=null;return;}try{if(!ready())throw new Error('unsupported');await ctx.resume();volumes();schedule();}catch{cfg.enabled=false;sound=false;toast('이 브라우저에서 소리를 시작하지 못했습니다. 무음으로 계속할 수 있습니다.');}}
 function effect(kind){if(!ctx||ctx.state!=='running'||!cfg.enabled||office||document.hidden)return;const t=ctx.currentTime;if(t-lastEffect<.07&&!['mimic','glass','ending'].includes(kind))return;lastEffect=t;switch(kind){case'click':note(69,t,.05,.13,fx,'triangle');break;case'collect':[76,83].forEach((n,i)=>note(n,t+i*.07,.24,.18,fx));break;case'success':[62,69,74].forEach((n,i)=>note(n,t+i*.10,.45,.18,fx));break;case'fail':note(46,t,.19,.12,fx,'triangle',42);break;case'stone':hiss(t,.24,.20,220);note(28,t,.23,.10,fx,'triangle');break;case'cloth':hiss(t,.10,.11,1700);break;case'mimic':[42,47,38].forEach((n,i)=>note(n,t+i*.10,.11,.22,fx,'triangle',n-6));break;case'glass':[81,88,93].forEach((n,i)=>note(n,t+i*.11,.7,.10,fx));break;case'parcel':hiss(t,.5,.2,1100);note(60,t+.48,.08,.19,fx,'triangle');break;case'ending':[62,65,69,74,77,81].forEach((n,i)=>note(n,t+i*.15,1.1,.20,fx));break;}}
 document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(0,ctx.currentTime);ctx.suspend().catch(()=>{});}else if(cfg.enabled&&!office){ctx.resume().then(()=>{volumes();next=ctx.currentTime+.1;}).catch(()=>{});}});
 return{cfg,enable,effect,update(kind,value){cfg[kind]=Number(value);volumes();persist();},start(){if(cfg.enabled){ctx?.resume().catch(()=>{});schedule();}},stop(){if(timer)clearInterval(timer);timer=null;},mute(){cfg.enabled=false;sound=false;volumes();if(ctx)ctx.suspend().catch(()=>{});if(timer)clearInterval(timer);timer=null;persist();}};
})();
// Silence the old generic beep to prevent overlapping duplicate feedback.
tone=function(){};
function audioSettings(){panel('소리 설정',`<p>직접 만든 전자 피아노·베이스 BGM과 합성 효과음입니다. 소리를 끄고도 모든 퍼즐을 풀 수 있습니다.</p><div class="actions"><button class="primary" onclick="gameAudio.enable(${!gameAudio.cfg.enabled}).then(audioSettings)">${gameAudio.cfg.enabled?'전체 음소거':'소리 켜기'}</button><button class="secondary" onclick="gameAudio.effect('collect')">효과음 미리 듣기</button></div><div class="audio-sliders"><label>BGM <output id="music-percent">${Math.round(gameAudio.cfg.music*100)}%</output><input type="range" min="0" max="1" step=".01" value="${gameAudio.cfg.music}" aria-label="BGM 볼륨" oninput="gameAudio.update('music',this.value);document.getElementById('music-percent').textContent=Math.round(this.value*100)+'%'"></label><label>효과음 <output id="effects-percent">${Math.round(gameAudio.cfg.effects*100)}%</output><input type="range" min="0" max="1" step=".01" value="${gameAudio.cfg.effects}" aria-label="효과음 볼륨" oninput="gameAudio.update('effects',this.value);document.getElementById('effects-percent').textContent=Math.round(this.value*100)+'%'"></label></div><p class="sub">업무 모드에서는 무음 · 다른 탭에서는 일시정지 · 새로고침 후에는 직접 소리를 켜주세요.</p>`);}
$('#sound').textContent='소리 설정';$('#sound').onclick=audioSettings;
const officeBeforeAudio=setOffice;setOffice=function(v){officeBeforeAudio(v);if(v)gameAudio.mute();$('#sound').textContent='소리 설정';};
const startBeforeAudio=startGame;startGame=function(){startBeforeAudio();gameAudio.start();};
const introBeforeAudio=intro;intro=function(){introBeforeAudio();const button=$('#modal').querySelector('button.primary');if(button){button.textContent='무음으로 시작';const audible=document.createElement('button');audible.className='secondary';audible.textContent=office?'업무 모드 · 무음':'소리 켜고 시작';audible.disabled=office;audible.onclick=async()=>{await gameAudio.enable(true);startGame();};button.after(audible);}};
const grantBeforeAudio=grant;grant=function(id){const existed=owns(id);grantBeforeAudio(id);if(!existed)gameAudio.effect('collect');};
const turnBeforeAudio=turnPipe;turnPipe=function(i){turnBeforeAudio(i);gameAudio.effect('stone');};
const relayBeforeAudio=flipRelay;flipRelay=function(i){relayBeforeAudio(i);gameAudio.effect('click');};
const wipeBeforeAudio=wipeCell;wipeCell=function(i){wipeBeforeAudio(i);gameAudio.effect('cloth');};
const useBeforeAudio=useItem;useItem=function(id,target){const had=has('facility');useBeforeAudio(id,target);if(!had&&has('facility'))gameAudio.effect('mimic');};
const mirrorBeforeAudio=checkMirror;checkMirror=function(){const before=S().shadow;mirrorBeforeAudio();gameAudio.effect(!before&&S().shadow?'glass':'click');};
const wireBeforeAudio=checkWires;checkWires=function(){wireBeforeAudio();gameAudio.effect(relayStages()[4].every((v,i)=>v===desiredSignals[i])?'success':'fail');};
const parcelBeforeAudio=sendParcel;sendParcel=function(){gameAudio.effect('parcel');parcelBeforeAudio();};
const endingBeforeAudio=ending;ending=function(){gameAudio.stop();endingBeforeAudio();gameAudio.effect('ending');};
const resetBeforeAudio=resetGame;resetGame=function(){gameAudio.mute();resetBeforeAudio();};

// ===== 07 world: 주변 조사(세계관) =====
// Optional environmental stories. Never award items, seals or puzzle flags.
const worldDetails={
 hr:[
 ['chair','빈 손님 의자',[2,61,17,16],'가죽 방석에 두 사람이 앉았던 듯 움푹한 자국이 겹쳐 있다. 의자 아래에는 작은 발받침이 하나 더 있다.','방석 옆을 들춰본다','“그림자 동반 면담 시 보조 의자를 요청하세요.”\n직원 만족도 조사에서 유일하게 바로 반영된 건의라고 한다.'],
 ['clock','책상 위 모래시계',[6,80,8,17],'모래가 아래에서 위로 흐른다. 옆의 컵받침에는 커피 대신 검은 모래가 조금 묻어 있다.','받침을 뒤집는다','“근무 시간 환급 장치 / 시제품 / 인사부 개인 반입 금지.”\n뼈 대리는 모르는 척 창밖을 본다.'],
 ['papers','결재 서류 더미',[77,43,12,13],'맨 위에는 뼈 대리의 휴가 신청서가 있다. 사유란에는 “바다” 한 단어만 적혀 있다.','아래 장을 본다','그 아래에도 같은 신청서. 더 아래에도 같은 신청서.\n가장 오래된 장에는 “바다라는 곳이 아직 있습니까?”라고 적혀 있다.'],
 ['city','도시의 불빛',[35,4,37,20],'창밖의 탑마다 사무실 불이 켜져 있다. 어떤 창에서는 사람이 먼저 일어나고, 그림자가 한참 뒤에 따라 일어난다.','창틀의 낙서를 읽는다','“오늘도 누군가는 먼저 퇴근했다.”\n바로 아래, 다른 필체로 “사람이었으면 좋겠네.”']
 ],
 archive:[
 ['ladder','붉은 사다리',[28,5,10,48],'사다리 바퀴마다 작은 브레이크가 달려 있다. 바닥에는 제멋대로 굴러간 자국이 남아 있다.','바퀴의 꼬리표를 본다','“자율 정리 기능 해제. 이용자가 올라가 있는 동안에도 퇴근하려 함.”'],
 ['binders','오래된 인사철',[1,3,21,17],'책등의 연도가 서로 다른 달력을 쓰고 있다. 용력, 인간력, 그리고 “본관 이전 이후”.','한 권을 펼친다','직원 사진에서 얼굴은 점점 흐려지는데 바닥의 그림자는 또렷하다.\n맨 뒤에는 “사진보다 인영의 보존 기간이 길다”는 기록이 있다.'],
 ['stool','작업대 의자',[35,85,10,14],'의자 다리 세 개는 짧고 하나만 길다. 그런데 전혀 흔들리지 않는다.','의자 아래를 본다','짧은 다리 밑마다 작은 그림자가 발끝으로 버티고 있다.\n누군가 종이 한 장을 붙여뒀다. “높이 조절 중입니다. 건드리지 마세요.”'],
 ['plant','창가의 식물',[63,38,13,18],'분재의 가지가 창문 쪽이 아니라 서류 쪽으로 뻗어 있다. 화분에 종이 부스러기가 쌓여 있다.','화분의 관리표를 읽는다','“주 1회 물. 월 1회 폐기된 기획안.”\n새싹 옆에는 아주 작게 “이번엔 될 것 같아요”라고 쓰여 있다.']
 ],
 facility:[
 ['boxes','작업대 아래 상자',[27,65,18,15],'상자에는 이빨 자국이 나 있다. 이빨 간격은 미믹 주임의 입과 닮았다.','뜯어진 송장을 펼친다','배송 품목: 소화용 연마석, 금속 알레르기 약, 유리 씹힘 방지 캡.\n“잡식성”이라는 인사 기록 옆에 취급 주의가 빼곡하다.'],
 ['chair','빈 작업 의자',[80,49,17,33],'의자는 따뜻하다. 앞의 공구들은 사용하기 좋은 방향으로 놓여 있다. 누군가 방금 자리를 비운 것 같다.','등받이의 쪽지를 읽는다','“제가 안 보이면 휴가입니다. 투명 종족이라고 상시 근무 중인 건 아닙니다.”'],
 ['bottles','세척제 운반차',[65,53,13,20],'세척제 통마다 손글씨로 이름이 적혀 있다. 한 통만 뚜껑에 자물쇠가 달렸다.','경고표를 읽는다','“후회 제거제. 금속 얼룩에는 효과 없음.”\n그 아래: “회식 다음 날 사용 신청 폭주로 배급제 전환.”'],
 ['door','붉은 비상 계단',[76,25,11,20],'비상문 너머에서 접시 부딪히는 소리가 들린다. 계단에는 퇴근 방향과 반대인 발자국이 이어진다.','문 옆 안내를 읽는다','“직원 식당. 야간 근무자에게도 아침 메뉴 제공.”\n오늘의 메뉴는 어제의 결심과 따뜻한 수프다.']
 ],
 audit:[
 ['seat','거울 앞 의자',[46,58,22,30],'팔걸이 한쪽만 유난히 닳았다. 누군가 이쪽을 꼭 잡고 오래 앉아 있었던 것 같다.','좌석 밑을 살핀다','“본인과 그림자의 진술이 다를 경우, 둘 다 끝까지 듣는다.”\n지워진 옛 규정 아래 새 문장이 덧붙어 있다.'],
 ['files','창가의 검은 서류철',[49,44,6,9],'등에 붙은 제목은 “동반 퇴실 예외 사례”. 가장 얇은 서류철에만 먼지가 없다.','표지를 연다','“직원은 남았으나 그림자만 퇴실한 사례.”\n결론란: “다음 날 둘 다 출근함. 어느 쪽도 경위를 말하지 않음.”'],
 ['plant','그늘의 화분',[1,40,12,24],'잎은 붉은데 그림자는 초록빛이다. 거울에는 잎도 초록색으로 비친다.','화분 받침을 본다','작은 글씨: “거울이 거짓말하는 게 아닙니다. 이쪽이 늘 솔직한 것도 아니니까요.”'],
 ['desk','붉은 회의탁자',[72,60,20,12],'탁자 위에는 빈 이름표 받침이 둘 있다. 하나는 “담당자”, 다른 하나는 아무것도 쓰여 있지 않다.','이름표 뒤를 본다','빈 이름표 뒤에 연필로 “따라오는 쪽”이라고 적혀 있다.\n누가 지우려다 만 흔적이 남아 있다.']
 ],
 mail:[
 ['letters','칸막이 우편함',[72,41,16,15],'얇은 봉투들이 칸마다 따로 놓여 있다. 주소가 없는 봉투도 배달을 기다리고 있다.','반송 봉투를 본다','수취인: 입사 전의 나.\n반송 사유: 해당 시간대로 가는 관이 철거됨.'],
 ['tray','책상 위 우편 묶음',[77,64,13,9],'붉은 끈으로 묶인 사내 우편들. 가장 위의 봉투는 가장자리만 검게 그을렸다.','소인을 살펴본다','“감정 취급 주의. 내용물에 화가 포함되어 있음.”\n배달원 메모: “발신자가 진정한 다음 재발송할 것.”'],
 ['chair','수발 담당자의 의자',[65,74,15,20],'등받이에 코트가 걸려 있다. 바닥에는 딱 한 짝의 슬리퍼가 놓여 있다.','코트의 명찰을 읽는다','담당자: 순환 근무 7호.\n업무 인계란에는 “이번에는 꼭 문으로 퇴근할 것. 관 사용 금지.”'],
 ['tubes','천장의 투명 관',[28,1,33,23],'빈 캡슐 하나가 천천히 지나간다. 안에는 접힌 종이새가 들어 있다.','조금 더 지켜본다','종이새가 날갯짓한다. 캡슐 벽에 부딪히자 얌전히 접힌다.\n누군가는 편지를 보내는 대신 편지가 직접 가도록 만들었다.']
 ],
 exit:[
 ['sofa','퇴실 대기 소파',[3,57,19,19],'쿠션 하나만 조금 내려앉아 있다. 아무도 없는데 누군가 자리를 잡고 있는 것 같다.','소파 틈을 살핀다','구겨진 번호표. “동반자 대기.”\n뒷면에 적힌 문장: “먼저 가도 돼.” 그 아래: “싫어.”'],
 ['city','성문 밖 야경',[70,9,22,34],'회사 밖에도 불빛은 많다. 멀리 편의점 같은 가게가 보이고, 긴 그림자가 문 앞에서 누군가를 기다린다.','거리 쪽을 바라본다','자동문이 열리자 사람과 그림자가 나란히 나온다.\n회사 안에서만 복잡했던 일이 밖에서는 아무렇지도 않아 보인다.'],
 ['drawers','경비실 서랍장',[68,50,8,9],'서랍에 주운 물건의 이름이 붙어 있다. 우산, 열쇠, 결심. 마지막 서랍은 유난히 깊다.','분실물 안내를 읽는다','“결심은 한 달 보관 후 폐기합니다. 단, 퇴사 결심은 본인 요청에 따라 무기한 보관합니다.”'],
 ['banner','문 옆 문장',[61,9,7,30],'오래된 문장 아래에 새 명판을 덧댔다. 회사 표어가 몇 번 바뀐 모양이다.','겹친 명판 사이를 읽는다','옛 문구: “세계를 우리 발아래.”\n새 문구: “함께 걷는 내일.”\n아래쪽의 작은 낙서: “일단 오늘은 집에.”']
 ]
};
const loreIndex={};
for(const [room,entries] of Object.entries(worldDetails))for(const [key,title,rect,text,action,detail] of entries){const id='lore_'+room+'_'+key;loreIndex[id]={room,title,text,action,detail};rooms[room].spots.push([title,...rect,id]);}
function loreState(){if(!S().lore)S().lore={};return S().lore;}
function inspectLore(id,detail=false){const d=loreIndex[id];if(!d)return;loreState()[id]=Math.max(loreState()[id]||0,detail?2:1);save();panel(d.title,`<p>${esc(d.text)}</p>${detail?`<div class="document-body">${esc(d.detail)}</div>`:`<button class="secondary" onclick="inspectLore('${id}',true)">${esc(d.action)}</button>`}<div class="actions"><button class="primary" onclick="closeModal()">주변으로 돌아가기</button></div>`);}
const interactBeforeLore=interact;interact=function(id){if(loreIndex[id]){inspectLore(id);return;}interactBeforeLore(id);};
const notebookBeforeLore=notebook;
notebook=function(){notebookBeforeLore();const entries=Object.entries(loreState());const section=document.createElement('section');section.className='lore-notebook';section.innerHTML=`<h3>주변에서 본 것들</h3><p class="sub">사건 해결과 별개로 발견한 마왕성의 기록입니다.</p><div class="clue-list">${entries.map(([id,depth])=>`<button class="secondary" onclick="inspectLore('${id}',${depth===2})">${loreIndex[id].title}</button>`).join('')||'<p>방의 물건들을 둘러보면 기록이 남습니다.</p>'}</div>`;$('#modal').append(section);};
$('#approval').onclick=notebook;
const renderBeforeLore=render;render=function(){renderBeforeLore();rooms[state.room].spots.forEach((spot,i)=>{if(!loreIndex[spot[5]])return;const button=$('#stage').querySelectorAll('.hotspot')[i];button?.classList.add('lore-target');const rail=$('#scene-targets').children[i];rail?.classList.add('lore-target');if(loreState()[spot[5]]===2){button?.setAttribute('aria-label',spot[0]+' · 살펴본 물건');if(rail){const note=document.createElement('small');note.className='lore-seen';note.textContent='살펴봄';rail.append(note);}}});};
render();

// ===== 08 fixes: 진행 안내 막대·모바일·소지품 정리·성문 =====
// 진행 안내 막대: 현재 할 일, 사건 진행, 힌트를 항상 보이게 한다.
(function(){const bar=document.createElement('div');bar.className='case-bar';bar.innerHTML='<div class="case-steps" id="case-steps"></div><p class="case-objective"><b>지금 할 일</b><span id="case-objective"></span></p><button class="case-hint" id="case-hint" type="button">✧ 막혔나요? 힌트</button>';document.querySelector('.room-head').after(bar);$('#case-hint').onclick=()=>$('#hint').onclick();})();
// 다 쓴 물건: 더 이상 쓸 곳이 없으면 소지품에서 뺀다.
function spentItems(){return {badge:S().drawer,cloth:S().clean,film:S().shadow,polished:S().shadow,lantern:E().ink&&!!S().lamp,packet:E().installed};}
const renderBeforeFixes=render;
render=function(){const spent=spentItems();const before=state.items.length;state.items=state.items.filter(id=>!spent[id]);if(selected&&!owns(selected))selected=null;if(state.items.length!==before)save();renderBeforeFixes();
 $('#case-objective').textContent=$('#objective').textContent;
 const steps=[['hr','통로 복구'],['facility','명판 회수'],['audit','그림자 복원'],['parcel','원본 회수'],['ended','퇴실']];
 const done={hr:has('hr'),facility:has('facility'),audit:has('audit'),parcel:E().parcel,ended:state.ended};
 $('#case-steps').innerHTML=steps.map(([k,l])=>`<span class="${done[k]?'done':''}">${done[k]?'✓ ':''}${l}</span>`).join('');
};
// 성문 자체도 조사할 수 있게 한다.
const interactBeforeFixes=interact;
interact=function(id){if(id==='door'){panel('성문',`<p>${state.ended?'문은 열려 있다. 밤바람이 들어온다.':'붉은 문은 손잡이째 굳게 잠겨 있다. 오른쪽 작업대의 필름 판독기가 그림자와 원본 인영을 대조해야 열린다고 적혀 있다.'}</p><div class="actions"><button class="primary" onclick="interact('terminal')">필름 판독기 살펴보기</button></div>`);return;}interactBeforeFixes(id);};
// 터치 기기: 마우스 오버가 없으므로 번호 표시를 기본으로 하고 대상 목록을 보여준다.
if(matchMedia('(hover: none)').matches){explore=false;document.body.classList.remove('exploration-mode');exploreButton.textContent='탐색 표시: 번호';exploreButton.setAttribute('aria-pressed','false');}
render();

// ===== 09 boot =====
if(!state.started)intro();else if(state.ended)ending();
