export const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value)
