'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface FileItem {
  key: string;
  fileName: string;
  size: number;
  lastModified: string;
  url: string;
}

type SortField = 'fileName' | 'size' | 'lastModified';
type SortOrder = 'asc' | 'desc';

export default function FilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCopied, setShowCopied] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('lastModified');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 인증 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/verify');
        if (!response.data.authenticated) {
          router.push('/login');
        } else {
          setIsCheckingAuth(false);
          loadFiles();
        }
      } catch (err) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/files');
      if (response.data.success) {
        setFiles(response.data.files);
      }
    } catch (err) {
      setError('파일 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const copyToClipboard = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setShowCopied(key);
    setTimeout(() => setShowCopied(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 같은 필드 클릭 시 정렬 순서 변경
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 필드 클릭 시 해당 필드로 내림차순 정렬
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const sortedAndFilteredFiles = files
    .filter((file) =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'fileName') {
        comparison = a.fileName.localeCompare(b.fileName);
      } else if (sortField === 'size') {
        comparison = a.size - b.size;
      } else if (sortField === 'lastModified') {
        comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

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
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md hover:shadow-lg"
            >
              ⬅️ 업로드
            </button>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                📁 파일 목록
              </h1>
              <p className="text-gray-600">
                S3에 업로드된 파일들을 관리하세요
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md hover:shadow-lg"
          >
            🚪 로그아웃
          </button>
        </div>

        {/* 검색 & 새로고침 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 파일명 검색..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <button
              onClick={loadFiles}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? '⏳ 로딩...' : '🔄 새로고침'}
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            총 <span className="font-bold text-indigo-600">{sortedAndFilteredFiles.length}</span>개의 파일
            {searchTerm && ` (전체 ${files.length}개 중)`}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-700 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* 파일 테이블 */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-4xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-600">파일 목록을 불러오는 중...</p>
          </div>
        ) : sortedAndFilteredFiles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600">
              {searchTerm ? '검색 결과가 없습니다' : '업로드된 파일이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition"
                      onClick={() => handleSort('fileName')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>파일명</span>
                        <span className="text-xs">{getSortIcon('fileName')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition"
                      onClick={() => handleSort('size')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>크기</span>
                        <span className="text-xs">{getSortIcon('size')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-indigo-700 transition"
                      onClick={() => handleSort('lastModified')}
                    >
                      <div className="flex items-center space-x-2">
                        <span>업로드 일시</span>
                        <span className="text-xs">{getSortIcon('lastModified')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedAndFilteredFiles.map((file, index) => (
                    <tr
                      key={file.key}
                      className={`hover:bg-gray-50 transition ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {file.fileName.match(/\.(mp4|mov|avi|webm|mpeg)$/i) ? '🎬' : '🖼️'}
                          </span>
                          <span className="font-mono text-sm text-gray-800">
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatSize(file.size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(file.lastModified)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm shadow-md hover:shadow-lg"
                          >
                            🔗 열기
                          </button>
                          <button
                            onClick={() => copyToClipboard(file.url, file.key)}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm shadow-md hover:shadow-lg"
                          >
                            {showCopied === file.key ? '✓ 복사됨!' : '📋 복사'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

