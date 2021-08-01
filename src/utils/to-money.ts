const toMoney = (number: number): string => {
  const numberFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return numberFormat.format(number);
};

export default toMoney;
