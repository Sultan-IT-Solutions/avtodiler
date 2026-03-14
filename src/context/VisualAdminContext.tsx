import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { readVisualAdminMode, writeVisualAdminMode } from '../utils/visualAdmin';

type VisualAdminContextValue = {
  enabled: boolean;
  authed: boolean;
  enable: () => void;
  disable: () => void;
};

const VisualAdminContext = createContext<VisualAdminContextValue | null>(null);

export const VisualAdminProvider = ({ children }: PropsWithChildren) => {
  const location = useLocation();
  const [enabled, setEnabled] = useState(() => readVisualAdminMode());
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const syncMode = () => setEnabled(readVisualAdminMode());
    syncMode();
    window.addEventListener('storage', syncMode);
    window.addEventListener('focus', syncMode);
    return () => {
      window.removeEventListener('storage', syncMode);
      window.removeEventListener('focus', syncMode);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (location.pathname.startsWith('/admin') || !enabled) {
      setAuthed(false);
      return () => {
        cancelled = true;
      };
    }

    void fetch('/api/admin/login/status', { method: 'GET', cache: 'no-store' })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setAuthed(false);
          writeVisualAdminMode(false);
          setEnabled(false);
          return;
        }
        const body = (await res.json()) as { ok?: boolean; authed?: boolean };
        setAuthed(Boolean(body?.ok && body?.authed));
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, location.pathname]);

  const value = useMemo<VisualAdminContextValue>(
    () => ({
      enabled,
      authed,
      enable: () => {
        writeVisualAdminMode(true);
        setEnabled(true);
      },
      disable: () => {
        writeVisualAdminMode(false);
        setEnabled(false);
        setAuthed(false);
      },
    }),
    [authed, enabled]
  );

  return <VisualAdminContext.Provider value={value}>{children}</VisualAdminContext.Provider>;
};

export const useVisualAdmin = () => {
  const context = useContext(VisualAdminContext);
  if (!context) throw new Error('useVisualAdmin must be used within VisualAdminProvider');
  return context;
};
