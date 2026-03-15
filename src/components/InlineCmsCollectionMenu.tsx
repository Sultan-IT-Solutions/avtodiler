import { useEffect, useRef } from 'react';
import { Edit3, Plus, Trash2, X } from 'lucide-react';
import { isolateTouchScroll, lockScroll, unlockScroll } from '../utils/scrollLock';

type CollectionItem = {
  id: string;
  title: string;
  subtitle?: string;
};

export const InlineCmsCollectionMenu = ({
  title,
  open,
  onClose,
  addLabel = 'Добавить',
  onAdd,
  items,
  onEdit,
  onDelete,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  addLabel?: string;
  onAdd?: () => void;
  items: CollectionItem[];
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !backdropRef.current || !panelRef.current) return;

    return isolateTouchScroll(backdropRef.current, panelRef.current);
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[78] overflow-hidden bg-black/70 px-4 py-4 sm:py-8"
      onClick={onClose}
      style={{ touchAction: 'none' }}
    >
      <div className="flex min-h-full items-start justify-center">
        <div
          ref={panelRef}
          className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto overscroll-contain border border-white/10 bg-luxury-elevated p-6 shadow-2xl lg:p-8"
          onClick={(event) => event.stopPropagation()}
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-luxury-burgundy">
                Inline CMS
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/70 transition hover:border-white/25 hover:text-white"
              aria-label="Закрыть"
            >
              <X size={16} />
            </button>
          </div>

          {onAdd ? (
            <div className="mb-6">
              <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={onAdd}>
                <Plus size={14} />
                {addLabel}
              </button>
            </div>
          ) : null}

          <div className="grid gap-3">
            {items.length === 0 ? (
              <div className="border border-white/10 bg-white/[0.02] px-4 py-5 text-white/55">
                Пока ничего нет.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 border border-white/10 bg-white/[0.02] p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{item.title}</p>
                    {item.subtitle ? (
                      <p className="mt-1 text-sm text-white/45">{item.subtitle}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item.id)}
                      className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/75 transition hover:border-white/25 hover:text-white"
                    >
                      <Edit3 size={13} />
                      Редактировать
                    </button>
                    {onDelete ? (
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="inline-flex items-center gap-2 border border-luxury-burgundy/35 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-luxury-burgundy transition hover:bg-luxury-burgundy/10"
                      >
                        <Trash2 size={13} />
                        Удалить
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
