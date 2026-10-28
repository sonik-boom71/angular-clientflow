import { Lang } from '../i18n/lang';
import { Board, StageEvent } from '../models/board.model';
import { createId } from '../utils/id';
import { createDefaultColumns, createLabels } from './board-factory';

export const DEMO_BOARD_ID = 'demo';

// Positions of the default stages and labels created by board-factory.
const STAGE = { leads: 0, proposal: 1, progress: 2, invoiced: 3, paid: 4, lost: 5 } as const;
const LABEL = { website: 0, design: 1, mobile: 2, support: 3, urgent: 4 } as const;

interface DemoDeal {
  stage: number;
  title: [en: string, uk: string];
  client: string;
  value: number;
  labels: number[];
  daysInStage: number;
  dueInDays?: number;
  contact?: string;
  notes?: [en: string, uk: string];
}

const DEALS: DemoDeal[] = [
  {
    stage: STAGE.leads,
    title: ['Landing page for a coffee shop', 'Лендинг для кав’ярні'],
    client: 'Brew & Co',
    value: 900,
    labels: [LABEL.website],
    daysInStage: 2,
    contact: 'hello@brewco.example',
    notes: [
      'Wants an online menu and a booking form. Call back on Friday.',
      'Хочуть онлайн-меню й форму бронювання. Передзвонити в п’ятницю.',
    ],
  },
  {
    stage: STAGE.leads,
    title: ['Online store redesign', 'Редизайн інтернет-магазину'],
    client: 'Kvitka Flowers',
    value: 2400,
    labels: [LABEL.design, LABEL.website],
    daysInStage: 10,
    contact: '@kvitka_shop',
  },
  {
    stage: STAGE.proposal,
    title: ['Booking app MVP', 'MVP застосунку для бронювань'],
    client: 'FitSpace',
    value: 4800,
    labels: [LABEL.mobile],
    daysInStage: 4,
    dueInDays: 3,
    contact: 'anna@fitspace.example',
    notes: [
      'Proposal: 6 weeks, 3 milestones. Follow up if no answer by the due date.',
      'Пропозиція: 6 тижнів, 3 етапи. Нагадати, якщо не відповідять до терміну.',
    ],
  },
  {
    stage: STAGE.proposal,
    title: ['SEO audit', 'SEO-аудит'],
    client: 'Lviv Tours',
    value: 500,
    labels: [LABEL.website],
    daysInStage: 12,
  },
  {
    stage: STAGE.progress,
    title: ['Corporate website', 'Корпоративний сайт'],
    client: 'Nova Logistics',
    value: 3200,
    labels: [LABEL.website],
    daysInStage: 15,
    dueInDays: 1,
  },
  {
    stage: STAGE.progress,
    title: ['Logo and brand book', 'Логотип і брендбук'],
    client: 'Smak Bakery',
    value: 1200,
    labels: [LABEL.design, LABEL.urgent],
    daysInStage: 9,
    dueInDays: -2,
  },
  {
    stage: STAGE.invoiced,
    title: ['Monthly app support', 'Щомісячна підтримка застосунку'],
    client: 'FitSpace',
    value: 600,
    labels: [LABEL.support, LABEL.mobile],
    daysInStage: 3,
    dueInDays: 5,
  },
  {
    stage: STAGE.paid,
    title: ['Online store', 'Інтернет-магазин'],
    client: 'Kvitka Flowers',
    value: 2800,
    labels: [LABEL.website],
    daysInStage: 8,
  },
  {
    stage: STAGE.paid,
    title: ['Landing page', 'Лендинг'],
    client: 'Lviv Tours',
    value: 700,
    labels: [LABEL.website],
    daysInStage: 38,
  },
  {
    stage: STAGE.paid,
    title: ['Dashboard UI', 'UI для дашборду'],
    client: 'Nova Logistics',
    value: 1900,
    labels: [LABEL.design],
    daysInStage: 66,
  },
  {
    stage: STAGE.paid,
    title: ['Monthly app support', 'Щомісячна підтримка застосунку'],
    client: 'FitSpace',
    value: 600,
    labels: [LABEL.support],
    daysInStage: 95,
  },
  {
    stage: STAGE.paid,
    title: ['Portfolio website', 'Сайт-портфоліо'],
    client: 'Olena Koval',
    value: 650,
    labels: [LABEL.website, LABEL.design],
    daysInStage: 125,
  },
  {
    stage: STAGE.paid,
    title: ['Email templates', 'Шаблони листів'],
    client: 'Brew & Co',
    value: 400,
    labels: [LABEL.design],
    daysInStage: 150,
  },
  {
    stage: STAGE.lost,
    title: ['Crypto exchange UI', 'UI для криптобіржі'],
    client: 'CoinNest',
    value: 5000,
    labels: [LABEL.design],
    daysInStage: 30,
    notes: ['They chose a cheaper agency.', 'Обрали дешевшу агенцію.'],
  },
];

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function dayFromToday(offsetDays: number): string {
  const date = daysAgo(-offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function createDemoBoard(lang: Lang): Board {
  const columns = createDefaultColumns(lang);
  const labels = createLabels(lang);
  const leads = columns[STAGE.leads];
  const textIndex = lang === 'en' ? 0 : 1;

  for (const deal of DEALS) {
    const column = columns[deal.stage];
    const enteredAt = daysAgo(deal.daysInStage).toISOString();
    const createdAt = column === leads ? enteredAt : daysAgo(deal.daysInStage + 14).toISOString();
    const history: StageEvent[] = [{ columnId: leads.id, columnTitle: leads.title, at: createdAt }];
    if (column !== leads) {
      history.push({ columnId: column.id, columnTitle: column.title, at: enteredAt });
    }

    column.cards.push({
      id: createId(),
      title: deal.title[textIndex],
      client: deal.client,
      contact: deal.contact ?? '',
      value: deal.value,
      description: deal.notes?.[textIndex] ?? '',
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
