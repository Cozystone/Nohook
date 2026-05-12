# Nohook MVP

실제 Google 지도 위에 베트남 관광지 위험 도로를 색상으로 표시하는 `Nohook`
MVP입니다. 초행 관광객이 호객행위, 가짜 택시, 시클로 과다요금, 사진 유도 후
팁 강요 같은 신호를 사전에 확인하는 데 초점을 둡니다.

## 구현 범위

- 실제 Google 지도 기반 도로 오버레이
- 호치민 1군, 하노이 올드쿼터 핵심 구간 좌표 반영
- 도로 상세 패널과 주변 신호 요약
- 익명 신고 폼과 목업 운영 검수 API
- 운영자 검수 프리뷰 페이지 `/admin`

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## Google Maps API 키 설정

프로젝트 루트 `nohook-app` 아래에 `.env.local` 파일을 만들고 아래 값을 넣습니다.

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

키가 없으면 앱은 빌드되지만, 지도 영역에는 안내 메시지만 표시됩니다.

## 배포 메모

- Vercel 환경변수에도 동일하게 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`를 등록해야
  실제 지도가 보입니다.
- 현재 위험도 데이터와 신고 저장은 목업 기반입니다.
- 다음 단계는 Google Places 연동, 영구 DB 저장, 운영자 인증 추가입니다.
