import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  afterNextRender,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Card, CardChanges, Label } from '../../core/models/board.model';
import { Icon } from '../../shared/ui/icon';
import { notBlank } from '../../shared/validators';

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 1000;

/** Card editor in a native <dialog>: focus trapping, Escape and the backdrop come for free. */
@Component({
  selector: 'app-card-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './card-dialog.html',
  styleUrl: './card-dialog.scss',
})
export class CardDialog implements OnInit {
  readonly card = input.required<Card>();
  readonly labels = input<Label[]>([]);
  readonly columnTitle = input('');

  readonly saved = output<CardChanges>();
  readonly deleted = output();
  readonly closed = output();

  protected readonly titleMax = TITLE_MAX;
  protected readonly descriptionMax = DESCRIPTION_MAX;

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notBlank, Validators.maxLength(TITLE_MAX)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(DESCRIPTION_MAX)],
    }),
    dueDate: new FormControl('', { nonNullable: true }),
    labelIds: new FormControl<string[]>([], { nonNullable: true }),
  });

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
      description: card.description,
      dueDate: card.dueDate ?? '',
      labelIds: [...card.labelIds],
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
    const { title, description, dueDate, labelIds } = this.form.getRawValue();
    this.saved.emit({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      labelIds,
    });
    this.close();
  }

  protected remove(): void {
    if (confirm(`Delete "${this.card().title}"?`)) {
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
