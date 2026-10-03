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
function cleaningPanel(){if(S().clean){inspectItem('polished');return;}if(!owns('plate')||!owns('cloth'))return;panel('명판 닦기',`<p>광택 천을 명판에 댔다. 문양 위의 검댕을 문질러 닦아보자.</p><div id="cleaning-board" aria-label="천으로 닦을 명판">${face.map((id,i)=>`<button data-wipe="${i}" class="soot-cell ${P().wiped.includes(i)?'wiped':''}" onclick="wipeCell(${i})" aria-label="${i+1}번 칸 ${P().wiped.includes(i)?'닦음':'닦기'}"><span>${glyphs[id]}</span><small>${names[id]}</small></button>`).join('')}</div><p class="sub">마우스·손가락으로 문지르거나, 칸을 클릭하세요. 키보드는 Tab과 Enter를 사용합니다.</p><p id="cleaning-progress" role="status">${P().wiped.length} / 9칸의 문양이 드러났다.</p>`);}
function wipeCell(i){if(S().clean||!owns('plate')||!owns('cloth')||P().wiped.includes(i))return;P().wiped.push(i);save();const cell=document.querySelector(`[data-wipe="${i}"]`);if(cell){cell.classList.add('wiped');cell.setAttribute('aria-label',`${i+1}번 칸 닦음`);}const progress=$('#cleaning-progress');if(progress)progress.textContent=`${P().wiped.length} / 9칸의 문양이 드러났다.`;if(P().wiped.length===9){remove('plate');S().clean=true;grant('polished');discover('plate');eventPanel('명판이 제 모습을 드러냈다','천이 새까맣게 변했다. 금속판에는 아홉 문양과 비스듬히 잘린 모서리가 남아 있다.');}}
document.addEventListener('pointerdown',e=>{const cell=e.target.closest('[data-wipe]');if(cell)wipeCell(Number(cell.dataset.wipe));});
document.addEventListener('pointermove',e=>{if(!e.buttons||!$('#cleaning-board'))return;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-wipe]');if(cell)wipeCell(Number(cell.dataset.wipe));});
const returnBeforePolish=returnToProblem;
returnToProblem=function(){if((documentOrigin||currentView)?.title==='명판 닦기'){documentOrigin=null;currentDocument=null;cleaningPanel();return;}returnBeforePolish();};
problemHints.clean=['검댕 아래의 명판을 읽으려면 표면부터 닦아야 합니다.','인사부 비품 서랍의 광택 천과 그을린 명판을 조합해보세요.','광택 천과 명판을 조합한 뒤 아홉 칸을 문지르거나 클릭하면 됩니다.'];

// Keep evidence, remove accidental solution paragraphs from ordinary documents.
docs.route=['접힌 복도의 정비도','시설부 연결관은 왼쪽 위에서 들어와 오른쪽 아래로 나간다.\n회전축 규격: 황동 사각형. 창문 비품과 동일 규격.\n조각의 열린 끝이 맞닿아야 통과할 수 있다. 사용하지 않는 복도는 연결하지 않아도 된다.\n작업 후에는 반드시 입구의 빛으로 연결 상태를 확인할 것.'];
docs.cooling=['냉각 보관 기록','만년빙 시험 결과\n금속 조각: 차가워짐.\n발광 시료: 온도는 내려갔지만 빛은 그대로 남음.\n용기 형태: 변화 없음.\n보관함 손잡이의 성에는 일반적인 얼음과 동일한 성질을 보인다.'];
docs.ink=['빛에 드러난 운송장','내용물: 그림자 감광 필름 원본.\n시험편 사고: 물에 젖은 필름은 인영이 번졌다. 뜨거워진 필름은 수축했다. 빛에 노출된 필름은 하얗게 날아갔다.\n방습·차광 케이스 파손. 이번 운송에는 보호 기능이 없다.'];
itemDetails.badge=['사진 대신 빈 실루엣. 인사부 발급 임시 사원증이다.','뒷면 아래에 얇은 금속 접점이 있다. 닳은 자국이 일정한 간격으로 나 있다.'];
itemDetails.crank=['끝이 사각형인 황동 손잡이.','축에 작은 사각형 규격 표식이 있다.'];

// Notebook records observations, not automatically generated answers.
notebook=function(){panel('조사 수첩',`<div class="notebook-history"><h3>내가 바꾼 것들</h3>${P().journal.length?`<ol>${P().journal.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>`:'<p>아직 기록된 변화가 없다.</p>'}</div><h3>발견한 자료</h3><div class="clue-list">${S().clues.map(id=>`<button class="secondary" onclick="readDoc('${id}')">${docs[id][0]}${S().pin===id?' · 고정됨':''}</button>`).join('')||'<p>읽은 자료가 여기에 남습니다.</p>'}</div><label for="personal-notes">내 메모</label><textarea id="personal-notes" rows="4" oninput="S().notes=this.value;save()">${esc(S().notes)}</textarea>`);};
$('#approval').onclick=notebook;
const previousHelp=$('#help').onclick;
$('#help').onclick=()=>{previousHelp();const note=document.createElement('p');note.className='sub';note.textContent='탐색 표시를 바꾸면 조사 번호를 숨길 수 있습니다. 해결한 대상에는 ✓와 결과가 남습니다. 수첩에서 지금까지 바꾼 것들을 확인하세요.';$('#modal').append(note);};
// The original focus loop only handled buttons. Replace it for all modal controls.
document.addEventListener('keydown',e=>{if(e.key!=='Tab'||$('#overlay').classList.contains('hidden'))return;const nodes=[...$('#modal').querySelectorAll('button:not(:disabled),select:not(:disabled),textarea:not(:disabled),input:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}e.stopImmediatePropagation();},true);
P();render();save();
