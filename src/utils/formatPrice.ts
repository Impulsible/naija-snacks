export const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString('en-NG')}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};