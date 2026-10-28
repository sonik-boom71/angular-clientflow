import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/services/theme.service';
import { AppHeader } from './layout/app-header';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AppHeader],
  styleUrl: './app.scss',
  template: `
    <app-header />
    <main class="main">
      <router-outlet />
    </main>
  `,
})
export class App {
  constructor() {
    // Starts the theme service, which applies the saved theme.
    inject(ThemeService);
  }
}
