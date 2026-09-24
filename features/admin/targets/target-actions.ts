import { targetService } from "@/services/targets/target.service";
import {
  convertToBaseCurrency,
  type CurrencyCode,
  type CurrencyRateMap,
} from "@/utils/currency";

export const currentPeriod = () => new Date().toISOString().slice(0, 7);

export const targetActions = {
  list() {
    return targetService.list();
  },

  achievement(period: string) {
    return targetService.achievement(period);
  },

  /** Amount typed in the selected currency; targets are stored in TZS. */
  save(
    period: string,
    amount: string,
    currency: CurrencyCode,
    rates: CurrencyRateMap,
  ) {
    return targetService.save({
      period,
      targetAmount:
        Math.round(
          convertToBaseCurrency(Number(amount), currency, rates) * 100,
        ) / 100,
    });
  },
};
