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
 shelf:['고정 장식과 책등 끝의 문양을 비교하세요.','달에서 출발해 이웃 문양이 같은 책을 이어놓으세요. 두 권을 선택하면 교환됩니다.','보안 → 시설 → 급식 → 퇴근 회의 순서로 놓고 책을 안쪽으로 미세요.'],
 plate:['문양은 아홉 개지만 대조판 구멍은 세 개입니다. 두 판의 모서리를 비교하세요.','명판을 천으로 닦고, 기록실 서가의 투명판과 겹치세요.','투명판 모서리를 오른쪽 위로 맞춥니다. 손에 든 판에서는 열쇠·태양·왕관이 보입니다. 거울에서는 같은 순서일까요?'],
 mirror:['명판만으로는 문양이 너무 많습니다. 기록실 작업대가 필요합니다.','명판과 투명판을 겹쳐 모서리를 맞춘 뒤 닦은 명판을 거울에 사용하세요.','거울의 위쪽 행부터 읽으면 열쇠 → 왕관 → 태양입니다. 입력 후 이름을 부르세요.'],
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
