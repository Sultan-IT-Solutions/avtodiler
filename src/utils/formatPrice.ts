export const formatPriceKzt = (price: number, locale: string = 'ru-KZ') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
