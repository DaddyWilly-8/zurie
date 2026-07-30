export type CurrencyCode = "USD" | "TZS" | "EUR" | "GBP" | "KES";
export type CurrencyRateMap = Record<CurrencyCode, number>;

export const CURRENCY_OPTIONS: Array<{ code: CurrencyCode; label: string }> = [
  { code: "USD", label: "US Dollar" },
  { code: "TZS", label: "Tanzanian Shilling" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "KES", label: "Kenyan Shilling" },
];

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  USD: "en-US",
  TZS: "sw-TZ",
  EUR: "de-DE",
  GBP: "en-GB",
  KES: "en-KE",
};

export const DEFAULT_USD_EXCHANGE_RATE: CurrencyRateMap = {
  USD: 1,
  TZS: 2550,
  EUR: 0.92,
  GBP: 0.79,
  KES: 129,
};

export const normalizeExchangeRates = (
  rates?: Partial<CurrencyRateMap> | null,
): CurrencyRateMap => {
  return {
    USD: rates?.USD && rates.USD > 0 ? rates.USD : DEFAULT_USD_EXCHANGE_RATE.USD,
    TZS: rates?.TZS && rates.TZS > 0 ? rates.TZS : DEFAULT_USD_EXCHANGE_RATE.TZS,
    EUR: rates?.EUR && rates.EUR > 0 ? rates.EUR : DEFAULT_USD_EXCHANGE_RATE.EUR,
    GBP: rates?.GBP && rates.GBP > 0 ? rates.GBP : DEFAULT_USD_EXCHANGE_RATE.GBP,
    KES: rates?.KES && rates.KES > 0 ? rates.KES : DEFAULT_USD_EXCHANGE_RATE.KES,
  };
};

export const convertFromUsd = (
  amount: number,
  targetCurrency: CurrencyCode,
  rates: Partial<CurrencyRateMap> = DEFAULT_USD_EXCHANGE_RATE,
): number => {
  const safeRates = normalizeExchangeRates(rates);
  return amount * safeRates[targetCurrency];
};

export const formatCurrency = (
  amount: number,
  currency: CurrencyCode = "USD",
): string => {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "TZS" ? 0 : 2,
  }).format(amount);
};

export const formatUsdPriceInCurrency = (
  amountInUsd: number,
  currency: CurrencyCode,
  rates: Partial<CurrencyRateMap> = DEFAULT_USD_EXCHANGE_RATE,
): string => {
  return formatCurrency(convertFromUsd(amountInUsd, currency, rates), currency);
};

