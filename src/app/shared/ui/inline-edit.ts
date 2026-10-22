import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

/** Text that turns into an input on click. Enter or blur saves, Escape cancels. */
@Component({
  selector: 'app-inline-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './inline-edit.scss',
  template: `
    @if (editing()) {
      <input
        #field
        class="inline-edit__input"
        [value]="value()"
        [attr.aria-label]="label()"
        [attr.maxlength]="maxLength()"
        (keydown.enter)="commit(field.value)"
        (keydown.escape)="cancel()"
        (blur)="commit(field.value)"
      />
    } @else {
      <button type="button" class="inline-edit__text" [title]="label()" (click)="start()">
        {{ value() }}
      </button>
    }
  `,
})
export class InlineEdit {
  readonly value = input.required<string>();
  readonly label = input('Name');
  readonly maxLength = input(80);
  readonly saved = output<string>();

  protected readonly editing = signal(false);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  constructor() {
    effect(() => {
      const element = this.field()?.nativeElement;
      element?.focus();
      element?.select();
    });
  }

  protected start(): void {
    this.editing.set(true);
  }

  protected commit(text: string): void {
    if (!this.editing()) {
      return;
    }
    this.editing.set(false);
    const next = text.trim();
    if (next && next !== this.value()) {
      this.saved.emit(next);
    }
  }

  protected cancel(): void {
    this.editing.set(false);
  }
}
