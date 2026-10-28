import { Lang } from '../i18n/lang';
import { Board, Card, Column, Currency, Label, StageKind } from '../models/board.model';
import { createId } from '../utils/id';

const STAGES: Record<Lang, [string, StageKind][]> = {
  en: [
    ['Leads', 'open'],
    ['Proposal sent', 'open'],
    ['In progress', 'open'],
    ['Invoiced', 'open'],
    ['Paid', 'won'],
    ['Lost', 'lost'],
  ],
  uk: [
    ['Ліди', 'open'],
    ['Пропозиція', 'open'],
    ['У роботі', 'open'],
    ['Рахунок виставлено', 'open'],
    ['Оплачено', 'won'],
    ['Програно', 'lost'],
  ],
};

const LABELS: Record<Lang, [string, Label['color']][]> = {
  en: [
    ['Website', 'blue'],
    ['Design', 'violet'],
    ['Mobile', 'green'],
    ['Support', 'gray'],
    ['Urgent', 'red'],
  ],
  uk: [
    ['Сайт', 'blue'],
    ['Дизайн', 'violet'],
    ['Мобільний', 'green'],
    ['Підтримка', 'gray'],
    ['Терміново', 'red'],
  ],
};

const DEFAULT_CURRENCY: Record<Lang, Currency> = { en: 'USD', uk: 'UAH' };

export function createLabels(lang: Lang): Label[] {
  return LABELS[lang].map(([name, color]) => ({ id: createId(), name, color }));
}

export function createColumn(title: string, kind: StageKind = 'open', cards: Card[] = []): Column {
  return { id: createId(), title, kind, cards };
}

export function createDefaultColumns(lang: Lang): Column[] {
  return STAGES[lang].map(([title, kind]) => createColumn(title, kind));
}

export function createCard(
  title: string,
  column: Pick<Column, 'id' | 'title'>,
  extra: Partial<Omit<Card, 'id' | 'title'>> = {},
): Card {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title,
    client: '',
    contact: '',
    value: null,
    description: '',
    labelIds: [],
    dueDate: null,
    createdAt: now,
    stageEnteredAt: now,
    history: [{ columnId: column.id, columnTitle: column.title, at: now }],
    ...extra,
  };
}

export function createBoard(title: string, lang: Lang, currency = DEFAULT_CURRENCY[lang]): Board {
  return {
    id: createId(),
    title,
    currency,
    columns: createDefaultColumns(lang),
    labels: createLabels(lang),
    createdAt: new Date().toISOString(),
  };
}
