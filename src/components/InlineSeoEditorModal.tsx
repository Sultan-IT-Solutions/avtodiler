import { useEffect, useMemo, useState } from 'react';
import { InlineCmsInput, InlineCmsLocaleFields, InlineCmsModal } from './InlineCmsModal';
import { seoApi } from '../utils/adminApi';
import type { SeoItem } from '../types/admin';

const emptyLocale = () => ({ ru: '', kz: '', en: '' });

export const InlineSeoEditorModal = ({
  slug,
  open,
  onClose,
}: {
  slug: string;
  open: boolean;
  onClose: () => void;
}) => {
  const [items, setItems] = useState<SeoItem[]>([]);
  const [draft, setDraft] = useState<SeoItem | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void seoApi.list().then((next) => {
      if (cancelled) return;
      setItems(next);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const item = useMemo(
    () =>
      items.find((entry) => entry.slug === slug) ?? {
        id: `seo-${slug}-${Date.now()}`,
        slug,
        title: emptyLocale(),
        description: emptyLocale(),
        keywords: emptyLocale(),
      },
    [items, slug]
  );

  useEffect(() => {
    if (!open) return;
    setDraft(item);
  }, [item, open]);

  if (!open || !draft) return null;

  return (
    <InlineCmsModal
      title="Редактирование SEO"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className="btn-primary"
            onClick={async () => {
              await seoApi.upsert(draft);
              onClose();
            }}
          >
            Сохранить
          </button>
          {items.some((entry) => entry.id === draft.id) ? (
            <button
              type="button"
              className="btn-outline"
              onClick={async () => {
                if (!window.confirm('Удалить SEO запись?')) return;
                await seoApi.remove(draft.id);
                onClose();
              }}
            >
              Удалить
            </button>
          ) : null}
        </>
      }
    >
      <InlineCmsInput value={draft.slug} onChange={(slugValue) => setDraft({ ...draft, slug: slugValue })} placeholder="Slug" />
      <InlineCmsLocaleFields
        label="Meta title"
        value={draft.title}
        onChange={(title) => setDraft({ ...draft, title })}
      />
      <InlineCmsLocaleFields
        label="Meta description"
        value={draft.description}
        multiline
        onChange={(description) => setDraft({ ...draft, description })}
      />
      <InlineCmsLocaleFields
        label="Keywords"
        value={draft.keywords}
        onChange={(keywords) => setDraft({ ...draft, keywords })}
      />
    </InlineCmsModal>
  );
};
