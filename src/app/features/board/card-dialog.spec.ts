import { ComponentFixture, TestBed } from '@angular/core/testing';

import { testBoard, testCard } from '../../../testing/memory-storage';
import { CardChanges } from '../../core/models/board.model';
import { CardDialog } from './card-dialog';

describe('CardDialog', () => {
  let fixture: ComponentFixture<CardDialog>;
  let element: HTMLElement;
  let saved: CardChanges[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(CardDialog);
    fixture.componentRef.setInput(
      'card',
      testCard('1', { title: 'Write docs', description: 'README', labelIds: ['l1'] }),
    );
    fixture.componentRef.setInput('labels', testBoard().labels);
    saved = [];
    fixture.componentInstance.saved.subscribe((changes) => saved.push(changes));
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  const input = (selector: string) => element.querySelector<HTMLInputElement>(selector)!;

  function type(selector: string, value: string): void {
    const field = input(selector);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('blur'));
  }

  async function submit(): Promise<void> {
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  it('fills the form from the card', () => {
    expect(input('#card-title').value).toBe('Write docs');
    expect(element.querySelector('textarea')!.value).toBe('README');
    const checkboxes = element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    expect([...checkboxes].map((box) => box.checked)).toEqual([true, false]);
  });

  it('blocks saving a blank title and explains why', async () => {
    type('#card-title', '   ');
    await submit();

    expect(saved).toEqual([]);
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Enter a title.');
  });

  it('emits trimmed changes on save', async () => {
    type('#card-title', '  Write the README  ');
    type('#card-due', '2026-11-05');
    element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1].click();
    await submit();

    expect(saved).toEqual([
      {
        title: 'Write the README',
        description: 'README',
        dueDate: '2026-11-05',
        labelIds: ['l1', 'l2'],
      },
    ]);
  });

  it('saves an empty date as no deadline', async () => {
    type('#card-due', '');
    await submit();
    expect(saved[0].dueDate).toBeNull();
  });
});
