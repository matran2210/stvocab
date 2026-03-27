import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JoditEditor from 'jodit-react';
import { apiClient } from '../../api/client';
import { marked } from 'marked';

export default function VocabularyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State lưu dữ liệu tổng
  const [vocab, setVocab] = useState({
    word: '',
    meaning: '',
    phonetic: '',
    category_id: '',
    storyline: '',
    image_path: '',
    audio_path: '',
  });

  // State lưu danh sách Category để chọn
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // States quản lý Loading từng phần riêng biệt
  const [isFetching, setIsFetching] = useState(true);
  const [loadingBasic, setLoadingBasic] = useState(false);
  const [loadingStoryline, setLoadingStoryline] = useState(false);
  const [loadingStorylineAI, setLoadingStorylineAI] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingImageAI, setLoadingImageAI] = useState(false);
  const [loadingAutoFill, setLoadingAutoFill] = useState(false);

  // States cho Image Prompt AI & Modal
  const [imagePrompt, setImagePrompt] = useState('');
  
  // --- STATES MỚI CHO UNSPLASH ---
  const [unsplashImages, setUnsplashImages] = useState<string[]>([]); // Mảng chứa 20 link ảnh
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0); // Vị trí ảnh đang xem
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Link ảnh đang hiển thị
  
  const [loadingPickImage, setLoadingPickImage] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);  
  // Ref và Config cho Jodit Editor
  const editorRef = useRef(null);
  const editorConfig = useMemo(() => ({
    readonly: false,
    height: 300,
    placeholder: 'Nhập nội dung storyline hoặc nhấn Gen AI để tạo tự động...',
    toolbarSticky: false,
    buttons: ['bold', 'italic', 'underline', 'strikethrough', '|', 'ul', 'ol', '|', 'font', 'fontsize', 'brush', 'paragraph', '|', 'link', 'align', 'undo', 'redo'],
  }), []);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await apiClient('/admin/categories?page=1&limit=100');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data || []);
        }

        const res = await apiClient(`/admin/vocabularies/${id}`);
        if (res.ok) {
          const data = await res.json();
          setVocab(data);
        } else {
          showToast('Không tìm thấy từ vựng!', 'error');
          navigate('/vocabularies');
        }
      } catch (err) {
        showToast('Lỗi máy chủ!', 'error');
      } finally {
        setIsFetching(false);
      }
    };
    fetchInitialData();
  }, [id, navigate]);
  

  // Hàm Update API dùng chung
  const executeUpdate = async (payload: any) => {
    try {
      const isFile = payload instanceof FormData;
      
      const res = await apiClient(`/admin/vocabularies/${id}`, {
        method: 'PUT',
        body: isFile ? payload : JSON.stringify(payload),
      });
      
      if (res.ok) {
        const updatedData = await res.json();
        setVocab((prev) => ({ ...prev, ...updatedData }));
        return true;
      } else {
        showToast('Cập nhật thất bại!', 'error');
        return false;
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ!', 'error');
      return false;
    }
  };

  // --- CÁC HÀM XỬ LÝ CHO TỪNG KHỐI ---

  const handleSaveBasic = async () => {
    setLoadingBasic(true);
    const success = await executeUpdate({ 
      word: vocab.word, 
      meaning: vocab.meaning, 
      phonetic: vocab.phonetic,
      category_id: vocab.category_id
    });
    if (success) showToast('Lưu thông tin cơ bản thành công!', 'success');
    setLoadingBasic(false);
  };

  const playAudio = () => {
    if (!vocab.word) {
      showToast('Không có từ để phát âm!', 'error');
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(vocab.word);
      utterance.lang = 'en-US';
      utterance.rate = 1;

      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Trình duyệt không hỗ trợ TTS!', 'error');
    }
  };

  const handleAutoFill = async () => {
    if (!vocab.word.trim()) return;

    try {
      setLoadingAutoFill(true);
      const res = await apiClient(`/admin/vocabularies/auto-fill/${vocab.word}`);
      if (res.ok) {
        const data = await res.json();
        setVocab(prev => ({
          ...prev,
          meaning: data.meaning || '',
          phonetic: data.phonetic || '',
        }));
      } else {
        showToast('Không lấy được dữ liệu tự động!', 'error');
      }
    } catch (err) {
      showToast('Lỗi khi gọi auto-fill!', 'error');
    } finally {
      setLoadingAutoFill(false);
    }
  };

  const handleSaveStoryline = async () => {
    setLoadingStoryline(true);
    const success = await executeUpdate({ storyline: vocab.storyline });
    if (success) showToast('Lưu Storyline thành công!', 'success');
    setLoadingStoryline(false);
  };

  const handleGenStorylineAI = async () => {
    setLoadingStorylineAI(true);
    const success = await executeUpdate({ gen_storyline_ai: true });
    if (success) showToast('AI đã tạo xong Storyline!', 'success');
    setLoadingStorylineAI(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    const success = await executeUpdate(formData);
    if (success) showToast('Upload ảnh thành công!', 'success');
    setLoadingImage(false);
  };

  const handleGenImageAI = async () => {
    setIsConfirmModalOpen(false);
    if (!imagePrompt.trim()) return showToast('Vui lòng nhập prompt!', 'error');

    setLoadingImageAI(true);
    const success = await executeUpdate({ image_prompt_ai: imagePrompt });
    if (success) {
      showToast('AI đã tạo ảnh thành công!', 'success');
      setImagePrompt('');
    }
    setLoadingImageAI(false);
  };

  // --- HÀM TÌM ẢNH UNSPLASH (LẤY 20 ẢNH CÙNG LÚC) ---
  const fetchUnsplashImages = async () => {
    if (!vocab.word.trim()) {
      return;
    }

    try {
      setLoadingPickImage(true);
      // Gọi API truyền limit=20
      const res = await apiClient(`/admin/vocabularies/pick-unsplash/${vocab.word}?limit=20`);
      if (res.ok) {
        const data = await res.json();
        // Xử lý linh hoạt đề phòng API trả về mảng trực tiếp hoặc nằm trong key
        const urls = Array.isArray(data) ? data : (data.images || data.image_paths || data.data || []);
        
        if (urls.length > 0) {
          setUnsplashImages(urls);
          setCurrentImageIndex(0);
          setPreviewImage(urls[0]); // Hiển thị ảnh đầu tiên
          showToast(`Đã tải ${urls.length} ảnh! Hãy dùng nút mũi tên để chọn.`, 'success');
        } else {
          showToast('Không tìm thấy ảnh nào từ Unsplash!', 'error');
        }
      } else {
        showToast('Lỗi khi tải dữ liệu từ Unsplash!', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối khi gọi Unsplash!', 'error');
    } finally {
      setLoadingPickImage(false);
    }
  };

  // --- HÀM NEXT / PREV ẢNH LÊN FRONTEND ---
  const handleNextImage = () => {
    if (unsplashImages.length === 0) return;
    const nextIdx = (currentImageIndex + 1) % unsplashImages.length;
    setCurrentImageIndex(nextIdx);
    setPreviewImage(unsplashImages[nextIdx]);
  };

  const handlePrevImage = () => {
    if (unsplashImages.length === 0) return;
    const prevIdx = currentImageIndex === 0 ? unsplashImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIdx);
    setPreviewImage(unsplashImages[prevIdx]);
  };

  // --- LƯU ẢNH ---
  const handleSavePickedImage = async () => {
    if (!previewImage) return;

    const success = await executeUpdate({ image_path: previewImage });
    if (success) {
      showToast('Lưu ảnh thành công!', 'success');
      // Xoá danh sách mảng sau khi lưu để trở về trạng thái bình thường
      setUnsplashImages([]);
      setPreviewImage(null);
    }
  };

  if (isFetching) return <div className="p-8 text-center mt-20 text-gray-500 animate-pulse">Đang tải dữ liệu từ vựng...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate('/vocabularies')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Chỉnh sửa: <span className="text-blue-600">{vocab.word}</span></h1>
            <p className="text-gray-500 text-sm mt-1">Người dùng chỉnh sửa từng phần nội dung của từ vựng.</p>
          </div>
        </div>

        {/* ================= HÀNG 1: CHIA 2 CỘT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* CỘT 1: THÔNG TIN CƠ BẢN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Thông tin cơ bản & Phát âm
            </h2>
            
            <div className="space-y-4 flex-grow">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ vựng</label>
                <input
                  type="text"
                  value={vocab.word}
                  onChange={e => setVocab({ ...vocab, word: e.target.value })}
                  onBlur={handleAutoFill}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {loadingAutoFill && (
                  <p className="text-xs text-blue-500 mt-1 animate-pulse">
                    Đang tự động lấy nghĩa & phiên âm...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phiên âm</label>
                <input
                  type="text"
                  value={vocab.phonetic}
                  onChange={e => setVocab({ ...vocab, phonetic: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loadingAutoFill}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nghĩa</label>
                <input
                  type="text"
                  value={vocab.meaning}
                  onChange={e => setVocab({ ...vocab, meaning: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={loadingAutoFill}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại từ vựng</label>
                <div className="relative">
                  <select
                    value={vocab.category_id}
                    onChange={e => setVocab({ ...vocab, category_id: e.target.value })}
                    className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 items-center justify-end border-t border-gray-50 pt-4">
              <button onClick={playAudio} className="px-4 py-2 flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2l4 4V4L9 8H7a2 2 0 00-2 2z" /></svg>
                Nghe Audio
              </button>

              <button onClick={handleSaveBasic} disabled={loadingBasic} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50">
                {loadingBasic ? 'Đang lưu...' : 'Lưu Thông Tin'}
              </button>
            </div>
          </div>

          {/* CỘT 2: HÌNH ẢNH & AI PROMPT */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Hình ảnh minh họa
              </h2>

              <div className="flex items-center gap-2">
                {unsplashImages.length > 0 ? (
                  <>
                    <button onClick={handlePrevImage} className="px-3 py-1 rounded-lg border hover:bg-gray-100 text-sm font-medium">←</button>
                    <span className="text-sm font-medium text-gray-600 min-w-[40px] text-center">
                      {currentImageIndex + 1}/{unsplashImages.length}
                    </span>
                    <button onClick={handleNextImage} className="px-3 py-1 rounded-lg border hover:bg-gray-100 text-sm font-medium">→</button>
                    
                    <button
                      onClick={handleSavePickedImage}
                      className="ml-2 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition"
                    >
                      Lưu ảnh này
                    </button>
                  </>
                ) : (
                  <button
                    onClick={fetchUnsplashImages}
                    disabled={loadingPickImage}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    {loadingPickImage ? 'Đang tải...' : '🔍 Tìm ảnh Unsplash'}
                  </button>
                )}
              </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            
            <div 
              onClick={() => {
                // Chỉ cho phép click upload thủ công nếu không đang duyệt ảnh Unsplash
                if(unsplashImages.length === 0) fileInputRef.current?.click();
              }}
              className={`relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition group flex-grow ${(previewImage || vocab.image_path) ? 'border-transparent' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'} ${unsplashImages.length === 0 ? 'cursor-pointer' : ''}`}
            >
              {loadingImage ? (
                <div className="text-blue-500 font-medium animate-pulse">Đang tải ảnh lên...</div>
              ) : (previewImage || vocab.image_path) ? (
                <>
                  <img src={previewImage || vocab.image_path} alt={vocab.word} className="w-full h-full object-contain bg-black" />
                  
                  {/* Overlay nhắc nhở Upload chỉ xuất hiện khi chưa load Unsplash */}
                  {unsplashImages.length === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="text-white font-medium flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Đổi ảnh khác (Upload)
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="text-gray-600 font-medium">Click để tải ảnh lên</p>
                  <p className="text-gray-400 text-sm mt-1">Ảnh cũ sẽ tự động bị xóa</p>
                </div>
              )}
            </div>

            <div className="mt-4 bg-pink-50 p-4 rounded-xl border border-pink-100">
              <label className="block text-sm font-bold text-pink-800 mb-2">Hoặc dùng AI tạo ảnh (Image Prompt)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={imagePrompt}
                  onChange={e => setImagePrompt(e.target.value)}
                  placeholder="VD: A cute cat learning English..." 
                  className="flex-grow px-4 py-2 bg-white border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none" 
                />
                <button 
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={loadingImageAI || !imagePrompt.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-semibold transition shadow-md disabled:opacity-50 whitespace-nowrap"
                >
                  ✨ Gen AI Ảnh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= HÀNG 2: STORYLINE FULL WIDTH VỚI JODIT EDITOR ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Storyline (Cốt truyện)
            </span>
          </h2>
          
          <div className="prose prose-lg max-w-none mb-4 text-gray-800 border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
            <JoditEditor
              ref={editorRef}
              value={vocab?.storyline ? marked.parse(vocab.storyline) as any: vocab.storyline}
              config={editorConfig}
              onBlur={newContent => setVocab({...vocab, storyline: newContent})}
            />
          </div>

          <div className="flex gap-3 justify-end mt-auto pt-2 border-t border-gray-50">
            <button onClick={handleGenStorylineAI} disabled={loadingStorylineAI} className="px-5 py-2.5 flex items-center gap-2 text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-lg font-semibold transition shadow-md disabled:opacity-50">
              ✨ {loadingStorylineAI ? 'AI đang viết...' : 'Gen AI Storyline'}
            </button>
            <button onClick={handleSaveStoryline} disabled={loadingStoryline} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50">
              {loadingStoryline ? 'Đang lưu...' : 'Lưu Storyline'}
            </button>
          </div>
        </div>

      </div>

      {/* ================= MODAL XÁC NHẬN GEN ẢNH AI ================= */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md text-center transform transition-all">
            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              ✨
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận tạo ảnh AI</h3>
            <p className="text-gray-600 mb-6">
              Bạn sắp gọi AI để tạo ảnh với prompt: <br/>
              <span className="font-semibold text-pink-600 italic">"{imagePrompt}"</span><br/><br/>
              Lưu ý: Ảnh cũ (nếu có) trong thư mục từ vựng này sẽ bị xóa. Bạn có muốn tiếp tục?
            </p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setIsConfirmModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition">Hủy bỏ</button>
              <button onClick={handleGenImageAI} className="px-5 py-2 text-white font-medium bg-pink-600 hover:bg-pink-700 rounded-lg transition shadow-sm">Chắc chắn tạo</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST THÔNG BÁO ================= */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-[70] transition-all transform flex items-center space-x-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}