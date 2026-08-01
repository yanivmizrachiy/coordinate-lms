const VIEWBOX_WIDTH = 560;
const VIEWBOX_HEIGHT = 380;
const LEFT = 56;
const RIGHT = 104;
const TOP = 70;
const BOTTOM = 82;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  kind: string;
}

function parseArray(raw: string | undefined): (number | string)[] | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value)
      ? (value as (number | string)[])
      : null;
  } catch {
    return null;
  }
}

function numberSetting(
  raw: string | undefined,
  fallback: number,
): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function percent(value: number, whole: number): string {
  return String((value / whole) * 100) + '%';
}

function answerSpan(box: Box): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'blank lms-grid-answer';
  span.dir = 'ltr';
  span.dataset.gridAnswer = box.kind;
  span.setAttribute('aria-label', box.label);
  span.style.left = percent(box.x, VIEWBOX_WIDTH);
  span.style.top = percent(box.y, VIEWBOX_HEIGHT);
  span.style.width = percent(box.width, VIEWBOX_WIDTH);
  span.style.height = percent(box.height, VIEWBOX_HEIGHT);
  return span;
}

function boxesForGrid(grid: HTMLElement): Box[] {
  const xmax = numberSetting(grid.dataset['xmax'], 8);
  const ymax = numberSetting(grid.dataset['ymax'], 6);
  const xlabels = parseArray(grid.dataset['xlabels']);
  const ylabels = parseArray(grid.dataset['ylabels']);
  const axisNamesHidden = grid.dataset['axisnames'] === 'false';
  const originName = grid.dataset['originname'] === 'true';

  const sx = (VIEWBOX_WIDTH - LEFT - RIGHT) / xmax;
  const sy = (VIEWBOX_HEIGHT - TOP - BOTTOM) / ymax;
  const x = (value: number): number => LEFT + value * sx;
  const y = (value: number): number =>
    VIEWBOX_HEIGHT - BOTTOM - value * sy;

  const boxes: Box[] = [];

  if (xlabels) {
    for (let value = 1; value <= xmax; value += 1) {
      if (xlabels[value] !== '') continue;

      boxes.push({
        x: x(value) - 14,
        y: y(0) + 8,
        width: 28,
        height: 22,
        label: 'השלמת המספר החסר על ציר x',
        kind: 'x-tick',
      });
    }
  }

  if (ylabels) {
    for (let value = 1; value <= ymax; value += 1) {
      if (ylabels[value] !== '') continue;

      boxes.push({
        x: x(0) - 42,
        y: y(value) - 11,
        width: 28,
        height: 22,
        label: 'השלמת המספר החסר על ציר y',
        kind: 'y-tick',
      });
    }
  }

  if (axisNamesHidden) {
    boxes.push(
      {
        x: x(xmax) + 36,
        y: y(0) - 11,
        width: 52,
        height: 22,
        label: 'שם הציר האופקי',
        kind: 'axis-x',
      },
      {
        x: x(0) - 28,
        y: y(ymax) - 48,
        width: 56,
        height: 22,
        label: 'שם הציר האנכי',
        kind: 'axis-y',
      },
    );

    if (originName) {
      boxes.push(
        {
          x: x(0) - 54,
          y: y(0) + 6,
          width: 52,
          height: 22,
          label: 'המילה הראשונה בשם ראשית הצירים',
          kind: 'origin-first',
        },
        {
          x: x(0) - 54,
          y: y(0) + 32,
          width: 52,
          height: 22,
          label: 'המילה השנייה בשם ראשית הצירים',
          kind: 'origin-second',
        },
      );
    } else {
      boxes.push({
        x: x(0) - 40,
        y: y(0) + 6,
        width: 26,
        height: 22,
        label: 'שם נקודת הראשית',
        kind: 'origin',
      });
    }
  }

  return boxes;
}

/**
 * Adds editable HTML spans exactly over the empty SVG answer rectangles.
 * The original rectangles remain untouched, so A4 printing stays identical.
 */
export function hydrateGridAnswerInputs(root: ParentNode): void {
  for (const grid of root.querySelectorAll<HTMLElement>('.coordinate-grid')) {
    if (grid.dataset['lmsGridInputs'] === 'ready') continue;

    grid.dataset['lmsGridInputs'] = 'ready';

    for (const box of boxesForGrid(grid)) {
      grid.append(answerSpan(box));
    }
  }
}
