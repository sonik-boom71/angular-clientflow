import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { I18n } from './i18n.service';
import { TranslationKey } from './translations';

/**
 * Route `title`s are translation keys. The title updates on navigation and again
 * when the language changes. Pages without a route title set their own.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18n);
  private readonly key = signal<TranslationKey | undefined>(undefined);

  constructor() {
    super();
    effect(() => {
      const key = this.key();
      if (key) {
        this.title.setTitle(this.i18n.t(key));
      }
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.key.set(this.buildTitle(snapshot) as TranslationKey | undefined);
  }
}
