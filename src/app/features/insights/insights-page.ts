import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { I18n } from '../../core/i18n/i18n.service';
import { LocalDatePipe, MoneyPipe, TranslatePipe } from '../../core/i18n/pipes';
import { BoardStore } from '../../core/services/board-store';
import {
  earningsByMonth,
  stageTotals,
  summarizeBoard,
  topClients,
} from '../../core/utils/board-stats';
import { Icon } from '../../shared/ui/icon';
import { KpiStrip } from '../../shared/ui/kpi-strip';

function share(value: number, max: number): number {
  if (!max || !value) {
    return 0;
  }
  return Math.max(2, Math.round((value / max) * 100));
}

@Component({
  selector: 'app-insights-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, KpiStrip, LocalDatePipe, MoneyPipe, TranslatePipe],
  templateUrl: './insights-page.html',
  styleUrl: './insights-page.scss',
})
export class InsightsPage {
  readonly id = input.required<string>();

  private readonly store = inject(BoardStore);
  private readonly title = inject(Title);
  private readonly i18n = inject(I18n);

  protected readonly board = computed(() => this.store.findBoard(this.id()));
  protected readonly summary = computed(() => {
    const board = this.board();
    return board ? summarizeBoard(board) : null;
  });

  protected readonly stages = computed(() => {
    const board = this.board();
    const totals = board ? stageTotals(board) : [];
    const max = Math.max(0, ...totals.map((stage) => stage.value));
    return totals.map((stage) => ({ ...stage, share: share(stage.value, max) }));
  });

  protected readonly months = computed(() => {
    const board = this.board();
    const totals = board ? earningsByMonth(board) : [];
    const max = Math.max(0, ...totals.map((month) => month.value));
    return totals.map((month) => ({ ...month, share: share(month.value, max) }));
  });

  protected readonly clients = computed(() => {
    const board = this.board();
    return board ? topClients(board) : [];
  });

  constructor() {
    effect(() => {
      const board = this.board();
      if (board) {
        this.title.setTitle(this.i18n.t('title.insights', { name: board.title }));
      }
    });
  }
}
