import { useEffect, useState } from 'react';
import { CategoryCard } from './CategoryCard';
import {
  getVocabularyCategories,
  type VocabularyCategory,
} from '../services/category-api';

type VocabularyCategorySectionProps = {
  mode: 'preview' | 'all';
  onViewAll?: () => void;
  onCollapse?: () => void;
  onSelectCategory: (category: VocabularyCategory) => void;
};

const categoryTones = [
  'bg-[#FFD6A5]',
  'bg-[#BCE7FD]',
  'bg-[#C9F2C7]',
  'bg-[#F7C5CC]',
];

function getProgress(index: number) {
  const progressValues = [40, 68, 22, 54, 31, 76, 47, 59];
  return progressValues[index % progressValues.length];
}

function getLessons(index: number) {
  const lessonValues = ['12 bài học', '24 bài học', '8 bài học', '18 bài học'];
  return lessonValues[index % lessonValues.length];
}

function getTone(index: number) {
  return categoryTones[index % categoryTones.length];
}

export function VocabularyCategorySection({
  mode,
  onViewAll,
  onCollapse,
  onSelectCategory,
}: VocabularyCategorySectionProps) {
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      setIsLoading(true);
      setError('');

      try {
        if (mode === 'preview') {
          const response = await getVocabularyCategories(1, 4);

          if (!isActive) {
            return;
          }

          setCategories(response.data);
          setTotalItems(response.meta.totalItems);
          return;
        }

        const pageSize = 12;
        let page = 1;
        let totalPages = 1;
        let total = 0;
        const allCategories: VocabularyCategory[] = [];

        while (page <= totalPages) {
          const response = await getVocabularyCategories(page, pageSize);
          allCategories.push(...response.data);
          totalPages = Math.max(response.meta.totalPages, 1);
          total = response.meta.totalItems;
          page += 1;
        }

        if (!isActive) {
          return;
        }

        setCategories(allCategories);
        setTotalItems(total);
      } catch {
        if (!isActive) {
          return;
        }

        setError('Không tải được danh mục từ vựng. Vui lòng thử lại.');
        setCategories([]);
        setTotalItems(0);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, [mode]);

  const isPreview = mode === 'preview';

  return (
    <section className={isPreview ? 'mt-6' : 'mt-1'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-gray-700">
            Learning
          </p>
          <h2 className="text-2xl font-black sm:text-3xl">
            Danh mục từ vựng{!isLoading ? ` (${totalItems})` : ''}
          </h2>
        </div>

        {isPreview ? (
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-sm font-black shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
          >
            Xem
          </button>
        ) : (
          <button
            type="button"
            onClick={onCollapse}
            className="rounded-full border-2 border-gray-900 bg-[#9BE564] px-4 py-2 text-sm font-black shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
          >
            Thu
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-[28px] border-2 border-gray-900 bg-white px-5 py-10 text-center text-base font-black text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]">
          Đang tải danh mục từ vựng...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-[28px] border-2 border-gray-900 bg-[#F7C5CC] px-5 py-10 text-center text-base font-black text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && categories.length === 0 ? (
        <div className="rounded-[28px] border-2 border-gray-900 bg-white px-5 py-10 text-center text-base font-black text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]">
          Chưa có danh mục từ vựng nào.
        </div>
      ) : null}

      {!isLoading && !error && categories.length > 0 ? (
        <div
          className={
            isPreview
              ? 'grid gap-4 md:grid-cols-2'
              : 'neo-scrollbar grid max-h-[calc(100vh-260px)] gap-4 overflow-y-auto pr-2 md:grid-cols-2'
          }
        >
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              title={category.name}
              progress={getProgress(index)}
              lessons={getLessons(index)}
              tone={getTone(index)}
              onClick={() => onSelectCategory(category)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
