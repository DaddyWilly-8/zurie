export type {
  Currency,
  ExchangeRate,
} from "@/services/currencies/currency.service";

export type CurrencyForm = {
  name: string;
  namePlural: string;
  code: string;
  symbol: string;
  symbolNative: string;
  decimalDigits: string;
};

export const emptyCurrencyForm: CurrencyForm = {
  name: "",
  namePlural: "",
  code: "",
  symbol: "",
  symbolNative: "",
  decimalDigits: "2",
};
