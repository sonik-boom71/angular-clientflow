import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ThemeService } from '../core/services/theme.service';
import { Icon } from '../shared/ui/icon';

export const REPOSITORY_URL = 'https://github.com/sonik-boom71/angular-taskflow';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  styleUrl: './app-header.scss',
  template: `
    <header class="header">
      <a routerLink="/" class="header__logo">
        <app-icon name="kanban" [size]="22" />
        <span>TaskFlow</span>
      </a>

      <nav class="header__actions" aria-label="App">
        <a class="btn btn--ghost" [href]="repositoryUrl" target="_blank" rel="noopener">
          <app-icon name="code" />
          <span class="header__hide-sm">Source</span>
        </a>
        <button
          type="button"
          class="icon-btn"
          [attr.aria-label]="themeLabel()"
          [title]="themeLabel()"
          (click)="theme.toggle()"
        >
          <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" />
        </button>
      </nav>
    </header>
  `,
})
export class AppHeader {
  protected readonly theme = inject(ThemeService);
  protected readonly repositoryUrl = REPOSITORY_URL;
  protected readonly themeLabel = computed(() =>
    this.theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
}
