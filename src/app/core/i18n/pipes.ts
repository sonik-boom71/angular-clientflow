import { Pipe, PipeTransform, inject } from '@angular/core';

import { DateStyle, formatDate, formatMoney } from './format';
import { I18n, TranslationParams } from './i18n.service';
import { TranslationKey } from './translations';

// Impure, so the text updates when the language changes.

@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(key: TranslationKey, params?: TranslationParams): string {
    return this.i18n.t(key, params);
  }
}

@Pipe({ name: 'money', pure: false })
export class MoneyPipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(value: number | null | undefined, currency: string, compact = false): string {
    return value == null ? '' : formatMoney(value, currency, this.i18n.locale(), compact);
  }
}

@Pipe({ name: 'localDate', pure: false })
export class LocalDatePipe implements PipeTransform {
  private readonly i18n = inject(I18n);

  transform(value: string | Date | null | undefined, style: DateStyle = 'short'): string {
    return value ? formatDate(value, this.i18n.locale(), style) : '';
  }
}
