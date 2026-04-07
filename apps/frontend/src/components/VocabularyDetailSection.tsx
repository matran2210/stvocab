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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentIndex = useMemo(
    () => items.findIndex((item) => item.id === currentVocabularyId),
    [items, currentVocabularyId]
  );
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex === items.length - 1;

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
    if (isFirst) {
      return;
    }

    onSelectVocabulary(items[currentIndex - 1].id);
  };

  const goNext = () => {
    if (isLast) {
      return;
    }

    onSelectVocabulary(items[currentIndex + 1].id);
  };

  return (
    <section className="mt-1">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex shrink-0 rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
        >
          ← Quay lại
        </button>

        <div className="ml-auto inline-flex min-w-0 items-center gap-2 rounded-full border-2 border-gray-900 bg-[#C9F2C7] px-4 py-2 text-sm font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
          <StoryIcon />
          <span className="truncate">{category.name}</span>
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
        <>
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

          <div className="mt-6 flex items-center justify-between gap-3 sm:grid sm:grid-cols-3">
            <button
              type="button"
              onClick={goPrevious}
              disabled={isFirst}
              className="rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-sm font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] sm:px-5 sm:py-4 sm:text-base"
            >
              Prev
            </button>

            {!isLast ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full border-2 border-gray-900 bg-[#9BE564] px-4 py-2 text-sm font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] sm:col-start-3 sm:px-5 sm:py-4 sm:text-base"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={onFinish}
                className="rounded-full border-2 border-gray-900 bg-[#FF9B71] px-4 py-2 text-sm font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] sm:col-start-3 sm:px-5 sm:py-4 sm:text-base"
              >
                Finish
              </button>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
