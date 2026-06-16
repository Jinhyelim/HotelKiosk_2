# J Hotel 무인 키오스크 시스템

> 호텔 고객의 비대면 서비스 이용을 위한 무인 키오스크 + 관리자 웹 통합 시스템

---

## 프로젝트 개요

체크인부터 예약, 결제, 호텔 내부 관리까지 통합한 무인 키오스크 시스템입니다.  
프런트 데스크 업무를 자동화하여 고객 대기 시간을 줄이고, 관리자는 실시간으로 객실·예약·재고 현황을 관리할 수 있습니다.

**팀원**: 박재경 · 손민정 · 진혜림 · 한정수  
**개발 기간**: 2026년 4월 ~

---

## 주요 기능

### 고객용 키오스크

- 예약번호로 예약 조회 및 체크인
- 숙박 기간·인원 기반 객실 실시간 조회 및 현장 예약
- 숙박 연장 (동일 객실 또는 다른 객실 조회 안내)
- 부가 서비스(옵션) 선택
- Toss Payments 연동 결제 (카드 / 간편결제)
- 포인트 조회·적립·사용
- 예약 완료 시 SMS 발송 (Solapi)
- AI 챗봇 — 호텔 정책 문서(PDF) 기반 RAG + 음성 인식(Web Speech API) 웨이크 워드 연동
- 세션 타임아웃 시 자동 복귀 및 개인정보 즉시 삭제

### 관리자 웹

| 권한 | 기능 |
|------|------|
| 공통 (일반·최고) | 대시보드, 객실 관리, 예약 관리, 고객 및 포인트 관리, 재고 조회·등록·수정 |
| 최고 관리자 전용 | 요금 정책 관리, 매출·객실·옵션 통계, 관리자 계정 관리, 재고 경고 알림 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Language | Java 21 |
| Framework | Spring Boot 4.0.5 |
| Template | Thymeleaf |
| ORM | MyBatis |
| Security | Spring Security |
| DB (Main) | MariaDB |
| DB (Vector) | PostgreSQL + pgvector |
| Cache | Redis |
| AI | Spring AI 2.0.0-M4, OpenAI GPT-4o-mini, text-embedding-3-small |
| 결제 | Toss Payments |
| SMS | Solapi SDK |
| API 문서 | Swagger (springdoc-openapi 3.0.2) |
| Build | Gradle |

---

## 시스템 아키텍처

```
[ Client ]
  ├─ 고객 키오스크  : HTML/CSS/JS + Axios + Web Speech API
  └─ 관리자 웹      : Thymeleaf MVC + Chart.js

[ Server ]
  Spring Boot
  ├─ Spring Security (인증·권한)
  ├─ MyBatis (DB 연동)
  ├─ Spring AI — RAG 파이프라인 (PDF → pgvector → GPT-4o-mini)
  └─ REST API (Swagger 문서화)

[ Data / External ]
  MariaDB ─ 메인 데이터
  PostgreSQL (pgvector) ─ AI 문서 벡터
  Redis ─ 이메일 인증번호 TTL 관리
  Toss Payments API
  Solapi SMS API
```

---

## DB 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `admin` | 관리자 계정 (SUPER / GENERAL 등급) |
| `members` | 호텔 이용 고객 정보 |
| `members_point` | 포인트 적립·사용 내역 |
| `room_master` | 객실 정보 (정적 사양) |
| `room_status` | 실시간 객실 상태 |
| `option_master` | 부가 서비스 옵션 목록 |
| `reservations` | 예약 정보 (과거·현재·미래) |
| `options_record` | 예약별 선택 옵션 상세 |
| `payments` | 결제 정보 |
| `pricing_policy` | 요금 정책 (시즌·요일 차등) |
| `pricing_policy_room` | 정책별 객실 적용 요금 |
| `stocks` | 소모품 재고 |
| `inform_board` | 호텔 공지 게시판 |

---

## 빠른 시작

### 사전 준비

- Java 21
- Docker
- MariaDB
- PostgreSQL (pgvector 확장)
- `.env` 파일 설정 (아래 참고)

### 환경 변수 설정 (`.env`)

프로젝트 루트에 `.env` 파일을 생성하고 아래 항목을 채웁니다.

```
DATA_SOURCE_USER_NAME=<MariaDB 사용자명>
DATA_SOURCE_PASSWORD=<MariaDB 비밀번호>

MAIL_USERNAME=<발신 이메일 (네이버 SMTP)>
MAIL_PASSWORD=<이메일 비밀번호>

TOSS_CLIENT_KEY=<Toss 위젯 클라이언트 키>
TOSS_SECRET_KEY=<Toss 시크릿 키>

SMS_API_KEY=<Solapi API Key>
SMS_API_SECRET=<Solapi API Secret>
SMS_API_PHONE=<발신 전화번호>

OPENAI_API_KEY=<OpenAI API Key>

PG_VECTOR_PASSWORD=<PostgreSQL 비밀번호>
```

### 실행 순서

```bash
# 1. DB 초기화 (MariaDB)
#    src/main/resources/sql/DBInit.sql 실행

# 2. Redis 실행
docker-compose up -d

# 3. Spring Boot 실행
./gradlew bootRun

# 4. 종료 후 Redis 중지 (선택)
docker-compose down
```

---

## API 문서

애플리케이션 실행 후 아래 주소에서 Swagger UI를 확인할 수 있습니다.

```
http://localhost:8080/swagger-ui/index.html?urls.primaryName=REST+API
```

---

## GitHub

[https://github.com/skla8590/HotelKiosk_2](https://github.com/skla8590/HotelKiosk_2)
