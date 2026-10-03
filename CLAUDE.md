# 마왕성 퇴근 심사 · 작업 안내 (Claude Code용)

1인용 방탈출 웹게임. 빌드 과정 없는 정적 사이트이며 GitHub Pages로 배포한다.

- 저장소: https://github.com/maou-escape/demon-castle-escape
- 플레이 주소: https://maou-escape.github.io/demon-castle-escape/
- 배포: `main` 브랜치에 push하면 1~2분 뒤 Pages에 자동 반영된다.

## 개인정보 규칙 (반드시 지킬 것)

- 커밋 작성자 이메일은 noreply 주소만 쓴다. 이 저장소에서 처음 작업할 때 아래를 실행한다.
  ```
  git config user.name "nohchann3607-del"
  git config user.email "302767362+nohchann3607-del@users.noreply.github.com"
  ```
- 실명, 직장명, 개인 gmail 주소를 코드·문서·커밋 메시지에 넣지 않는다.
- 플레이 주소에 개인 계정명이 드러나지 않도록 저장소는 `maou-escape` 조직에 둔다.

## 파일 구성

| 경로 | 내용 |
| --- | --- |
| `index.html` | 화면 뼈대. 스크립트는 `game.js` 하나만 불러온다 |
| `game.js` | 게임 전체 로직 |
| `story.css` `office.css` `cinematic.css` `design-upgrade.css` `anime.css` | 이 순서로 덮어쓰는 스타일. 새 스타일은 `anime.css` 끝에 추가 |
| `assets/*.webp` | 방 배경 6장 (1672×941, WebP 품질 82) |
| `docs/` | 제작 기록. 게임 실행에는 쓰이지 않음 |
| `tools/playtest.js` | 처음부터 엔딩까지 자동 플레이 테스트 |

## game.js 구조

예전 버전 위에 기능을 덧씌워 온 구조라, 같은 함수(`render`, `interact`, `panel`, `useItem` 등)를 뒤쪽 섹션이 감싸서 재정의한다. 섹션 순서가 곧 실행 순서다.

| 섹션 | 내용 |
| --- | --- |
| 00 core | 공용 상태, 모달, 기본 렌더 |
| 01 story | 사건 문서, 소지품, 접힌 복도·서가·명판·반사경 퍼즐 |
| 02 episode | 수발실, 필름 판독기, 장치별 3단계 힌트(`problemHints`) |
| 03 visual | 배전함 교차 스위치, 관송관 경로 |
| 04 art | 배경 그림과 조사 지점 좌표 (`rooms.*.spots`, 단위 %) |
| 05 polish | 진행 기록, 명판 닦기, 조사 수첩 |
| 06 audio | 합성 BGM·효과음 |
| 07 world | 퍼즐과 무관한 주변 조사 24곳 |
| 08 fixes | 진행 안내 막대, 다 쓴 물건 정리, 성문, 터치 기기 처리 |
| 09 boot | 시작 |

수정 원칙:
- 기존 함수를 고칠 때는 그 함수가 처음 정의된 섹션을 직접 고친다. 새 래퍼를 계속 쌓지 않는다.
- 저장 키는 `demon-office-objects-v4`. 저장 데이터 형태를 바꾸면 이전 저장도 열리는지 확인한다.
- 퍼즐 정답을 바꾸면 해당 `problemHints` 3단계와 관련 `docs` 문구도 함께 고친다.

## 퍼즐과 정답 (스포일러)

| 장치 | 정답 |
| --- | --- |
| 개인 비품 서랍 | 사원증 사용 → 광택 천, 휴대등 |
| 접힌 복도 | 감사부 창문 손잡이 사용 후 1→2→5→4→7→8→9 연결 |
| 만년빙 / 미믹 | 양초로 해동 → 얼음 획득 → 양초+얼음 조합 → 미믹에게 차가운 불꽃 |
| 명판 닦기 | 상하좌우 반전 퍼즐. 네 모서리 + 가운데 |
| 반납 서가 | 6권 중 5권. 보안(뒤집기)→급식→야근(뒤집기)→시설(뒤집기)→퇴근(뒤집기), 감사 회의는 카트 |
| 판독 작업대 | 투명판+닦은 명판, 투명판 모서리 오른쪽 위(rotation 1) |
| 이름 반사경 | 거울은 좌우 반전. 열쇠→왕관→태양 |
| 빈 운송장 | 휴대등 사용 |
| 배전함 | Ⅰ 교차, Ⅱ 직결, Ⅲ 교차, Ⅳ 교차 |
| 관송관 | 발송함→하층관→중앙 우회관→암실 옆→회수함 |
| 차광막 | 서가에서 얻은 톱니 사용 후 닫기 |
| 필름 판독기 | 원본 봉투·휴대등 사용, A 90°, B 270°, C 180° |

## 검증

사용자는 토큰 절약을 위해 검증을 직접 하는 것을 선호한다. 큰 수정 뒤에만, 요청받았을 때 아래를 실행한다.

```
python3 -m http.server 8766        # 다른 터미널에서
npm i -D playwright && npx playwright install chromium   # 처음 한 번
node tools/playtest.js
```

브라우저 자동화(Claude in Chrome)를 쓸 때는 스크린샷과 페이지 전체 읽기를 줄이고, 필요한 요소만 찾아 읽는다.

## 다음 게임

같은 조직(`maou-escape`)에 새 저장소로 만들고 Pages를 켠다. 주소는 `https://maou-escape.github.io/<저장소명>/`이 된다.
