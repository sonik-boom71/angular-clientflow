const moneyFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

/** Formats an amount with the currency symbol, e.g. "$2,400" or "2 400 $". Formatters are cached. */
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

/** Parses yyyy-mm-dd as a local date, so the day doesn't shift with the time zone. */
export function parseDate(value: string): Date | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

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
