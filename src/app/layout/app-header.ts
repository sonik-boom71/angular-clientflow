import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { I18n } from '../core/i18n/i18n.service';
import { Lang } from '../core/i18n/lang';
import { TranslatePipe } from '../core/i18n/pipes';
import { ThemeService } from '../core/services/theme.service';
import { Icon } from '../shared/ui/icon';

export const REPOSITORY_URL = 'https://github.com/sonik-boom71/angular-clientflow';

const LANGUAGES: { lang: Lang; short: string; name: string }[] = [
  { lang: 'en', short: 'EN', name: 'English' },
  { lang: 'uk', short: 'UA', name: 'Українська' },
];

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon, TranslatePipe],
  styleUrl: './app-header.scss',
  template: `
    <header class="header">
      <a routerLink="/" class="header__logo" aria-label="ClientFlow">
        <app-icon name="kanban" [size]="22" />
        <span>ClientFlow</span>
      </a>

      <nav class="header__nav" [attr.aria-label]="'nav.main' | t">
        <a routerLink="/pipelines" routerLinkActive="header__link--active" class="header__link">
          {{ 'nav.pipelines' | t }}
        </a>
      </nav>

      <div class="header__actions">
        <div class="lang" role="group" [attr.aria-label]="'nav.language' | t">
          @for (option of languages; track option.lang) {
            <button
              type="button"
              class="lang__option"
              [class.lang__option--on]="i18n.lang() === option.lang"
              [attr.aria-pressed]="i18n.lang() === option.lang"
              [attr.aria-label]="option.name"
              [attr.lang]="option.lang"
              (click)="i18n.lang.set(option.lang)"
            >
              {{ option.short }}
            </button>
          }
        </div>
        <a
          class="icon-btn"
          [href]="repositoryUrl"
          target="_blank"
          rel="noopener"
          [attr.aria-label]="'nav.source' | t"
          [title]="'nav.source' | t"
        >
          <app-icon name="code" />
        </a>
        <button
          type="button"
          class="icon-btn"
          [attr.aria-label]="themeLabel() | t"
          [title]="themeLabel() | t"
          (click)="theme.toggle()"
        >
          <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" />
        </button>
      </div>
    </header>
  `,
})
export class AppHeader {
  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(I18n);
  protected readonly languages = LANGUAGES;
  protected readonly repositoryUrl = REPOSITORY_URL;
  protected readonly themeLabel = computed(() =>
    this.theme.theme() === 'dark' ? 'theme.toLight' : 'theme.toDark',
  );
}
