export const normalizePhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
};

export const isValidPhoneNumber = (value: string): boolean => /^(08|62|8)\d{8,13}$/.test(value);
