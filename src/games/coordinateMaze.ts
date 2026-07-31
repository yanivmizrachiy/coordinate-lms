/* מבוך הקואורדינטות — move a marker with the four direction buttons. Each move
   changes exactly one coordinate (right/left → x, up/down → y). You may not
   leave the first quadrant or step on a wall. Reach the target to win. */
import type { GameDefinition } from './types';
import { renderCoordinateGrid, type GridPoint } from '../lib/coordinateGrid';
import { move, eqPoint, isFirstQuadrant, type Direction, type Point } from '../lib/coordinateMath';
import { elem, clear } from '../lib/dom';

export interface MazeConfig {
  start: Point;
  target: Point;
  walls: Point[];
  xMax: number;
  yMax: number;
}

export const mazeConfig: MazeConfig = {
  start: { x: 0, y: 0 },
  target: { x: 6, y: 4 },
  xMax: 8,
  yMax: 6,
  walls: [
    { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
    { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
  ],
};

const isWall = (cfg: MazeConfig, p: Point): boolean => cfg.walls.some((w) => eqPoint(w, p));

export function canStandOn(cfg: MazeConfig, p: Point): boolean {
  return isFirstQuadrant(p) && p.x <= cfg.xMax && p.y <= cfg.yMax && !isWall(cfg, p);
}

/** BFS — used by the tests to prove the maze is solvable. */
export function mazeIsSolvable(cfg: MazeConfig): boolean {
  const key = (p: Point): string => `${p.x},${p.y}`;
  const seen = new Set<string>([key(cfg.start)]);
  const queue: Point[] = [cfg.start];
  const dirs: Direction[] = ['right', 'left', 'up', 'down'];
  while (queue.length) {
    const cur = queue.shift()!;
    if (eqPoint(cur, cfg.target)) return true;
    for (const d of dirs) {
      const next = move(cur, d, 1);
      if (canStandOn(cfg, next) && !seen.has(key(next))) { seen.add(key(next)); queue.push(next); }
    }
  }
  return false;
}

const DIRS: { dir: Direction; label: string }[] = [
  { dir: 'up', label: '▲ למעלה' },
  { dir: 'down', label: '▼ למטה' },
  { dir: 'left', label: '◀ שמאלה' },
  { dir: 'right', label: 'ימינה ▶' },
];

export const coordinateMazeGame: GameDefinition = {
  id: 'coordinate-maze',
  title: 'מבוך הקואורדינטות',
  icon: '🌀',
  short: 'זזים במבוך לפי פקודות הזזה עד ליעד.',
  skill: 'הזזה מדויקת: ימינה/שמאלה משנות x, למעלה/למטה משנות y',
  mount(root) {
    const cfg = mazeConfig;
    let pos: Point = { ...cfg.start };
    const trail: Point[] = [{ ...cfg.start }];

    const wrap = elem('div', { class: 'game' });
    wrap.append(elem('div', { class: 'game__intro' },
      elem('h2', { text: 'איך יוצאים מהמבוך?' }),
      elem('p', { text: 'הזיזו את הסמן מהנקודה הירוקה אל היעד הזהוב. כל צעד משנה שיעור אחד: ימינה/שמאלה משנים את x, למעלה/למטה משנים את y. אסור לצאת מהרביע הראשון או לעמוד על קיר.' }),
    ));

    const status = elem('div', { class: 'game__row' });
    const holder = elem('div', { class: 'coordinate-grid grid-lg', style: 'max-width:520px' });
    wrap.append(holder, status);

    const controls = elem('div', { class: 'game__row' });
    const feedback = elem('span', { class: 'game__prompt' });
    DIRS.forEach(({ dir, label }) => {
      const btn = elem('button', { class: 'iconbtn', type: 'button', text: label });
      btn.addEventListener('click', () => {
        const next = move(pos, dir, 1);
        if (!canStandOn(cfg, next)) {
          feedback.textContent = next.x < 0 || next.y < 0 || next.x > cfg.xMax || next.y > cfg.yMax
            ? '✗ אי אפשר לצאת מהרביע הראשון' : '✗ יש שם קיר';
          return;
        }
        pos = next;
        trail.push({ ...pos });
        feedback.textContent = '';
        redraw();
      });
      controls.append(btn);
    });
    const reset = elem('button', { class: 'iconbtn iconbtn--ghost', type: 'button', text: '↺ מהתחלה' });
    reset.addEventListener('click', () => { pos = { ...cfg.start }; trail.length = 0; trail.push({ ...cfg.start }); feedback.textContent = ''; redraw(); });
    controls.append(reset, feedback);
    wrap.append(controls);

    function redraw(): void {
      const wallPoints: GridPoint[] = cfg.walls.map((w) => ({ x: w.x, y: w.y, label: '■', color: '#94a3b8', anchor: 'middle', dx: 0, dy: 4 }));
      const points: GridPoint[] = [
        ...wallPoints,
        { x: cfg.start.x, y: cfg.start.y, label: 'התחלה', color: '#15803d', dx: 14, dy: -14 },
        { x: cfg.target.x, y: cfg.target.y, label: 'יעד', color: '#b45309' },
        /* The position is NOT written on the board. At the start it shares the
           origin with „התחלה”, and below the dot it lands in the row where the
           axis numbers live — so it was pushed around and printed on them. The
           line under the board already says „מיקום נוכחי: (x,y)”, which is the
           same information in a place where it can be read. */
        { x: pos.x, y: pos.y, label: '', color: '#1d4ed8' },
      ];
      const segments = trail.slice(1).map((p, i) => ({
        from: [trail[i]!.x, trail[i]!.y] as [number, number], to: [p.x, p.y] as [number, number], type: 'guide' as const,
      }));
      clear(holder);
      /* The starting square IS the origin, so three labels („התחלה”, the current
         position, and the corner mark) all want that one corner. This is a game
         board, not the lesson about the axes being perpendicular, so the corner
         mark gives way and the labels get the room. */
      holder.append(renderCoordinateGrid({ points, segments, originAngle: false, ariaLabel: 'מבוך הקואורדינטות' }));

      clear(status);
      if (eqPoint(pos, cfg.target)) {
        status.append(elem('div', { class: 'reveal', text: `✓ הגעתם ליעד (${cfg.target.x},${cfg.target.y}) ב־${trail.length - 1} צעדים!` }));
      } else {
        status.append(elem('span', { class: 'game__prompt', text: `מיקום נוכחי: (${pos.x},${pos.y})  ·  יעד: (${cfg.target.x},${cfg.target.y})` }));
      }
    }

    redraw();
    clear(root);
    root.append(wrap);
    return () => clear(root);
  },
};
