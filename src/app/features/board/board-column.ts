import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Column, Label } from '../../core/models/board.model';
import { CardFilter, EMPTY_FILTER, matchesFilter } from '../../core/utils/card-filter';
import { Icon } from '../../shared/ui/icon';
import { InlineEdit } from '../../shared/ui/inline-edit';
import { CardItem } from './card-item';

export const columnListId = (columnId: string) => `column-${columnId}`;

/** One board column. Purely presentational: every change goes up as an output. */
@Component({
  selector: 'app-board-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropList, CdkDrag, CdkDragHandle, CardItem, Icon, InlineEdit],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss',
})
export class BoardColumn {
  readonly column = input.required<Column>();
  readonly labels = input<Label[]>([]);
  readonly filter = input<CardFilter>(EMPTY_FILTER);
  readonly filtering = input(false);
  readonly connectedTo = input<string[]>([]);

  readonly cardDropped = output<CdkDragDrop<string>>();
  readonly cardOpened = output<string>();
  readonly cardAdded = output<string>();
  readonly renamed = output<string>();
  readonly removed = output();

  protected readonly listId = computed(() => columnListId(this.column().id));
  protected readonly visibleCards = computed(() =>
    this.column().cards.filter((card) => matchesFilter(card, this.filter())),
  );

  protected addCard(field: HTMLInputElement): void {
    const title = field.value.trim();
    if (title) {
      this.cardAdded.emit(title);
      field.value = '';
    }
  }

  protected remove(): void {
    const count = this.column().cards.length;
    const message = `Delete the "${this.column().title}" column and its ${count} cards?`;
    if (count === 0 || confirm(message)) {
      this.removed.emit();
    }
  }
}
