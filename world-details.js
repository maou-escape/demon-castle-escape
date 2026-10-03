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
