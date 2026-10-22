import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../../shared/ui/icon';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  styles: `
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin: auto;
      padding: 64px 24px;
      text-align: center;
    }

    .not-found__code {
      color: var(--accent);
      font-size: 64px;
      font-weight: 800;
      line-height: 1;
    }

    p {
      color: var(--text-muted);
    }
  `,
  template: `
    <section class="not-found">
      <span class="not-found__code">404</span>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or was moved.</p>
      <a routerLink="/" class="btn btn--primary">
        <app-icon name="arrow-left" />
        Back to boards
      </a>
    </section>
  `,
})
export class NotFoundPage {}
