# Joon Drive

클라우드 스토리지 서비스 프론트엔드 애플리케이션입니다.

## 프로젝트 소개

Joon Drive는 사용자가 파일을 업로드, 다운로드, 관리할 수 있는 클라우드 스토리지 서비스의 프론트엔드입니다. 
Next.js와 React를 기반으로 구축되었으며, 세션 기반 인증 시스템을 사용합니다.

## 주요 기능

- 🔐 사용자 인증 (로그인, 회원가입, 비밀번호 찾기)
- 📁 파일 업로드 및 다운로드
- 🔍 파일 검색
- ⚙️ 계정 설정
- 🎨 다크 모드 지원

## 기술 스택

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios

## 요구사항

- Node.js 22 이상
- npm 또는 yarn

## 설치 및 실행

### 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Docker 실행

```bash
# 이미지 빌드
docker build -t joondrive-fe .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env.local joondrive-fe
```

## 프로젝트 구조

```
joondrive-fe/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── login/             # 로그인 페이지
│   ├── signup/            # 회원가입 페이지
│   └── account-settings/  # 계정 설정 페이지
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 함수
├── proxy.ts               # 인증 프록시
└── public/                # 정적 파일
```

## 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 실행

## 라이선스

Private
