import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { I18n } from '../../core/i18n/i18n.service';
import { LocalDatePipe, TranslatePipe } from '../../core/i18n/pipes';
import { Card, CardChanges, Label } from '../../core/models/board.model';
import { Icon } from '../../shared/ui/icon';
import { notBlank } from '../../shared/validators';

export const TITLE_MAX = 120;
export const TEXT_MAX = 120;
export const NOTES_MAX = 2000;

/** Deal editor in a native <dialog>: focus trapping, Escape and the backdrop come for free. */
@Component({
  selector: 'app-card-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, LocalDatePipe, TranslatePipe],
  templateUrl: './card-dialog.html',
  styleUrl: './card-dialog.scss',
})
export class CardDialog implements OnInit {
  private readonly i18n = inject(I18n);

  readonly card = input.required<Card>();
  readonly labels = input<Label[]>([]);
  readonly columnTitle = input('');
  readonly currency = input('USD');

  readonly saved = output<CardChanges>();
  readonly deleted = output();
  readonly closed = output();

  protected readonly titleMax = TITLE_MAX;
  protected readonly textMax = TEXT_MAX;
  protected readonly notesMax = NOTES_MAX;

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notBlank, Validators.maxLength(TITLE_MAX)],
    }),
    client: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(TEXT_MAX)],
    }),
    contact: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(TEXT_MAX)],
    }),
    value: new FormControl<number | null>(null, {
      validators: [Validators.min(0), Validators.max(100_000_000)],
    }),
    dueDate: new FormControl('', { nonNullable: true }),
    labelIds: new FormControl<string[]>([], { nonNullable: true }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(NOTES_MAX)],
    }),
  });

  /** Newest first, as "Created in …" / "Moved to …" lines. */
  protected readonly history = computed(() =>
    this.card()
      .history.map((event, index) => ({
        at: event.at,
        text: this.i18n.t(index === 0 ? 'dialog.historyCreated' : 'dialog.historyMoved', {
          stage: event.columnTitle,
        }),
      }))
      .reverse(),
  );

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      // jsdom (unit tests) has no showModal, so fall back to the open attribute.
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    });
  }

  ngOnInit(): void {
    const card = this.card();
    this.form.setValue({
      title: card.title,
      client: card.client,
      contact: card.contact,
      value: card.value,
      dueDate: card.dueDate ?? '',
      labelIds: [...card.labelIds],
      description: card.description,
    });
  }

  protected hasLabel(labelId: string): boolean {
    return this.form.controls.labelIds.value.includes(labelId);
  }

  protected toggleLabel(labelId: string): void {
    const control = this.form.controls.labelIds;
    const ids = control.value;
    control.setValue(
      ids.includes(labelId) ? ids.filter((id) => id !== labelId) : [...ids, labelId],
    );
    control.markAsDirty();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, client, contact, value, dueDate, labelIds, description } =
      this.form.getRawValue();
    this.saved.emit({
      title: title.trim(),
      client: client.trim(),
      contact: contact.trim(),
      value: typeof value === 'number' && Number.isFinite(value) ? value : null,
      dueDate: dueDate || null,
      labelIds,
      description: description.trim(),
    });
    this.close();
  }

  protected remove(): void {
    if (confirm(this.i18n.t('dialog.confirmDelete', { name: this.card().title }))) {
      this.deleted.emit();
      this.close();
    }
  }

  protected close(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    } else {
      this.closed.emit();
    }
  }

  /** A click on the dialog element itself (not its content) means a click on the backdrop. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }
}
