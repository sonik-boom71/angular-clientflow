import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { I18n } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { TranslationKey } from '../../core/i18n/translations';
import { BoardStore } from '../../core/services/board-store';
import { ThemeService } from '../../core/services/theme.service';
import { REPOSITORY_URL } from '../../layout/app-header';
import { Icon, IconName } from '../../shared/ui/icon';

interface Feature {
  icon: IconName;
  title: TranslationKey;
  body: TranslationKey;
}

const FEATURES: Feature[] = [
  { icon: 'kanban', title: 'landing.f1.title', body: 'landing.f1.body' },
  { icon: 'banknote', title: 'landing.f2.title', body: 'landing.f2.body' },
  { icon: 'bell', title: 'landing.f3.title', body: 'landing.f3.body' },
  { icon: 'chart', title: 'landing.f4.title', body: 'landing.f4.body' },
  { icon: 'lock', title: 'landing.f5.title', body: 'landing.f5.body' },
  { icon: 'globe', title: 'landing.f6.title', body: 'landing.f6.body' },
];

const STEPS: TranslationKey[] = ['landing.step1', 'landing.step2', 'landing.step3'];

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TranslatePipe],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  private readonly store = inject(BoardStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);
  private readonly theme = inject(ThemeService);

  protected readonly features = FEATURES;
  protected readonly steps = STEPS;
  protected readonly repositoryUrl = REPOSITORY_URL;
  protected readonly screenshot = computed(
    () => `screenshots/pipeline-${this.i18n.lang()}-${this.theme.theme()}.png`,
  );

  protected openDemo(): void {
    this.router.navigate(['/board', this.store.ensureDemoBoard()]);
  }

  protected startEmpty(): void {
    const board = this.store.createBoard(this.i18n.t('pipelines.defaultName'));
    if (board) {
      this.router.navigate(['/board', board.id]);
    }
  }
}
