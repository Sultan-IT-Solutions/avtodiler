import type { CategoryItem, ProductItem, ShopState } from '../types/shop';

type LegacySubcategory = NonNullable<CategoryItem['subcategories']>[number];

const emptyLegacySubcategories = (): LegacySubcategory[] => [];

export const slugifyPathSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const getCategorySlugCandidate = (category: Pick<CategoryItem, 'slug' | 'name' | 'id'>) => {
  const candidates: Array<string | undefined> = [
    category.slug,
    category.name.en,
    category.name.ru,
    category.name.kz,
    category.id,
  ];

  for (const candidate of candidates) {
    const slug = slugifyPathSegment(candidate ?? '');
    if (slug) {
      return slug;
    }
  }

  return 'category';
};

export const buildUniqueCategorySlug = (
  category: Pick<CategoryItem, 'slug' | 'name' | 'id'>,
  takenSlugs: Set<string>
) => {
  const baseSlug = getCategorySlugCandidate(category);
  if (!takenSlugs.has(baseSlug)) {
    takenSlugs.add(baseSlug);
    return baseSlug;
  }

  let suffix = 2;
  let nextSlug = `${baseSlug}-${suffix}`;
  while (takenSlugs.has(nextSlug)) {
    suffix += 1;
    nextSlug = `${baseSlug}-${suffix}`;
  }
  takenSlugs.add(nextSlug);
  return nextSlug;
};

export const normalizeCategory = (
  category: CategoryItem,
  takenSlugs?: Set<string>
): CategoryItem => {
  const normalizedSlug = takenSlugs
    ? buildUniqueCategorySlug(category, takenSlugs)
    : getCategorySlugCandidate(category);

  return {
    ...category,
    slug: normalizedSlug,
    subcategories: emptyLegacySubcategories(),
  };
};

export const normalizeCategories = (categories: CategoryItem[]) => {
  const takenSlugs = new Set<string>();
  return categories.map((category) => normalizeCategory(category, takenSlugs));
};

const buildCategoryMaps = (categories: CategoryItem[]) => ({
  byId: new Map(categories.map((category) => [category.id, category])),
  bySlug: new Map(categories.map((category) => [category.slug, category])),
});

const resolveCategoryIdFromLegacy = (
  product: Partial<ProductItem> & { categorySlug?: string },
  categoryMaps: ReturnType<typeof buildCategoryMaps>
) => {
  const explicitCategoryId =
    typeof product.categoryId === 'string' && product.categoryId.trim()
      ? product.categoryId.trim()
      : '';

  if (explicitCategoryId && categoryMaps.byId.has(explicitCategoryId)) {
    return explicitCategoryId;
  }

  const legacySlug =
    typeof product.categorySlug === 'string' && product.categorySlug.trim()
      ? product.categorySlug.trim()
      : '';

  return categoryMaps.bySlug.get(legacySlug)?.id ?? '';
};

const normalizeProductWithCategoryMaps = (
  product: ProductItem,
  categoryMaps: ReturnType<typeof buildCategoryMaps>
): ProductItem => {
  const categoryId = resolveCategoryIdFromLegacy(product, categoryMaps);
  const resolvedCategory = categoryMaps.byId.get(categoryId);

  return {
    ...product,
    categoryId,
    categorySlug: resolvedCategory?.slug,
    subcategorySlug: undefined,
  };
};

export const normalizeProduct = (product: ProductItem, categories: CategoryItem[]) =>
  normalizeProductWithCategoryMaps(product, buildCategoryMaps(categories));

export const normalizeProducts = (products: ProductItem[], categories: CategoryItem[]) => {
  const categoryMaps = buildCategoryMaps(categories);
  return products.map((product) => normalizeProductWithCategoryMaps(product, categoryMaps));
};

export const normalizeProductForSave = (
  product: ProductItem,
  categories: CategoryItem[]
): ProductItem => {
  const normalized = normalizeProduct(product, categories);

  return {
    ...normalized,
    slug: slugifyPathSegment(normalized.slug),
    categorySlug: undefined,
    subcategorySlug: undefined,
  };
};

export const normalizeCategoryForSave = (category: CategoryItem): CategoryItem => ({
  ...normalizeCategory(category),
  subcategories: emptyLegacySubcategories(),
});

export const normalizeShopState = (state: ShopState): ShopState => {
  const categories = normalizeCategories(state.categories);
  const products = normalizeProducts(state.products, categories);

  return {
    ...state,
    categories,
    products,
  };
};

export const findCategoryByProduct = (product: ProductItem | undefined, categories: CategoryItem[]) => {
  if (!product) return undefined;
  return categories.find((category) => category.id === product.categoryId);
};

export const findCategoryByRouteSlug = (slug: string | undefined, categories: CategoryItem[]) => {
  if (!slug) return undefined;
  return categories.find((category) => category.slug === slug);
};
