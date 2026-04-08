import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { NavigationMenu } from '../components/NavigationMenu';
import { ProfilePanel } from '../components/ProfilePanel';
import { VocabularyCategorySection } from '../components/VocabularyCategorySection';
import { VocabularyListSection } from '../components/VocabularyListSection';
import { VocabularyDetailSection } from '../components/VocabularyDetailSection';
import { navigationItems } from '../data/navigation';
import { type VocabularyCategory } from '../services/category-api';
import { getCurrentUserProfile } from '../services/auth-api';
import { type VocabularyItem } from '../services/vocabulary-api';
import { getStoredAuthUser, type AuthenticatedUser } from '../utils/auth';

export function HomePage() {
  const [activeItem, setActiveItem] = useState('learning');
  const [isViewingAllCategories, setIsViewingAllCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VocabularyCategory | null>(null);
  const [selectedVocabulary, setSelectedVocabulary] = useState<VocabularyItem | null>(null);
  const [categoryVocabularies, setCategoryVocabularies] = useState<VocabularyItem[]>([]);
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredAuthUser());

  const activeLabel =
    activeItem === 'profile'
      ? 'Hồ sơ'
      : navigationItems.find((item) => item.id === activeItem)?.label ?? 'Học tập';

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      try {
        const profile = await getCurrentUserProfile();

        if (isActive) {
          setUser(profile);
        }
      } catch {
        // ProtectedRoute va apiClient da xu ly phien het han.
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelectMenuItem = (itemId: string) => {
    setActiveItem(itemId);
    setIsViewingAllCategories(false);
    setSelectedCategory(null);
    setSelectedVocabulary(null);
    setCategoryVocabularies([]);
  };

  const handleSelectCategory = (category: VocabularyCategory) => {
    setSelectedCategory(category);
    setSelectedVocabulary(null);
  };

  return (
    <main className="min-h-screen bg-[#FFFBF5] text-gray-900">
      <Header user={user} onAvatarClick={() => setActiveItem('profile')} />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-24 pt-3 sm:px-6 sm:pb-16 sm:pt-4">
        {activeItem === 'profile' ? (
          <ProfilePanel
            user={user}
          />
        ) : activeItem === 'learning' && selectedCategory && selectedVocabulary ? (
          <VocabularyDetailSection
            category={selectedCategory}
            items={categoryVocabularies}
            currentVocabularyId={selectedVocabulary.id}
            onBack={() => setSelectedVocabulary(null)}
            onSelectVocabulary={(vocabularyId) => {
              const nextVocabulary = categoryVocabularies.find(
                (item) => item.id === vocabularyId
              );

              if (nextVocabulary) {
                setSelectedVocabulary(nextVocabulary);
              }
            }}
            onFinish={() => setSelectedVocabulary(null)}
          />
        ) : activeItem === 'learning' && selectedCategory ? (
          <VocabularyListSection
            category={selectedCategory}
            onBack={() => {
              setSelectedCategory(null);
              setSelectedVocabulary(null);
              setCategoryVocabularies([]);
            }}
            onSelectVocabulary={setSelectedVocabulary}
            onStartStoryline={setSelectedVocabulary}
            onItemsLoaded={setCategoryVocabularies}
          />
        ) : activeItem === 'learning' && isViewingAllCategories ? (
          <VocabularyCategorySection
            mode="all"
            onCollapse={() => setIsViewingAllCategories(false)}
            onSelectCategory={handleSelectCategory}
          />
        ) : (
          <>
            <section className="rounded-[32px] border-2 border-gray-900 bg-[#FFF8E8] p-5 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="mb-3 inline-flex rounded-full border-2 border-gray-900 bg-[#BCE7FD] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em]">
                    Trang chủ
                  </p>
                  <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
                    {user?.name
                      ? `Chào mừng trở lại, ${user.name}.`
                      : 'Chào mừng trở lại với hành trình học từ vựng mỗi ngày.'}
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

            {activeItem === 'learning' ? (
              <VocabularyCategorySection
                mode="preview"
                onViewAll={() => setIsViewingAllCategories(true)}
                onSelectCategory={handleSelectCategory}
              />
            ) : null}
          </>
        )}
      </div>

      <NavigationMenu activeItem={activeItem} onSelect={handleSelectMenuItem} />
    </main>
  );
}
