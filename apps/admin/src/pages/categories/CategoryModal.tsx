import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any; // Thêm prop này: Chứa dữ liệu khi ấn "Sửa", null nếu "Tạo"
}

export default function CategoryModal({ isOpen, onClose, onSuccess, editData }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Lắng nghe sự thay đổi của editData để đổ dữ liệu vào form
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        description: editData.description || '',
      });
    } else {
      // Nếu không có editData (Tạo mới) thì reset form
      setFormData({ name: '', description: '' });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Phân biệt chế độ Sửa (PUT) và Tạo (POST)
    const isEdit = !!editData;
    const url = isEdit ? `/admin/categories/${editData.id}` : '/admin/categories';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const response = await apiClient(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess(); // Gọi để reload list
        onClose();   // Đóng modal
      } else {
        const data = await response.json();
        setError(data.message || 'Có lỗi xảy ra!');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          {/* Đổi Title theo chế độ */}
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? 'Cập Nhật Danh Mục' : 'Tạo Danh Mục Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className={`px-6 py-2 text-white font-medium rounded-lg transition ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}>
              {/* Đổi chữ ở nút Submit */}
              {isLoading ? 'Đang lưu...' : (editData ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}