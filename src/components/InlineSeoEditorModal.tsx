import { useEffect, useMemo, useState } from 'react';
import { InlineCmsInput, InlineCmsLocaleFields, InlineCmsModal } from './InlineCmsModal';
import { seoApi } from '../utils/adminApi';
import { shopAdminApi } from '../utils/shopApi';
import type { SeoItem } from '../types/admin';
import type { SeoPage } from '../types/shop';

const emptyLocale = () => ({ ru: '', kz: '', en: '' });

export const InlineSeoEditorModal = ({
  slug,
  open,
  onClose,
  scope = 'default',
}: {
  slug: string;
  open: boolean;
  onClose: () => void;
  scope?: 'default' | 'shop';
}) => {
  const [items, setItems] = useState<Array<SeoItem | SeoPage>>([]);
  const [draft, setDraft] = useState<SeoItem | SeoPage | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    if (scope === 'shop') {
      void shopAdminApi.bootstrap().then((next) => {
        if (cancelled) return;
        setItems(next.seoPages);
      });
    } else {
      void seoApi.list().then((next) => {
        if (cancelled) return;
        setItems(next);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [open, scope]);

  const item = useMemo(
    () =>
      items.find((entry) => entry.slug === slug) ?? {
        id: `seo-${slug}-${Date.now()}`,
        slug,
        title: emptyLocale(),
        description: emptyLocale(),
        ...(scope === 'shop' ? { h1: emptyLocale() } : { keywords: emptyLocale() }),
      },
    [items, scope, slug]
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
              if (scope === 'shop') {
                await shopAdminApi.upsert('seoPages', draft.id, draft);
              } else {
                await seoApi.upsert(draft as SeoItem);
              }
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
                if (scope === 'shop') {
                  await shopAdminApi.remove('seoPages', draft.id);
                } else {
                  await seoApi.remove(draft.id);
                }
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
      {'h1' in draft ? (
        <InlineCmsLocaleFields
          label="H1"
          value={draft.h1}
          onChange={(h1) => setDraft({ ...draft, h1 })}
        />
      ) : (
        <InlineCmsLocaleFields
          label="Keywords"
          value={draft.keywords}
          onChange={(keywords) => setDraft({ ...draft, keywords })}
        />
      )}
    </InlineCmsModal>
  );
};
