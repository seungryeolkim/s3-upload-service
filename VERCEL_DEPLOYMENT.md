# Vercel 배포 가이드

이 가이드는 S3 Upload Service를 Vercel에 배포하는 방법을 설명합니다.

## 1️⃣ GitHub에 푸시하기

### 1.1 GitHub 레포 생성

1. [GitHub](https://github.com/new)에서 새 저장소 생성
2. 저장소 이름: `s3-upload-service`
3. 설명: "Simple S3 image upload service"
4. Public 선택
5. Create repository

### 1.2 로컬에서 푸시

```bash
cd "/Users/seungryeol.kim/s3 upload/s3-upload-service"

# GitHub 원격 저장소 추가
git remote add origin https://github.com/your-username/s3-upload-service.git

# main 브랜치로 푸시
git branch -M main
git push -u origin main
```

---

## 2️⃣ Vercel에 배포하기

### 2.1 Vercel CLI 설치

```bash
npm i -g vercel
```

### 2.2 Vercel 로그인

```bash
vercel login
```

브라우저에서 로그인하고 인증합니다.

### 2.3 프로젝트 배포

```bash
cd "/Users/seungryeol.kim/s3 upload/s3-upload-service"
vercel
```

프롬프트에서:
- **Set up and deploy**: `y`
- **Which scope**: 본인의 Vercel 계정 선택
- **Link to existing project?**: `N`
- **Project name**: `s3-upload-service`
- **Directory**: `./` (현재 디렉토리)

---

## 3️⃣ 환경 변수 설정 (매우 중요!)

배포 후 Vercel CLI로 환경 변수를 설정합니다:

```bash
# AWS S3 Credentials 설정
vercel env add AWS_ACCESS_KEY_ID
# 입력: your_access_key_id_here

vercel env add AWS_SECRET_ACCESS_KEY
# 입력: your_secret_access_key_here

vercel env add AWS_BUCKET_NAME
# 입력: yetter-cdn

vercel env add AWS_REGION
# 입력: ap-northeast-2

vercel env add AWS_ENDPOINT_URL
# 입력: https://s3.ap-northeast-2.amazonaws.com
```

각 명령어 실행 시 환경을 선택하는 프롬프트가 나타납니다:
- `Production` (생산 환경) - **필수 선택**
- `Preview` (미리보기 환경)
- `Development` (개발 환경)

**모두 Production으로 설정하세요.**

---

## 4️⃣ 한 번에 설정하기 (권장)

또는 스크립트로 한 번에 설정할 수 있습니다:

```bash
vercel env add AWS_ACCESS_KEY_ID "your_access_key_id_here"
vercel env add AWS_SECRET_ACCESS_KEY "your_secret_access_key_here"
vercel env add AWS_BUCKET_NAME "yetter-cdn"
vercel env add AWS_REGION "ap-northeast-2"
vercel env add AWS_ENDPOINT_URL "https://s3.ap-northeast-2.amazonaws.com"
```

---

## 5️⃣ 배포 확인

### Vercel 대시보드 확인

1. [Vercel Dashboard](https://vercel.com/dashboard)에 접속
2. 프로젝트 `s3-upload-service` 클릭
3. Settings → Environment Variables 확인

### 서비스 테스트

```bash
# 배포된 URL 확인
vercel ls

# 또는 대시보드에서 Domains 확인
# https://s3-upload-service-[random].vercel.app
```

테스트:
```bash
curl -X POST https://s3-upload-service-[random].vercel.app/api/upload \
  -F "file=@test-image.jpg" \
  -F "directory=test"
```

---

## 6️⃣ 업데이트 배포

로컬에서 코드 수정 후:

```bash
git add .
git commit -m "Update: 설명"
git push origin main

# Vercel에 자동으로 배포됩니다!
```

또는 수동 배포:
```bash
vercel --prod
```

---

## 🚀 최종 배포된 URL

배포 완료 후 Vercel이 제공하는 URL:
```
https://s3-upload-service-[random].vercel.app
```

이 URL이 **본인의 S3 업로드 서비스 엔드포인트**입니다.

---

## ⚠️ 주의사항

1. **credentials 절대 노출 금지**: `.gitignore`에 `.env.local`은 이미 포함됨
2. **환경 변수 double check**: Vercel 대시보드에서 환경 변수 확인
3. **S3 버킷 권한**: AWS IAM에서 해당 키가 S3 접근 권한 있는지 확인

---

## 🔗 유용한 링크

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/learn/basics/deploying-nextjs-app)
- [환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)
