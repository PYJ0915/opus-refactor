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

## 🔨 리팩토링 목표

> 팀 프로젝트에서 아쉬웠던 부분을 개선하고, 더 나은 코드 구조와 사용자 경험을 만드는 것을 목표로 합니다.

- [ ] <!-- 리팩토링 목표 1 -->
- [ ] <!-- 리팩토링 목표 2 -->
- [ ] <!-- 리팩토링 목표 3 -->

## ✅ 개선 사항

| 분류 | 기존 | 개선 |
|------|------|------|
| <!-- 분류 --> | <!-- 기존 방식 --> | <!-- 개선 방식 --> |

---

## ⚙️ 기술 스택

<div align="center">

| 분류 | 기술 |
|:---:|:---|
| **🖥 Front-end** | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) |
| **🛠 Back-end** | ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white) ![MyBatis](https://img.shields.io/badge/MyBatis-DC382D?style=for-the-badge&logo=databricks&logoColor=white) ![Oracle](https://img.shields.io/badge/Oracle_DB-F80000?style=for-the-badge&logo=oracle&logoColor=white) ![Tomcat](https://img.shields.io/badge/Apache_Tomcat-F8DC75?style=for-the-badge&logo=apachetomcat&logoColor=black) |
| **🚀 Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white) |
| **☁️ External API** | ![KOPIS](https://img.shields.io/badge/KOPIS_Open_API-0066CC?style=for-the-badge&logoColor=white) ![Toss](https://img.shields.io/badge/Toss_Payments-0064FF?style=for-the-badge&logo=tosspayments&logoColor=white) ![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white) |

</div>

---

## 🗂️ 담당 기능

### 🛍️ Selections — 기념품 굿즈
- 공연·전시 관련 굿즈 목록 제공
- 장바구니, 옵션 선택, 수량 조절
- 토스 페이먼츠 결제 API 연동
- 배송 조회, 교환/반품 정보 확인

### 🔔 알림 & AI 챗봇
- 주문/배송 상태 실시간 알림
- ChatGPT(GPT-4o-mini) 기반 AI 상담 챗봇 — 전시·공연 추천 및 서비스 안내

### 👤 마이페이지
- 주문 내역 조회

### 🔧 관리자 페이지
- 상품(굿즈) 등록·수정·삭제
- 배송 상태 관리

---

## 🛠️ 트러블슈팅

- **장바구니 새로고침 시 수량 두 배 오류**
  - 원인: 병합 로직이 컴포넌트 재마운트마다 반복 실행
  - 해결: Zustand Store 전역 상태에서 `hasMerged` 플래그 관리, 로그인 시 1회만 병합

- **`useGeneratedKeys`와 시퀀스 동시 사용 시 PK NULL 문제**
  - 원인: Oracle 시퀀스는 SQL 내부에서 실행되어 JDBC가 PK 값을 인식 못함
  - 해결: `useGeneratedKeys` 대신 `<selectKey>`로 INSERT 전에 시퀀스 값 조회

---

## 📅 개발 기간

| 단계 | 내용 | 기간 |
|------|------|------|
| 기획·설계 | 프로젝트 주제, 요구사항 정의, DB 설계 | 2026.01.23 ~ 01.26 |
| 개발 | 프론트엔드·백엔드 기능 구현 | 2026.01.27 ~ 02.26 |
| 배포 | AWS 배포 및 최종 점검 | 2026.02 말 |
| **리팩토링** | **개인 브랜치 코드 개선** | **2026.__ ~ 진행 중** |

---

## 📁 프로젝트 구조

```
OPUS
├── Front-end (React + Vite)
│   ├── On-Stage        # 전시·공연 탐색
│   ├── Proposals       # 게시판
│   ├── Unveiling       # 경매
│   └── Selections      # 굿즈
└── Back-end (Spring Boot + Oracle)
    ├── Member          # 회원 관리
    ├── Stage           # 전시·공연 API 연동
    ├── Unveiling       # 경매 도메인
    ├── Goods           # 굿즈·주문·결제
    └── Admin           # 관리자
```

---

<p align="center">
  <b>OPUS</b> — Opening Perspective, Unveiling Scene
</p>
