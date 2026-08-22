# METAGATE DTTC 웹사이트

국내 최초 군 특화 드론 시뮬레이션 교육 플랫폼 **DTTC(Defense Technology Training Center)**의 공식 웹사이트입니다. 본 사이트는 `DTTC_웹사이트_서비스_기획서_v1.0`을 기반으로 제작되었습니다.

## 파일 구조

```
dttc-website/
├── index.html            # 홈 (히어로, 실적, 서비스, 트러스트, CTA)
├── about.html            # DTTC 소개 (미션, 운영구조, 기술스택, 기관 소개, MOU)
├── courses.html          # 교육 과정 목록 (6개 정규 과정 + 필터)
├── unit-training.html    # 부대 위탁교육 (온라인 이론 + 주둔지 방문 실기 이중 트랙)
├── course-detail.html    # 과정 상세 (DTTC-TAC 예시, 커리큘럼·일정·교관)
├── simulator.html        # 시뮬레이터 데모 (Three.js 6단계 FSM + 플랫폼 안내)
├── references.html       # 실적·레퍼런스 (교육 실적, MOU, 언론 보도, 후기)
├── contact.html          # 교육 신청 폼 (Formspree 연동 코드 포함)
├── resources.html        # 자료실 (브로셔, 개인정보처리방침, 이용약관)
├── css/
│   └── styles.css        # 브랜드 스타일시트 (네이비 #0D2A5C / 오렌지 #E85D1B)
└── js/
    ├── common.js         # 공통 스크립트 (네비, 카운터, 쿠키 배너, 필터)
    └── simulator.js      # Three.js 드론 시뮬레이터 엔진
```

## 즉시 실행 방법

### 1) 로컬 실행

```bash
# 프로젝트 폴더로 이동 후
python3 -m http.server 8080
# 또는
npx serve .
```

브라우저에서 `http://localhost:8080` 접속.

### 2) Vercel 배포 (기획서 권장 방식)

```bash
# 1. GitHub 저장소 생성 후 이 폴더를 푸시
git init && git add . && git commit -m "Initial DTTC site"
git remote add origin https://github.com/[user]/dttc-website.git
git push -u origin main

# 2. https://vercel.com 에서 "Import Project" → GitHub 저장소 선택
# 3. Framework: "Other" 선택 → Deploy
# 4. Project Settings → Domains → dttc.metagate.net 연결
```

정적 HTML/CSS/JS 사이트이므로 빌드 단계가 필요 없습니다. 즉시 배포됩니다.

### 3) 도메인 연결 (dttc.metagate.net)

이 사이트는 기본 도메인으로 `dttc.metagate.net`(서브도메인)을 사용합니다. metagate.net 도메인 관리 페이지(가비아·후이즈·카페24 등)에서 다음 DNS 레코드를 추가하세요.

| 호스트 | 타입 | 값 | TTL |
|---|---|---|---|
| `dttc` | CNAME | `cname.vercel-dns.com` | 3600 |

Vercel Dashboard → Project → Settings → Domains에서 `dttc.metagate.net`을 추가하면, DNS 전파 완료 후(10~30분) HTTPS 인증서가 자동 발급됩니다.

**향후 확장**: `dttc.kr`을 추가 등록하신 경우, `dttc.kr` → `dttc.metagate.net`으로 301 리다이렉트를 설정하시면 짧은 URL도 동시에 활용할 수 있습니다.

## 반드시 바꿔야 하는 플레이스홀더

배포 전 다음 값을 실제 정보로 교체해 주세요.

### Formspree 연동 (교육 신청 폼)
**파일: `contact.html`, `unit-training.html`** — 두 파일 모두 동일하게 교체해야 합니다.

