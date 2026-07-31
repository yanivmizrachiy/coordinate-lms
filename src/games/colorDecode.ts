/* פענוח צבעוני — colour the cells listed by their ordered pairs. When the right
   cells are filled, a hidden symbol appears. Plotting practice with a payoff. */
import type { GameDefinition } from './types';
import { isFirstQuadrant, type Point } from '../lib/coordinateMath';
import { elem, clear } from '../lib/dom';

export const decodeCols = 7; // x: 0..6
export const decodeRows = 6; // y: 0..5

/** Cells that, when coloured, reveal a check mark (וי). */
export const decodeTargets: Point[] = [
  { x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 3 }, { x: 5, y: 4 }, { x: 6, y: 5 },
];
export const decodeSymbol = 'סימן וי';

const keyOf = (p: Point): string => `${p.x},${p.y}`;

export function decodeSolved(colored: Iterable<string>): boolean {
  const set = new Set(colored);
  const targetKeys = decodeTargets.map(keyOf);
  return set.size === targetKeys.length && targetKeys.every((k) => set.has(k));
}

export const colorDecodeGame: GameDefinition = {
  id: 'color-decode',
  title: 'פענוח צבעוני',
  icon: '🎨',
  short: 'צובעים תאים לפי זוגות סדורים ומגלים סמל נסתר.',
  skill: 'סימון מדויק של זוגות סדורים',
  mount(root) {
    const colored = new Set<string>();
    const wrap = elem('div', { class: 'game' });
    wrap.append(elem('div', { class: 'game__intro' },
      elem('h2', { text: 'איזה צבע מסתתר בכל נקודה?' }),
      elem('p', { text: 'צבעו את התאים לפי הרשימה. לחיצה על תא צובעת אותו, לחיצה נוספת מבטלת. כשכל התאים הנכונים צבועים — יתגלה הסמל.' }),
    ));

    const listText = decodeTargets.map((p) => `(${p.x},${p.y})`).join('  ·  ');
    wrap.append(elem('div', { class: 'game__row' }, elem('span', { class: 'game__prompt', text: 'צבעו את התאים: ' + listText })));

    const finalMsg = elem('div', { class: 'reveal reveal--pending no-print', text: 'צבעו את כל התאים הנכונים כדי לגלות את הסמל.' });

    const grid = elem('div', {
      style: `display:grid;grid-template-columns:28px repeat(${decodeCols}, 1fr);gap:3px;max-width:420px;margin:8px 0`,
    });

    const refresh = (): void => {
      if (decodeSolved(colored)) { finalMsg.className = 'reveal'; finalMsg.textContent = `✓ פענחתם: ${decodeSymbol}`; }
      else { finalMsg.className = 'reveal reveal--pending no-print'; finalMsg.textContent = 'צבעו את כל התאים הנכונים כדי לגלות את הסמל.'; }
    };

    // rows from top (y = rows-1) down to y = 0, so orientation matches the axes
    for (let y = decodeRows - 1; y >= 0; y--) {
      grid.append(elem('div', { style: 'display:grid;place-items:center;font-weight:800;color:var(--muted);font-size:13px', text: String(y) }));
      for (let x = 0; x < decodeCols; x++) {
        const k = `${x},${y}`;
        const cell = elem('button', {
          type: 'button', 'aria-label': `תא (${x},${y})`,
          style: 'aspect-ratio:1;border:1px solid var(--hairline);border-radius:6px;background:#fff;min-height:34px',
        });
        cell.addEventListener('click', () => {
          if (colored.has(k)) { colored.delete(k); cell.style.background = '#fff'; }
          else { colored.add(k); cell.style.background = 'var(--brand)'; }
          refresh();
        });
        grid.append(cell);
      }
    }
    // x-axis labels row
    grid.append(elem('div', {}));
    for (let x = 0; x < decodeCols; x++) {
      grid.append(elem('div', { style: 'display:grid;place-items:center;font-weight:800;color:var(--muted);font-size:13px', text: String(x) }));
    }

    wrap.append(grid, finalMsg);
    clear(root);
    root.append(wrap);
    return () => clear(root);
  },
};

/** Exposed for tests. */
export function targetsAreFirstQuadrant(): boolean {
  return decodeTargets.every(isFirstQuadrant);
}
