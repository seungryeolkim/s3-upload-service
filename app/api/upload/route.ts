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

    // 파일을 Buffer로 변환
    const buffer = Buffer.from(await file.arrayBuffer());

    // 파일 확장자 추출
    const originalFileName = file.name || 'upload';
    const ext = originalFileName.split('.').pop() || 'jpg';

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
