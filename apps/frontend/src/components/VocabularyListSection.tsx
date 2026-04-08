import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import {
  getVocabulariesByCategory,
  type VocabularyItem,
} from '../services/vocabulary-api';
import { type VocabularyCategory } from '../services/category-api';

type VocabularyListSectionProps = {
  category: VocabularyCategory;
  onBack: () => void;
  onSelectVocabulary: (vocabulary: VocabularyItem) => void;
  onStartStoryline: (vocabulary: VocabularyItem) => void;
  onItemsLoaded: (items: VocabularyItem[]) => void;
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}

export function VocabularyListSection({
  category,
  onBack,
  onSelectVocabulary,
  onStartStoryline,
  onItemsLoaded,
}: VocabularyListSectionProps) {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingId, setPlayingId] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      setIsLoading(true);
      setError('');

      try {
        const pageSize = 20;
        let page = 1;
        let totalPages = 1;
        let total = 0;
        const allItems: VocabularyItem[] = [];

        while (page <= totalPages) {
          const response = await getVocabulariesByCategory(category.id, page, pageSize);
          allItems.push(...response.data);
          totalPages = Math.max(response.meta.totalPages, 1);
          total = response.meta.totalItems;
          page += 1;
        }

        if (!isActive) {
          return;
        }

        setItems(allItems);
        setTotalItems(total);
        onItemsLoaded(allItems);
      } catch {
        if (!isActive) {
          return;
        }

        setError('Không tải được danh sách từ vựng. Vui lòng thử lại.');
        setItems([]);
        setTotalItems(0);
        onItemsLoaded([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      isActive = false;
      audioRef.current?.pause();
      speechSynthesis.cancel();
    };
  }, [category.id, onItemsLoaded]);

  const playAudio = async (event: MouseEvent, item: VocabularyItem) => {
    event.stopPropagation();
    setPlayingId(item.id);

    try {
      audioRef.current?.pause();
      speechSynthesis.cancel();

      if (item.audio_path) {
        const audio = new Audio(item.audio_path);
        audioRef.current = audio;
        audio.addEventListener('ended', () => setPlayingId(''), { once: true });
        audio.addEventListener('error', () => setPlayingId(''), { once: true });
        await audio.play();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(item.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setPlayingId('');
      utterance.onerror = () => setPlayingId('');
      speechSynthesis.speak(utterance);
    } catch {
      setPlayingId('');
    }
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>, item: VocabularyItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectVocabulary(item);
    }
  };

  return (
    <section className="mt-1">
      <div className="rounded-[28px] border-2 border-gray-900 bg-[#FFF8E8] p-4 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
              >
                ← Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  if (items[0]) {
                    onStartStoryline(items[0]);
                  }
                }}
                disabled={isLoading || items.length === 0}
                className="ml-auto inline-flex rounded-full border-2 border-gray-900 bg-[#9BE564] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]"
              >
                Storyline
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-[28px] border-2 border-gray-900 bg-white px-5 py-10 text-center text-base font-black text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]">
          Đang tải danh sách từ vựng...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="mt-6 rounded-[28px] border-2 border-gray-900 bg-[#F7C5CC] px-5 py-10 text-center text-base font-black text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <div className="mt-6 rounded-[28px] border-2 border-gray-900 bg-white px-5 py-10 text-center text-base font-black text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]">
          Danh mục này chưa có từ vựng nào.
        </div>
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-[28px] border-2 border-gray-900 bg-white shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] md:block">
            <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px] gap-4 border-b-2 border-gray-900 bg-[#BCE7FD] px-5 py-4 text-sm font-extrabold uppercase tracking-[0.16em] text-gray-700">
              <p>Từ vựng</p>
              <p>Phiên âm</p>
              <p>Nghĩa</p>
              <p className="text-center">Âm thanh</p>
            </div>

            <div>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectVocabulary(item)}
                  onKeyDown={(event) => handleRowKeyDown(event, item)}
                  className={`grid cursor-pointer grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px] items-center gap-4 px-5 py-4 text-left transition-all hover:bg-[#FFF4D6] focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    index !== items.length - 1 ? 'border-b-2 border-gray-900' : ''
                  }`}
                >
                  <p className="truncate text-lg font-black text-gray-900">{item.word}</p>
                  <p className="truncate text-base font-bold text-gray-700">{item.phonetic || '-'}</p>
                  <p className="truncate text-base font-bold text-gray-700">{item.meaning || '-'}</p>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={(event) => void playAudio(event, item)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-900 bg-[#9BE564] text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                      aria-label={`Nghe phát âm từ ${item.word}`}
                    >
                      {playingId === item.id ? '...' : <PlayIcon />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:hidden">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-[26px] border-2 border-gray-900 bg-white p-4 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectVocabulary(item)}
                    className="min-w-0 flex-1 cursor-pointer text-left"
                  >
                    <p className="text-lg font-black text-gray-900">{item.word}</p>
                    <p className="mt-1 text-sm font-bold text-gray-700">
                      {item.phonetic || 'Chưa có phiên âm'}
                    </p>
                    <p className="mt-3 text-base font-bold leading-6 text-gray-800">
                      {item.meaning || 'Chưa có nghĩa'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={(event) => void playAudio(event, item)}
                    className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gray-900 bg-[#9BE564] text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                    aria-label={`Nghe phát âm từ ${item.word}`}
                  >
                    {playingId === item.id ? '...' : <PlayIcon />}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
