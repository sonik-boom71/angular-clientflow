import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { LocalDatePipe, MoneyPipe, TranslatePipe } from '../../core/i18n/pipes';
import { TranslationKey } from '../../core/i18n/translations';
import { Card, Currency, Label, StageKind } from '../../core/models/board.model';
import { getDealHealth } from '../../core/utils/deal-health';
import { DueStatus } from '../../core/utils/due-status';
import { Icon } from '../../shared/ui/icon';

const DUE_HINTS: Record<DueStatus, TranslationKey | null> = {
  none: null,
  overdue: 'deal.overdue',
  today: 'deal.dueToday',
  soon: 'deal.dueSoon',
  later: 'deal.due',
};

@Component({
  selector: 'app-card-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, LocalDatePipe, MoneyPipe, TranslatePipe],
  styleUrl: './card-item.scss',
  template: `
    <button type="button" class="card" (click)="opened.emit()">
      @if (cardLabels().length) {
        <span class="card__labels">
          @for (label of cardLabels(); track label.id) {
            <span class="label label--{{ label.color }}">{{ label.name }}</span>
          }
        </span>
      }

      <span class="card__title">{{ card().title }}</span>
      @if (card().client) {
        <span class="card__client">
          <app-icon name="user" [size]="13" />
          {{ card().client }}
        </span>
      }

      <span class="card__meta">
        @if (card().value !== null) {
          <span class="card__value">{{ card().value | money: currency() }}</span>
        }
        @if (card().dueDate) {
          @let hint = dueHint();
          <span class="chip chip--{{ health().due }}" [title]="hint ? (hint | t) : ''">
            <app-icon name="calendar" [size]="13" />
            {{ card().dueDate | localDate }}
            @if (hint) {
              <span class="sr-only">{{ hint | t }}</span>
            }
          </span>
        }
        @if (health().idleDays; as days) {
          <span class="chip chip--idle" [title]="'deal.idleHint' | t: { count: days }">
            <app-icon name="clock" [size]="13" />
            {{ 'deal.idle' | t: { count: days } }}
            <span class="sr-only">{{ 'deal.idleHint' | t: { count: days } }}</span>
          </span>
        }
        @if (card().description) {
          <span class="card__notes" [title]="'deal.hasNotes' | t">
            <app-icon name="text" [size]="14" />
            <span class="sr-only">{{ 'deal.hasNotes' | t }}</span>
          </span>
        }
      </span>
    </button>
  `,
})
export class CardItem {
  readonly card = input.required<Card>();
  readonly labels = input<Label[]>([]);
  readonly kind = input<StageKind>('open');
  readonly currency = input<Currency>('USD');
  readonly opened = output();

  protected readonly cardLabels = computed(() => {
    const ids = this.card().labelIds;
    return this.labels().filter((label) => ids.includes(label.id));
  });

  protected readonly health = computed(() => getDealHealth(this.card(), this.kind()));
  protected readonly dueHint = computed(() => DUE_HINTS[this.health().due]);
}
