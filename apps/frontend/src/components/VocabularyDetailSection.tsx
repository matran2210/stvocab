import { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import { type VocabularyCategory } from '../services/category-api';
import {
  getVocabularyDetail,
  type VocabularyDetail,
  type VocabularyItem,
} from '../services/vocabulary-api';

type VocabularyDetailSectionProps = {
  category: VocabularyCategory;
  items: VocabularyItem[];
  currentVocabularyId: string;
  onBack: () => void;
  onSelectVocabulary: (vocabularyId: string) => void;
  onFinish: () => void;
};

function StoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-current" strokeWidth="2">
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z" />
      <path d="M5 4.5A2.5 2.5 0 0 0 2.5 7V22H20" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 stroke-current"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'left' ? (
        <>
          <path d="M19 12H5" />
          <path d="M11 6 5 12l6 6" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}
    </svg>
  );
}

function parseStoryline(storyline?: string | null) {
  if (!storyline?.trim()) {
    return '<p>Nội dung storyline sẽ được cập nhật sau.</p>';
  }

  return marked.parse(storyline, { breaks: true }) as string;
}

export function VocabularyDetailSection({
  category,
  items,
  currentVocabularyId,
  onBack,
  onSelectVocabulary,
  onFinish,
}: VocabularyDetailSectionProps) {
  const [detail, setDetail] = useState<VocabularyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [navigationDirection, setNavigationDirection] = useState<'left' | 'right'>('right');
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwipeDragging, setIsSwipeDragging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const detailShellRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef(false);

  const normalizedCurrentVocabularyId = String(currentVocabularyId);

  const currentIndex = useMemo(
    () => items.findIndex((item) => String(item.id) === normalizedCurrentVocabularyId),
    [items, normalizedCurrentVocabularyId]
  );
  const hasCurrentItem = currentIndex >= 0;
  const isFirst = !hasCurrentItem || currentIndex === 0;
  const isLast = !hasCurrentItem || currentIndex === items.length - 1;

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setIsPlaying(false);
  }, [currentVocabularyId]);

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await getVocabularyDetail(currentVocabularyId);

        if (!isActive) {
          return;
        }

        setDetail(response);
      } catch {
        if (!isActive) {
          return;
        }

        setError('Không tải được chi tiết từ vựng. Vui lòng thử lại.');
        setDetail(null);
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
  }, [currentVocabularyId]);

  const playAudio = async () => {
    if (!detail) {
      return;
    }

    setIsPlaying(true);

    try {
      audioRef.current?.pause();
      speechSynthesis.cancel();

      if (detail.audio_path) {
        const audio = new Audio(detail.audio_path);
        audioRef.current = audio;
        audio.addEventListener('ended', () => setIsPlaying(false), { once: true });
        audio.addEventListener('error', () => setIsPlaying(false), { once: true });
        await audio.play();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(detail.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    } catch {
      setIsPlaying(false);
    }
  };

  const goPrevious = () => {
    if (!hasCurrentItem || isFirst) {
      return;
    }

    setNavigationDirection('left');
    onSelectVocabulary(items[currentIndex - 1].id);
  };

  const goNext = () => {
    if (!hasCurrentItem || isLast) {
      return;
    }

    setNavigationDirection('right');
    onSelectVocabulary(items[currentIndex + 1].id);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    isHorizontalSwipeRef.current = false;
    setIsSwipeDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;

    if (!touch || startX === null || startY === null) {
      return;
    }

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (!isHorizontalSwipeRef.current) {
      if (Math.abs(deltaX) < 10) {
        return;
      }

      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        touchStartXRef.current = null;
        touchStartYRef.current = null;
        setIsSwipeDragging(false);
        setDragOffset(0);
        return;
      }

      isHorizontalSwipeRef.current = true;
      setIsSwipeDragging(true);
    }

    const shellWidth = detailShellRef.current?.offsetWidth ?? window.innerWidth;
    const maxOffset = Math.max(140, shellWidth * 0.7);

    setDragOffset(Math.max(-maxOffset, Math.min(maxOffset, deltaX)));
    event.preventDefault();
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    const wasHorizontalSwipe = isHorizontalSwipeRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = false;

    if (!touch || startX === null || startY === null) {
      setIsSwipeDragging(false);
      setDragOffset(0);
      return;
    }

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    setIsSwipeDragging(false);
    setDragOffset(0);

    const shellWidth = detailShellRef.current?.offsetWidth ?? window.innerWidth;
    const swipeThreshold = Math.max(120, shellWidth * 0.45);

    if (
      !wasHorizontalSwipe ||
      Math.abs(deltaX) < swipeThreshold ||
      Math.abs(deltaX) < Math.abs(deltaY) * 1.2
    ) {
      return;
    }

    if (deltaX < 0) {
      goNext();
      return;
    }

    goPrevious();
  };

  return (
    <section className="mt-1">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex min-w-0 items-center justify-start">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
          >
            ← Quay lại
          </button>
        </div>

        <div className="relative z-10 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrevious}
            disabled={isFirst}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-gray-900 bg-white/85 text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]"
            aria-label="Từ trước"
          >
            <ArrowIcon direction="left" />
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-gray-900 bg-[#9BE564] text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
              aria-label="Từ tiếp theo"
            >
              <ArrowIcon direction="right" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinish}
              className="rounded-full border-2 border-gray-900 bg-[#FF9B71] px-4 py-2 text-sm font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
            >
              Finish
            </button>
          )}
        </div>

        <div className="flex min-w-0 items-center justify-end">
          <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border-2 border-gray-900 bg-[#C9F2C7] px-4 py-2 text-sm font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
            <StoryIcon />
            <span className="truncate">{category.name}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-[28px] border-2 border-gray-900 bg-white px-5 py-10 text-center text-base font-black text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]">
          Đang tải chi tiết từ vựng...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="mt-6 rounded-[28px] border-2 border-gray-900 bg-[#F7C5CC] px-5 py-10 text-center text-base font-black text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && detail ? (
        <div className="relative mt-6">
          <div
            ref={detailShellRef}
            key={currentVocabularyId}
            className={`vocabulary-page-shell ${
              isSwipeDragging
                ? 'vocabulary-page-dragging'
                : navigationDirection === 'right'
                ? 'vocabulary-page-transition-forward'
                : 'vocabulary-page-transition-backward'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            style={{
              transform: isSwipeDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
              opacity: isSwipeDragging ? Math.max(0.82, 1 - Math.abs(dragOffset) / 420) : undefined,
            }}
          >
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="order-2 rounded-[30px] border-2 border-gray-900 bg-white p-5 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] lg:order-1 lg:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="inline-flex rounded-full border-2 border-gray-900 bg-[#BCE7FD] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-700">
                    Từ vựng
                  </p>
                  <h1 className="mt-4 break-words text-3xl font-black leading-tight text-gray-900 sm:text-4xl">
                    {detail.word}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => void playAudio()}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gray-900 bg-[#9BE564] text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
                  aria-label={`Nghe phát âm từ ${detail.word}`}
                >
                  {isPlaying ? '...' : <PlayIcon />}
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div className="rounded-[24px] border-2 border-gray-900 bg-[#FFF8E8] p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-700">
                    Phiên âm
                  </p>
                  <p className="mt-2 break-words text-lg font-black leading-8 text-gray-900">
                    {detail.phonetic || 'Chưa có phiên âm'}
                  </p>
                </div>

                <div className="rounded-[24px] border-2 border-gray-900 bg-[#FFD6A5] p-4 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-700">
                    Nghĩa
                  </p>
                  <p className="mt-2 break-words text-lg font-black leading-8 text-gray-900">
                    {detail.meaning || 'Chưa có nghĩa'}
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 rounded-[30px] border-2 border-gray-900 bg-[#FFF4D6] p-4 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] lg:order-2">
              {detail.image_path ? (
                <img
                  src={detail.image_path}
                  alt={detail.word}
                  className="h-[260px] w-full rounded-[24px] border-2 border-gray-900 object-cover shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] sm:h-[320px]"
                />
              ) : (
                <div className="flex h-[260px] w-full items-center justify-center rounded-[24px] border-2 border-dashed border-gray-900 bg-white px-6 text-center text-lg font-black leading-8 text-gray-700 sm:h-[320px]">
                  Hình ảnh của từ vựng sẽ hiển thị tại đây
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-[30px] border-2 border-gray-900 bg-white p-5 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-gray-900 bg-[#9BE564] text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                <StoryIcon />
              </div>
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-gray-700">
                  Storyline
                </p>
                <p className="text-base font-black text-gray-900">
                  Ngữ cảnh từ vựng
                </p>
              </div>
            </div>

            <div
              className="prose prose-p:my-3 prose-li:my-1 prose-strong:text-gray-900 max-w-none text-[15px] font-bold leading-7 text-gray-800"
              dangerouslySetInnerHTML={{ __html: parseStoryline(detail.storyline) }}
            />
          </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
