import { TOTAL_PAGES } from '../data/workbook';
import { elem } from '../lib/dom';
import {
  loadReviewProgress,
  saveReviewProgress,
  validateReviewImport,
  type AnswerReviewBundle,
  type AnswerReviewEntry,
  type AnswerReviewManifest,
  type ReviewDecision,
  type ReviewProgressState,
} from '../lms/answerReview';
import { currentSession } from '../lms/auth';
import { loadAnswerKey, saveAnswerKey } from '../lms/repository';
import { navigate } from '../router';
import type { AnswerKey } from '../lms/types';
import type { ViewContext } from './context';

interface StudioTarget {
  pageNumber: number;
  targetId: string;
  signature: string;
  inputType: string;
  classification: string;
  sourceEvidence: string;
  automaticCheckingSafe: boolean;
  answers: string[];
  canonicalAnswers: string[];
  context: string;
}

interface StudioPage {
  pageNumber: number;
  title: string;
  targets: StudioTarget[];
}

const DECISION_LABELS: Record<ReviewDecision, string> = {
  unreviewed: 'טרם נסקר',
  'answers-approved': 'תשובות אושרו',
  'open-ended': 'פתוח להערכת מורה',
  'intentionally-ungraded': 'לא מדורג במכוון',
};

function download(fileName: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function validProgress(
  target: StudioTarget,
  progress: ReviewProgressState,
): ReviewProgressState[string] | undefined {
  const record = progress[target.targetId];
  return record?.signature === target.signature ? record : undefined;
}

function decisionFor(
  target: StudioTarget,
  progress: ReviewProgressState,
): ReviewDecision {
  if (target.answers.length > 0) return 'answers-approved';
  return validProgress(target, progress)?.decision || 'unreviewed';
}

function entriesFor(
  pages: readonly StudioPage[],
  progress: ReviewProgressState,
  canonicalOnly = false,
): AnswerReviewEntry[] {
  return pages.flatMap((page) =>
    page.targets.map((target) => {
      const record = validProgress(target, progress);
      const answers = canonicalOnly ? target.canonicalAnswers : target.answers;
      const decision: ReviewDecision =
        answers.length > 0
          ? 'answers-approved'
          : canonicalOnly
            ? 'unreviewed'
            : record?.decision || 'unreviewed';
      return {
        pageNumber: page.pageNumber,
        targetId: target.targetId,
        signature: target.signature,
        decision,
        answers: decision === 'answers-approved' ? answers : [],
        ...(record?.note && !canonicalOnly ? { note: record.note } : {}),
      };
    }),
  );
}

function bundleFor(
  manifest: AnswerReviewManifest,
  entries: AnswerReviewEntry[],
): AnswerReviewBundle {
  return {
    schemaVersion: 2,
    kind: 'coordinate-lms-answer-review',
    manifestGeneratedAt: manifest.generatedAt,
    targetCount: manifest.targetCount,
    exportedAt: new Date().toISOString(),
    entries,
  };
}

export function lmsKeys({ outlet, setTitle }: ViewContext): void {
  setTitle('סטודיו סקירת תשובות');
  const session = currentSession();
  const shell = elem('div', { class: 'container lms-keys' });

  if (!session || session.role !== 'admin') {
    const gate = elem(
      'section',
      { class: 'lms-gate' },
      elem('h1', { text: 'סטודיו סקירת התשובות מיועד למנהל' }),
      elem('p', { text: 'יש להתחבר באמצעות חשבון המנהל.' }),
    );
    const login = elem('button', {
      class: 'btn btn--gold',
      type: 'button',
      text: 'מעבר להתחברות',
    });
    login.addEventListener('click', () => navigate('#/login'));
    gate.append(login);
    shell.append(gate);
    outlet.append(shell);
    return;
  }

  const header = elem('header', { class: 'lms-keys__head' });
  header.append(
    elem(
      'div',
      {},
      elem('h1', { text: 'סטודיו סקירת תשובות' }),
      elem('p', {
        text:
          'כל 1,061 היעדים מגיעים מדוח הכיסוי המופק. אפשר לסנן, לייצא עבודה מלאה, לסקור באצווה ולייבא לתצוגה מקדימה לפני הפעלה.',
      }),
    ),
  );

  const toolbar = elem('div', { class: 'lms-keys__toolbar' });
  const exportTemplate = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'ייצוא תבנית סקירה',
  });
  const exportProgress = elem('button', {
    class: 'btn btn--gold',
    type: 'button',
    text: 'ייצוא מצב הסקירה',
  });
  const importInput = elem('input', {
    type: 'file',
    accept: 'application/json,.json',
    hidden: 'true',
  }) as HTMLInputElement;
  const importButton = elem('button', {
    class: 'btn btn--teacher',
    type: 'button',
    text: 'בדיקת קובץ סקירה',
  });
  const applyImport = elem('button', {
    class: 'btn btn--gold',
    type: 'button',
    text: 'הפעלת הייבוא המאומת',
  }) as HTMLButtonElement;
  applyImport.disabled = true;
  importButton.addEventListener('click', () => importInput.click());
  toolbar.append(
    exportTemplate,
    exportProgress,
    importButton,
    applyImport,
    importInput,
  );
  header.append(toolbar);

  const status = elem('div', {
    class: 'lms-panel__status',
    text: 'טוען את מניפסט הסקירה…',
  });
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const statusFilter = elem('select', {
    'aria-label': 'סינון לפי מצב סקירה',
  }) as HTMLSelectElement;
  for (const [value, text] of [
    ['all', 'כל מצבי הסקירה'],
    ['unreviewed', DECISION_LABELS.unreviewed],
    ['answers-approved', DECISION_LABELS['answers-approved']],
    ['open-ended', DECISION_LABELS['open-ended']],
    ['intentionally-ungraded', DECISION_LABELS['intentionally-ungraded']],
  ]) {
    statusFilter.append(elem('option', { value, text }));
  }
  const classificationFilter = elem('select', {
    'aria-label': 'סינון לפי סיווג',
  }) as HTMLSelectElement;
  classificationFilter.append(
    elem('option', { value: 'all', text: 'כל הסיווגים' }),
  );
  const filters = elem(
    'div',
    { class: 'lms-keys__filters' },
    statusFilter,
    classificationFilter,
  );
  const content = elem('div', { class: 'lms-keys__content' });
  shell.append(header, status, filters, content);
  outlet.append(shell);

  let manifest: AnswerReviewManifest | null = null;
  let pages: StudioPage[] = [];
  let progress = loadReviewProgress();
  let pendingImport: AnswerReviewBundle | null = null;

  function render(): void {
    const allTargets = pages.flatMap((page) => page.targets);
    const reviewedTargets = allTargets.filter(
      (target) => decisionFor(target, progress) !== 'unreviewed',
    ).length;
    const answerTargets = allTargets.filter(
      (target) => target.answers.length > 0,
    ).length;
    status.textContent =
      `נסקרו ${String(reviewedTargets)} מתוך ${String(allTargets.length)} יעדים; ` +
      `${String(answerTargets)} כוללים תשובות פעילות.`;
    status.dataset.kind =
      reviewedTargets === allTargets.length ? 'success' : 'normal';

    const summary = elem('div', { class: 'lms-summary' });
    for (const [value, label] of [
      [TOTAL_PAGES, 'עמודים'],
      [allTargets.length, 'יעדי מענה'],
      [reviewedTargets, 'יעדים שנסקרו'],
      [allTargets.length - reviewedTargets, 'ממתינים לסקירה'],
    ] as const) {
      summary.append(
        elem(
          'div',
          { class: 'lms-summary__card' },
          elem('strong', { text: String(value) }),
          elem('span', { text: label }),
        ),
      );
    }

    const selectedStatus = statusFilter.value;
    const selectedClassification = classificationFilter.value;
    const grid = elem('div', { class: 'lms-keys__grid' });
    for (const page of pages) {
      const visible = page.targets.filter((target) => {
        const decision = decisionFor(target, progress);
        return (
          (selectedStatus === 'all' || selectedStatus === decision) &&
          (selectedClassification === 'all' ||
            selectedClassification === target.classification)
        );
      });
      if (visible.length === 0) continue;
      const reviewed = page.targets.filter(
        (target) => decisionFor(target, progress) !== 'unreviewed',
      ).length;
      const card = elem('section', { class: 'lms-keys__card' });
      const open = elem('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        text: 'פתיחת העמוד',
      });
      open.addEventListener('click', () =>
        navigate('#/workbook/' + String(page.pageNumber)),
      );
      card.append(
        elem('h2', {
          text: `עמוד ${String(page.pageNumber)} — ${page.title}`,
        }),
        elem('p', {
          text: `${String(reviewed)} מתוך ${String(page.targets.length)} יעדים נסקרו`,
        }),
        open,
      );
      const details = elem('details');
      details.open = selectedStatus !== 'all' || selectedClassification !== 'all';
      details.append(
        elem('summary', {
          text: `הצגת ${String(visible.length)} יעדים מסוננים`,
        }),
      );
      const list = elem('ol');
      for (const target of visible) {
        const decision = decisionFor(target, progress);
        list.append(
          elem(
            'li',
            {},
            elem('code', { text: target.targetId }),
            elem('span', {
              text: ` [${target.inputType}] ${target.context || 'ללא הקשר טקסטואלי'}`,
            }),
            elem('small', {
              text: `סיווג: ${target.classification}; מקור: ${target.sourceEvidence}`,
            }),
            elem('strong', {
              text:
                ` ${DECISION_LABELS[decision]}` +
                (target.answers.length > 0
                  ? ` — ${target.answers.join(' / ')}`
                  : ''),
            }),
          ),
        );
      }
      details.append(list);
      card.append(details);
      grid.append(card);
    }
    content.replaceChildren(summary, grid);
  }

  statusFilter.addEventListener('change', render);
  classificationFilter.addEventListener('change', render);

  void (async () => {
    try {
      const response = await fetch('./answer-review-manifest.json', {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('מניפסט סקירת התשובות לא נמצא.');
      manifest = (await response.json()) as AnswerReviewManifest;
      if (
        manifest.schemaVersion !== 2 ||
        manifest.pageCount !== TOTAL_PAGES ||
        manifest.pages.length !== TOTAL_PAGES
      ) {
        throw new Error(`מניפסט סקירת התשובות אינו תואם ל־${TOTAL_PAGES} העמודים.`);
      }
      const classifications = new Set<string>();
      const collected: StudioPage[] = [];
      for (const page of manifest.pages) {
        const key = await loadAnswerKey(page.pageNumber);
        collected.push({
          pageNumber: page.pageNumber,
          title: page.title,
          targets: page.targets.map((target) => {
            classifications.add(target.classification);
            return {
              ...target,
              canonicalAnswers: target.answers,
              answers: key[target.targetId] || target.answers,
            };
          }),
        });
      }
      pages = collected;
      for (const classification of [...classifications].sort()) {
        classificationFilter.append(
          elem('option', { value: classification, text: classification }),
        );
      }
      render();
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : 'טעינת הסטודיו נכשלה.';
      status.dataset.kind = 'error';
    }
  })();

  exportTemplate.addEventListener('click', () => {
    if (!manifest) return;
    download(
      'coordinate-lms-answer-review-template.json',
      bundleFor(manifest, entriesFor(pages, progress, true)),
    );
  });

  exportProgress.addEventListener('click', () => {
    if (!manifest) return;
    download(
      'coordinate-lms-answer-review-progress.json',
      bundleFor(manifest, entriesFor(pages, progress)),
    );
  });

  importInput.addEventListener('change', () => {
    const file = importInput.files?.[0];
    if (!file || !manifest) return;
    pendingImport = null;
    applyImport.disabled = true;
    void file
      .text()
      .then((text) => JSON.parse(text) as unknown)
      .then((data) => {
        const result = validateReviewImport(data, manifest!);
        const activeTargets = new Map(
          pages
            .flatMap((page) => page.targets)
            .map((target) => [target.targetId, target]),
        );
        const unsafeRemoval = result.bundle?.entries.find(
          (entry) =>
            (activeTargets.get(entry.targetId)?.answers.length || 0) > 0 &&
            entry.decision !== 'answers-approved',
        );
        if (!result.valid || !result.bundle || unsafeRemoval) {
          const errors = [...result.errors];
          if (unsafeRemoval) {
            errors.push(
              `אי אפשר להסיר מפתח פעיל מן היעד ${unsafeRemoval.targetId} דרך ייבוא.`,
            );
          }
          throw new Error(errors.slice(0, 8).join(' '));
        }
        pendingImport = result.bundle;
        applyImport.disabled = false;
        const approved = result.bundle.entries.filter(
          (entry) => entry.decision === 'answers-approved',
        ).length;
        status.textContent =
          `הקובץ אומת במלואו: ${String(result.bundle.entries.length)} יעדים, ` +
          `${String(approved)} עם תשובות. טרם בוצעה שמירה; לחצו על הפעלת הייבוא.`;
        status.dataset.kind = 'success';
      })
      .catch((error: unknown) => {
        status.textContent =
          error instanceof Error ? error.message : 'בדיקת הקובץ נכשלה.';
        status.dataset.kind = 'error';
      })
      .finally(() => {
        importInput.value = '';
      });
  });

  applyImport.addEventListener('click', () => {
    if (!pendingImport) return;
    applyImport.disabled = true;
    const bundle = pendingImport;
    void (async () => {
      let savedPages = 0;
      const byPage = new Map<number, AnswerReviewEntry[]>();
      const currentTargets = new Map(
        pages
          .flatMap((page) => page.targets)
          .map((target) => [target.targetId, target]),
      );
      for (const entry of bundle.entries) {
        if (entry.decision !== 'answers-approved') continue;
        const current = currentTargets.get(entry.targetId)?.answers || [];
        if (
          current.length === entry.answers.length &&
          current.every((answer, index) => answer === entry.answers[index])
        ) {
          continue;
        }
        const list = byPage.get(entry.pageNumber) || [];
        list.push(entry);
        byPage.set(entry.pageNumber, list);
      }
      for (const [pageNumber, entries] of byPage) {
        const key: AnswerKey = await loadAnswerKey(pageNumber);
        let changed = false;
        for (const entry of entries) {
          if (entry.answers.length === 0) continue;
          key[entry.targetId] = entry.answers;
          changed = true;
        }
        if (changed) {
          await saveAnswerKey(pageNumber, key);
          savedPages += 1;
        }
      }
      progress = saveReviewProgress(bundle.entries);
      for (const page of pages) {
        for (const target of page.targets) {
          const entry = bundle.entries.find(
            (candidate) => candidate.targetId === target.targetId,
          );
          if (entry?.decision === 'answers-approved') {
            target.answers = entry.answers;
          }
        }
      }
      pendingImport = null;
      render();
      status.textContent =
        `הייבוא המאומת הופעל. מצב הסקירה נשמר ועודכנו מפתחות ב־${String(savedPages)} עמודים.`;
      status.dataset.kind = 'success';
    })().catch((error: unknown) => {
      applyImport.disabled = false;
      status.textContent =
        error instanceof Error ? error.message : 'הפעלת הייבוא נכשלה.';
      status.dataset.kind = 'error';
    });
  });
}
