# 📁 프로젝트명

<div align="center">
  <img src=https://github.com/beyond-sw-camp/be11-fin-3team-SilverPotion-BE/blob/main/img/%EA%B0%9C%EC%9A%94.png >
</div>

>실버세대의 건강관리와 사회적 교류를 위한 플랫폼

---

## 📌 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [문서 목록](#문서-목록)
3. [프로젝트 기획서 (프로젝트기획)](#프로젝트-기획서-프로젝트기획)
4. [요구사항 정의서 (프로젝트기획)](#요구사항-정의서-프로젝트기획)
5. [시스템 아키텍처 설계서 (프로젝트기획)](#시스템-아키텍처-설계서-프로젝트기획)
6. [WBS (프로젝트기획)](#wbs-프로젝트기획)
7. [ERD (프로젝트기획)](#erd-프로젝트기획)
8. [화면설계서 (프로젝트기획)](#화면설계서-프로젝트기획)
9. [프로그램사양서 (백엔드 설계 및 구축)](#프로그램사양서-백엔드-설계-및-구축)
10. [단위 테스트 결과서 (백엔드 설계 및 구축)](#단위-테스트-결과서-백엔드-설계-및-구축)
11. [UI/UX 단위 테스트 결과서 (프론트엔드 설계 및 구축)](#uiux-단위-테스트-결과서-프론트엔드-설계-및-구축)
12. [배포 후 통합 테스트 결과서 (시스템 통합)](#배포-후-통합-테스트-결과서-시스템-통합)
13. [CI/CD 계획서 (시스템 통합)](#cicd-계획서-시스템-통합)
14. [배포 및 운영](#배포-및-운영)
15. [팀원 정보](#팀원-정보)

---

## 📖 프로젝트 개요

- **프로젝트명** : 실버포션
- **프로젝트 배경** : <br>
<div align="center">
  <img src=https://github.com/beyond-sw-camp/be11-fin-3team-SilverPotion-BE/blob/main/img/%ED%97%AC%EC%8A%A4%EC%BC%80%EC%96%B4%20%EC%88%98%EC%9A%941.png >
</div>
<div align="center">
  <img src=https://github.com/beyond-sw-camp/be11-fin-3team-SilverPotion-BE/blob/main/img/%EB%85%B8%EC%9D%B8%20%EC%BB%A4%EB%AE%A4%EB%8B%88%ED%8B%B0%EC%97%90%20%EB%8C%80%ED%95%9C%20%EC%88%98%EC%9A%94.png >
</div>

1️⃣초고령 사회 진입
대한민국은 작년 12월, 전체 인구 중 65세 이상 노인이 차지하는 비율이 20%를 넘어가며 **초고령 사회에 진입**했습니다.<br>
이에 따라, 노인 인구의 의료 서비스, 돌봄 수요가 급증하고 있습니다.<br><br>
2️⃣노인인구 중 노인 1인 가구 혹은 노인 부부가구가 90%에 도달했습니다.<br>
노인인구의 대부분이 자식과 떨어져 산다는 것으로, 노인의 가족 및 보호자에게 있어 <br>
**원격으로 부모의 건강을 모니터링하고 돌봄에 참여할 수 있는 시스템에 대한 수요**가 커지고 있습니다.<br><br>
3️⃣한국 노인의 사회적 고립도는 OECD 평균에 비해 3배 이상 높습니다.<br>
이러한 사회적 고립도는 치매나 고독사 증가를 가중시켜 사회의 부담을 높이고 있습니다.<br><br>

**목표 및 목적** :
**1️⃣ 노년층의 건강 관리 효율성 강화**
**2️⃣ 가족 및 보호자의 안심 돌봄 환경 구축**
**3️⃣ 사회적 고립 해소 및 정서적 안정 지원**

- **주요 기능 요약** :  
  **1️⃣ 실버 헬스케어**
    - 갤럭시 워치, 애플워치 등 웨어러블 기기 연동을 통한 실시간 데이터 수집(걸음수,심박수,체온,혈압,소모칼로리 등)
    - 수집된 데이터를 통해 일/주/월 단위로 건강 리포트 제공
    - AI가 개인 건강 데이터를 분석해 약/영양제, 병원 위치, 운동 방법 추천
    - 보호자가 노인의 건강 데이터를 조회할 수 있음

  **2️⃣ 소모임(커뮤니티)**
    - 사용자가 자신의 관심사(운동,요리,독서,음악)등을 기반으로 손쉽게 모임 생성 및 가입 가능
    - 모임별로 독립된 커뮤니티 공간을 제공하여 각 모임마다 홈,게시판,사진첩,채팅방 기능을 제공

---

## 📄 문서 목록

| 문서명 | 분류 | 설명 | 다운로드 |
|:----------------------------------|:--------------------------|:------------------------------------------|:---------------------------------------------|
| 프로젝트 기획서 (프로젝트기획) | 프로젝트기획 | 프로젝트 배경, 목적, 추진 전략 등 | [📎 프로젝트 기획서 다운로드](./docs/프로젝트_기획서.pdf) |
| 요구사항 정의서 (프로젝트기획) | 프로젝트기획 | 기능 및 비기능 요구사항 정의 | [📎 요구사항 정의서 바로가기](https://docs.google.com/spreadsheets/d/1xPL9fzuUFguVioFHqQyqesHNe3U2_l63kEcYtexFRvk/edit?gid=1960802497#gid=1960802497) |
| 시스템 아키텍처 설계서 (프로젝트기획) | 프로젝트기획 | 시스템 구성 및 흐름도 | [📎 시스템 아키텍처 설계서 다운로드](./docs/시스템_아키텍처_설계서.pdf) |
| WBS (프로젝트기획) | 프로젝트기획 | 업무 분장 및 세부 일정 | [📎 WBS 바로가기](https://docs.google.com/spreadsheets/d/1xPL9fzuUFguVioFHqQyqesHNe3U2_l63kEcYtexFRvk/edit?gid=1809279197#gid=1809279197) |
| ERD (프로젝트기획) | 프로젝트기획 | 데이터베이스 구조 및 관계 | [📎 ERD 바로가기](https://www.erdcloud.com/d/5zTkSLQ7qB9hg6b4G) |
| 화면설계서 (프로젝트기획) | 프로젝트기획 | UI/UX 화면 흐름 및 구조 | [📎 화면설계서(피그마) 바로가기 ](https://www.figma.com/design/lieOgqHknZxpzSkXT6IsX7/silverpotion?node-id=0-1&t=f7PFNSWT2n8etaXt-1) |
| API명세서 (백엔드 설계 및 구축) | 백엔드 설계 및 구축 | 각 기능별 상세 사양 기술 | [📎 API명세서 바로보기](https://docs.google.com/spreadsheets/d/1xPL9fzuUFguVioFHqQyqesHNe3U2_l63kEcYtexFRvk/edit?gid=1214004648#gid=1214004648) |
| 단위 테스트 결과서 (백엔드 설계 및 구축) | 백엔드 설계 및 구축 | 기능별 테스트 수행 결과 | [📎 단위 테스트 결과서 다운로드](./docs/단위_테스트_결과서.pdf) |
| UI/UX 단위 테스트 결과서 (프론트엔드 설계 및 구축) | 프론트엔드 설계 및 구축 | 화면 기반 사용자 테스트 결과 | [📎 UI/UX 단위 테스트 결과서 다운로드](./docs/UIUX_단위_테스트_결과서.pdf) |
| 배포 후 통합 테스트 결과서 (시스템 통합) | 시스템 통합 | 배포 후 통합 테스트 결과 정리 | [📎 배포 후 통합 테스트 결과서 다운로드](./docs/배포후_통합_테스트_결과서.pdf) |
| CI/CD 계획서 (시스템 통합) | 시스템 통합 | 배포 및 자동화 파이프라인 계획 | [📎 CI/CD 계획서 다운로드](./docs/CICD_계획서.pdf) |

---

## 📑 프로젝트 기획서 (프로젝트기획)
- 프로젝트 추진 배경, 목적, 전략 정리
  👉 [📎 문서 보기](./docs/프로젝트_기획서.pdf)

---

## 📑 요구사항 정의서 (프로젝트기획)
- 기능적 / 비기능 요구사항, 유즈케이스
  👉 [📎 문서 보기](https://docs.google.com/spreadsheets/d/1xPL9fzuUFguVioFHqQyqesHNe3U2_l63kEcYtexFRvk/edit?gid=1960802497#gid=1960802497)

---

## 📑 시스템 아키텍처 설계서 (프로젝트기획)
> 시스템 구성도 이미지 삽입  
![시스템 아키텍처](./images/architecture.png)  
👉 [📎 문서 보기](./docs/시스템_아키텍처_설계서.pdf)

---

## 📑 WBS (프로젝트기획)
- 업무 분류 체계, 일정계획
  👉 [📎 문서 보기](https://docs.google.com/spreadsheets/d/1xPL9fzuUFguVioFHqQyqesHNe3U2_l63kEcYtexFRvk/edit?gid=1809279197#gid=1809279197)

---

## 📑 ERD (프로젝트기획)
<details>
<summary>데이터베이스 구조 보기</summary>

### 전체 ERD
![스크린샷 2025-03-28 112415](https://github.com/user-attachments/assets/f55b36ad-2a82-4126-b2a4-f14a5e7abe99)
### 유저
![스크린샷 2025-03-28 112538](https://github.com/user-attachments/assets/26e79aeb-b5fb-4156-a274-276320a0b99c)
### 소모임
![스크린샷 2025-03-28 112512](https://github.com/user-attachments/assets/d908d100-0905-441b-845e-92b8b700e6c3)
### 채팅
![스크린샷 2025-03-28 112434](https://github.com/user-attachments/assets/2cc2c98f-37cc-42e7-baed-c3318dbcd8f9)
</details>
👉 [📎 문서 보기](https://www.erdcloud.com/d/5zTkSLQ7qB9hg6b4G)

---

## 📑 화면설계서 (프로젝트기획)
> 주요 UI/UX 흐름  
👉 [📎 문서 보기](https://www.figma.com/design/lieOgqHknZxpzSkXT6IsX7/silverpotion?node-id=0-1&t=f7PFNSWT2n8etaXt-1)

---

## 📑 API명세서
- 상세 기능별 사양, 입력/출력 정의
  👉 [📎 문서 보기](https://docs.google.com/spreadsheets/d/1xPL9fzuUFguVioFHqQyqesHNe3U2_l63kEcYtexFRvk/edit?gid=1214004648#gid=1214004648)

---

## 📑 단위 테스트 결과서 (백엔드 설계 및 구축)
| 테스트 항목 | 테스트 내용 | 결과 | 비고 |
|:-------------|:------------------|:----:|:------|
| 로그인 기능 | 올바른 ID/Password | ✅ 성공 | 정상 작동 |
| 회원가입 기능 | 필수 입력값 누락 테스트 | ✅ 성공 | 예외처리 확인 |

👉 [📎 문서 보기](https://documenter.getpostman.com/view/41079416/2sB2cYbzyb#6ba25797-9674-4873-9b11-99b092b2b0cb)

---

## 📑 UI/UX 단위 테스트 결과서 (프론트엔드 설계 및 구축)
- 사용성 테스트, 인터페이스 반응
<details>
  
  #### - 로그인 및 회원가입-
  <summary> 메인페이지</summary>
  <img src="https://github.com/user-attachments/assets/ce63f6ff-f5cc-4443-9efb-f820880f8d4e">
</details>
<details>
  <summary> 로그인</summary>
  <img src="https://github.com/user-attachments/assets/2f7c077f-405e-4c20-bb93-af7a07b89b98">
</details>
<details>
  <summary> 회원가입</summary>
  <img src="https://github.com/user-attachments/assets/9508ba22-b7f4-4c24-8a6f-a92672c15033">
</details>
<details>
  <summary> google회원가입</summary>
  <img src="https://github.com/user-attachments/assets/e3166d3f-907f-4832-9da9-de28b41c83a9">
</details>
<details>
  <summary> google로그인</summary>
  <img src="https://github.com/user-attachments/assets/1c86ba7e-5bee-4df7-9d65-3e162ed321e7">
</details>
<details>
  <summary> kakao회원가입</summary>
  <img src="https://github.com/user-attachments/assets/1632c825-7dc9-4b74-af3d-65fa215f6d2a">
</details>
<details>
  <summary> kakao로그인</summary>
  <img src="https://github.com/user-attachments/assets/8f41d775-5e67-451b-add9-dde3da76ce83">
</details>


#### - 건강데이터-
<details>
<summary> 본인 건강데이터 조회</summary>
  <img src="https://github.com/user-attachments/assets/bc686a90-6390-434c-a203-db31bed34d6c">
</details>
<details>
<summary> 본인 AI리포트 조회</summary>
  <img src="https://github.com/user-attachments/assets/b873fd13-2216-44c1-b261-be22454be71d">
</details>
<details>
<summary> 피보호자 데이터 조회</summary>
  <img src="https://github.com/user-attachments/assets/d20a3eeb-4097-436a-84e0-a9d3f6d89df5">
</details>
<details>
<summary> 피보호자 리포트 조회</summary>
  <img src="https://github.com/user-attachments/assets/b5b91708-a8b7-4445-a90d-4cfd2b984de6">
</details>
<details>
<summary> 헬스지수 생성 및 조회</summary>
  <img src="https://github.com/user-attachments/assets/c808c8d3-86b9-4204-b656-fd693bc41792">
</details>
<details>
<summary> 건강데이터기반 모임 추천</summary>
  <img src="https://github.com/user-attachments/assets/2f42a962-f86c-46df-bf41-1719040c6b77">
</details>

#### - 모임-
<details>
<summary>소모임 생성</summary>
  <img src="https://github.com/user-attachments/assets/a2f80d17-514c-47e7-bfc5-520dddc41767">
</details>
<details>
<summary>모임 가입</summary>
  <img src="https://github.com/user-attachments/assets/6d07924a-a5f9-4962-b748-65939a0b947d">
</details>
<details>
<summary>정모 만들기</summary>
  <img src="https://github.com/user-attachments/assets/0c7f2a8a-0d39-4e6e-b5e0-d5cff0914341">
</details>
<details>
<summary>게시판 전체 조회</summary>
  <img src="https://github.com/user-attachments/assets/cc560fd8-1362-45fb-9e20-cc46cca1ba4c">
</details>
<details>
<summary>게시판 좋아요</summary>
  <img src="https://github.com/user-attachments/assets/f55173b2-758c-424d-b186-425e05b66496">
</details>
<details>
<summary>투표 상세 조회</summary>
  <img src="https://github.com/user-attachments/assets/ddb25aa4-55da-416b-98d5-8683b8dbf972">
</details>
<details>
<summary>투표 항목 유저 조회</summary>
  <img src="https://github.com/user-attachments/assets/95a78184-620d-4961-a0e6-b5fa75eb0c3a">
</details>
<details>
<summary>자유글 생성</summary>
  <img src="https://github.com/user-attachments/assets/9e7d2c53-6010-4e9a-879d-4357967696e8">
</details>
<details>
<summary>공지글 생성</summary>
  <img src="https://github.com/user-attachments/assets/3262c7b0-84ef-46c4-9f9a-884f9310cbca">
</details>
<details>
<summary>투표글 생성</summary>
  <img src="https://github.com/user-attachments/assets/aaf6571c-31db-471b-8c24-a3a157897174">
</details>

#### - 채팅-
<details>
<summary>채팅</summary>
  <img src="https://github.com/user-attachments/assets/88f8c827-64be-4730-8e2b-11729f3629a4">
</details>

#### - 마이캘린더-

#### - 관리자페이지-
<details>
<summary>관리자유저목록</summary>
  <img src="https://github.com/user-attachments/assets/fa7bc019-0525-4bba-a9c3-b278d7c9cc01">
</details>
<details>
<summary>관리자유저검색</summary>
  <img src="https://github.com/user-attachments/assets/3098032e-795d-4b54-b5c1-f3170125a878">
</details>
<details>
<summary>관리자유저상세</summary>
  <img src="https://github.com/user-attachments/assets/cac69a2b-8171-4f4d-bf42-ae892340ba43">
</details>




---

## 📑 배포 후 통합 테스트 결과서 (시스템 통합)
- 통합 테스트 항목 및 결과 요약
  👉 [📎 문서 보기](./docs/배포후_통합_테스트_결과서.pdf)

---

## 📑 CI/CD 계획서 (시스템 통합)
<div align="center">
  <img src= https://github.com/beyond-sw-camp/be11-fin-3team-SilverPotion-BE/blob/main/img/cicd.png >
</div>

---

## 🚀 배포 및 운영

- 운영 URL : [https://www.silverpotion.site](https://www.silverpotion.site)
- 배포 환경 : AWS

---

## 👨‍👩‍👧‍👦 팀원 정보

| 이름 | 역할 | GitHub |
|:------|:------------------------|:-----------------------------|
| 경수혁 | 팀장 | [github.com/hong](https://github.com/hong) |
| 이재석 | 팀원 | [github.com/lee](https://github.com/lee) |
| 최영일 | 팀원 | [github.com/sung](https://github.com/sung) |
| 김진영 | 팀원 | [github.com/sung](https://github.com/sung) |




### Git Commit Convention
- 커밋 메시지 형식 <br>
  태그 종류 <br>
  Feat : 새로운 기능 추가 <br>
  Fix : 버그 수정 <br>
  Docs : 문서 수정 <br>
  Style : 세미콜론 누락 등 코드 변경이 없는 경우 <br>
  Refactor : 코드 리팩토링 <br>
  Test : 테스트 코드 및 리팩토링 테스트 코드 추가 <br>
  커밋 메시지 작성 규칙 <br>
  제목은 간결하게 작성. <br>
  본문에는 무엇을 변경했는지 또는 왜 변경했는지를 상세히 기록.
