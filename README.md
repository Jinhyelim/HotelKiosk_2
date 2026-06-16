# J Hotel 무인 키오스크 시스템

> 호텔 고객의 비대면 체크인·예약·결제부터 관리자 운영 관리까지 통합한 무인 키오스크 시스템

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [팀원 및 역할](#2-팀원-및-역할)
3. [기술 스택](#3-기술-스택)
4. [시스템 아키텍처](#4-시스템-아키텍처)
5. [주요 기능](#5-주요-기능)
6. [핵심 기술 구현](#6-핵심-기술-구현)
7. [데이터베이스 설계](#7-데이터베이스-설계)
8. [프로젝트 구조](#8-프로젝트-구조)
9. [실행 방법](#9-실행-방법)
10. [API 문서](#10-api-문서)
11. [참조](#11-참조)

---

## 1. 프로젝트 개요

### 개발 배경

최근 호텔 산업은 비대면 서비스 수요 증가, 운영 효율화 필요, 인력 부족 문제에 직면해 있습니다. 기존 프런트 데스크 중심의 체크인·체크아웃 업무 방식은 고객 대기 시간 증가, 직원 과부하, 운영 비용 상승이라는 문제를 야기했습니다. 이에 따라 호텔 운영 전반을 디지털화하고 고객 경험을 개선하기 위한 무인 키오스크 시스템의 필요성이 대두되었습니다.

### 목적

- **고객 편의성 향상** : 예약 조회·체크인·결제까지 모든 절차를 키오스크 하나로 처리, 음성 인식 AI로 접근성 확보, 타임아웃 복귀·개인정보 자동 삭제로 안전한 사용자 경험 제공
- **운영 효율성 강화** : 체크인·예약·결제 자동화로 프런트 데스크 업무 부담 감소, 실시간 객실·재고·예약 현황을 관리자 페이지에서 즉시 확인
- **안정성·보안성 확보** : 결제 오류 및 타임아웃 발생 시 자동 취소·복귀, 비밀번호 BCrypt 암호화, 세션 관리, 데이터 무결성 보장

**개발 기간** : 2026년 4월 ~

---

## 2. 팀원 및 역할

| 이름 | 담당 영역 |
|------|-----------|
| 박재경 | AI 챗봇 (RAG 파이프라인, pgvector), Spring Security (Redis 이메일 인증, 로그인 프로세스), Swagger API 문서화 |
| 손민정 | 현장 예약·숙박 연장 프로세스, Flatpickr 캘린더 연동, 한글·숫자 터치 키보드 구현, 세션 타임아웃·개인정보 보호, Web Speech API 웨이크 워드 |
| 진혜림 | 호텔 공지 안내 화면, 체크인 구현, Toss Payments 결제 연동, 고객 포인트 적립·사용 로직, 테이블 정의서·유스케이스 작성 |
| 한정수 | 관리자 웹 전체 (대시보드, 객실·예약·고객·재고 관리), 통계 시각화 (Chart.js), 관리자 계정 관리 |

---

## 3. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Language | Java | 21 |
| Framework | Spring Boot | 4.0.5 |
| Template Engine | Thymeleaf | - |
| ORM | MyBatis | 4.0.1 |
| Security | Spring Security | - |
| DB (Main) | MariaDB | - |
| DB (Vector) | PostgreSQL + pgvector | - |
| Cache | Redis | 7 |
| AI Framework | Spring AI | 2.0.0-M4 |
| LLM | OpenAI GPT-4o-mini | - |
| Embedding | OpenAI text-embedding-3-small | - |
| STT | OpenAI Whisper-1 | - |
| 결제 | Toss Payments | - |
| SMS | Solapi SDK | 1.0.3 |
| 이메일 | Naver SMTP | - |
| API 문서 | Springdoc OpenAPI (Swagger) | 3.0.2 |
| 객체 매핑 | ModelMapper | 3.2.5 |
| 비동기 통신 | Axios | - |
| 날짜 선택 | Flatpickr | - |
| 한글 입력 | Hangul.js | - |
| Build | Gradle | - |
| Container | Docker + Docker Compose | - |

---

## 4. 시스템 아키텍처

```
┌──────────────────────────────────────────────────────────────────┐
│                          Client Tier                             │
│                                                                  │
│  고객 키오스크                    관리자 웹                        │
│  HTML / CSS / JS                 Thymeleaf MVC                   │
│  Axios (비동기)                  Chart.js (통계 시각화)            │
│  Web Speech API (음성 인식)      Ajax (비동기 조회)                │
│  Flatpickr (날짜 선택)                                            │
│  Hangul.js (터치 키보드)                                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼─────────────────────────────────────┐
│                         Server Tier                              │
│                                                                  │
│  Spring Boot 4.0.5 (Java 21)                                     │
│  ├─ Spring Security   : 관리자 인증·권한 (BCrypt, 세션 관리)       │
│  ├─ MyBatis           : DB 연동 (XML Mapper)                     │
│  ├─ Spring AI (RAG)   : PDF 임베딩 → pgvector 검색 → GPT 응답     │
│  ├─ WebSocket         : 실시간 객실 상태 업데이트                  │
│  └─ REST API          : Swagger 문서화                           │
│                                                                  │
│  [스케줄러]                                                       │
│  WaitingCleanupScheduler : 1분마다 미결제 대기 예약 자동 삭제       │
│  EtlRunner               : 앱 기동 시 hotel_policy.pdf → pgvector │
└──────┬───────────────────────┬───────────────────────────────────┘
       │                       │
┌──────▼──────┐   ┌────────────▼───────────────────────────────────┐
│  Data Tier  │   │              External API                       │
│             │   │                                                 │
│  MariaDB    │   │  Toss Payments  : 카드·간편결제 승인             │
│  (메인 DB)  │   │  Solapi SMS     : 예약·결제 완료 문자 발송       │
│             │   │  OpenAI API     : GPT-4o-mini, Whisper-1        │
│  PostgreSQL │   │  Naver SMTP     : 이메일 인증 발송               │
│  (pgvector) │   │                                                 │
│             │   └─────────────────────────────────────────────────┘
│  Redis      │
│  (인증번호) │
└─────────────┘
```

---

## 5. 주요 기능

### 5-1. 고객용 키오스크

#### 대기 화면 / 메인 화면
- 일정 시간 미조작 시 대기 화면(홍보 이미지 무한 루프)으로 자동 복귀
- 화면 터치 시 메인 화면 진입, 언어 선택(선택사항) 후 서비스 선택

#### 현장 예약
1. 숙박 기간(체크인·체크아웃 날짜) 및 인원 설정 (Flatpickr 캘린더)
2. 조건에 맞는 예약 가능 객실 실시간 조회 (정렬·필터 선택 가능)
3. 원하는 객실 선택 후 부가 서비스 옵션 설정 (수량 개별 조절 가능)
4. 예약자 정보 입력 (터치 키보드 — 한글/숫자 지원)
5. 최종 예약 정보 확인 → 결제 화면 연결
6. 결제 완료 시 SMS 자동 발송 + 신규 고객이면 자동 회원 등록

#### 체크인
- 예약번호 입력 → 예약 정보 조회 및 확인
- 주차 차량 번호 입력 (선택사항)
- 결제 미완료 예약이면 재결제 안내
- 체크인 처리 완료

#### 숙박 연장
1. 예약번호 입력 → 연장 가능 예약 목록 조회
2. 새로운 체크아웃 날짜 선택
3. 연장 가능 기간이면 옵션 선택 후 결제 (체크아웃 날짜 자동 업데이트)
4. 연장 불가능 기간이면 해당 기간 내 다른 객실 안내

#### 결제
- 결제 수단 선택 : **Toss Payments** (카드 / 간편결제) 또는 **현장 카드 결제**
- 포인트 조회 및 사용 (전화번호 + 생년월일로 본인 확인)
- 결제 성공·실패 시 모달 처리
- 결제 완료 후 영수증 출력 선택, SMS 발송
- 결제 경로(현장 예약 / 숙박 연장)에 따라 후처리 자동 분기

#### AI 챗봇
- 호텔 정책 PDF 기반 RAG(Retrieval-Augmented Generation) 응답
- 대화 맥락 기억 (ConversationId 기반 ChatMemory)
- 음성 입력 지원 : Web Speech API 웨이크 워드 감지 → AI 채팅 화면 자동 진입 → OpenAI Whisper STT → GPT 응답
- 질문 기반 연관 질문 4개 자동 추천
- 스트리밍 응답 지원

#### 보안 / UX
- 세션 타임아웃 시 자동 초기 화면 복귀, 개인정보 즉시 삭제
- 터치 전용 환경을 위한 커스텀 한글·숫자 소프트 키보드

---

### 5-2. 관리자 웹

#### 공통 기능 (일반·최고 관리자)
| 메뉴 | 주요 기능 |
|------|-----------|
| 로그인 | BCrypt 인증, 로그인 실패 5회 계정 자동 잠금, 계정 상태별 에러 메시지 분기 |
| 대시보드 | 오늘 체크인·체크아웃·예약 현황 요약, 객실 상태 한눈에 확인 |
| 객실 관리 | 객실 목록 조회, 상태 변경(Available / Occupied / Cleaning / Maintenance), 등록·수정·삭제 |
| 예약 관리 | 예약 목록 페이징 조회, 상태 변경(Reserved / In / Out / Cancelled), 환불 처리 |
| 고객 관리 | 고객 목록 조회, 특정 고객 선택 시 상세 정보 Ajax 비동기 출력, 포인트 조정 |
| 재고 관리 | 소모품 재고 조회·등록·수정, 재고 최소 보유량 기준 상태 표시 (Clear / Shortage / Warning) |

#### 최고 관리자 전용 기능
| 메뉴 | 주요 기능 |
|------|-----------|
| 요금 정책 관리 | 시즌·요일 차등 요금 정책 등록·수정·삭제, 정책별 객실 적용 가격 설정 |
| 통계 | 매출 추이, 객실 가동률, 옵션 선택률 그래프 시각화 (Chart.js) |
| 관리자 계정 관리 | 관리자 등록·수정·상태 변경 (Working / Absence / Leave / Locked) |
| 재고 경고 알림 | 최소 보유량 이하 재고 항목 이메일 알림 발송 |

---

## 6. 핵심 기술 구현

### 6-1. Toss Payments 연동

- `pay.html`에서 Toss Payments 위젯 SDK 직접 로드 (카드·간편결제 제공)
- 결제 요청 시 `successUrl` / `failUrl`로 브라우저 리다이렉트 처리
- `PayService.confirmTossPayment()` : Toss 승인 API(`POST /v1/payments/confirm`) 호출 → Secret Key Base64 인코딩으로 Basic 인증 헤더 생성
- 승인 응답에서 카드 승인 번호(`approveNo`) 추출 → `payments` + `toss_log` 테이블 저장
- `paySource` 파라미터로 현장 예약·숙박 연장 경로 분기 처리
- 숙박 연장 결제 시 `reservations.checkout_date` 자동 업데이트

```
결제 흐름
고객 → pay.html (Toss SDK) → Toss 서버 → successUrl 리다이렉트
→ PayController.tossSuccess() → Toss 승인 API 호출 → DB 저장 → 완료 모달
```

### 6-2. SMS 발송 (Solapi)

- 결제 완료 시 `PayService.sendPaymentSms()` 호출, Solapi Java SDK로 문자 발송
- 발신 번호·수신 번호·문자 내용을 `Message` 객체로 구성 후 `DefaultMessageService`로 전송
- 발송 성공 여부(`smsStatus`)를 `payments`·`reservations` 두 테이블에 동시 기록
- 비회원(전화번호 미존재) 케이스 : SMS 생략 후 `Failed` 상태 기록
- 카드·Toss Pay 결제 양쪽에서 공통 메서드 호출 (단일 진입점)
- API Key / Secret / 발신번호 모두 `.env` 주입으로 보안 처리

### 6-3. AI 챗봇 — RAG 파이프라인

```
[앱 기동 시 ETL]
hotel_policy.pdf → ETLService.etlFromPath()
→ PDF 문서 파싱 → text-embedding-3-small 임베딩 → pgvector 저장
(이미 로드된 경우 중복 ETL 생략)

[사용자 질문 처리]
사용자 질문
→ CompressionQueryTransformer (대화 맥락 기반 질문 압축·재구성)
→ VectorStoreDocumentRetriever (pgvector 유사도 검색, topK=3)
→ RetrievalAugmentationAdvisor (검색 결과 + 질문을 LLM에 전달)
→ GPT-4o-mini 응답 생성
→ MessageChatMemoryAdvisor (ConversationId 기반 대화 기억 유지)
```

- 스트리밍 응답 지원 (`Flux<String>`)
- 연관 질문 4개 자동 추천 (GPT 응답을 JSON 배열로 파싱)
- 메타데이터 필터링으로 특정 출처 문서만 검색 가능

### 6-4. 음성 인식 (Web Speech API + OpenAI Whisper)

- 메인 화면에서 웨이크 워드 감지 → AI 채팅 화면 자동 진입
- AI 채팅 화면은 3단계로 구성:
  - `screen-confirm` : 인식 의도 확인
  - `screen-retry` : 재발화 요청
  - `screen-result` : 답변 출력
- 음성 데이터(byte[]) → `ByteArrayResource` 변환 → Whisper-1 STT → 텍스트 → RAG 파이프라인
- 각 화면 전환 시 애니메이션 재실행으로 자연스러운 대화 흐름 구현

### 6-5. Spring Security 인증·권한

- `AdminDetailsService` : DB에서 관리자 계정 조회 후 UserDetails 반환
- 계정 상태 (`statement`) 에 따른 예외 분기:
  - `Locked` → `LockedException` → 잠금 오류 안내
  - `Leave` → `DisabledException` → 퇴사 안내
  - `Absence` → `AccountExpiredException` → 휴직 안내
- 로그인 실패 5회 누적 시 DB `statement = 'Locked'` 자동 처리
- 로그인 성공 시 실패 횟수 초기화 + 로그인 IP DB 업데이트
- 동일 계정 동시 로그인 1개 제한 (기존 세션 만료 방식)
- 권한별 URL 접근 제어:
  - `ROLE_SUPER` : 통계·관리자 계정 관리 포함 전체 접근
  - `ROLE_GENERAL` : 운영 기능만 접근
  - 고객 키오스크 경로 : 인증 불필요, CSRF 제외 처리

### 6-6. 이메일 인증 (Redis)

- 관리자 이메일 인증번호 발송 시 Redis에 인증번호 저장 (TTL 설정)
- Redis 기반 유효 기간 관리로 만료 인증번호 자동 제거
- Naver SMTP (SSL 465포트) 사용

### 6-7. 스케줄러

```java
// 1분마다 실행 — 미결제 대기(Waiting) 상태 예약 자동 삭제
@Scheduled(fixedDelay = 60000)
public void deleteWaitingReservations()
```

결제 페이지에서 이탈하거나 타임아웃된 미결제 예약을 자동 정리하여 DB 일관성 유지

---

## 7. 데이터베이스 설계

> 메인 DB: MariaDB / 벡터 DB: PostgreSQL + pgvector

### ERD 주요 관계

```
admin
members ──< members_point
members ──< reservations ──< options_record >── option_master
         ──< payments
room_master ──< reservations
            ──< room_status
            ──< pricing_policy_room >── pricing_policy
stocks
inform_board
```

### 테이블 상세

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|-----------|
| `admin` | 관리자 계정 | admin_id, password(BCrypt), admin_grade(SUPER/GENERAL), statement(Working/Absence/Leave/Locked), fail_count |
| `admin_log` | 관리자 작업 이력 | log_id, admin_id, action_type |
| `members` | 호텔 이용 고객 | member_no, member_name, member_phone, member_birth, reservation_count, member_point |
| `members_point` | 포인트 변동 내역 | point_id, member_no, reservation_id, earning(+), using(-) |
| `room_master` | 객실 기본 정보(정적) | room_no, room_type(Standard/Superior/Deluxe/Suite), room_view(Mountain/City/Lake/Ocean), base_price, max_people, rating, room_status |
| `room_status` | 실시간 객실 상태(동적) | room_no, current_status(Available/Occupied/Cleaning/Cleaning Required/Maintenance), card_issuance(Waiting/Issuance/Return) |
| `option_master` | 부가 서비스 옵션 | option_id, option_name, option_category(Meal/Leisure/Consumable), option_target(Adult/Child/Common), option_price |
| `reservations` | 예약 정보 (과거·현재·미래) | idx(PK), reservation_id(체크인날짜6자리-랜덤6자리), room_no, status(Reserved/In/Out/Cancelled), checkin_date, checkout_date, add_option, pay_status |
| `options_record` | 예약별 선택 옵션 | option_record_id, idx(예약PK), option_id, quantity, option_charge |
| `payments` | 결제 정보 | payment_id, reservation_id, pay_method(Card/Pay), room_price, point_amount, option_charge, total_charge, pay_status, sms_status |
| `toss_log` | Toss 결제 원본 로그 | Toss API 응답 원문 저장 |
| `pricing_policy` | 요금 정책 | policy_id, policy_name, repeat_type(None/Weekly/Monthly), start_date, end_date, discount_rate |
| `pricing_policy_room` | 정책별 객실 적용 요금 | pricing_room_id, policy_id, room_no, room_price |
| `stocks` | 소모품 재고 | stock_id, stock_name, stock_count, min_stock, stock_status(Clear/Shortage/Warning) |
| `inform_board` | 호텔 공지 게시판 | inform_id, title, content, writer, reg_date, mod_date |

> **DB 초기화 SQL** : `src/main/resources/sql/DBInit.sql`  
> **더미 데이터** : `src/main/resources/sql/DBDummyInit.sql`  
> **pgvector 스키마** : `src/main/resources/sql/postgres.sql`

---

## 8. 프로젝트 구조

```
src/
├─ main/
│  ├─ java/hotel_kiosk/
│  │  ├─ config/                  # 설정 클래스
│  │  │  ├─ EtlRunner.java        # 앱 기동 시 PDF → pgvector ETL
│  │  │  ├─ SecurityConfiguration.java
│  │  │  ├─ MariaDBConfig.java
│  │  │  ├─ PgVectorConfig.java
│  │  │  └─ SwaggerConfig.java
│  │  ├─ controller/
│  │  │  ├─ admin/                # 관리자 웹 컨트롤러
│  │  │  └─ customer/             # 고객 키오스크 컨트롤러
│  │  │     ├─ AIChatController.java
│  │  │     ├─ CheckInController.java
│  │  │     ├─ OnSiteReservationController.java
│  │  │     ├─ ExtendedReservationController.java
│  │  │     └─ PayController.java
│  │  ├─ domain/                  # JPA/JDBC Entity
│  │  ├─ dto/                     # 데이터 전송 객체
│  │  ├─ exception/               # 커스텀 예외
│  │  ├─ mapper/                  # MyBatis 매퍼 인터페이스
│  │  ├─ security/                # Spring Security 관련
│  │  └─ service/
│  │     ├─ admin/                # 관리자 서비스
│  │     └─ customer/             # 고객 서비스
│  │        ├─ ai/
│  │        │  ├─ AiService.java  # RAG + STT + 추천 질문
│  │        │  └─ ETLService.java # PDF 임베딩 파이프라인
│  │        ├─ PayService.java
│  │        ├─ SmsService.java
│  │        └─ WaitingCleanupScheduler.java
│  └─ resources/
│     ├─ mapper/                  # MyBatis XML 매퍼
│     ├─ sql/                     # DB 초기화 SQL
│     ├─ data/hotel_policy.pdf    # AI RAG용 호텔 정책 문서
│     ├─ static/
│     │  ├─ css/admin|customer/
│     │  ├─ js/admin|customer/
│     │  └─ img/
│     ├─ templates/
│     │  ├─ admin/               # 관리자 Thymeleaf 템플릿
│     │  └─ customer/            # 고객 키오스크 Thymeleaf 템플릿
│     └─ application.properties
└─ test/                         # 단위 테스트 (JUnit5 + MyBatis Test)
```

---

## 9. 실행 방법

### 사전 준비

- Java 21
- Docker & Docker Compose
- MariaDB 설치 및 실행
- PostgreSQL 설치 + pgvector 확장 활성화

### 1단계 : 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 항목을 채웁니다.

```dotenv
# MariaDB
DATA_SOURCE_USER_NAME=your_db_username
DATA_SOURCE_PASSWORD=your_db_password

# Naver SMTP (이메일 인증)
MAIL_USERNAME=your_naver_email@naver.com
MAIL_PASSWORD=your_naver_app_password

# Toss Payments
TOSS_CLIENT_KEY=test_ck_xxxx
TOSS_SECRET_KEY=test_sk_xxxx

# Solapi SMS
SMS_API_KEY=your_solapi_api_key
SMS_API_SECRET=your_solapi_api_secret
SMS_API_PHONE=01012345678

# OpenAI
SPRING_AI_OPENAI_API_KEY=sk-xxxx

# PostgreSQL (pgvector)
PG_VECTOR_PASSWORD=your_postgres_password
```

### 2단계 : DB 초기화

MariaDB에서 아래 SQL 파일을 순서대로 실행합니다.

```bash
# 스키마 및 테이블 생성
mysql -u root -p < src/main/resources/sql/DBInit.sql

# 더미 데이터 삽입 (선택사항)
mysql -u root -p hotel_kiosk < src/main/resources/sql/DBDummyInit.sql
```

PostgreSQL에서 pgvector 스키마를 초기화합니다.

```bash
psql -U postgres < src/main/resources/sql/postgres.sql
```

### 3단계 : Redis 실행

```bash
docker-compose up -d
```

### 4단계 : 애플리케이션 실행

```bash
./gradlew bootRun
```

앱 기동 시 `EtlRunner`가 자동으로 `hotel_policy.pdf`를 pgvector에 임베딩합니다 (최초 1회만).

### 5단계 : 접속

| 화면 | URL |
|------|-----|
| 고객 키오스크 | http://localhost:8080/JHotel |
| 관리자 로그인 | http://localhost:8080/admin/login |
| Swagger API 문서 | http://localhost:8080/swagger-ui/index.html |

### 종료

```bash
docker-compose down   # Redis 중지
```

---

## 10. API 문서

Swagger UI에서 REST API 전체 명세를 확인할 수 있습니다.

```
http://localhost:8080/swagger-ui/index.html?urls.primaryName=REST+API
```

### 주요 API 엔드포인트 요약

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/JHotel/checkin/search` | 예약번호로 예약 조회 |
| POST | `/JHotel/checkin/do` | 체크인 처리 |
| GET | `/JHotel/onsite/rooms` | 예약 가능 객실 목록 조회 |
| POST | `/JHotel/onsite/pre-reserve` | 결제 전 예약 임시 등록 |
| GET | `/JHotel/pay/toss/success` | Toss 결제 성공 콜백 |
| POST | `/JHotel/pay/card` | 현장 카드 결제 처리 |
| POST | `/api/kiosk/ai/chat` | AI 챗봇 질문 (스트리밍) |
| POST | `/api/kiosk/ai/stt` | 음성 → 텍스트 변환 |
| GET | `/api/admin/email/send` | 이메일 인증번호 발송 |

---

## 11. 참조

- **GitHub** : https://github.com/skla8590/HotelKiosk_2
- **Swagger** : http://localhost:8080/swagger-ui/index.html?urls.primaryName=REST+API
- **공유 문서** : https://drive.google.com/drive/folders/17a31kjk8bhSAuJAp-wGKzaoDVNNmxvmf
