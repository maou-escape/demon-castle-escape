// Presentation only. Puzzle state and saved progress stay in story.js / episode.js.
for(const id of ['hr','facility','audit','exit','archive','mail']){
 rooms[id].art=()=>`<img class="scene-art" src="assets/${id}-anime.png" alt="${rooms[id].title} — 애니메이션풍 야간 사무실">`;
}
rooms.hr.spots=[['조직도',5,8,23,34,'org'],['뼈 대리',58,27,17,25,'skeleton'],['불씨 양초',6,40,8,17,'candle'],['사고 접수철',82,8,15,26,'rules'],['개인 비품 서랍',41,57,23,25,'drawer']];
rooms.facility.spots=[['만년빙 보관함',2,10,21,65,'ice'],['미믹 주임',27,30,22,27,'mimic'],['반려 식단',43,17,9,20,'diet']];
rooms.audit.spots=[['관리 기록',3,14,11,24,'registration'],['이름 반사경',24,4,15,70,'mirror'],['창문 손잡이',80,41,10,10,'window']];
rooms.exit.spots=[['차광막 기어함',21,38,6,14,'blind'],['인영 필름 판독기',68,55,29,27,'terminal'],['판독 일지',85,66,13,14,'light']];
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
