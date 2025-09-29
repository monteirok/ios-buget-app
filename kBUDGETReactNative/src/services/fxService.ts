import { FxRate } from '@/models';

export interface FxRateProvider {
  getRate(currency: string, date: Date): FxRate | undefined;
  convert(amount: number, currency: string, date: Date): number | undefined;
  upsertRates(rates: FxRate[]): Promise<void>;
  refreshRatesIfNeeded(): Promise<void>;
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export class FxService implements FxRateProvider {
  private cache = new Map<string, FxRate>();

  getRate(currency: string, date: Date): FxRate | undefined {
    const key = `${currency}-${isoDate(date)}`;
    return this.cache.get(key);
  }

  convert(amount: number, currency: string, date: Date): number | undefined {
    if (currency === 'CAD') {
      return amount;
    }

    const rate = this.getRate(currency, date);
    if (!rate) {
      return undefined;
    }
    return amount * rate.rateToCAD;
  }

  async upsertRates(rates: FxRate[]): Promise<void> {
    for (const rate of rates) {
      const key = `${rate.code}-${rate.date}`;
      this.cache.set(key, rate);
    }
  }

  async refreshRatesIfNeeded(): Promise<void> {
    // Stub: plug in remote fetch when API is available. Offline-only for MVP scaffolding.
  }
}
