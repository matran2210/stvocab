import { useState } from 'react';
import { CategoryCard } from '../components/CategoryCard';
import { Header } from '../components/Header';
import { NavigationMenu } from '../components/NavigationMenu';
import { vocabularyCategories } from '../data/categories';
import { navigationItems } from '../data/navigation';

export function HomePage() {
  const [activeItem, setActiveItem] = useState('learning');

  const activeLabel =
    navigationItems.find((item) => item.id === activeItem)?.label ?? 'Học tập';

  return (
    <main className="min-h-screen bg-[#FFFBF5] text-gray-900">
      <Header />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-36 pt-28 sm:px-6 sm:pb-40">
        <section className="rounded-[32px] border-2 border-gray-900 bg-[#FFF8E8] p-5 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="mb-3 inline-flex rounded-full border-2 border-gray-900 bg-[#BCE7FD] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em]">
                Trang chủ
              </p>
              <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
                Chào mừng trở lại với hành trình học từ vựng mỗi ngày.
              </h1>
              <p className="mt-3 max-w-2xl text-base font-bold leading-7">
                Bạn đang ở mục <span className="underline decoration-2">{activeLabel}</span>. Hôm nay là thời điểm tốt để tiếp tục một bài học ngắn và giữ streak đang lên.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 self-start lg:shrink-0">
              <div className="min-w-[132px] rounded-[22px] border-2 border-gray-900 bg-[#FFD6A5] px-4 py-3 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-700">
                  Chuỗi học
                </p>
                <p className="mt-1 text-xl font-black">12 ngày</p>
              </div>
              <div className="min-w-[132px] rounded-[22px] border-2 border-gray-900 bg-[#C9F2C7] px-4 py-3 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-700">
                  Mục tiêu
                </p>
                <p className="mt-1 text-xl font-black">20 từ</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-gray-700">
                Learning
              </p>
              <h2 className="text-2xl font-black sm:text-3xl">
                Danh mục từ vựng
              </h2>
            </div>
            <button className="rounded-full border-2 border-gray-900 bg-white px-4 py-2 text-sm font-black shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]">
              Xem
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {vocabularyCategories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.title}
                progress={category.progress}
                lessons={category.lessons}
                tone={category.tone}
              />
            ))}
          </div>
        </section>
      </div>

      <NavigationMenu activeItem={activeItem} onSelect={setActiveItem} />
    </main>
  );
}
