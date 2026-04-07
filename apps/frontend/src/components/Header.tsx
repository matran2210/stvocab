import { type ReactNode, useEffect, useRef, useState } from 'react';
import { type AuthenticatedUser } from '../utils/auth';

type HeaderProps = {
  user?: AuthenticatedUser | null;
  onAvatarClick?: () => void;
};

type StatBadgeProps = {
  label: string;
  value: string;
  icon: ReactNode;
  tone: string;
};

function StatBadge({ label, value, icon, tone }: StatBadgeProps) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-full border-2 border-gray-900 px-2 py-2 sm:px-3 ${tone} shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-gray-900 bg-white sm:h-9 sm:w-9">
        {icon}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.14em] text-gray-700 sm:text-[10px] sm:tracking-[0.18em]">
          {label}
        </p>
        <p className="truncate text-xs font-black text-gray-900 sm:text-sm" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}

function getAvatarLabel(name?: string | null) {
  const label = name?.trim();

  if (!label) {
    return 'ST';
  }

  return label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat('vi-VN').format(value ?? 0);
}

export function Header({ user, onAvatarClick }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);
  const avatarLabel = getAvatarLabel(user?.name || user?.email);

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const scheduleHide = () => {
      clearHideTimer();

      if (window.scrollY <= 8) {
        setIsVisible(true);
        return;
      }

      hideTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    };

    const handleScroll = () => {
      setIsVisible(true);
      scheduleHide();
    };

    scheduleHide();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearHideTimer();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 px-4 pb-3 pt-4 transition-transform duration-300 sm:px-6 ${
        isVisible ? 'translate-y-0' : '-translate-y-[120%]'
      }`}
    >
      <div className="mx-auto max-w-6xl rounded-[28px] border-2 border-gray-900 bg-[#FFF8E8] px-3 py-3 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] sm:px-5">
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onAvatarClick}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gray-900 bg-[#9BE564] text-base font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
          >
            {avatarLabel}
          </button>

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            <div className="min-w-0">
              <StatBadge
                label="Vàng"
                value={formatNumber(user?.gold)}
                tone="bg-[#FFE17D]"
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M12 2 9.4 8H3l5.2 4-2 7L12 15l5.8 4-2-7L21 8h-6.4L12 2Z" />
                  </svg>
                }
              />
            </div>
            <div className="min-w-0">
              <StatBadge
                label="Điểm"
                value={`${formatNumber(user?.learningPoints)} XP`}
                tone="bg-[#BCE7FD]"
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M12 3 4 8v5c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V8l-8-5Zm1 6h3l-5 7h-3l5-7Z" />
                  </svg>
                }
              />
            </div>
          </div>

          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-900 bg-[#FF9B71] text-xl font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]">
            +
          </button>
        </div>

        <div className="hidden items-center justify-between gap-4 md:flex">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onAvatarClick}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-gray-900 bg-[#9BE564] text-lg font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]"
            >
              {avatarLabel}
            </button>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-700">
                StVocab
              </p>
              <p className="text-lg font-black text-gray-900">
                {user?.name || user?.email || 'Sẵn sàng cho buổi học tiếp theo'}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-3">
            <div className="w-[152px] min-w-0">
              <StatBadge
                label="Vàng"
                value={formatNumber(user?.gold)}
                tone="bg-[#FFE17D]"
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M12 2 9.4 8H3l5.2 4-2 7L12 15l5.8 4-2-7L21 8h-6.4L12 2Z" />
                  </svg>
                }
              />
            </div>
            <div className="w-[172px] min-w-0">
              <StatBadge
                label="Điểm học tập"
                value={`${formatNumber(user?.learningPoints)} XP`}
                tone="bg-[#BCE7FD]"
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M12 3 4 8v5c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V8l-8-5Zm1 6h3l-5 7h-3l5-7Z" />
                  </svg>
                }
              />
            </div>
            <button className="flex items-center gap-2 rounded-full border-2 border-gray-900 bg-[#FF9B71] px-4 py-3 text-sm font-black text-gray-900 shadow-[4px_4px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)]">
              <span className="text-xl leading-none">+</span>
              <span>Nâng cấp gói</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
