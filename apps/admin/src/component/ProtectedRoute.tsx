import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function ProtectedRoute() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      // 1. Check xem có token trong localStorage chưa
      const auth = localStorage.getItem('admin_auth');
      if (!auth) {
        setIsLoading(false);
        return;
      }

      // 2. Gọi API get me để check xem token có đúng không
      try {
        const response = await apiClient('/auth/admin/me', {
          method: 'GET'
        });

        if (response.ok) {
          setIsVerified(true);
        } else {
          // Lỗi 401 thì xoá token rác đi
          localStorage.removeItem('admin_auth');
        }
      } catch (error) {
        console.error('Lỗi kết nối máy chủ', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Đang gọi API thì hiện chữ Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-500 animate-pulse">
          Đang kiểm tra quyền truy cập...
        </div>
      </div>
    );
  }

  // Nếu xác thực thành công -> Render các trang con (Outlet)
  // Nếu thất bại -> Đá về trang /login
  return isVerified ? <Outlet /> : <Navigate to="/login" replace />;
}