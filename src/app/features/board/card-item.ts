import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Card, Label } from '../../core/models/board.model';
import { DueStatus, getDueStatus } from '../../core/utils/due-status';
import { Icon } from '../../shared/ui/icon';

const DUE_HINTS: Record<DueStatus, string> = {
  none: '',
  overdue: 'Overdue',
  today: 'Due today',
  soon: 'Due soon',
  later: 'Due',
};

@Component({
  selector: 'app-card-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, Icon],
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

      @if (card().dueDate || card().description) {
        <span class="card__meta">
          @if (card().dueDate) {
            <span class="due due--{{ dueStatus() }}" [title]="dueHint()">
              <app-icon name="calendar" [size]="14" />
              {{ card().dueDate | date: 'MMM d' }}
              <span class="sr-only">{{ dueHint() }}</span>
            </span>
          }
          @if (card().description) {
            <span class="card__has-text" title="Has a description">
              <app-icon name="text" [size]="14" />
              <span class="sr-only">Has a description</span>
            </span>
          }
        </span>
      }
    </button>
  `,
})
export class CardItem {
  readonly card = input.required<Card>();
  readonly labels = input<Label[]>([]);
  readonly opened = output();

  protected readonly cardLabels = computed(() => {
    const ids = this.card().labelIds;
    return this.labels().filter((label) => ids.includes(label.id));
  });

  protected readonly dueStatus = computed(() => getDueStatus(this.card().dueDate));
  protected readonly dueHint = computed(() => DUE_HINTS[this.dueStatus()]);
}
