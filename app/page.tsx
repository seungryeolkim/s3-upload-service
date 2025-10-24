'use client';

import { FormEvent, ChangeEvent, useState, DragEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface UploadResponse {
  success: boolean;
  url?: string;
  s3Key?: string;
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [error, setError] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const BASE_URL = 'https://cdn.yetter.ai/ytr-ai';

  // 인증 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/verify');
        if (!response.data.authenticated) {
          router.push('/login');
        } else {
          setIsCheckingAuth(false);
        }
      } catch (err) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const isImage = droppedFile.type.startsWith('image/');
      const isVideo = droppedFile.type.startsWith('video/');
      
      if (isImage || isVideo) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('이미지 또는 비디오 파일만 업로드 가능합니다');
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError('파일을 선택해주세요');
      return;
    }

    if (!fileName) {
      setError('파일명을 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');
    setUploadUrl('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);

      const response = await axios.post<UploadResponse>(
        '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success && response.data.url) {
        setUploadUrl(response.data.url);
        setFile(null);
        setFileName('');
      } else {
        setError(response.data.error || '업로드 실패');
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : '업로드 실패';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 인증 확인 중 로딩 화면
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🔐</div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1"></div>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📤 S3 Media Upload
            </h1>
            <p className="text-gray-600">
              이미지 & 비디오를 S3에 업로드하고 CDN URL을 받으세요
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md hover:shadow-lg"
            >
              🚪 로그아웃
            </button>
          </div>
        </div>

        {/* 메인 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 파일명 입력 */}
            <div>
              <label htmlFor="fileName" className="block text-sm font-semibold text-gray-700 mb-3">
                📁 파일명 설정
              </label>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 mb-2">
                <span className="text-gray-600 font-mono text-sm flex-shrink-0">
                  {BASE_URL}/
                </span>
                <input
                  type="text"
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="예: product/thumbnail"
                  className="flex-1 bg-transparent outline-none font-mono text-sm"
                />
                <span className="text-gray-600 font-mono text-sm flex-shrink-0">
                  .[확장자]
                </span>
              </div>
              <p className="text-xs text-gray-500">
                💡 예시: <span className="font-mono text-indigo-600">product/thumbnail</span> → <span className="font-mono text-green-600">{BASE_URL}/product_thumbnail.jpg</span>
              </p>
            </div>

            {/* 드래그 앤 드롭 영역 */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
              }`}
            >
              <input
                type="file"
                id="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="text-center">
                <div className="text-4xl mb-2">🎬</div>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  이미지 또는 비디오를 드래그해주세요
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  또는 클릭해서 파일을 선택하세요 (최대 2GB)
                </p>
                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✓ <span className="font-semibold">{file.name}</span>
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      크기: {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* 업로드 버튼 */}
            <button
              type="submit"
              disabled={!file || !fileName || loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  업로드 중...
                </span>
              ) : (
                <span>🚀 업로드하기</span>
              )}
            </button>
          </form>
        </div>

        {/* 성공 결과 */}
        {uploadUrl && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                ✅ 업로드 완료!
              </h2>
              <p className="text-gray-600">아래 URL을 복사해서 사용하세요</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
              <p className="text-xs text-gray-600 mb-2 font-semibold">📋 CDN URL:</p>
              <p className="text-sm text-green-700 break-all font-mono font-semibold">
                {uploadUrl}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyToClipboard}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                {showCopied ? '✓ 복사됨!' : '📋 클립보드 복사'}
              </button>
              <button
                onClick={() => {
                  setUploadUrl('');
                  setFile(null);
                  setFileName('');
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                🔄 다시 업로드
              </button>
            </div>
          </div>
        )}

        {/* 도움말 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 사용법</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">1️⃣</span>
              <div>
                <p className="font-semibold text-gray-700">파일명 입력</p>
                <p className="text-sm text-gray-600">
                  예: <span className="font-mono bg-gray-100 px-2 py-1 rounded">product/thumbnail</span>
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">2️⃣</span>
              <div>
                <p className="font-semibold text-gray-700">미디어 파일 선택</p>
                <p className="text-sm text-gray-600">
                  이미지(JPG, PNG, GIF, WebP) 또는 비디오(MP4, MOV, AVI, WebM) 선택
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">3️⃣</span>
              <div>
                <p className="font-semibold text-gray-700">업로드</p>
                <p className="text-sm text-gray-600">
                  버튼을 클릭해서 S3에 업로드 (최대 2GB)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0">4️⃣</span>
              <div>
                <p className="font-semibold text-gray-700">URL 복사</p>
                <p className="text-sm text-gray-600">
                  완성된 CDN URL을 복사해서 사용
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
