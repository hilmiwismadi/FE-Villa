export const formatNumberWithDots = (value: string | number): string => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
};

export const parseFormattedNumber = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits);
};
