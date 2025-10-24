import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.AWS_ENDPOINT_URL,
});

// 지원되는 파일 타입
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

// 파일 업로드 처리
export async function POST(request: NextRequest): Promise<Response> {
  try {
    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file');
    const fileName = (formData.get('fileName') as string) || 'upload';

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (2GB 제한)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB까지 업로드 가능합니다.` },
        { status: 400 }
      );
    }

    // 파일 타입 검증 (이미지 또는 비디오)
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다. 이미지(JPG, PNG, GIF, WebP) 또는 비디오(MP4, MOV, AVI, WebM)만 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일을 Buffer로 변환
    const buffer = Buffer.from(await file.arrayBuffer());

    // 파일 확장자 추출
    const originalFileName = file.name || 'upload';
    const ext = originalFileName.split('.').pop() || (isVideo ? 'mp4' : 'jpg');

    // S3 키 생성 (사용자입력.확장자)
    const s3Key = `ytr-ai/${fileName}.${ext}`;

    // S3에 업로드
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || 'yetter-cdn',
      Key: s3Key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    });

    await s3Client.send(command);

    // CDN URL 반환
    const cdnUrl = `https://cdn.yetter.ai/${s3Key}`;

    return NextResponse.json({
      success: true,
      url: cdnUrl,
      s3Key: s3Key,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS(): Promise<Response> {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
