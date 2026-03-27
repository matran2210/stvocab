import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();



const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const credentials = btoa(`${username}:${password}`);
    const basicAuthHeader = `Basic ${credentials}`;

    // Gọi API qua client dùng chung
    const response = await apiClient('/auth/admin/login', {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader,
      },
      body: JSON.stringify({ user: username, pass: password }),
    });

    if (response.ok) {
      // Lưu lại để dùng cho các request sau trong interceptor của client
      localStorage.setItem('admin_auth', basicAuthHeader);
      navigate('/home');
    } else {
      setError('Sai tài khoản hoặc mật khẩu Admin!');
    }
  } catch (err) {
    setError('Không thể kết nối tới server.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          StVocab Admin
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tài khoản
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Nhập username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}