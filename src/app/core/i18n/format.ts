import { parseDate } from '../utils/dates';

const moneyFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

export function formatMoney(
  value: number,
  currency: string,
  locale: string,
  compact = false,
): string {
  const key = `${locale}|${currency}|${compact}`;
  let format = moneyFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: compact ? 1 : 0,
      notation: compact ? 'compact' : 'standard',
    });
    moneyFormats.set(key, format);
  }
  return format.format(value);
}

export type DateStyle = 'short' | 'medium' | 'month';

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  short: { month: 'short', day: 'numeric' },
  medium: { dateStyle: 'medium' },
  month: { month: 'short' },
};

export function formatDate(value: string | Date, locale: string, style: DateStyle): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  if (!date) {
    return '';
  }
  const key = `${locale}|${style}`;
  let format = dateFormats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, DATE_OPTIONS[style]);
    dateFormats.set(key, format);
  }
  return format.format(date);
}
