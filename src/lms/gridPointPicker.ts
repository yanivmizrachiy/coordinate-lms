const NS = 'http://www.w3.org/2000/svg';
const W = 560;
const H = 380;
const L = 56;
const R = 104;
const T = 70;
const B = 82;

interface PickerTask {
  targets: [HTMLElement, HTMLElement];
  label: string;
  marker: SVGGElement;
  observer: MutationObserver;
  focusHandlers: Array<{ target: HTMLElement; handler: EventListener }>;
}

interface GridRef {
  grid: HTMLElement;
  svg: SVGSVGElement;
}

interface GridBinding extends GridRef {
  tasks: PickerTask[];
  clickHandler: EventListener;
  originalAria: string | null;
}

function numberSetting(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizedText(node: Element | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function pointLabel(context: string): string {
  const match = context.match(/נקודה\s+([A-Z])/i);
  return match?.[1]?.toUpperCase() || '•';
}

function numericText(target: HTMLElement): number | null {
  const raw = (target.textContent || '').trim().replace(',', '.');
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function coordinateToViewBox(
  grid: HTMLElement,
  x: number,
  y: number,
): { x: number; y: number } {
  const xmax = numberSetting(grid.dataset['xmax'], 8);
  const ymax = numberSetting(grid.dataset['ymax'], 6);
  const sx = (W - L - R) / xmax;
  const sy = (H - T - B) / ymax;
  return { x: L + x * sx, y: H - B - y * sy };
}

function eventToCoordinate(
  event: MouseEvent,
  grid: HTMLElement,
  svg: SVGSVGElement,
): { x: number; y: number } | null {
  const rect = svg.getBoundingClientRect();
  if (!(rect.width > 0) || !(rect.height > 0)) return null;

  const viewX = ((event.clientX - rect.left) / rect.width) * W;
  const viewY = ((event.clientY - rect.top) / rect.height) * H;
  const xmax = numberSetting(grid.dataset['xmax'], 8);
  const ymax = numberSetting(grid.dataset['ymax'], 6);
  const sx = (W - L - R) / xmax;
  const sy = (H - T - B) / ymax;
  const rawX = (viewX - L) / sx;
  const rawY = (H - B - viewY) / sy;
  const x = Math.round(rawX);
  const y = Math.round(rawY);

  if (x < 0 || x > xmax || y < 0 || y > ymax) return null;
  // Touch screens are imprecise. Snap only when the tap is genuinely closest
  // to this lattice point, never to a neighbouring cell.
  if (Math.abs(rawX - x) > 0.46 || Math.abs(rawY - y) > 0.46) return null;
  return { x, y };
}

function makeMarker(label: string): SVGGElement {
  const group = document.createElementNS(NS, 'g');
  group.classList.add('lms-picked-point', 'no-print');
  group.dataset['lmsPickedLabel'] = label;
  group.setAttribute('aria-hidden', 'true');
  group.style.display = 'none';

  const circle = document.createElementNS(NS, 'circle');
  circle.setAttribute('r', '7');
  circle.setAttribute('fill', '#1d4ed8');
  circle.setAttribute('stroke', '#ffffff');
  circle.setAttribute('stroke-width', '3');

  const text = document.createElementNS(NS, 'text');
  text.textContent = label === '•' ? '' : label;
  text.setAttribute('font-size', '16');
  text.setAttribute('font-weight', '800');
  text.setAttribute('fill', '#1f2a44');
  text.setAttribute('direction', 'ltr');

  group.append(circle, text);
  return group;
}

function updateMarker(grid: HTMLElement, task: PickerTask): void {
  const [xTarget, yTarget] = task.targets;
  const x = numericText(xTarget);
  const y = numericText(yTarget);
  const xmax = numberSetting(grid.dataset['xmax'], 8);
  const ymax = numberSetting(grid.dataset['ymax'], 6);

  if (x === null || y === null || x < 0 || y < 0 || x > xmax || y > ymax) {
    task.marker.style.display = 'none';
    return;
  }

  const at = coordinateToViewBox(grid, x, y);
  const circle = task.marker.querySelector('circle');
  const text = task.marker.querySelector('text');
  circle?.setAttribute('cx', String(at.x));
  circle?.setAttribute('cy', String(at.y));
  text?.setAttribute('x', String(at.x + 10));
  text?.setAttribute('y', String(at.y - 10));
  task.marker.style.display = '';
}

function fillTask(task: PickerTask, point: { x: number; y: number }): void {
  const values = [String(point.x), String(point.y)];
  task.targets.forEach((target, index) => {
    target.textContent = values[index] || '';
    target.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function isPointMarkingTask(item: HTMLElement): boolean {
  const context = normalizedText(item);
  return /סמנו|סמן/.test(context) && item.querySelectorAll('.pair-blank').length === 2;
}

function gridRefs(sheet: HTMLElement): GridRef[] {
  return Array.from(sheet.querySelectorAll<HTMLElement>('.coordinate-grid'))
    .map((grid) => ({ grid, svg: grid.querySelector<SVGSVGElement>('svg') }))
    .filter((entry): entry is GridRef => Boolean(entry.svg));
}

/** Pick the graph the printed instruction refers to without page-number rules.
 * Prefer a graph in the same question card. Otherwise use the nearest graph
 * appearing before the instruction ("על הסרטוט/המפה" commonly refers back to
 * the drawing in section א). */
function gridForTask(item: HTMLElement, grids: readonly GridRef[]): GridRef | null {
  const card = item.closest('.q-card');
  const sameCardGrid = card?.querySelector<HTMLElement>('.coordinate-grid');
  if (sameCardGrid) {
    const found = grids.find((entry) => entry.grid === sameCardGrid);
    if (found) return found;
  }

  const preceding = grids.filter(({ grid }) =>
    Boolean(grid.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING),
  );
  return preceding.at(-1) || grids[0] || null;
}

function buildBinding(
  gridRef: GridRef,
  taskElements: readonly HTMLElement[],
): GridBinding | null {
  const { grid, svg } = gridRef;
  let activeIndex = 0;
  const tasks: PickerTask[] = [];

  taskElements.forEach((item, index) => {
    const targets = Array.from(item.querySelectorAll<HTMLElement>('.pair-blank'));
    if (targets.length !== 2) return;
    const label = pointLabel(normalizedText(item));
    const marker = makeMarker(label);
    svg.append(marker);

    const task: PickerTask = {
      targets: [targets[0]!, targets[1]!],
      label,
      marker,
      observer: new MutationObserver(() => undefined),
      focusHandlers: [],
    };

    task.observer.disconnect();
    task.observer = new MutationObserver(() => updateMarker(grid, task));
    for (const target of task.targets) {
      task.observer.observe(target, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      const handler: EventListener = () => {
        activeIndex = index;
        grid.dataset['lmsPickerActive'] = task.label;
      };
      target.addEventListener('focus', handler);
      target.addEventListener('pointerdown', handler);
      task.focusHandlers.push({ target, handler });
    }
    updateMarker(grid, task);
    tasks.push(task);
  });

  if (tasks.length === 0) return null;
  const originalAria = grid.getAttribute('aria-label');
  grid.dataset['lmsPicker'] = 'ready';
  grid.dataset['lmsPickerActive'] = tasks[0]!.label;
  grid.style.cursor = 'crosshair';
  grid.style.touchAction = 'manipulation';
  grid.setAttribute(
    'aria-label',
    `${originalAria || 'מערכת צירים'}. אפשר ללחוץ על נקודה במערכת כדי לסמן את התשובה.`,
  );

  const clickHandler: EventListener = (rawEvent) => {
    const event = rawEvent as MouseEvent;
    const point = eventToCoordinate(event, grid, svg);
    if (!point) return;
    const task = tasks[activeIndex];
    if (!task) return;
    fillTask(task, point);
    updateMarker(grid, task);

    if (activeIndex < tasks.length - 1) {
      activeIndex += 1;
      grid.dataset['lmsPickerActive'] = tasks[activeIndex]!.label;
    }
  };

  // Listen on the wrapper: HTML LMS overlays above the SVG still bubble here.
  grid.addEventListener('click', clickHandler);
  return { grid, svg, tasks, clickHandler, originalAria };
}

/**
 * Makes every canonical "mark a point" instruction touch-first. The graph may
 * live in the same question card or an earlier section of the same worksheet.
 * Printable HTML is untouched; existing coordinate blanks remain the keyboard
 * fallback and stay synchronized with the visible point marker.
 */
export function hydrateGridPointPickers(root: ParentNode): () => void {
  if ((root as Node).nodeType === 9) return () => undefined;
  const bindings: GridBinding[] = [];

  for (const sheet of root.querySelectorAll<HTMLElement>('.sheet')) {
    const grids = gridRefs(sheet);
    if (grids.length === 0) continue;
    const assignments = new Map<HTMLElement, HTMLElement[]>();

    for (const item of sheet.querySelectorAll<HTMLElement>('li')) {
      if (!isPointMarkingTask(item)) continue;
      const selected = gridForTask(item, grids);
      if (!selected) continue;
      const list = assignments.get(selected.grid) || [];
      list.push(item);
      assignments.set(selected.grid, list);
    }

    for (const gridRef of grids) {
      const items = assignments.get(gridRef.grid) || [];
      if (items.length === 0) continue;
      const binding = buildBinding(gridRef, items);
      if (binding) bindings.push(binding);
    }
  }

  return () => {
    for (const binding of bindings) {
      binding.grid.removeEventListener('click', binding.clickHandler);
      binding.grid.style.cursor = '';
      binding.grid.style.touchAction = '';
      delete binding.grid.dataset['lmsPicker'];
      delete binding.grid.dataset['lmsPickerActive'];
      if (binding.originalAria === null) binding.grid.removeAttribute('aria-label');
      else binding.grid.setAttribute('aria-label', binding.originalAria);
      for (const task of binding.tasks) {
        task.observer.disconnect();
        for (const { target, handler } of task.focusHandlers) {
          target.removeEventListener('focus', handler);
          target.removeEventListener('pointerdown', handler);
        }
        task.marker.remove();
      }
    }
  };
}
