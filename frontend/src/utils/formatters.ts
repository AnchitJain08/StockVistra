export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num);
};

export const formatPercentage = (num: number): string => {
    return num.toFixed(2) + '%';
};

export const formatPrice = (num: number): string => {
    return num.toFixed(2);
};
