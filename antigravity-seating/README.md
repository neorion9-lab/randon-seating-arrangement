# 🛸 무중력 자리배치기 (Antigravity Seating)

초등 교실에서 월 1회 자리를 바꿀 때 사용할 수 있는 **'앤티그래비티' 우주 테마의 랜덤 자리바꾸기 프로그램**입니다.
React, Vite, Vanilla CSS를 사용하여 우아하고 화려한 비주얼 효과 및 사운드와 함께 정교한 배치 제약조건을 제공하는 단일 페이지 웹 애플리케이션(SPA)입니다.

---

## ✨ 주요 기능

*   **우주 & 무중력 테마 비주얼:** 3D Starfield(별빛 유영 및 워프) 배경 효과 및 자리 셔플 시 무중력 카드 유영 연출.
*   **Web Audio API 오디오 엔진:** 외부 오디오 소스 없이 브라우저 단독으로 무중력 부유음, 셔플 회전 째깍임, 철컥 고정음, 미래지향적 팡파르를 생생하게 재생.
*   **교실 격자 배치도 편집기 (Layout Editor):** 3x3 ~ 8x8 그리드 크기 조절, 칸별 토글(`책상`, `통로`, `사물함`, `TV`, `창문`), 칠판 위치 설정(상/하/좌/우) 지원.
*   **학생 명단 관리 (Student Manager):** 24명 기본 명단 제공, 엑셀/CSV 데이터 간편 복사 붙여넣기(TSV) 및 파일 업로드 지원.
*   **짝꿍 제약 및 알고리즘 (Seating Engine):** 
    *   `필수 짝꿍 🤝` (옆자리 배치) / `금지 짝꿍 🚫` (이웃 배치 차단)
    *   `고정석 🔒` (특정 자리에 고정 설정) / `결석자 🚫` (대기정거장 제외 배치)
    *   `성별 자동 분배 ♂️♀️` 및 `지난달 짝꿍 중복 방지 🔄` (최대 2,000회 백트래킹 계산).
*   **드래그 앤 드롭 수동 조율:** 배치 후 마우스 드래그를 통해 자유롭게 자리를 맞바꿀 수 있는 물리 탄성 효과 인터랙션.
*   **배치 검증 로그 & 저장:** 배치 통계 및 제약 위배 내역을 터미널 로그로 실시간 모니터링하고 결과 엑셀(CSV) 저장.

---

## 🚀 시작하기 (Local Setup)

로컬 환경에서 개발 서버를 기동하여 즉시 테스트할 수 있습니다.

```bash
# 1. 프로젝트 폴더로 이동
cd antigravity-seating

# 2. 패키지 설치 (최초 1회)
npm install

# 3. 로컬 개발 서버 실행
npm run dev
```
개발 서버가 시작되면 브라우저에서 `http://localhost:5173`으로 접속할 수 있습니다.

---

## 📦 배포 안내 (Deployment Guide)

이 프로젝트는 정적 파일로 빌드되는 Single Page Application(SPA)이므로, 다양한 무료 호스팅 플랫폼에 아주 쉽게 배포할 수 있습니다.

### 1. GitHub Pages 배포 (추천)
현재 연결된 GitHub 저장소를 통해 바로 웹페이지를 무료로 호스팅할 수 있습니다.

**방법 A: GitHub Actions 자동 배포 (가장 편리)**
1. GitHub 저장소 페이지로 이동합니다.
2. **Settings** -> **Pages** 메뉴로 이동합니다.
3. **Build and deployment** 항목의 **Source**를 `GitHub Actions`로 변경합니다.
4. `.github/workflows/deploy.yml` 파일을 작성하여 푸시하면 커밋할 때마다 자동으로 배포가 진행됩니다.

**방법 B: `gh-pages` 라이브러리를 활용한 수동 배포**
1. 프로젝트 폴더로 이동하여 `gh-pages` 배포 라이브러리를 설치합니다.
   ```bash
   npm install --save-dev gh-pages
   ```
2. `vite.config.js` 파일에 저장소 경로 지정을 위해 `base` 설정을 추가합니다. (예: `base: '/randon-seating-arrangement/',`)
3. `package.json`의 `scripts` 항목에 아래 두 행을 추가합니다:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -dist dist"
   ```
4. 터미널에서 다음 명령어를 실행하면 빌드 및 배포가 진행됩니다:
   ```bash
   npm run deploy
   ```

---

### 2. Vercel 배포 (1분 초간단 배포)
가장 빠르게 빌드 및 배포할 수 있는 무료 클라우드 플랫폼입니다.

1. [Vercel](https://vercel.com/)에 접속하여 가입 후 GitHub 계정을 연동합니다.
2. **Add New** -> **Project**를 클릭합니다.
3. 내 GitHub 저장소 목록 중 `randon-seating-arrangement`를 찾아 **Import**를 누릅니다.
4. **Framework Preset**이 `Vite`로 자동 감지되는지 확인합니다.
5. **Deploy** 버튼을 누르면 약 30초 내에 전 세계에서 접속 가능한 고유 도메인(예: `antigravity-seating.vercel.app`)으로 무료 배포됩니다.

---

### 3. Netlify 배포
Vercel과 유사한 초간단 빌드 호스팅 플랫폼입니다.

1. [Netlify](https://www.netlify.com/)에 가입 및 로그인 후 GitHub 계정을 연결합니다.
2. **Add new site** -> **Import an existing project**를 선택합니다.
3. GitHub 저장소 중 `randon-seating-arrangement`를 선택합니다.
4. 빌드 명령어(`npm run build`)와 배포 디렉토리(`dist`)가 올바르게 세팅되었는지 확인 후 **Deploy site**를 누릅니다.
