import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VocabularyModal({ isOpen, onClose, onSuccess }: VocabularyModalProps) {
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    phonetic: '',
    level: 'Basic', // Mặc định là Basic
    category_id: '',
    auto_gen_ai: false, // Checkbox AI
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy danh sách Categories để đổ vào Select Box khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          // Lấy limit lớn để hiển thị đủ danh mục trong dropdown
          const res = await apiClient('/admin/categories?page=1&limit=100');
          if (res.ok) {
            const data = await res.json();
            setCategories(data.data || []);
            // Tự động chọn category đầu tiên nếu chưa chọn
            if (data.data?.length > 0 && !formData.category_id) {
              setFormData((prev) => ({ ...prev, category_id: data.data[0].id }));
            }
          }
        } catch (err) {
          console.error('Lỗi tải danh mục', err);
        }
      };
      fetchCategories();
    } else {
      // Reset form khi đóng Modal
      setFormData({ word: '', meaning: '', phonetic: '', level: 'Basic', category_id: '', auto_gen_ai: false });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      setError('Vui lòng chọn danh mục!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient('/admin/vocabularies', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || 'Lỗi khi tạo từ vựng!');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Tạo Từ Vựng Mới
            {formData.auto_gen_ai && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">✨ AI Enabled</span>}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ vựng (Word) <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                onBlur={async () => {
                  if (!formData.word.trim()) return;

                  try {
                    setIsLoading(true);
                    const res = await apiClient(`/admin/vocabularies/auto-fill/${formData.word}`);
                    if (res.ok) {
                      const data = await res.json();
                      setFormData((prev) => ({
                        ...prev,
                        meaning: data.meaning || '',
                        phonetic: data.phonetic || '',
                      }));
                    }
                  } catch (err) {
                    console.error('Auto fill failed', err);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: Hello"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phiên âm (Phonetic)</label>
              <input type="text" required value={formData.phonetic} onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: /həˈləʊ/" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nghĩa (Meaning) <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.meaning} onChange={(e) => setFormData({ ...formData, meaning: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Xin chào" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
              <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
              <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="Basic">Basic (Cơ bản)</option>
                <option value="Advanced">Advanced (Nâng cao)</option>
              </select>
            </div>
          </div>

          {/* Toggle Auto Gen AI */}
          <div className="flex items-center mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <input 
              type="checkbox" 
              id="ai_toggle" 
              checked={formData.auto_gen_ai} 
              onChange={(e) => setFormData({ ...formData, auto_gen_ai: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="ai_toggle" className="ml-3 text-sm font-medium text-purple-800 cursor-pointer">
              Tự động gọi AI tạo Storyline & Kiến thức
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Hủy</button>
            <button type="submit" disabled={isLoading} className={`px-6 py-2 text-white font-medium rounded-lg transition ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isLoading ? 'Đang xử lý...' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}