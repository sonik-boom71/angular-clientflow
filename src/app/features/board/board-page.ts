import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

import { CardChanges, Column } from '../../core/models/board.model';
import { BoardStore } from '../../core/services/board-store';
import { summarizeBoard } from '../../core/utils/board-stats';
import { CardFilter, isFilterActive } from '../../core/utils/card-filter';
import { Icon } from '../../shared/ui/icon';
import { InlineEdit } from '../../shared/ui/inline-edit';
import { BoardColumn, columnListId } from './board-column';
import { CardDialog } from './card-dialog';

/** Short press-and-hold on touch screens so the board can still be scrolled with a finger. */
const DRAG_START_DELAY = { touch: 200, mouse: 0 };

@Component({
  selector: 'app-board-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDropList,
    CdkDrag,
    CdkScrollable,
    RouterLink,
    BoardColumn,
    CardDialog,
    Icon,
    InlineEdit,
  ],
  templateUrl: './board-page.html',
  styleUrl: './board-page.scss',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class BoardPage {
  /** Bound from the `:id` route parameter by withComponentInputBinding(). */
  readonly id = input.required<string>();

  private readonly store = inject(BoardStore);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');

  protected readonly dragStartDelay = DRAG_START_DELAY;
  protected readonly board = computed(() => this.store.boards().find((b) => b.id === this.id()));
  protected readonly summary = computed(() => {
    const board = this.board();
    return board ? summarizeBoard(board) : null;
  });

  protected readonly query = signal('');
  protected readonly selectedLabelIds = signal<string[]>([]);
  protected readonly filter = computed<CardFilter>(() => ({
    query: this.query(),
    labelIds: this.selectedLabelIds(),
  }));
  protected readonly filtering = computed(() => isFilterActive(this.filter()));

  protected readonly listIds = computed(
    () => this.board()?.columns.map((column) => columnListId(column.id)) ?? [],
  );

  protected readonly editingCardId = signal<string | null>(null);
  protected readonly editing = computed(() => {
    const cardId = this.editingCardId();
    for (const column of this.board()?.columns ?? []) {
      const card = column.cards.find((c) => c.id === cardId);
      if (card) {
        return { card, columnTitle: column.title };
      }
    }
    return null;
  });

  constructor() {
    effect(() => {
      const board = this.board();
      if (board) {
        this.title.setTitle(`${board.title} · TaskFlow`);
      }
    });
  }

  protected renameBoard(title: string): void {
    this.store.renameBoard(this.id(), title);
  }

  protected deleteBoard(): void {
    const board = this.board();
    if (board && confirm(`Delete "${board.title}" and all its cards? This can't be undone.`)) {
      this.store.deleteBoard(board.id);
      this.router.navigate(['/']);
    }
  }

  protected addColumn(field: HTMLInputElement): void {
    if (field.value.trim()) {
      this.store.addColumn(this.id(), field.value);
      field.value = '';
    }
  }

  protected renameColumn(columnId: string, title: string): void {
    this.store.renameColumn(this.id(), columnId, title);
  }

  protected removeColumn(columnId: string): void {
    this.store.deleteColumn(this.id(), columnId);
  }

  protected dropColumn(event: CdkDragDrop<Column[]>): void {
    this.store.moveColumn(this.id(), event.previousIndex, event.currentIndex);
  }

  protected dropCard(event: CdkDragDrop<string>): void {
    this.store.moveCard(
      this.id(),
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
  }

  protected addCard(columnId: string, title: string): void {
    this.store.addCard(this.id(), columnId, title);
  }

  protected saveCard(cardId: string, changes: CardChanges): void {
    this.store.updateCard(this.id(), cardId, changes);
  }

  protected deleteCard(cardId: string): void {
    this.store.deleteCard(this.id(), cardId);
  }

  protected isLabelSelected(labelId: string): boolean {
    return this.selectedLabelIds().includes(labelId);
  }

  protected toggleLabel(labelId: string): void {
    this.selectedLabelIds.update((ids) =>
      ids.includes(labelId) ? ids.filter((id) => id !== labelId) : [...ids, labelId],
    );
  }

  protected clearFilters(): void {
    this.query.set('');
    this.selectedLabelIds.set([]);
  }

  /** "/" focuses the search box, like on GitHub. */
  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = target?.closest('input, textarea, select, [contenteditable], dialog');
    if (event.key === '/' && !typing && !this.editingCardId()) {
      event.preventDefault();
      this.search()?.nativeElement.focus();
    }
  }
}
