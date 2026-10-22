import { TestBed } from '@angular/core/testing';

import { MemoryStorage } from '../../../testing/memory-storage';
import { StorageService } from '../services/storage.service';
import { formatMoney } from './format';
import { I18n, LANG_STORAGE_KEY } from './i18n.service';

describe('I18n', () => {
  let storage: MemoryStorage;

  function setup(savedLang?: string): I18n {
    storage = new MemoryStorage();
    if (savedLang) {
      storage.data.set(LANG_STORAGE_KEY, savedLang);
    }
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storage }],
    });
    return TestBed.inject(I18n);
  }

  it('starts in English for an English browser', () => {
    expect(setup().lang()).toBe('en');
  });

  it('restores the saved language', () => {
    expect(setup('uk').lang()).toBe('uk');
  });

  it('ignores a saved language it does not support', () => {
    expect(setup('de').lang()).toBe('en');
  });

  it('translates and fills in parameters', () => {
    const i18n = setup();
    expect(i18n.t('nav.pipelines')).toBe('Pipelines');
    expect(i18n.t('stage.delete', { name: 'Leads' })).toBe('Delete stage Leads');

    i18n.lang.set('uk');
    expect(i18n.t('nav.pipelines')).toBe('Воронки');
  });

  it('picks English plural forms', () => {
    const i18n = setup();
    expect(i18n.t('pipelines.deals', { count: 1 })).toBe('1 deal');
    expect(i18n.t('pipelines.deals', { count: 5 })).toBe('5 deals');
  });

  it('picks all three Ukrainian plural forms', () => {
    const i18n = setup('uk');
    expect([1, 2, 5, 11, 21, 22, 25].map((count) => i18n.t('pipelines.deals', { count }))).toEqual([
      '1 угода',
      '2 угоди',
      '5 угод',
      '11 угод',
      '21 угода',
      '22 угоди',
      '25 угод',
    ]);
  });

  it('saves the language and sets <html lang>', () => {
    const i18n = setup();
    i18n.lang.set('uk');
    TestBed.tick();
    expect(storage.data.get(LANG_STORAGE_KEY)).toBe('uk');
    expect(document.documentElement.lang).toBe('uk');
  });
});

describe('formatMoney', () => {
  // Intl uses narrow no-break spaces as group separators in some locales.
  const plain = (text: string) => text.replace(/\s/g, ' ');

  it('formats amounts for each locale without decimals', () => {
    expect(formatMoney(2400, 'USD', 'en-US')).toBe('$2,400');
    expect(plain(formatMoney(2400, 'USD', 'uk-UA'))).toBe('2 400 $');
    expect(plain(formatMoney(2400, 'UAH', 'uk-UA'))).toBe('2 400 ₴');
  });

  it('shortens big amounts in compact mode', () => {
    expect(formatMoney(12_500, 'USD', 'en-US', true)).toBe('$12.5K');
  });
});
