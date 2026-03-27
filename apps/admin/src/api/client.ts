const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  // Lấy header auth đã lưu từ localStorage (nếu có)
  const authHeader = localStorage.getItem('admin_auth');

  // Khởi tạo headers mặc định với Token
  const headers: Record<string, string> = {
    ...(authHeader ? { Authorization: authHeader } : {}),
  };

  // QUAN TRỌNG: Kiểm tra xem data gửi đi có phải là FormData không
  if (options.body instanceof FormData) {
    // Nếu là FormData (Upload file) -> Không làm gì cả, để trình duyệt tự set Content-Type
  } else {
    // Nếu là dữ liệu bình thường -> Ép kiểu Content-Type thành JSON
    headers['Content-Type'] = 'application/json';
  }

  // Gộp các header truyền thêm từ options (nếu có) vào header mặc định
  const finalHeaders = {
    ...headers,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: finalHeaders,
  });

  if (response.status === 401) {
    // Nếu lỗi 401 (Unauthorized), xóa auth và đá về login
    localStorage.removeItem('admin_auth');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  return response;
};