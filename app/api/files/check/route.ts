import { NextRequest, NextResponse } from 'next/server';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.AWS_ENDPOINT_URL,
});

// 파일 존재 여부 확인
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { s3Key } = body;

    if (!s3Key) {
      return NextResponse.json(
        { error: 'S3 키가 필요합니다' },
        { status: 400 }
      );
    }

    try {
      // HeadObject로 파일 존재 확인
      const command = new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || 'yetter-cdn',
        Key: s3Key,
      });

      const response = await s3Client.send(command);

      // 파일이 존재함
      return NextResponse.json({
        exists: true,
        size: response.ContentLength || 0,
        lastModified: response.LastModified?.toISOString() || '',
        contentType: response.ContentType || '',
      });
    } catch (error: any) {
      // 파일이 존재하지 않음 (404 에러)
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return NextResponse.json({
          exists: false,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Check file error:', error);
    return NextResponse.json(
      { error: '파일 확인에 실패했습니다' },
      { status: 500 }
    );
  }
}

