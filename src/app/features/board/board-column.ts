import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { I18n } from '../../core/i18n/i18n.service';
import { MoneyPipe, TranslatePipe } from '../../core/i18n/pipes';
import { TranslationKey } from '../../core/i18n/translations';
import { Column, Label, STAGE_KINDS, StageKind } from '../../core/models/board.model';
import { CardFilter, EMPTY_FILTER, matchesFilter } from '../../core/utils/card-filter';
import { Icon, IconName } from '../../shared/ui/icon';
import { InlineEdit } from '../../shared/ui/inline-edit';
import { CardItem } from './card-item';

export const columnListId = (columnId: string) => `column-${columnId}`;

const KIND_LABELS: Record<StageKind, TranslationKey> = {
  open: 'stage.kind.open',
  won: 'stage.kind.won',
  lost: 'stage.kind.lost',
};

const KIND_ICONS: Record<StageKind, IconName> = {
  open: 'circle',
  won: 'circle-check',
  lost: 'circle-x',
};

/** One pipeline stage. Purely presentational: every change goes up as an output. */
@Component({
  selector: 'app-board-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CardItem,
    Icon,
    InlineEdit,
    MoneyPipe,
    TranslatePipe,
  ],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss',
  host: {
    '[class.kind-won]': 'column().kind === "won"',
    '[class.kind-lost]': 'column().kind === "lost"',
  },
})
export class BoardColumn {
  private readonly i18n = inject(I18n);

  readonly column = input.required<Column>();
  readonly labels = input<Label[]>([]);
  readonly currency = input('USD');
  readonly filter = input<CardFilter>(EMPTY_FILTER);
  readonly filtering = input(false);
  readonly connectedTo = input<string[]>([]);
  readonly dragStartDelay = input<{ touch: number; mouse: number }>({ touch: 0, mouse: 0 });

  readonly cardDropped = output<CdkDragDrop<string>>();
  readonly cardOpened = output<string>();
  readonly cardAdded = output<string>();
  readonly renamed = output<string>();
  readonly kindChanged = output<StageKind>();
  readonly removed = output();

  protected readonly listId = computed(() => columnListId(this.column().id));
  protected readonly visibleCards = computed(() =>
    this.column().cards.filter((card) => matchesFilter(card, this.filter())),
  );
  protected readonly total = computed(() =>
    this.visibleCards().reduce((sum, card) => sum + (card.value ?? 0), 0),
  );
  protected readonly kindIcon = computed(() => KIND_ICONS[this.column().kind]);
  protected readonly kindTitle = computed(() =>
    this.i18n.t('stage.kindButton', { kind: this.i18n.t(KIND_LABELS[this.column().kind]) }),
  );

  protected cycleKind(): void {
    const kinds = STAGE_KINDS;
    const next = kinds[(kinds.indexOf(this.column().kind) + 1) % kinds.length];
    this.kindChanged.emit(next);
  }

  protected addCard(field: HTMLInputElement): void {
    const title = field.value.trim();
    if (title) {
      this.cardAdded.emit(title);
      field.value = '';
    }
  }

  protected remove(): void {
    const column = this.column();
    if (
      column.cards.length === 0 ||
      confirm(this.i18n.t('stage.confirmDelete', { name: column.title }))
    ) {
      this.removed.emit();
    }
  }
}
