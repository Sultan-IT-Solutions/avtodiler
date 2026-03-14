let lockCount = 0;
let lockedScrollY = 0;
let previousHtmlOverflow = '';
let previousBodyOverflow = '';
let previousBodyPosition = '';
let previousBodyTop = '';
let previousBodyWidth = '';

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

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.width = '100%';
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
  window.scrollTo(0, lockedScrollY);
};
