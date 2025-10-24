import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.AWS_ENDPOINT_URL,
});

// S3 파일 목록 조회
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME || 'yetter-cdn',
      Prefix: 'ytr-ai/', // ytr-ai 폴더만 조회
      MaxKeys: 1000, // 최대 1000개
    });

    const response = await s3Client.send(command);

    const files = (response.Contents || []).map((item) => ({
      key: item.Key || '',
      fileName: (item.Key || '').replace('ytr-ai/', ''), // ytr-ai/ 제거
      size: item.Size || 0,
      lastModified: item.LastModified?.toISOString() || '',
      url: `https://cdn.yetter.ai/${item.Key}`,
    }));

    return NextResponse.json({
      success: true,
      files: files,
      count: files.length,
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: '파일 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

