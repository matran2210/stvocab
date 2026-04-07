import {
  useEffect,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
  useRef,
  useState,
} from 'react';
import { navigationItems } from '../data/navigation';

type NavigationMenuProps = {
  activeItem: string;
  onSelect: (itemId: string) => void;
};

type NavItemIconProps = {
  children: ReactNode;
  compact?: boolean;
};

function NavItemIcon({ children, compact = false }: NavItemIconProps) {
  return (
    <div
      className={`flex items-center justify-center border-2 border-gray-900 bg-white text-gray-900 ${
        compact
          ? 'h-8 w-8 rounded-[18px]'
          : 'h-10 w-10 rounded-2xl md:h-11 md:w-11'
      }`}
    >
      {children}
    </div>
  );
}

function renderIcon(icon: string) {
  const className = 'h-5 w-5 stroke-current';

  switch (icon) {
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="2">
          <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z" />
          <path d="M5 4.5A2.5 2.5 0 0 0 2.5 7V22H20" />
        </svg>
      );
    case 'wheel':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v16M4 12h16M7 7l10 10M17 7 7 17" />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="2">
          <path d="M7 2v4M17 2v4M3 9h18" />
          <rect x="3" y="4" width="18" height="17" rx="2" />
        </svg>
      );
    case 'rocket':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="2">
          <path d="M14 4c2.5 0 5 2.5 5 5 0 5-5 9-9 9l-4 2 2-4c0-4 4-9 9-9Z" />
          <path d="M13 11h.01" />
        </svg>
      );
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="2">
          <path d="M7 18.5 3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2H7Z" />
        </svg>
      );
    case 'shop':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="2">
          <path d="M4 7h16l-1 13H5L4 7ZM9 7V5a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="2">
          <path d="M8 21h8M12 17v4M7 3h10v4a5 5 0 0 1-10 0V3Z" />
          <path d="M17 5h3a2 2 0 0 1-2 2h-1M7 5H4a2 2 0 0 0 2 2h1" />
        </svg>
      );
    default:
      return null;
  }
}

