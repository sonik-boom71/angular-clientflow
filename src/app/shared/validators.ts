import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Fails for strings that are empty or only whitespace. */
export function notBlank(control: AbstractControl<string | null>): ValidationErrors | null {
  return control.value?.trim() ? null : { blank: true };
}
