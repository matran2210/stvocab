import React, { useState, useEffect } from 'react';
// Nếu bạn import theo đường dẫn cũ thì mở comment ra nhé
// import { apiClient } from '@/utils/apiClient'; 
import { apiClient } from '../../api/client';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
interface StudentMock {
  name: string;
  avatar_base_url: string;
}

interface ItemEntity {
  id?: string;
  name: string;
  description: string;
  type: string;
  rarity_star: number;
  price_gold: number;
  image_url: string;
  is_active: boolean;
  metadata: {
    cssString?: string;
    cssStyles?: React.CSSProperties;
  };
}

const DEFAULT_STUDENT: StudentMock = {
  name: 'Admin Preview',
  avatar_base_url:
    'https://api.dicebear.com/8.x/notionists/svg?seed=Felix&backgroundColor=f1f5f9',
};

const EquippedAvatar = ({
  student,
  frame,
}: {
  student?: StudentMock;
  frame: ItemEntity | null;
}) => {
  const baseCss: React.CSSProperties = { borderRadius: '50%' };
  const { rawCSS, ...safeCssStyles } =
    frame?.metadata?.cssStyles || ({} as any);
  const finalContainerCss = { ...baseCss, ...safeCssStyles };

  return (
    <>
      {/* Nếu JSON có chứa rawCSS (định nghĩa keyframes), nó sẽ render thẳng vào HTML */}
      {rawCSS && <style dangerouslySetInnerHTML={{ __html: rawCSS }} />}

      {/* THẺ CHA: Dùng avatar-root để bắt sự kiện CSS */}
      <div
        className="relative w-40 h-40 aspect-square avatar-root"
        style={finalContainerCss}
      >
        {/* LỚP 1 - AVATAR: Thêm class avatar-inner để làm counter-animation */}
        <div className="absolute inset-0 rounded-full overflow-hidden z-[1] avatar-inner">
          {student ? (
            <img
              src={student.avatar_base_url}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white" />
          )}
        </div>

        {/* LỚP 2 - KHUNG VIỀN: Dùng -top-[15%] -left-[15%] thay cho translate để tránh bị CSS animation đè */}
        {frame?.image_url && (
          <img
            src={frame.image_url}
            alt={frame.name}
            className="absolute -top-[15%] -left-[15%] w-[130%] h-[130%] max-w-none pointer-events-none object-contain z-[5] frame-img"
          />
        )}
      </div>
    </>
  );
};

