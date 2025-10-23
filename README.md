# S3 Upload Service

간단한 이미지 업로드 API 서비스입니다. 이미지를 받아서 AWS S3에 업로드하고 CDN URL을 반환합니다.

## 🚀 기능

- ✨ 간단한 이미지 업로드 API
- 🖼️ 웹 UI를 통한 테스트 가능
- 📁 사용자 정의 디렉토리 지원
- ⏰ 타임스탬프 기반 파일명 자동 생성
- 🌍 CORS 지원
- ☁️ AWS S3 통합
- 🚀 Vercel에 바로 배포 가능

## 📋 요구사항

- Node.js 18+
- npm 또는 yarn
- AWS S3 credentials (access_key_id, secret_access_key)

## 🛠️ 설치 및 실행

### 로컬 개발

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env.local)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=yetter-cdn
AWS_REGION=ap-northeast-2
AWS_ENDPOINT_URL=https://s3.ap-northeast-2.amazonaws.com

# 3. 개발 서버 실행
npm run dev

# 4. http://localhost:3000 에서 확인
```

## 📤 API 사용법

### HTTP Request

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@image.jpg" \
  -F "directory=thumbnails"
```

### 요청 형식
- **Method**: `POST`
- **URL**: `/api/upload`
- **Content-Type**: `multipart/form-data`

**파라미터:**
- `file` (required): 업로드할 이미지 파일
- `directory` (optional): S3의 디렉토리 (기본값: `images`)

### 응답 (성공)

```json
{
  "success": true,
  "url": "https://cdn.yetter.ai/thumbnails/1698765432123_image.jpg",
  "s3Key": "thumbnails/1698765432123_image.jpg"
}
```

### 응답 (실패)

```json
{
  "error": "No file provided"
}
```

## 🌐 Vercel 배포

### 1. GitHub에 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/s3-upload-service.git
git push -u origin main
```

### 2. Vercel에 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 3. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정합니다:

```
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_BUCKET_NAME=yetter-cdn
AWS_REGION=ap-northeast-2
AWS_ENDPOINT_URL=https://s3.ap-northeast-2.amazonaws.com
```

## 📚 응답 예시

### JavaScript/TypeScript

```javascript
const uploadImage = async (file, directory = 'images') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('directory', directory);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Image URL:', data.url);
    return data.url;
  } else {
    console.error('Upload failed:', data.error);
  }
};
```

### Python

```python
import requests

def upload_image(file_path, directory='images'):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'directory': directory}
        response = requests.post(
            'http://localhost:3000/api/upload',
            files=files,
            data=data
        )
        return response.json()

# 사용
result = upload_image('path/to/image.jpg', 'thumbnails')
print(result['url'])
```

### cURL

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@image.jpg" \
  -F "directory=thumbnails" \
  -s | jq '.url'
```

## 🔒 보안 주의사항

⚠️ **실제 프로덕션 환경에서는:**

1. **환경 변수 보호**: AWS credentials를 Vercel의 환경 변수에 안전하게 저장
2. **파일 검증**: 파일 타입과 크기 검증 추가 필요
3. **CORS 설정**: 필요한 도메인만 허용하도록 수정
4. **Rate Limiting**: API 호출 제한 추가

## 📝 프로젝트 구조

```
s3-upload-service/
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts          # S3 업로드 API
│   └── page.tsx                  # 웹 UI
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json
└── README.md
```

## 🐛 트러블슈팅

### 파일 업로드 실패
- AWS credentials 확인
- S3 bucket이 존재하는지 확인
- 버킷의 권한 설정 확인

### CORS 에러
- API 요청의 Origin 확인
- 필요시 CORS 정책 수정

### Vercel 배포 문제
- 환경 변수 설정 확인
- 빌드 로그 확인

## 📄 라이선스

MIT

## 👨‍💻 개발자

Created with ❤️ for Yetter Team