export function NavigationMenu({
  activeItem,
  onSelect,
}: NavigationMenuProps) {
  const [isVisible, setIsVisible] = useState(true);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const isInteractingRef = useRef(false);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const isNearPageBottom = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      return scrollBottom >= document.documentElement.scrollHeight - 24;
    };

    const scheduleHide = () => {
      clearHideTimer();

      if (isNearPageBottom() || isInteractingRef.current) {
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

  const startDrag =
    (target: 'mobile' | 'desktop') =>
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const container =
        target === 'mobile' ? mobileScrollRef.current : desktopScrollRef.current;

      if (!container) {
        return;
      }

      isInteractingRef.current = true;
      setIsVisible(true);

      dragStateRef.current = {
        isDragging: true,
        startX: event.clientX,
        scrollLeft: container.scrollLeft,
      };
    };

  const startTouchInteraction = () => {
    isInteractingRef.current = true;
    setIsVisible(true);

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const endDrag = () => {
    isInteractingRef.current = false;
    dragStateRef.current.isDragging = false;

    if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 24) {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = window.setTimeout(() => {
        if (!isInteractingRef.current) {
          setIsVisible(false);
        }
      }, 1000);
    }
  };

  const endTouchInteraction = (_event?: ReactTouchEvent<HTMLDivElement>) => {
    isInteractingRef.current = false;

    if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 24) {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = window.setTimeout(() => {
        if (!isInteractingRef.current) {
          setIsVisible(false);
        }
      }, 1000);
    }
  };

  const handleDrag =
    (target: 'mobile' | 'desktop') =>
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const container =
        target === 'mobile' ? mobileScrollRef.current : desktopScrollRef.current;

      if (!container || !dragStateRef.current.isDragging) {
        return;
      }

      const deltaX = event.clientX - dragStateRef.current.startX;
      container.scrollLeft = dragStateRef.current.scrollLeft - deltaX;
    };

  const handleWheel =
    (target: 'mobile' | 'desktop') => (event: ReactWheelEvent<HTMLDivElement>) => {
      const container =
        target === 'mobile' ? mobileScrollRef.current : desktopScrollRef.current;

      if (!container) {
        return;
      }

      isInteractingRef.current = true;
      setIsVisible(true);

      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();
      container.scrollLeft += event.deltaY;

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = window.setTimeout(() => {
        isInteractingRef.current = false;

        if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 24) {
          setIsVisible(false);
        }
      }, 1000);
    };

  return (
    <>
      <nav
        className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${
          isVisible ? 'translate-y-0' : 'translate-y-[140%]'
        }`}
      >
        <div className="mx-auto max-w-6xl">
          <div className="overflow-visible rounded-[28px] border-2 border-gray-900 bg-[#FFF4D6] px-2 py-2 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)]">
            <div
              ref={mobileScrollRef}
              className="no-scrollbar flex cursor-grab gap-2 overflow-x-auto px-1 py-1 active:cursor-grabbing"
              onMouseDown={startDrag('mobile')}
              onMouseMove={handleDrag('mobile')}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onWheel={handleWheel('mobile')}
              onTouchStart={startTouchInteraction}
              onTouchEnd={endTouchInteraction}
              onTouchCancel={endTouchInteraction}
            >
              <div className="flex min-w-full justify-center gap-2">
                {navigationItems.map((item) => {
                  const isActive = item.id === activeItem;

                  return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={`group flex w-[calc((100%-1rem)/3)] min-w-[calc((100%-1rem)/3)] shrink-0 flex-col items-center justify-start gap-0.5 rounded-[18px] border-2 border-gray-900 px-0.5 py-1 text-center transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] ${
                      isActive
                        ? 'bg-[#9BE564] shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]'
                        : 'bg-white shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]'
                    }`}
                  >
                    <NavItemIcon compact>{renderIcon(item.icon)}</NavItemIcon>
                    <span className="line-clamp-2 min-h-[1.2rem] text-[9px] font-extrabold leading-[0.65rem] text-gray-900">
                      {item.label}
                    </span>
                  </button>
                );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <nav
        className={`fixed inset-x-0 bottom-0 z-40 hidden px-6 pb-8 transition-transform duration-300 md:block ${
          isVisible ? 'translate-y-0' : 'translate-y-[140%]'
        }`}
      >
        <div className="mx-auto flex max-w-6xl justify-center">
          <div className="flex w-full items-center gap-3 overflow-visible rounded-[30px] border-2 border-gray-900 bg-[#FFF4D6] px-4 py-3.5 shadow-[8px_8px_0px_0px_rgba(31,41,55,1)]">
            <div
              ref={desktopScrollRef}
              className="no-scrollbar flex flex-1 cursor-grab items-center gap-3 overflow-x-auto overflow-y-visible py-1 scroll-smooth active:cursor-grabbing"
              onMouseDown={startDrag('desktop')}
              onMouseMove={handleDrag('desktop')}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onWheel={handleWheel('desktop')}
              onTouchStart={startTouchInteraction}
              onTouchEnd={endTouchInteraction}
              onTouchCancel={endTouchInteraction}
            >
              <div className="flex min-w-full justify-center gap-3">
                {navigationItems.map((item) => {
                  const isActive = item.id === activeItem;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className={`group flex min-w-[128px] shrink-0 items-center gap-3 rounded-full border-2 border-gray-900 px-4 py-2.5 text-left transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] ${
                        isActive
                          ? 'bg-[#9BE564] shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]'
                          : 'bg-white shadow-[4px_4px_0px_0px_rgba(31,41,55,1)]'
                      }`}
                    >
                      <NavItemIcon>{renderIcon(item.icon)}</NavItemIcon>
                      <span className="max-w-[116px] text-sm font-extrabold leading-tight text-gray-900">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
