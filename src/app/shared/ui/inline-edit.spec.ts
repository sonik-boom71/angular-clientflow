import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineEdit } from './inline-edit';

describe('InlineEdit', () => {
  let fixture: ComponentFixture<InlineEdit>;
  let element: HTMLElement;
  let saved: string[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(InlineEdit);
    fixture.componentRef.setInput('value', 'To do');
    saved = [];
    fixture.componentInstance.saved.subscribe((value) => saved.push(value));
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  async function startEditing(): Promise<HTMLInputElement> {
    element.querySelector('button')!.click();
    await fixture.whenStable();
    return element.querySelector('input')!;
  }

  function press(field: HTMLInputElement, key: string): void {
    field.dispatchEvent(new KeyboardEvent('keydown', { key }));
  }

  it('turns into a field on click and saves on Enter', async () => {
    const field = await startEditing();
    field.value = '  Backlog ';
    press(field, 'Enter');
    await fixture.whenStable();

    expect(saved).toEqual(['Backlog']);
    expect(element.querySelector('input')).toBeNull();
  });

  it('discards the change on Escape', async () => {
    const field = await startEditing();
    field.value = 'Something else';
    press(field, 'Escape');
    await fixture.whenStable();

    expect(saved).toEqual([]);
    expect(element.textContent).toContain('To do');
  });

  it('does not emit when the text is blank or unchanged', async () => {
    let field = await startEditing();
    field.value = '   ';
    press(field, 'Enter');
    await fixture.whenStable();

    field = await startEditing();
    press(field, 'Enter');
    await fixture.whenStable();

    expect(saved).toEqual([]);
  });
});
