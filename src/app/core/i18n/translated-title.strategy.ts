import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { I18n } from './i18n.service';
import { TranslationKey } from './translations';

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
