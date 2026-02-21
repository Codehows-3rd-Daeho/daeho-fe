# 대호 I&T 사내 협업 플랫폼 — 프론트엔드

이슈 관리, 회의 일정, 녹음 기반 회의록 자동화를 하나의 화면에서 처리하는 사내 협업 플랫폼의 React 클라이언트입니다.

---

## 기술 스택

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI_v7-007FFF?style=flat-square&logo=mui&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-FF6C37?style=flat-square&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)

---

## 주요 기능

### 이슈 & 회의 관리
이슈와 회의를 CRUD로 관리한다. 회의는 특정 이슈에 연결할 수 있으며, 회의 일정표 화면에서 캘린더 뷰로 전체 일정을 조망할 수 있다.

### 회의 녹음 & STT 자동화
브라우저 마이크로 녹음한 오디오를 청크 단위로 서버에 업로드하고, 백엔드 STT 파이프라인(인코딩 → 변환 → 요약)의 진행 상황을 WebSocket으로 실시간 수신해 화면에 표시한다.

### 크로스 브라우저 웹 푸시 알림
PWA로 제공되며 VAPID 기반 Web Push API를 통해 이슈·회의 등록 시 실시간 알림을 수신한다. Safari(APNs)와 Chrome/Edge(FCM) 모두 지원한다.

### 변경 이력 조회
이슈·회의 상세 페이지의 로그 탭과 관리자 로그 화면에서 필드 단위 변경 이력을 확인할 수 있다. 백엔드에서 JSON으로 저장된 이력(`{"type":"UPDATE","field":"상태","before":"IN_PROGRESS","after":"COMPLETED"}`)을 `formatLogMessage()`로 파싱해 한국어 텍스트로 렌더링한다.

---

## Getting Started

### 사전 요구사항

- Node.js 20+
- 백엔드 서버 실행 중 (`http://localhost:8080`)
- HTTPS 인증서 (Web Push 구독과 마이크 권한은 HTTPS 환경 필요)

### HTTPS 로컬 인증서 발급 (최초 1회)

```bash
choco install mkcert   # Windows (Homebrew의 경우: brew install mkcert)
mkcert -install
mkcert localhost
# localhost.pem, localhost-key.pem 생성됨
```

`vite.config.ts`에 아래 내용이 이미 포함되어 있다.

```ts
import fs from 'fs'

server: {
  https: {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem'),
  },
  host: 'localhost',
  port: 5173,
}
```

### 설치 및 실행

```bash
npm install
npm run dev
# https://localhost:5173
```

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

---

## 프로젝트 구조

```
src/
├── admin/          # 관리자 — 회원 관리, 로그 조회, 설정
├── common/         # axios 인스턴스, 공통 유틸 (formatLogMessage 등)
├── dashboard/      # 대시보드
├── issue/          # 이슈 목록, 상세, 등록/수정, 로그 탭
├── meeting/        # 회의 목록, 상세, 등록/수정, 로그 탭
├── calendar/       # 회의 일정표 (캘린더 뷰)
├── stt/            # 녹음 UI, STT 진행 상태 표시
├── notification/   # 알림 목록
├── mywork/         # 나의 업무
├── webpush/        # Web Push 구독 훅
└── store/          # Zustand 전역 상태
```
