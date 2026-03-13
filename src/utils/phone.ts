export const getPhoneDigits = (value: string) => value.replace(/\D/g, '');

export const isValidPhone = (value: string) => getPhoneDigits(value).length >= 10;
