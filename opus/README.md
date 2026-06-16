# 🎭 OPUS
### Opening Perspective, Unveiling Scene

> 작품을 보는 새로운 관점을 열고, 숨겨진 예술의 무대를 드러내다

---

> ⚠️ **본 레포지토리는 팀 프로젝트 OPUS를 개인적으로 리팩토링하는 브랜치입니다.**  
> 원본 팀 프로젝트와 별개로, 코드 품질 개선 및 기능 고도화를 목적으로 운영됩니다.

---

## 📌 프로젝트 소개

**OPUS**는 전시·공연 정보 탐색부터 후기 작성, 굿즈 구매, 미술품 경매까지 하나의 플랫폼에서 경험할 수 있는 **예술 통합 서비스**입니다.

여러 플랫폼에 분산된 전시 및 공연 정보를 통합하고, 전시·공연의 저변 확대와 대중성 확장을 목표로 기획되었습니다.

---

## ⚙️ 기술 스택

<div align="center">

| 분류 | 기술 |
|:---:|:---|
| **🖥 Front-end** | ![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white) ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) |
| **🛠 Back-end** | ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white) ![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white) ![MyBatis](https://img.shields.io/badge/MyBatis-DC382D?style=for-the-badge&logo=databricks&logoColor=white) ![Oracle](https://img.shields.io/badge/Oracle_DB-F80000?style=for-the-badge&logo=oracle&logoColor=white) |
| **🚀 Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white) |
| **☁️ External API** | ![KOPIS](https://img.shields.io/badge/KOPIS_Open_API-0066CC?style=for-the-badge&logoColor=white) ![KCISA](https://img.shields.io/badge/KCISA_Open_API-005BAC?style=for-the-badge&logoColor=white) ![Toss](https://img.shields.io/badge/Toss_Payments-0064FF?style=for-the-badge&logo=tosspayments&logoColor=white) ![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white) ![Google OAuth](https://img.shields.io/badge/Google_OAuth2-4285F4?style=for-the-badge&logo=google&logoColor=white) |
| **💬 Real-time** | ![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white) |

</div>

---

## 🗂️ 담당 기능

### 🛍️ Selections — 기념품 굿즈
- 공연·전시 관련 굿즈 목록 제공 (검색, 필터, 정렬)
- 장바구니, 옵션 선택, 수량 조절
- 토스 페이먼츠 결제 API 연동
- 배송 조회, 교환/반품 정보 확인
- **최근 본 상품** 로컬스토리지 저장 및 표시 _(신규)_
- **카카오톡 소셜 공유** 기능 _(신규)_

### 🎭 On-Stage — 전시·공연 탐색
- KCISA(전시), KOPIS(뮤지컬) Open API 연동
- 썸네일 없는 데이터 필터링 및 플레이스홀더 이미지 처리
- 만료된 전시·공연 **DB 캐싱** → 리뷰 접근 유지 _(신규)_
- **정렬 기능** (기본/가나다/종료 예정/최신 등록순) _(신규)_
- **그리드/리스트 뷰 전환** _(신규)_
- **카드 호버 오버레이** 상세 정보 표시 _(신규)_
- **별점 요약** 카드 표시 _(신규)_
- 전시 **장르 칩 필터** _(신규)_
- 비로그인 접근 허용 + 리뷰 블러 오버레이 _(신규)_

### 🔨 Unveiling — 미술품 경매
- 경매 목록 조회 및 상세 페이지
- 실시간 경매 **WebSocket** 입찰 _(신규)_
- **경매 시작 타이머** (START_DATE 기반 자동 LIVE 전환) _(신규)_
- **경매 알림 신청** / 취소 토글 _(신규)_
- 스케줄러를 통한 낙찰 확정, LIVE 전환, 마감 임박 알림 자동화

### 🔔 알림 & AI 챗봇
- 주문/배송/경매 상태 실시간 알림
- GPT-4o-mini 기반 AI 상담 챗봇
- **AI 전시·공연 추천 패널** _(신규)_

### 👤 마이페이지
- 주문 내역 조회 및 취소
- 찜/좋아요 목록
- 후기 관리 (작성·수정·삭제)
- **기업 회원 콘텐츠 대시보드** (게시글 통계·카테고리 분포) _(신규)_

### 🔧 관리자 페이지
- 상품(굿즈) 등록·수정·삭제 (파일 업로드 방식 개선)
- 배송 상태 관리 및 송장 입력
- 경매 등록 (이미지 직접 업로드 방식으로 개선) _(신규)_
- 경매 상태 강제 전환 (UPCOMING → LIVE → ENDED) _(신규)_
- 신고 후기 처리 / 삭제 후기 복구

### 🔍 통합 검색 _(신규)_
- Selections, Unveiling, Proposals, On-Stage(전시·뮤지컬) 통합 검색
- 헤더 실시간 검색 드롭다운 미리보기
- 검색 결과 페이지

### 🔐 인증·보안
- JWT 기반 인증 (서명 키 고정으로 서버 재시작 후 무효화 방지)
- Google OAuth2 소셜 로그인
- **비밀번호 찾기** (이메일 인증 코드) _(신규)_
- 세션 만료 vs 비로그인 메시지 분기 처리

---

## 🔨 리팩토링 목표 및 완료 현황

### 프론트엔드

- [x] `alert` / `confirm` → toast / 모달로 통일 (FE-01)
- [x] `console.log` / `console.error` 제거 (FE-02)
- [x] `memberNo` @RequestParam 보안 이슈 → JWT 추출 방식으로 변경 (FE-03)
- [x] `ScrollToTop` 중복 렌더링 제거 (FE-04)
- [x] `AuthSuccess.jsx` 리다이렉트 경로 수정 (FE-05)
- [x] 비로그인 On-Stage 접근 시 API 401 오류 → `loginMemberNo` 조건 추가
- [x] 미사용 파일 정리 및 컴포넌트 폴더 재구성

### 백엔드

- [x] 이메일 인증코드 `HashMap` → 인메모리 안전 구조로 교체 (BE-01)
- [x] `GlobalExceptionHandler` + `ApiExceptionHandler` 통합 (BE-02)
- [x] `memberNo` JWT에서 추출 (BE-03)
- [x] `AdminController` DI 방식 `@RequiredArgsConstructor`로 통일 (BE-04)
- [x] `NotificationServiceImpl` 권한 확인 단일 쿼리 최적화 (BE-05)
- [x] 백엔드 반환 타입 구체화 및 HTTP 메서드 정정 (ResponseEntity 명시)
- [x] 쿠키 관련 dead code 제거
- [x] 이메일 전송 비동기(@Async) 분리
- [x] `Review.jsx` 컴포넌트 분리 (리뷰/댓글 구조 개선)

### DB

- [x] `TOTAL_ORDER` 컬럼명 오타 수정 → `RECIPIENT`
- [x] `STAGE_PREFER` / `STAGE_SAVE` 타입 수정 (`STAGE_NO NUMBER → VARCHAR2(30)`)
- [x] `GOODS_OPTION VERSION` 낙관적 락 컬럼 추가
- [x] `UNVEILING.START_DATE` 추가 (경매 자동 시작 기능)
- [x] `UNVEILING.LIVE_ALERT_SENT_FL` 추가 (LIVE 알림 중복 방지)
- [x] `UNVEILING_ALERT` 테이블 생성 (경매 알림 신청)
- [x] `STAGE_CACHE` 테이블 생성 (만료 전시·뮤지컬 캐시)
- [x] `REVIEWS.REVIEW_RATING` 추가 (별점 기능)

### CSS

- [x] `:root` 변수 중복 선언 → `variables.css` 통합 (CSS-01)
- [x] 전역 리셋(`*`, `body`) 중복 제거 (CSS-02)
- [x] `AddressModal.css` ↔ `Checkout.css` 클래스 중복 제거 (CSS-03)
- [x] `App.css` Vite 보일러플레이트 잔존 코드 제거 (CSS-04)
- [x] `.ghost-btn` 중복 통합 (CSS-05)
- [x] `.soldout-badge` / `.soldout-message` 중복 통합 (CSS-06)
- [x] 모달 패턴 공통 베이스 추출 (CSS-07)
- [x] `loadingSpinner.css` 색상 변수 통일 (CSS-08)
- [x] `myPage.css` 불필요한 지역 변수 선언 제거 (CSS-09)
- [x] `@media` 내 `:root` 변경 정리 (CSS-10)

---

## ✅ 개선 사항 요약

| 분류 | 기존 | 개선 |
|------|------|------|
| **인증 메시지** | 비로그인/세션만료 모두 "세션 만료" | 비로그인 → "로그인이 필요합니다" / 만료 → "세션이 만료되었습니다" |
| **이미지 업로드** | URL 직접 입력 방식 | 파일 직접 업로드 (서버 저장) |
| **경매 시작** | 수동 상태 변경 | START_DATE 기반 스케줄러 자동 전환 + 관리자 강제 전환 |
| **만료 전시 접근** | API 실패 시 "잘못된 접근" | DB 캐시 폴백으로 리뷰 접근 유지 |
| **비로그인 On-Stage** | API 401 → 세션 만료 메시지 | 비로그인 조건 분기, 리뷰 블러 오버레이 |
| **토스트 메시지** | 겹침 시 확인 버튼 접근 불가 | dismiss 후 표시, newestOnTop 적용 |
| **CSS 구조** | 파일별 `:root` 중복 선언 | `variables.css` 단일 소스 |
| **JWT 보안** | memberNo 클라이언트 전송 | 서버에서 JWT 파싱으로 추출 |
| **검색** | 없음 | 통합 검색 + 헤더 드롭다운 미리보기 |

---

## 🛠️ 트러블슈팅

### 장바구니 새로고침 시 수량 두 배 오류
- **원인**: 병합 로직이 컴포넌트 재마운트마다 반복 실행
- **해결**: Zustand Store 전역 상태에서 `hasMerged` 플래그 관리, 로그인 시 1회만 병합

### `useGeneratedKeys`와 시퀀스 동시 사용 시 PK NULL 문제
- **원인**: Oracle 시퀀스는 SQL 내부에서 실행되어 JDBC가 PK 값을 인식 못함
- **해결**: `useGeneratedKeys` 대신 `<selectKey>`로 INSERT 전에 시퀀스 값 조회

### 서버 재시작 후 기존 토큰 무효화 문제
- **원인**: `JwtUtil`에서 서버 시작마다 랜덤 서명 키 생성
- **해결**: `application.properties`에 `jwt.secret` 고정값 설정

### 비로그인 On-Stage 접근 시 "세션 만료" 메시지 반복
- **원인**: `ExhibitionList`, `MusicalList`에서 `loginMemberNo` 조건 없이 `/myPage/savedList`, `/myPage/likeList` 호출
- **해결**: `!loginMemberNo` 조건 추가로 비로그인 시 API 호출 차단

### 경매 응찰 중 비밀번호 오류 시 로그아웃 현상
- **원인**: 비밀번호 검증 API 응답 401이 axiosAPI 인터셉터에서 세션 만료로 처리
- **해결**: `/auth/verify-password` 엔드포인트를 인터셉터 예외 목록에 추가

### HeroSlider 이미지 깜빡임 문제
- **원인**: 슬라이더 전환 시 이미지가 재로드되면서 발생
- **해결**: 이미지 preload 처리 및 CSS `object-fit` 통일

### MdPickSlider 중복 key 경고
- **원인**: KCISA API가 동일한 `exhibitionId`를 여러 페이지에 걸쳐 반환
- **해결**: `Map`으로 중복 제거 후 배열로 변환

---

## 📅 개발 기간

| 단계 | 내용 | 기간 |
|------|------|------|
| 기획·설계 | 프로젝트 주제, 요구사항 정의, DB 설계 | 2026.01.23 ~ 01.26 |
| 개발 | 프론트엔드·백엔드 기능 구현 | 2026.01.27 ~ 02.26 |
| 배포 | AWS 배포 및 최종 점검 | 2026.02 말 |
| **리팩토링** | **개인 브랜치 코드 개선 및 기능 고도화** | **2026.06.02 ~ 진행 중** |

---

## 📁 프로젝트 구조

```
OPUS
├── Front-end (React 19 + Vite)
│   ├── pages/
│   │   ├── onStage/       # 전시·공연 탐색 (KCISA, KOPIS API)
│   │   ├── Proposals/     # 게시판
│   │   ├── Unveiling/     # 경매
│   │   ├── selections/    # 굿즈
│   │   ├── mypage/        # 마이페이지
│   │   ├── admin/         # 관리자
│   │   └── footer/        # 약관·FAQ
│   ├── components/
│   │   ├── auth/          # 로그인·회원가입·OAuth2
│   │   ├── common/        # 공통 컴포넌트 (Loading, MetaTags 등)
│   │   ├── reviews/       # 별점 컴포넌트
│   │   └── toast/         # ToastConfig, showConfirm 유틸
│   ├── api/               # axios 인스턴스, 외부 API 유틸
│   ├── store/             # Zustand 스토어
│   └── css/               # 전역 스타일, 변수
└── Back-end (Spring Boot + Oracle)
    ├── member/            # 회원 관리, OAuth2, JWT
    ├── stage/             # 전시·공연 API 연동, 캐시
    ├── reviews/           # 후기, 별점, 댓글
    ├── unveiling/         # 경매 도메인, WebSocket, 스케줄러
    ├── selections/        # 굿즈·주문·결제 (토스페이먼츠)
    ├── board/             # 게시판 (Proposals)
    ├── notification/      # 알림
    ├── chatbot/           # GPT 챗봇
    ├── search/            # 통합 검색
    ├── admin/             # 관리자
    └── scheduler/         # 경매 자동화 스케줄러
```

---

## 🎯 신규 기능 목록

| 기능 | 설명 |
|------|------|
| **후기 별점 시스템** | 5점 별점 작성, 평균 별점 표시, 분포 차트 |
| **비밀번호 찾기** | 이메일 인증 코드 발송 → 새 비밀번호 설정 |
| **경매 알림 신청** | UPCOMING 경매 LIVE 전환 시 알림 수신 신청 |
| **최근 본 상품** | 로컬스토리지 기반 최근 조회 굿즈 표시 |
| **실시간 경매 WebSocket** | STOMP 기반 실시간 입찰가 갱신 |
| **통합 검색** | 헤더 드롭다운 + 전체 검색 결과 페이지 |
| **OG 메타태그** | `react-helmet-async` 동적 메타 태그 |
| **소셜 공유** | 카카오톡, URL 복사 공유 모달 |
| **AI 전시·공연 추천** | GPT-4o-mini 기반 사용자 취향 추천 패널 |
| **기업 회원 대시보드** | 게시글 통계, 카테고리 분포, 최근 게시글 |

---

<p align="center">
  <b>OPUS</b> — Opening Perspective, Unveiling Scene
</p>
