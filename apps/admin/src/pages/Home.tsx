import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function Home() {
  const navigate = useNavigate();
  
  // State lưu trữ số lượng phần tử
  const [stats, setStats] = useState({
    categories: 0,
    vocabularies: 0,
    users: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hàm fetch dữ liệu thống kê từ Backend
    const fetchStats = async () => {
      try {
        // Ghi chú: Sau này bạn viết 1 API trả về thống kê chung cho nhanh
        // Ví dụ: const res = await apiClient('/admin/stats');
        // Tạm thời fake data để lên UI trước:
        setTimeout(() => {
          setStats({
            categories: 12,
            vocabularies: 156,
            users: 1042,
          });
          setIsLoading(false);
        }, 500); // Giả lập loading 0.5s
      } catch (error) {
        console.error('Lỗi khi tải thống kê:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Mảng cấu hình các Card để render bằng vòng lặp cho gọn
  const cards = [
    {
      title: 'Danh mục (Category)',
      count: stats.categories,
      color: 'bg-blue-50 text-blue-600',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
      link: '/categories',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      title: 'Từ vựng (Vocabulary)',
      count: stats.vocabularies,
      color: 'bg-green-50 text-green-600',
      btnColor: 'bg-green-600 hover:bg-green-700',
      link: '/vocabularies',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    {
      title: 'Người dùng (User)',
      count: stats.users,
      color: 'bg-purple-50 text-purple-600',
      btnColor: 'bg-purple-600 hover:bg-purple-700',
      link: '/users',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tổng quan hệ thống</h1>
          <button 
            onClick={() => {
              // Xóa toàn bộ thông tin đăng nhập khỏi localStorage
              localStorage.clear();
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition"
          >
            Đăng xuất
          </button>
        </div>

        {/* Lưới các thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-md">
              
              {/* Icon */}
              <div className={`p-4 rounded-full mb-4 ${card.color}`}>
                {card.icon}
              </div>

              {/* Tên & Số lượng */}
              <h2 className="text-gray-500 font-medium text-lg">{card.title}</h2>
              <div className="text-4xl font-bold text-gray-800 my-4">
                {isLoading ? (
                  <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  card.count
                )}
              </div>

              {/* Nút xem chi tiết */}
              <button
                onClick={() => navigate(card.link)}
                className={`mt-auto w-full py-2.5 rounded-lg text-white font-medium transition-colors ${card.btnColor}`}
              >
                Xem chi tiết
              </button>
              
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}