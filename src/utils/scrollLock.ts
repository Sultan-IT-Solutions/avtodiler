let lockCount = 0;
let lockedScrollY = 0;
let previousHtmlOverflow = '';
let previousBodyOverflow = '';
let previousBodyPosition = '';
let previousBodyTop = '';
let previousBodyWidth = '';
let previousBodyLeft = '';
let previousBodyRight = '';

export const lockScroll = () => {
  if (typeof window === 'undefined') return;

  lockCount += 1;
  if (lockCount > 1) return;

  lockedScrollY = window.scrollY;
  previousHtmlOverflow = document.documentElement.style.overflow;
  previousBodyOverflow = document.body.style.overflow;
  previousBodyPosition = document.body.style.position;
  previousBodyTop = document.body.style.top;
  previousBodyWidth = document.body.style.width;
  previousBodyLeft = document.body.style.left;
  previousBodyRight = document.body.style.right;

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.width = '100%';
  document.body.style.left = '0';
  document.body.style.right = '0';
};

export const unlockScroll = () => {
  if (typeof window === 'undefined' || lockCount === 0) return;

  lockCount -= 1;
  if (lockCount > 0) return;

  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.overflow = previousBodyOverflow;
  document.body.style.position = previousBodyPosition;
  document.body.style.top = previousBodyTop;
  document.body.style.width = previousBodyWidth;
  document.body.style.left = previousBodyLeft;
  document.body.style.right = previousBodyRight;
  window.scrollTo(0, lockedScrollY);
};

export const isolateTouchScroll = (backdrop: HTMLElement, scrollable: HTMLElement) => {
  let lastTouchY = 0;

  const handleBackdropTouchMove = (event: TouchEvent) => {
    if (!scrollable.contains(event.target as Node)) {
      event.preventDefault();
    }
  };

  const handleScrollableTouchStart = (event: TouchEvent) => {
    lastTouchY = event.touches[0]?.clientY ?? 0;
  };

  const handleScrollableTouchMove = (event: TouchEvent) => {
    const currentTouchY = event.touches[0]?.clientY ?? 0;
    const deltaY = currentTouchY - lastTouchY;
    const { scrollTop, scrollHeight, clientHeight } = scrollable;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
      event.preventDefault();
    }

    event.stopPropagation();
    lastTouchY = currentTouchY;
  };

  backdrop.addEventListener('touchmove', handleBackdropTouchMove, { passive: false });
  scrollable.addEventListener('touchstart', handleScrollableTouchStart, { passive: true });
  scrollable.addEventListener('touchmove', handleScrollableTouchMove, { passive: false });

  return () => {
    backdrop.removeEventListener('touchmove', handleBackdropTouchMove);
    scrollable.removeEventListener('touchstart', handleScrollableTouchStart);
    scrollable.removeEventListener('touchmove', handleScrollableTouchMove);
  };
};
