import { AbstractControl, ValidationErrors } from '@angular/forms';

export function notBlank(control: AbstractControl<string | null>): ValidationErrors | null {
  return control.value?.trim() ? null : { blank: true };
}
