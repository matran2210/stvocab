import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import VocabularyCreate from './VocabularyCreate';
import { useNavigate } from 'react-router-dom';

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  level: string;
  category_id: string;
  category?: { name: string }; // Tuỳ thuộc Backend có join bảng Category lúc list ra không
}

export default function VocabularyList() {
  const navigate = useNavigate();
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    id: string;
    word: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVocabularies = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await apiClient(
        `/admin/vocabularies?page=${page}&limit=${limit}`,
      );
      if (response.ok) {
        const data = await response.json();
        setVocabularies(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        setCurrentPage(page);
      } else {
        showToast('Không thể tải danh sách từ vựng', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularies(currentPage);
  }, [currentPage]);

  const executeDelete = async () => {
    if (!deleteItem) return;
    try {
      const response = await apiClient(`/admin/vocabularies/${deleteItem.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showToast('Xóa từ vựng thành công!', 'success');
        fetchVocabularies(currentPage);
      } else {
        showToast('Có lỗi xảy ra khi xóa!', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setDeleteItem(null);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 transition"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý Từ vựng
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            + Tạo từ vựng mới
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="p-4 font-semibold">Từ vựng</th>
                <th className="p-4 font-semibold">Nghĩa</th>
                <th className="p-4 font-semibold">Loại từ vựng</th>
                <th className="p-4 font-semibold text-center">Cấp độ</th>
                <th className="p-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : vocabularies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Chưa có từ vựng nào.
                  </td>
                </tr>
              ) : (
                vocabularies.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium text-gray-800">{v.word}</td>
                    <td className="p-4 text-gray-600">{v.meaning}</td>
                    <td className="p-4 text-gray-600">
                      {v.category?.name || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${v.level === 'Basic' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                      >
                        {v.level}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-3">
                      {/* Tạm thời Edit disabled theo yêu cầu của bạn */}
                      <button
                        onClick={() => navigate(`/vocabularies/edit/${v.id}`)}
                        className="px-3 py-1 border border-amber-400 text-amber-500 rounded-md hover:bg-amber-50 transition text-sm font-medium"
                        title="Chức năng đang phát triển"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          setDeleteItem({ id: v.id, word: v.word })
                        }
                        className="px-3 py-1 border border-red-400 text-red-500 rounded-md hover:bg-red-50 transition text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang (Pagination) */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-end items-center mt-6 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 border rounded-lg bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                } transition`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 border rounded-lg bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition"
            >
              →
            </button>
          </div>
        )}
      </div>

      <VocabularyCreate
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setCurrentPage(1);
          fetchVocabularies(1);
        }}
      />

      {/* UI MODAL XÁC NHẬN XÓA */}
      {deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa từ vựng{' '}
              <span className="font-semibold text-gray-800">
                "{deleteItem.word}"
              </span>
              ?
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-5 py-2 text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={executeDelete}
                className="px-5 py-2 text-white font-medium bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm"
              >
                Chắc chắn xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UI TOAST */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-[70] transition-all transform flex items-center space-x-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