```html
<form id="apply-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

1. https://formspree.io 에서 무료 가입
2. 새 폼을 생성하고 엔드포인트 URL 복사
3. `YOUR_FORM_ID`를 발급받은 ID로 교체
4. 테스트 제출 1회 후 확인 이메일로 승인

승인 전까지 폼은 **테스트 모드**(콘솔 로그)로 동작합니다.

### 연락처/회사 정보 (전체 페이지 푸터)
- 이메일: `contact@metagate.net` — 실제 수신 가능한 이메일로 교체 (기본값으로 metagate.net 도메인 사용)
- 전화: `02-0000-0000` — 실 전화번호로 교체
- 사업자 등록번호: `000-00-00000` — 실제 번호로 교체

### Google Analytics (선택)
홈페이지 공개 시 GA4 스크립트를 `<head>`에 추가하세요. 쿠키 배너는 이미 구현되어 있습니다.

## 기획서 체크리스트 대비

| 기획서 항목 | 구현 상태 |
|---|---|
| 홈 히어로 (카피·CTA 2개·MOU 배지) | ✅ |
| KPI 카운터 (3+ / 150+ / 6+ / 120+) | ✅ 스크롤 시 애니메이션 |
| 서비스 카드 3단 그리드 | ✅ |
| MOU 협력 기관 로고 섹션 | ✅ |
| 후기·언론 보도 | ✅ |
| 6개 정규 과정 + 필터 | ✅ |
| 과정 상세 (DTTC-TAC) | ✅ |
| 시뮬레이터 데모 (Three.js 6단계 FSM) | ✅ 이륙→정찰→타격→귀환→착륙→평가 |
| 플랫폼 안내 (클라우드/인트라넷) | ✅ |
| 교육 실적 · MOU · 언론 보도 | ✅ |
| 교육 신청 폼 (Formspree) | ✅ |
| 단체 교육 문의 섹션 | ✅ `#group` 앵커 |
| 개인정보처리방침 / 이용약관 | ✅ |
| 반응형 (데스크톱/태블릿/모바일) | ✅ 720px·900px 브레이크포인트 |
| 쿠키 동의 배너 | ✅ localStorage 저장 |
| 부대 위탁교육 페이지 (온·오프 이중 트랙) | ✅ `unit-training.html` |
| 브랜드 컬러 (네이비·오렌지) | ✅ CSS 변수로 관리 |
| 폰트 (Pretendard + Inter) | ✅ jsDelivr CDN |
| SEO 메타태그 (title/description/OG) | ✅ 페이지별 |


## 부대 위탁교육 페이지 (`unit-training.html`)

군 실무부대를 대상으로 한 위탁교육 전용 랜딩 페이지입니다.

- **이중 트랙 다이어그램** — 온라인 이론 트랙과 주둔지 방문 실기 트랙이 &lsquo;기량 평가&rsquo;에서 합류하는 흐름을 인라인 SVG로 표현 (외부 라이브러리 없음)
- **과정 편성표** — DTTC-UT-B / UT-S / UT-T / UT-I 4개 과정. 정규 과정(BAS·TAC·INS) 커리큘럼을 위탁 형태로 재편성
- **5단계 신청 절차** — `.timeline.timeline-5` 사용
- **부대 준비사항** — 교육장 규격은 국토교통부고시 제2025-185호 별표 4 기준 준용
- **신청 폼** — Formspree AJAX 제출(`contact.html`과 동일 방식) + 우측 실시간 요약 패널 + `내용 복사` / `메일로 보내기` 버튼 (공문·메신저 발송용)
- **FAQ 아코디언** — `<details>` 네이티브 요소 기반

신규 CSS는 `css/styles.css` 하단의 `부대 위탁교육 (unit-training.html)` 블록에 모여 있습니다. 헤더 네비게이션이 8개 항목으로 늘어나면서 1080px 이하 구간의 네비 여백을 축소하는 미디어 쿼리도 같은 블록에 포함되어 있습니다.

### 교체 필요 항목
- Formspree `YOUR_FORM_ID`
- 담당 이메일 `contact@metagate.net`, 전화 `02-0000-0000`
- 정원·시간·교육장 규격 등 운영 수치는 실제 운영 기준으로 최종 확인 필요

## 시뮬레이터 동작 안내

`simulator.html`의 Three.js 데모는 다음과 같이 동작합니다.

- **자동 비행**: 키 입력이 없으면 6개 웨이포인트를 순차 이동하며 자동 진행
- **수동 조작**: `W/A/S/D`(수평) + `Space`(상승) + `Shift`(하강)
- **단계 건너뛰기**: `N` 또는 우측 하단 "다음 단계" 버튼
- **재시작**: `R` 또는 "미션 재시작" 버튼
- **정밀 타격 단계**: 표적 건물에 근접하면 타격 이펙트가 자동 발동

기획서의 "DTTC-DEMO-001 산출물 임베드" 방식이 준비되면, `#sim-canvas` 영역을 `<iframe>`으로 교체만 하면 됩니다.

## 다음 단계 (기획서 Phase 2~3)

- [ ] 실제 촬영 이미지/영상을 `assets/`에 추가 (부대 허가 범위 내)
- [ ] Google Search Console 등록 및 sitemap.xml 제출
- [ ] 네이버 애널리틱스 + GA4 추적 코드 삽입
- [ ] 과정별 상세 페이지 확장 (현재 TAC 1개 → 6개 전체)
- [ ] Notion API 또는 JSON CMS 연동으로 비개발자 콘텐츠 수정
- [ ] Phase 3: 회원 가입/로그인(JWT), 수강 신청 대시보드, 결제

---

© 2026 METAGATE Inc. | Powered by METAGATE | dttc.metagate.net
