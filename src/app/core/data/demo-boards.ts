import { Lang } from '../i18n/lang';
import { Board, StageEvent } from '../models/board.model';
import { createId } from '../utils/id';
import { createDefaultColumns, createLabels } from './board-factory';

export const DEMO_BOARD_ID = 'demo';

interface DemoDeal {
  /** Index in the default stages: 0 leads … 4 paid, 5 lost. */
  stage: number;
  title: [en: string, uk: string];
  client: string;
  value: number;
  /** Indexes in the default labels: 0 website, 1 design, 2 mobile, 3 support, 4 urgent. */
  labels: number[];
  daysInStage: number;
  dueInDays?: number;
  contact?: string;
  notes?: [en: string, uk: string];
}

const DEALS: DemoDeal[] = [
  {
    stage: 0,
    title: ['Landing page for a coffee shop', 'Лендинг для кав’ярні'],
    client: 'Brew & Co',
    value: 900,
    labels: [0],
    daysInStage: 2,
    contact: 'hello@brewco.example',
    notes: [
      'Wants an online menu and a booking form. Call back on Friday.',
      'Хочуть онлайн-меню й форму бронювання. Передзвонити в п’ятницю.',
    ],
  },
  {
    stage: 0,
    title: ['Online store redesign', 'Редизайн інтернет-магазину'],
    client: 'Kvitka Flowers',
    value: 2400,
    labels: [1, 0],
    daysInStage: 10,
    contact: '@kvitka_shop',
  },
  {
    stage: 1,
    title: ['Booking app MVP', 'MVP застосунку для бронювань'],
    client: 'FitSpace',
    value: 4800,
    labels: [2],
    daysInStage: 4,
    dueInDays: 3,
    contact: 'anna@fitspace.example',
    notes: [
      'Proposal: 6 weeks, 3 milestones. Follow up if no answer by the due date.',
      'Пропозиція: 6 тижнів, 3 етапи. Нагадати, якщо не відповідять до терміну.',
    ],
  },
  {
    stage: 1,
    title: ['SEO audit', 'SEO-аудит'],
    client: 'Lviv Tours',
    value: 500,
    labels: [0],
    daysInStage: 12,
  },
  {
    stage: 2,
    title: ['Corporate website', 'Корпоративний сайт'],
    client: 'Nova Logistics',
    value: 3200,
    labels: [0],
    daysInStage: 15,
    dueInDays: 1,
  },
  {
    stage: 2,
    title: ['Logo and brand book', 'Логотип і брендбук'],
    client: 'Smak Bakery',
    value: 1200,
    labels: [1, 4],
    daysInStage: 9,
    dueInDays: -2,
  },
  {
    stage: 3,
    title: ['Monthly app support', 'Щомісячна підтримка застосунку'],
    client: 'FitSpace',
    value: 600,
    labels: [3, 2],
    daysInStage: 3,
    dueInDays: 5,
  },
  {
    stage: 4,
    title: ['Online store', 'Інтернет-магазин'],
    client: 'Kvitka Flowers',
    value: 2800,
    labels: [0],
    daysInStage: 8,
  },
  {
    stage: 4,
    title: ['Landing page', 'Лендинг'],
    client: 'Lviv Tours',
    value: 700,
    labels: [0],
    daysInStage: 38,
  },
  {
    stage: 4,
    title: ['Dashboard UI', 'UI для дашборду'],
    client: 'Nova Logistics',
    value: 1900,
    labels: [1],
    daysInStage: 66,
  },
  {
    stage: 4,
    title: ['Monthly app support', 'Щомісячна підтримка застосунку'],
    client: 'FitSpace',
    value: 600,
    labels: [3],
    daysInStage: 95,
  },
  {
    stage: 4,
    title: ['Portfolio website', 'Сайт-портфоліо'],
    client: 'Olena Koval',
    value: 650,
    labels: [0, 1],
    daysInStage: 125,
  },
  {
    stage: 4,
    title: ['Email templates', 'Шаблони листів'],
    client: 'Brew & Co',
    value: 400,
    labels: [1],
    daysInStage: 150,
  },
  {
    stage: 5,
    title: ['Crypto exchange UI', 'UI для криптобіржі'],
    client: 'CoinNest',
    value: 5000,
    labels: [1],
    daysInStage: 30,
    notes: ['They chose a cheaper agency.', 'Обрали дешевшу агенцію.'],
  },
];

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/** yyyy-mm-dd for today shifted by `offsetDays`, so demo deadlines always look current. */
function dayFromToday(offsetDays: number): string {
  const date = daysAgo(-offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** A realistic freelance pipeline with dates relative to today. */
export function createDemoBoard(lang: Lang): Board {
  const columns = createDefaultColumns(lang);
  const labels = createLabels(lang);
  const text = lang === 'en' ? 0 : 1;

  for (const deal of DEALS) {
    const column = columns[deal.stage];
    const enteredAt = daysAgo(deal.daysInStage).toISOString();
    const createdAt =
      deal.stage === 0 ? enteredAt : daysAgo(deal.daysInStage + 10 + deal.stage).toISOString();
    const history: StageEvent[] = [
      { columnId: columns[0].id, columnTitle: columns[0].title, at: createdAt },
    ];
    if (deal.stage !== 0) {
      history.push({ columnId: column.id, columnTitle: column.title, at: enteredAt });
    }

    column.cards.push({
      id: createId(),
      title: deal.title[text],
      client: deal.client,
      contact: deal.contact ?? '',
      value: deal.value,
      description: deal.notes?.[text] ?? '',
      labelIds: deal.labels.map((index) => labels[index].id),
      dueDate: deal.dueInDays === undefined ? null : dayFromToday(deal.dueInDays),
      createdAt,
      stageEnteredAt: enteredAt,
      history,
    });
  }

  return {
    id: DEMO_BOARD_ID,
    title: lang === 'en' ? 'Freelance 2026' : 'Фриланс 2026',
    currency: 'USD',
    columns,
    labels,
    createdAt: daysAgo(160).toISOString(),
  };
}
