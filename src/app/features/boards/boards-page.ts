import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { BoardStore } from '../../core/services/board-store';
import { BoardSummary, summarizeBoard } from '../../core/utils/board-stats';
import { Icon } from '../../shared/ui/icon';
import { notBlank } from '../../shared/validators';

@Component({
  selector: 'app-boards-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './boards-page.html',
  styleUrl: './boards-page.scss',
})
export class BoardsPage {
  protected readonly store = inject(BoardStore);
  private readonly router = inject(Router);

  protected readonly summaries = computed(() =>
    this.store.boards().map((board) => summarizeBoard(board)),
  );

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
    const message = `Delete "${board.title}" and its ${board.cardCount} cards? This can't be undone.`;
    if (confirm(message)) {
      this.store.deleteBoard(board.id);
    }
  }

  protected resetDemo(): void {
    if (confirm('Replace all boards with the demo data?')) {
      this.store.resetToDemo();
    }
  }
}
