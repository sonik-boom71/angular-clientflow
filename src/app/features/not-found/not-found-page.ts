import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../core/i18n/pipes';
import { Icon } from '../../shared/ui/icon';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, TranslatePipe],
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
      <h1>{{ 'notFound.title' | t }}</h1>
      <p>{{ 'notFound.body' | t }}</p>
      <a routerLink="/" class="btn btn--primary">
        <app-icon name="arrow-left" />
        {{ 'notFound.back' | t }}
      </a>
    </section>
  `,
})
export class NotFoundPage {}
