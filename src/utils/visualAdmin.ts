const VISUAL_ADMIN_KEY = 'hongqi-visual-admin-mode';

export const readVisualAdminMode = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(VISUAL_ADMIN_KEY) === '1';
};

export const writeVisualAdminMode = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  if (enabled) {
    window.localStorage.setItem(VISUAL_ADMIN_KEY, '1');
    return;
  }
  window.localStorage.removeItem(VISUAL_ADMIN_KEY);
};

export const buildAdminUrl = (section: string, tab?: string) => {
  const params = new URLSearchParams();
  params.set('section', section);
  if (tab) params.set('tab', tab);
  return `/admin?${params.toString()}`;
};
