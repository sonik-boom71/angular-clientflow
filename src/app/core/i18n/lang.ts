export const LANGS = ['en', 'uk'] as const;

export type Lang = (typeof LANGS)[number];

export const LOCALES: Record<Lang, string> = { en: 'en-US', uk: 'uk-UA' };

export function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang);
}
