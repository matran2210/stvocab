import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client'; // Import client gọi API dùng chung
import CategoryModal from './CategoryModal';

// Định nghĩa kiểu dữ liệu cho Category
interface Category {
  id: string;
  name: string;
  description: string;
  total_words: number;
  created_at: string;
}

export default function CategoryList() {
  const navigate = useNavigate();

  // States quản lý dữ liệu và UI
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // States cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Số item trên 1 trang

  // State cho Modal Xác nhận xóa
  const [deleteItem, setDeleteItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // State cho Toast thông báo (Góc phải màn hình)
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Hàm hiển thị Toast tự tắt sau 3 giây
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Hàm gọi API lấy danh sách
  const fetchCategories = async (page: number) => {
    setIsLoading(true);
    try {
      // Gọi API GET kèm query params cho phân trang
      const response = await apiClient(
        `/admin/categories?page=${page}&limit=${limit}`,
      );

      if (response.ok) {
        const data = await response.json();
        // Giả sử backend trả về format: { data: [...], meta: { totalPages: 5, currentPage: 1 } }
        setCategories(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        setCurrentPage(page);
      } else {
        setError('Không thể tải danh sách danh mục');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API lần đầu khi vào trang hoặc khi đổi trang
  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  // Hàm 1: Bấm nút Xóa trên bảng -> Mở Modal Confirm
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteItem({ id, name });
  };

  // Hàm 2: Bấm nút "Chắc chắn xóa" trong Modal -> Gọi API
  const executeDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await apiClient(`/admin/categories/${deleteItem.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Xóa danh mục thành công!', 'success');
        fetchCategories(currentPage); // Tải lại trang
      } else {
        showToast('Có lỗi xảy ra khi xóa!', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setDeleteItem(null); // Xóa xong (hoặc lỗi) thì đóng Modal
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header của trang */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 transition"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý Danh mục</h1>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            + Tạo danh mục mới
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 max-h-[700px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="p-4 font-semibold">Tên danh mục</th>
                <th className="p-4 font-semibold hidden md:table-cell">
                  Mô tả
                </th>
                <th className="p-4 font-semibold text-center">Số từ vựng</th>
                <th className="p-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {cat.name}
                    </td>
                    <td className="p-4 text-gray-600 hidden md:table-cell truncate max-w-xs">
                      {cat.description}
                    </td>
                    <td className="p-4 text-center text-blue-600 font-semibold">
                      {cat.total_words || 0}
                    </td>
                    <td className="p-4 text-center space-x-3">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 border border-amber-400 text-amber-500 rounded-md hover:bg-amber-50 transition text-sm font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat.id, cat.name)}
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null); // Đóng modal thì dọn rác đi
        }}
        onSuccess={() => {
          fetchCategories(currentPage);
          showToast('Thao tác thành công!', 'success');
        }}
        editData={editingCategory}
      />

      {/* ---------------- UI MODAL XÁC NHẬN XÓA ---------------- */}
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
              Bạn có chắc chắn muốn xóa danh mục{' '}
              <span className="font-semibold text-gray-800">
                "{deleteItem.name}"
              </span>{' '}
              không? Hành động này không thể hoàn tác.
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

      {/* ---------------- UI TOAST THÔNG BÁO ---------------- */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-[70] transition-all transform flex items-center space-x-2 animate-slide-in ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.type === 'success' ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
      <style>
        {`
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translate(-50%, -20px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}
