import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MoneyPipe, TranslatePipe } from '../../core/i18n/pipes';
import { BoardSummary } from '../../core/utils/board-stats';

/** The four numbers a freelancer checks first: open pipeline, earned, win rate, what needs attention. */
@Component({
  selector: 'app-kpi-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe, TranslatePipe],
  styleUrl: './kpi-strip.scss',
  template: `
    @let s = summary();
    <dl class="kpis" [attr.aria-label]="'kpi.label' | t">
      <div class="kpi">
        <dt>{{ 'kpi.open' | t }}</dt>
        <dd class="kpi__value">{{ s.openValue | money: s.currency }}</dd>
        <dd class="kpi__hint">{{ 'kpi.openHint' | t: { count: s.openCount } }}</dd>
      </div>
      <div class="kpi">
        <dt>{{ 'kpi.earned' | t }}</dt>
        <dd class="kpi__value kpi__value--good">{{ s.wonValue | money: s.currency }}</dd>
        <dd class="kpi__hint">{{ 'kpi.earnedHint' | t: { count: s.wonCount } }}</dd>
      </div>
      <div class="kpi">
        <dt>{{ 'kpi.winRate' | t }}</dt>
        <dd class="kpi__value">{{ s.winRate === null ? '—' : s.winRate + '%' }}</dd>
        <dd class="kpi__hint">
          {{ 'kpi.winRateHint' | t: { won: s.wonCount, lost: s.lostCount } }}
        </dd>
      </div>
      @if (showAverage()) {
        <div class="kpi">
          <dt>{{ 'kpi.average' | t }}</dt>
          <dd class="kpi__value">
            {{ s.averageWonValue === null ? '—' : (s.averageWonValue | money: s.currency) }}
          </dd>
        </div>
      } @else {
        <div class="kpi">
          <dt>{{ 'kpi.attention' | t }}</dt>
          <dd class="kpi__value" [class.kpi__value--bad]="attention() > 0">{{ attention() }}</dd>
          <dd class="kpi__hint">
            {{ 'kpi.attentionHint' | t: { overdue: s.overdueCount, idle: s.idleCount } }}
          </dd>
        </div>
      }
    </dl>
  `,
})
export class KpiStrip {
  readonly summary = input.required<BoardSummary>();
  /** Insights shows the average paid deal instead of the attention counter. */
  readonly showAverage = input(false);

  protected readonly attention = computed(
    () => this.summary().overdueCount + this.summary().idleCount,
  );
}
