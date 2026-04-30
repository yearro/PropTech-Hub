export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', locale: 'es-MX' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
];

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

export const getCurrencyByCode = (code: string) => 
  SUPPORTED_CURRENCIES.find(c => c.code === code) || SUPPORTED_CURRENCIES[0];

export const formatCurrency = (value: number, currencyCode: string, lang: string) => {
  const currency = getCurrencyByCode(currencyCode);
  return new Intl.NumberFormat(lang === 'es' ? 'es-MX' : 'en-US', {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(value);
};
