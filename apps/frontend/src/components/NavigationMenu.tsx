import {
  useEffect,
  type MouseEvent as ReactMouseEvent,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { navigationItems } from '../data/navigation';

type NavigationMenuProps = {
  activeItem: string;
  onSelect: (itemId: string) => void;
};

type NavItemIconProps = {
  icon: string;
  isActive: boolean;
};

function NavItemIcon({ icon, isActive }: NavItemIconProps) {
  const palette = getIconPalette(icon);

  return (
    <div
      className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[18px] border-2 border-gray-900 text-gray-900 transition-transform duration-200 ${
        isActive ? 'scale-[1.02]' : ''
      }`}
      style={{ backgroundColor: palette.base }}
    >
      <span
        className="absolute inset-x-1 top-1 h-3 rounded-full opacity-80"
        style={{ backgroundColor: palette.glow }}
      />
      <span
        className="absolute -bottom-3 -right-2 h-7 w-7 rounded-full opacity-75"
        style={{ backgroundColor: palette.accent }}
      />
      <div className="relative z-10">{renderIcon(icon)}</div>
    </div>
  );
}

function getIconPalette(icon: string) {
  switch (icon) {
    case 'book':
      return { base: '#FFF3B2', glow: '#FFFBE0', accent: '#FFB84D' };
    case 'wheel':
      return { base: '#C7F0FF', glow: '#EEFBFF', accent: '#66C7F4' };
    case 'calendar':
      return { base: '#FFE0E8', glow: '#FFF2F6', accent: '#FF8CAB' };
    case 'rocket':
      return { base: '#FFD8C2', glow: '#FFF0E7', accent: '#FF8A5B' };
    case 'chat':
      return { base: '#D8F8D0', glow: '#F1FFE9', accent: '#7ED957' };
    case 'shop':
      return { base: '#E5DEFF', glow: '#F5F1FF', accent: '#9A8CFF' };
    case 'trophy':
      return { base: '#FFE7B8', glow: '#FFF6DE', accent: '#FFC94A' };
    default:
      return { base: '#FFFFFF', glow: '#F3F4F6', accent: '#D1D5DB' };
  }
}

function renderIcon(icon: string) {
  const className = 'h-5 w-5 stroke-current';

  switch (icon) {
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H20v15.5H8.5A2.5 2.5 0 0 0 6 21V5.5Z" />
          <path d="M6 6a2.5 2.5 0 0 0-2.5 2.5V20.5H20" />
          <path d="M9.5 7.5H16" />
          <path d="M9.5 11H16" />
        </svg>
      );
    case 'wheel':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 4.5V9.5" />
          <path d="M12 14.5V19.5" />
          <path d="M19.5 12H14.5" />
          <path d="M9.5 12H4.5" />
          <path d="M17.3 6.7 14 10" />
          <path d="M10 14 6.7 17.3" />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="5" width="16" height="15" rx="3" />
          <path d="M8 3.5V7" />
          <path d="M16 3.5V7" />
          <path d="M4 10H20" />
          <path d="M8 13.5H8.01" />
          <path d="M12 13.5H12.01" />
          <path d="M16 13.5H16.01" />
        </svg>
      );
    case 'rocket':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4.5c2.8.4 4.6 2.2 5 5-1.4 4.3-4.7 7.6-9 9l-3.5 1 1-3.5c1.4-4.3 4.7-7.6 9-9Z" />
          <path d="M14 10a1.5 1.5 0 1 0 0 .01" />
          <path d="M9 15 6 18" />
          <path d="M7.5 11.5 5 14" />
        </svg>
      );
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6.5A2.5 2.5 0 0 1 8.5 4H18a2 2 0 0 1 2 2v8.5a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3v-3.5A2.5 2.5 0 0 1 4 14V9a2.5 2.5 0 0 1 2-2.5Z" />
          <path d="M8.5 9.5H15.5" />
          <path d="M8.5 12.5H13" />
        </svg>
      );
    case 'shop':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8h12l-1 11H7L6 8Z" />
          <path d="M9 8V6.5A3.5 3.5 0 0 1 12.5 3 3.5 3.5 0 0 1 16 6.5V8" />
          <path d="M9.5 11.5H14.5" />
        </svg>
      );
    case 'trophy':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 4.5h8V8a4 4 0 0 1-8 0V4.5Z" />
          <path d="M12 12v3.5" />
          <path d="M9 19.5h6" />
          <path d="M6.5 5.5H4.5A1.5 1.5 0 0 0 6 8h2" />
          <path d="M17.5 5.5h2A1.5 1.5 0 0 1 18 8h-2" />
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
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const suppressToggleUntilRef = useRef(0);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const openMenu = () => {
    if (Date.now() < suppressToggleUntilRef.current) {
      return;
    }

    setIsOpen(true);
  };

  const closeMenuFromBackdrop = () => {
    suppressToggleUntilRef.current = Date.now() + 350;
    setIsOpen(false);
  };

  const startDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      scrollLeft: container.scrollLeft,
    };
  };

  const handleDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;

    if (!container || !dragStateRef.current.isDragging) {
      return;
    }

    container.scrollLeft = dragStateRef.current.scrollLeft - (event.clientX - dragStateRef.current.startX);
  };

  const endDrag = () => {
    dragStateRef.current.isDragging = false;
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current;

    if (!container || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    container.scrollLeft += event.deltaY;
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    const touch = event.touches[0];

    if (!container || !touch) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      startX: touch.clientX,
      scrollLeft: container.scrollLeft,
    };
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    const touch = event.touches[0];

    if (!container || !dragStateRef.current.isDragging || !touch) {
      return;
    }

    container.scrollLeft = dragStateRef.current.scrollLeft - (touch.clientX - dragStateRef.current.startX);
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Dong menu"
          className="fixed inset-0 z-40 bg-[#2B3441]/12 backdrop-blur-[1px]"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            closeMenuFromBackdrop();
          }}
        />
      ) : null}

      <nav className="pointer-events-none fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6 sm:top-auto">
        <div ref={panelRef} className="pointer-events-auto flex items-end gap-3 sm:items-start">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Dong navigation menu' : 'Mo navigation menu'}
            onClick={() => {
              if (isOpen) {
                setIsOpen(false);
                return;
              }

              openMenu();
            }}
            className={`group relative z-10 hidden h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border-2 border-gray-900 text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] sm:flex ${
              isOpen ? 'bg-[#9BE564]' : 'bg-[#FFF4D6]'
            }`}
          >
            <div className="relative flex h-6 w-6 items-center justify-center">
              <span
                className={`absolute h-[3px] w-6 rounded-full bg-current transition-transform duration-200 ${
                  isOpen ? 'rotate-45' : '-translate-y-[7px]'
                }`}
              />
              <span
                className={`absolute h-[3px] w-6 rounded-full bg-current transition-opacity duration-200 ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute h-[3px] w-6 rounded-full bg-current transition-transform duration-200 ${
                  isOpen ? '-rotate-45' : 'translate-y-[7px]'
                }`}
              />
            </div>
          </button>

          {!isOpen ? (
            <button
              type="button"
              aria-expanded={false}
              aria-label="Mo navigation menu"
              onClick={openMenu}
              className="group relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border-2 border-gray-900 bg-[#FFF4D6] text-gray-900 shadow-[6px_6px_0px_0px_rgba(31,41,55,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] sm:hidden"
            >
              <div className="relative flex h-6 w-6 items-center justify-center">
                <span className="absolute h-[3px] w-6 -translate-y-[7px] rounded-full bg-current" />
                <span className="absolute h-[3px] w-6 rounded-full bg-current" />
                <span className="absolute h-[3px] w-6 translate-y-[7px] rounded-full bg-current" />
              </div>
            </button>
          ) : null}

          <div
            className={`origin-left overflow-hidden rounded-[26px] border-2 border-gray-900 bg-[#FFF4D6] shadow-[8px_8px_0px_0px_rgba(31,41,55,1)] transition-all duration-200 ${
              isOpen
                ? 'translate-x-0 scale-100 opacity-100'
                : '-translate-x-4 scale-95 opacity-0 pointer-events-none'
            }`}
          >
            <div
              ref={scrollRef}
              className="max-w-[calc(100vw-2rem)] cursor-grab overflow-x-auto overflow-y-hidden p-2.5 active:cursor-grabbing sm:max-w-[min(56rem,calc(100vw-8rem))] sm:p-3"
              onMouseDown={startDrag}
              onMouseMove={handleDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={endDrag}
              onTouchCancel={endDrag}
            >
              <div className="flex min-w-max items-stretch gap-3">
                {navigationItems.map((item, index) => {
                  const isActive = item.id === activeItem;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.id);
                        setIsOpen(false);
                      }}
                      className={`group flex min-h-[4.8rem] w-[7.25rem] shrink-0 flex-col items-start gap-2 rounded-[22px] border-2 border-gray-900 px-2.5 py-2.5 text-left transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(31,41,55,1)] sm:min-h-[5rem] sm:w-[7.5rem] ${
                        isActive
                          ? 'bg-[#9BE564] shadow-[5px_5px_0px_0px_rgba(31,41,55,1)]'
                          : 'bg-white shadow-[5px_5px_0px_0px_rgba(31,41,55,1)]'
                      }`}
                      style={{ transitionDelay: isOpen ? `${index * 35}ms` : '0ms' }}
                    >
                      <NavItemIcon icon={item.icon} isActive={isActive} />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-black leading-tight text-gray-900 sm:text-[13px]">
                          {item.label}
                        </p>
                      </div>
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
