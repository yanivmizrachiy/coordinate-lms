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

interface GridBinding {
  grid: HTMLElement;
  svg: SVGSVGElement;
  tasks: PickerTask[];
  clickHandler: EventListener;
}

function numberSetting(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizedText(node: Element | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function pointLabel(context: string, fallback: number): string {
  const match = context.match(/נקודה\s+([A-Z])/i);
  return match?.[1]?.toUpperCase() || String(fallback + 1);
}

function numericText(target: HTMLElement): number | null {
  const value = Number((target.textContent || '').trim().replace(',', '.'));
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
  return {
    x: L + x * sx,
    y: H - B - y * sy,
  };
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
  // A learner may tap near the lattice point on a phone. Snap within slightly
  // less than half a grid cell; taps near an unrelated cell are not accepted.
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
  text.textContent = label;
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

/**
 * Makes canonical "mark a point and write its coordinates" tasks touch-first.
 * The printable worksheet HTML is unchanged. The existing pair blanks remain a
 * keyboard-accessible fallback and stay synchronized with the point chosen on
 * the graph.
 */
export function hydrateGridPointPickers(root: ParentNode): () => void {
  const bindings: GridBinding[] = [];

  for (const card of root.querySelectorAll<HTMLElement>('.q-card')) {
    const grid = card.querySelector<HTMLElement>('.coordinate-grid');
    const svg = grid?.querySelector<SVGSVGElement>('svg');
    if (!grid || !svg) continue;

    const taskElements = Array.from(card.querySelectorAll<HTMLElement>('li'))
      .filter((item) => {
        const context = normalizedText(item);
        return /סמנו|סמן/.test(context) && item.querySelectorAll('.pair-blank').length === 2;
      });
    if (taskElements.length === 0) continue;

    let activeIndex = 0;
    const tasks: PickerTask[] = [];

    taskElements.forEach((item, index) => {
      const targets = Array.from(item.querySelectorAll<HTMLElement>('.pair-blank'));
      if (targets.length !== 2) return;
      const label = pointLabel(normalizedText(item), index);
      const marker = makeMarker(label);
      svg.append(marker);

      const task: PickerTask = {
        targets: [targets[0]!, targets[1]!] as [HTMLElement, HTMLElement],
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

    if (tasks.length === 0) continue;
    grid.dataset['lmsPicker'] = 'ready';
    grid.dataset['lmsPickerActive'] = tasks[0]!.label;
    grid.style.cursor = 'crosshair';
    grid.style.touchAction = 'manipulation';
    const originalAria = grid.getAttribute('aria-label') || 'מערכת צירים';
    grid.setAttribute(
      'aria-label',
      `${originalAria}. אפשר ללחוץ על נקודה במערכת כדי לסמן את התשובה.`,
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

    // Listen on the whole coordinate-grid wrapper rather than only the SVG.
    // LMS HTML overlays (for missing ticks/labels) sit above the SVG and must
    // not swallow a learner's tap. Their click bubbles to this shared wrapper.
    grid.addEventListener('click', clickHandler);
    bindings.push({ grid, svg, tasks, clickHandler });
  }

  return () => {
    for (const binding of bindings) {
      binding.grid.removeEventListener('click', binding.clickHandler);
      binding.grid.style.cursor = '';
      binding.grid.style.touchAction = '';
      delete binding.grid.dataset['lmsPicker'];
      delete binding.grid.dataset['lmsPickerActive'];
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