export default function AvatarFrameDesigner() {
  const [items, setItems] = useState<ItemEntity[]>([]);
  const [editingItem, setEditingItem] = useState<ItemEntity | null>(null);
  const [originalItem, setOriginalItem] = useState<ItemEntity | null>(null);
  const [cssError, setCssError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});

  // --- STATE MODALS & TOAST ---
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // --- STATE FILTER & SORT ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<number | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await apiClient(`/admin/items?page=1&limit=50`);
        if (!response.ok) throw new Error('Fetch failed');
        const responseData = await response.json();
        setItems(responseData.data || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi fetch items:', err);
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const isDirty =
    originalItem &&
    editingItem &&
    JSON.stringify(editingItem) !== JSON.stringify(originalItem);

  const handleAddNew = () => {
    const tempId = `temp_${Date.now()}`;
    const newItem: ItemEntity = {
      id: tempId,
      name: 'Khung viền mới',
      description: '',
      type: 'AvatarFrame',
      rarity_star: 4,
      price_gold: 1000,
      image_url: '',
      is_active: true,
      metadata: {
        cssString: '',
        cssStyles: { border: '3px solid #3b82f6' },
      },
    };

    setItems([newItem, ...items]);
    setEditingItem(newItem);
    setOriginalItem({ ...newItem, id: tempId + '_unsaved' });
    setCssError('');
  };

  const handleInputChange = (field: keyof ItemEntity, value: any) => {
    if (!editingItem) return;
    const updated = { ...editingItem, [field]: value };
    setEditingItem(updated);
    if (updated.id) {
      setDirtyMap((prev) => ({ ...prev, [updated.id!]: true }));
    }
  };

  const handleCssChange = (jsonString: string) => {
    if (!editingItem) return;
    try {
      const parsedCss = JSON.parse(jsonString || '{}');
      setEditingItem({
        ...editingItem,
        metadata: { cssString: jsonString, cssStyles: parsedCss },
      });
      setCssError('');
      if (editingItem.id) {
        setDirtyMap((prev) => ({ ...prev, [editingItem.id!]: true }));
      }
    } catch (error) {
      setEditingItem({
        ...editingItem,
        metadata: { ...editingItem.metadata, cssString: jsonString },
      });
      setCssError(
        'Lỗi cú pháp JSON. Vui lòng kiểm tra lại dấu phẩy, ngoặc kép...',
      );
      if (editingItem.id) {
        setDirtyMap((prev) => ({ ...prev, [editingItem.id!]: true }));
      }
    }
  };

  const handleSave = async (itemToSave = editingItem) => {
    if (!itemToSave || !itemToSave.id) return false;
    if (cssError) {
      showToast('Sửa lỗi CSS trước khi lưu nhé!', 'error');
      return false;
    }

    try {
      const isNewItem = itemToSave.id.startsWith('temp_');
      let savedItem;

      if (isNewItem) {
        const payload = { ...itemToSave };
        delete payload.id;

        const response = await apiClient('/admin/items', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Create failed');
        savedItem = await response.json();
      } else {
        const response = await apiClient(`/admin/items/${itemToSave.id}`, {
          method: 'PATCH',
          body: JSON.stringify(itemToSave),
        });
        if (!response.ok) throw new Error('Update failed');
        savedItem = await response.json();
      }

      setItems(items.map((i) => (i.id === itemToSave.id ? savedItem : i)));
      setOriginalItem(savedItem);
      setEditingItem(savedItem);
      
      setDirtyMap((prev) => {
        const clone = { ...prev };
        delete clone[itemToSave.id!]; 
        return clone;
      });

      if (itemToSave.id === editingItem?.id)
        showToast('Đã lưu thành công!', 'success');
      return true;
    } catch (err) {
      showToast('Lỗi khi lưu!', 'error');
      return false;
    }
  };

  const handleSelectItem = (targetItem: ItemEntity) => {
    if (editingItem && isDirty) {
      setItems((prevItems) =>
        prevItems.map((i) => (i.id === editingItem.id ? editingItem : i)),
      );
    }
    loadItemToEditor(targetItem);
  };

  const loadItemToEditor = (targetItem: ItemEntity) => {
    const rawCss = targetItem.metadata?.cssString || '{}';
    let parsedCss = {};
    try {
      parsedCss = JSON.parse(rawCss);
    } catch (e) {}

    const itemToLoad = {
      ...targetItem,
      metadata: { ...targetItem.metadata, cssStyles: parsedCss },
    };
    setEditingItem(itemToLoad);
    setOriginalItem(itemToLoad);
    setCssError('');
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id); 
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (!itemToDelete.startsWith('temp_')) {
        const response = await apiClient(`/admin/items/${itemToDelete}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Delete failed');
      }

      setItems(items.filter((i) => i.id !== itemToDelete));
      if (editingItem?.id === itemToDelete) {
        setEditingItem(null);
        setOriginalItem(null);
      }
      
      setDirtyMap((prev) => {
        const clone = { ...prev };
        delete clone[itemToDelete];
        return clone;
      });

      showToast('Đã xóa khung thành công', 'success');
    } catch (err) {
      showToast('Lỗi khi xóa khung!', 'error');
    } finally {
      setItemToDelete(null); 
    }
  };

  // --- LOGIC LỌC DỮ LIỆU CHUẨN BỊ RENDER ---
  const filteredItems = items
    .filter((item) => {
      const matchName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRarity = filterRarity === 'all' || item.rarity_star === filterRarity;
      return matchName && matchRarity;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.price_gold - b.price_gold;
      if (sortOrder === 'desc') return b.price_gold - a.price_gold;
      return 0;
    });

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/home'}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-100 transition"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Designer Khung Viền
            </h1>
            {isDirty && (
              <span className="text-sm font-bold text-orange-500 animate-pulse bg-orange-100 px-3 py-1 rounded-full">
                ⚠️ Có thay đổi chưa lưu
              </span>
            )}
          </div>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
          >
            + Thêm Khung Mới
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: EDITOR */}
          <div className="lg:col-span-2 space-y-6">
            {editingItem ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-xl mb-6 border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500 mb-4 uppercase tracking-wider font-bold">
                    Live Preview
                  </p>
                  <EquippedAvatar
                    student={DEFAULT_STUDENT}
                    frame={editingItem}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên Khung
                    </label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Ảnh Khung
                    </label>
                    <input
                      type="text"
                      value={editingItem.image_url}
                      onChange={(e) =>
                        handleInputChange('image_url', e.target.value)
                      }
                      placeholder="https://..."
                      className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá Vàng
                    </label>
                    <input
                      type="number"
                      value={editingItem.price_gold}
                      onChange={(e) =>
                        handleInputChange('price_gold', Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Độ hiếm (Sao)
                    </label>
                    <input
                      type="number"
                      value={editingItem.rarity_star}
                      onChange={(e) =>
                        handleInputChange('rarity_star', Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cấu hình CSS (JSON)
                  </label>
                  <textarea
                    rows={6}
                    value={editingItem.metadata.cssString || ''}
                    onChange={(e) => handleCssChange(e.target.value)}
                    className={`w-full border font-mono text-sm p-3 rounded-lg outline-none ${cssError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-slate-900 text-green-400'}`}
                  />
                  {cssError && (
                    <p className="text-red-500 text-xs mt-1">{cssError}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      if (editingItem.id?.startsWith('temp_')) {
                        setItems(items.filter((i) => i.id !== editingItem.id));
                        setEditingItem(null);
                        setDirtyMap(prev => { const c = {...prev}; delete c[editingItem.id!]; return c; });
                      } else {
                        setEditingItem(originalItem);
                        setDirtyMap(prev => { const c = {...prev}; delete c[editingItem.id!]; return c; });
                      }
                      setCssError('');
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Hủy thay đổi
                  </button>
                  <button
                    onClick={() => handleSave()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                  >
                    Lưu lại
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center h-64 text-gray-400">
                Bấm vào một khung bên phải hoặc thêm mới để bắt đầu thiết kế.
              </div>
            )}
          </div>

          {/* CỘT PHẢI: DANH SÁCH & FILTER */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-[80vh] flex flex-col">
            <div className="mb-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">
                  Danh sách ({filteredItems.length})
                </h3>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`p-2 rounded-lg transition text-sm ${isFilterOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  🔍 Bộ lọc
                </button>
              </div>

              {/* Thanh Search nhanh */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm tên khung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute left-3 top-2 opacity-40">🔎</span>
              </div>

              {/* Panel Filter mở rộng */}
              {isFilterOpen && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-3 animate-slide-in">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-blue-400 mb-1">
                      Độ hiếm
                    </label>
                    <div className="flex gap-2">
                      {['all', 4, 5].map((r) => (
                        <button
                          key={r}
                          onClick={() => setFilterRarity(r as any)}
                          className={`flex-1 py-1 text-xs rounded-md border transition ${filterRarity === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                          {r === 'all' ? 'Tất cả' : `${r} ⭐`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-blue-400 mb-1">
                      Giá vàng
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="w-full p-2 text-xs rounded-md border border-gray-200 outline-none bg-white text-gray-700"
                    >
                      <option value="none">Mặc định</option>
                      <option value="asc">Giá thấp đến cao ↑</option>
                      <option value="desc">Giá cao xuống thấp ↓</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Danh sách Item sau khi filter */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`group relative flex items-center gap-4 p-3 rounded-xl cursor-pointer border-2 transition ${editingItem?.id === item.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="relative w-12 h-12 shrink-0">
                    {item.id?.startsWith('temp_') && (
                      <span
                        className="absolute top-0 right-0 bg-orange-500 w-3 h-3 rounded-full border-2 border-white z-10 translate-x-1 -translate-y-1"
                        title="Chưa lưu"
                      ></span>
                    )}
                    <div className="scale-[0.3] origin-top-left">
                      <EquippedAvatar frame={item} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">
                      {item.name}
                      {item.id?.startsWith('temp_') && (
                        <span className="text-xs text-orange-500 italic ml-1">
                          (Nháp)
                        </span>
                      )}
                      {!item.id?.startsWith('temp_') &&
                        dirtyMap[item.id!] && (
                          <span className="text-xs text-orange-500 italic ml-1">
                            (Chưa lưu)
                          </span>
                        )}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Giá: {item.price_gold} vàng | {item.rarity_star} ⭐
                    </p>
                  </div>

                  <button
                    onClick={(e) => confirmDelete(item.id!, e)}
                    className="absolute right-3 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm italic">
                  Không tìm thấy khung nào phù hợp...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL XÁC NHẬN XÓA --- */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <span className="text-2xl">🗑️</span>
              </div>
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-2">
                Xác nhận xóa
              </h3>
              <p className="text-sm text-gray-500 mb-8">
                Bạn có chắc chắn muốn xóa khung viền này không? Hành động này
                không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy bỏ
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Xóa ngay
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
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-in {
            animation: slide-in 0.2s ease-out;
          }
        `}
      </style>
    </div>
  );
}