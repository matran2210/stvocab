import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any; 
}

// Hàm hỗ trợ format chuỗi ISO 8601 từ backend sang định dạng dùng cho <input type="datetime-local">
const formatDateForInput = (isoString?: string | null) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16); 
};

export default function UserModal({ isOpen, onClose, onSuccess, editData }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    trial_expiration: '', // YYYY-MM-DDThh:mm
    package_level: 'Basic',
    gold: 0,
    learning_points: 0,
    pity_counter: 0,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Đổ dữ liệu vào form khi sửa hoặc reset khi tạo mới
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        email: editData.email || '',
        phone: editData.phone || '',
        status: editData.status || 'active',
        trial_expiration: formatDateForInput(editData.trial_expiration),
        package_level: editData.package_level || 'Basic',
        gold: editData.gold || 0,
        learning_points: editData.learning_points || 0,
        pity_counter: editData.pity_counter || 0,
      });
    } else {
      setFormData({ 
        name: '',
        email: '', 
        phone: '', 
        status: 'active', 
        trial_expiration: '',
        package_level: 'Basic',
        gold: 0,
        learning_points: 0,
        pity_counter: 0,
      });
    }
    setError('');
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const isEdit = !!editData;
    const url = isEdit ? `/admin/users/${editData.id}` : '/admin/users';
    const method = isEdit ? 'PATCH' : 'POST';

    // Chuyển lại ngày giờ về chuẩn ISO cho backend, hoặc gán null nếu bỏ trống
    const payload = {
      ...formData,
      trial_expiration: formData.trial_expiration ? new Date(formData.trial_expiration).toISOString() : null,
    };

    try {
      const response = await apiClient(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess(); 
        onClose();   
      } else {
        const data = await response.json();
        setError(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Có lỗi xảy ra!');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? 'Cập Nhật Người Dùng' : 'Thêm Người Dùng Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>}

            {/* --- NHÓM 1: THÔNG TIN CƠ BẢN --- */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên (Name)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="active">Hoạt động (Active)</option>
                    <option value="inactive">Tạm khóa (Inactive)</option>
                    <option value="banned">Cấm (Banned)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* --- NHÓM 2: CHỈ SỐ HỌC TẬP & GAME --- */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Chỉ số & Hệ thống</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vàng (Gold)</label>
                  <input
                    type="number" min="0"
                    value={formData.gold}
                    onChange={(e) => setFormData({ ...formData, gold: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điểm</label>
                  <input
                    type="number" min="0"
                    value={formData.learning_points}
                    onChange={(e) => setFormData({ ...formData, learning_points: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pity Counter</label>
                  <input
                    type="number" min="0"
                    value={formData.pity_counter}
                    onChange={(e) => setFormData({ ...formData, pity_counter: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* --- NHÓM 3: GÓI TÀI KHOẢN & DÙNG THỬ --- */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Gói dịch vụ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gói tài khoản</label>
                  <select
                    value={formData.package_level}
                    onChange={(e) => setFormData({ ...formData, package_level: e.target.value })}
                    className="w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Basic">Basic (Có quảng cáo)</option>
                    <option value="Pro">Pro (Không quảng cáo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn dùng thử</label>
                  <input
                    type="datetime-local"
                    value={formData.trial_expiration}
                    onChange={(e) => setFormData({ ...formData, trial_expiration: e.target.value })}
                    className="w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition">
            Hủy
          </button>
          <button 
            type="submit" 
            form="user-form"
            disabled={isLoading} 
            className={`px-6 py-2 text-white font-medium rounded-lg transition ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Đang lưu...' : (editData ? 'Cập nhật' : 'Tạo mới')}
          </button>
        </div>

      </div>
    </div>
  );
}