import { currencyService } from "@/services/currencies/currency.service";
import type { CurrencyForm } from "./types";

export const currencyActions = {
  list() {
    return currencyService.list();
  },

  create(form: CurrencyForm) {
    return currencyService.create({
      name: form.name,
      namePlural: form.namePlural,
      code: form.code,
      symbol: form.symbol,
      symbolNative: form.symbolNative,
      decimalDigits: Number(form.decimalDigits) || 2,
    });
  },

  update(id: number, form: CurrencyForm) {
    return currencyService.update(id, {
      name: form.name,
      namePlural: form.namePlural,
      code: form.code,
      symbol: form.symbol,
      symbolNative: form.symbolNative,
      decimalDigits: Number(form.decimalDigits) || 2,
    });
  },

  setActive(id: number, isActive: boolean) {
    return currencyService.setActive(id, isActive);
  },

  designateBase(id: number) {
    return currencyService.designateBase(id);
  },

  listExchangeRates(id: number) {
    return currencyService.listExchangeRates(id);
  },

  addExchangeRate(id: number, rate: number) {
    return currencyService.addExchangeRate(id, rate);
  },
};
