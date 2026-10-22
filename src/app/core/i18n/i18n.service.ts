import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

import { StorageService } from '../services/storage.service';
import { LOCALES, Lang, isLang } from './lang';
import { Entry, TRANSLATIONS, TranslationKey } from './translations';

export const LANG_STORAGE_KEY = 'clientflow:lang';

export type TranslationParams = Record<string, string | number>;

/**
 * Runtime translations without a page reload. The language is a signal, so every
 * template that calls t() re-renders when it changes.
 */
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);

  readonly lang = signal<Lang>(this.initialLang());
  readonly locale = computed(() => LOCALES[this.lang()]);
  private readonly pluralRules = computed(() => new Intl.PluralRules(this.locale()));

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.document.documentElement.lang = lang;
      this.storage.save(LANG_STORAGE_KEY, lang);
    });
  }

  t(key: TranslationKey, params?: TranslationParams): string {
    const entry: Entry | undefined = TRANSLATIONS[this.lang()][key] ?? TRANSLATIONS.en[key];
    if (entry === undefined) {
      return key;
    }
    const text = typeof entry === 'string' ? entry : this.pluralForm(entry, params?.['count']);
    return params ? interpolate(text, params) : text;
  }

  private pluralForm(entry: Exclude<Entry, string>, count: string | number | undefined): string {
    const category = this.pluralRules().select(Number(count ?? 0));
    return (
      (category === 'one' || category === 'few' || category === 'many'
        ? entry[category]
        : undefined) ?? entry.other
    );
  }

  private initialLang(): Lang {
    const saved = this.storage.load<string>(LANG_STORAGE_KEY);
    if (isLang(saved)) {
      return saved;
    }
    const browser = this.document.defaultView?.navigator?.language ?? '';
    return browser.toLowerCase().startsWith('uk') ? 'uk' : 'en';
  }
}

function interpolate(text: string, params: TranslationParams): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
