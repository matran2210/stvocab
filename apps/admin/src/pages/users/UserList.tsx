import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import UserModal from './UserModal'; // Đảm bảo import đúng đường dẫn tới file UserModal của bạn

// Điều chỉnh lại Interface theo đúng database-structure.txt
interface User {
  id: string;
  name: string
  email: string;
  phone: string | null;
  status: string;
  gold: number;
  learning_points: number;
  trial_expiration: string | null;
  package_level: string;
}

export default function UserList() {
  const navigate = useNavigate();

  // States quản lý dữ liệu và UI
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // States cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // States cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);

  // State cho Modal Xác nhận xóa
  const [deleteItem, setDeleteItem] = useState<{
    id: string;
    email: string;
  } | null>(null);

  // State cho Toast thông báo
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Hàm gọi API lấy danh sách User
  const fetchUsers = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await apiClient(
        `/admin/users?page=${page}&limit=${limit}`,
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        setCurrentPage(page);
      } else {
        setError('Không thể tải danh sách người dùng');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Handlers mở Modal Thêm/Sửa
  const handleOpenCreate = () => {
    setEditItem(null); // Gán null để báo hiệu đây là Tạo mới
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditItem(user); // Truyền nguyên object user sang Modal
    setIsModalOpen(true);
  };

  // Callback khi Modal Thêm/Sửa thành công
  const handleModalSuccess = () => {
    showToast(
      editItem
        ? 'Cập nhật người dùng thành công!'
        : 'Tạo người dùng thành công!',
      'success',
    );
    fetchUsers(currentPage); // Load lại dữ liệu trang hiện tại
  };

  const executeDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await apiClient(`/admin/users/${deleteItem.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Xóa người dùng thành công!', 'success');
        fetchUsers(currentPage);
      } else {
        showToast('Có lỗi xảy ra khi xóa!', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setDeleteItem(null);
    }
  };

  // Hàm format ngày tháng
  const formatExpirationDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen relative">
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
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý Người dùng
            </h1>
          </div>

          {/* Nút Tạo mới User */}
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm flex items-center space-x-2"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Tạo người dùng</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <th className="p-4 font-semibold">Tên / Email</th>
                <th className="p-4 font-semibold text-center">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Gold</th>
                <th className="p-4 font-semibold text-center">Điểm</th>
                <th className="p-4 font-semibold text-center">Trial</th>
                <th className="p-4 font-semibold text-center">Gói sử dụng</th>
                <th className="p-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">
                      <div className="font-semibold text-gray-800">
                        {user.name || 'Chưa cập nhật'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>

                    <td className="p-2 text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : user.status === 'banned'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-2 text-center">
                      <span className="text-amber-600 font-bold text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-100 inline-flex items-center gap-1">
                        {user.gold}
                      </span>
                    </td>

                    <td className="p-2 text-center">
                      <span className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-flex items-center gap-1">
                        {user.learning_points}
                      </span>
                    </td>

                    <td className="p-2 text-center">
                      {user.trial_expiration ? (
                        <div className="flex flex-col items-center">
                          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md mb-1">
                            Trial
                          </span>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatExpirationDate(user.trial_expiration)}
                          </span>
                        </div>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                          Paid
                        </span>
                      )}
                    </td>

                    <td className="p-2 text-center">
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">
                        {user.package_level.toUpperCase()}
                      </span>
                    </td>

                    {/* Cột 7: Hành động */}
                    <td className="p-2 text-center space-x-3">
                      {/* Nút Sửa */}
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="px-3 py-1 border border-blue-400 text-blue-600 rounded-md hover:bg-blue-50 transition text-sm font-medium inline-block"
                      >
                        Sửa
                      </button>

                      {/* Nút Xóa */}
                      <button
                        onClick={() =>
                          setDeleteItem({ id: user.id, email: user.email })
                        }
                        className="px-3 py-1 border border-red-400 text-red-500 rounded-md hover:bg-red-50 transition text-sm font-medium inline-block"
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

      {/* ---------------- COMPONENT USER MODAL ---------------- */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        editData={editItem}
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
              Bạn có chắc chắn muốn xóa user <br />
              <span className="font-semibold text-gray-800">
                "{deleteItem.email}"
              </span>{' '}
              không?
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
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
