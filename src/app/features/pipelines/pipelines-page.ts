import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { I18n } from '../../core/i18n/i18n.service';
import { MoneyPipe, TranslatePipe } from '../../core/i18n/pipes';
import { TranslationKey } from '../../core/i18n/translations';
import { BoardStore } from '../../core/services/board-store';
import { DownloadService } from '../../core/services/download.service';
import { BoardSummary, summarizeBoard } from '../../core/utils/board-stats';
import { createBackup, parseBackup } from '../../core/utils/export';
import { Icon } from '../../shared/ui/icon';
import { notBlank } from '../../shared/validators';

interface Status {
  ok: boolean;
  message: TranslationKey;
}

@Component({
  selector: 'app-pipelines-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon, MoneyPipe, TranslatePipe],
  templateUrl: './pipelines-page.html',
  styleUrl: './pipelines-page.scss',
})
export class PipelinesPage {
  protected readonly store = inject(BoardStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18n);
  private readonly download = inject(DownloadService);

  protected readonly summaries = computed(() =>
    this.store.boards().map((board) => summarizeBoard(board)),
  );
  protected readonly status = signal<Status | null>(null);

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [notBlank, Validators.maxLength(60)],
    }),
  });

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const board = this.store.createBoard(this.form.controls.title.value);
    this.form.reset();
    if (board) {
      this.router.navigate(['/board', board.id]);
    }
  }

  protected remove(board: BoardSummary): void {
    if (confirm(this.i18n.t('pipelines.confirmDelete', { name: board.title }))) {
      this.store.deleteBoard(board.id);
    }
  }

  protected resetDemo(): void {
    if (confirm(this.i18n.t('pipelines.confirmReset'))) {
      this.store.resetToDemo();
    }
  }

  protected exportBackup(): void {
    const date = new Date().toISOString().slice(0, 10);
    this.download.save(
      `clientflow-backup-${date}.json`,
      createBackup(this.store.boards()),
      'application/json',
    );
  }

  protected async importBackup(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const boards = parseBackup(await file.text());
    if (!boards) {
      this.status.set({ ok: false, message: 'pipelines.importError' });
      return;
    }
    if (confirm(this.i18n.t('pipelines.confirmImport'))) {
      this.store.replaceAll(boards);
      this.status.set({ ok: true, message: 'pipelines.importDone' });
    }
  }
}
