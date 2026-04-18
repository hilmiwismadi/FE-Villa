export const normalizePhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return digits;
  if (digits.startsWith('62')) return `0${digits.slice(2)}`;
  if (digits.startsWith('8')) return `0${digits}`;
  return digits;
};

export const isValidPhoneNumber = (value: string): boolean => /^08\d{8,13}$/.test(value);
