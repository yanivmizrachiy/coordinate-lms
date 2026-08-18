/* ===========================================================================
   coordinateGrid — renders a first-quadrant coordinate system as crisp vector
   SVG. This is a typed port of the original booklet renderer; geometry and
   styling are preserved so the 34 legacy pages look identical, while games get
   a clean, reusable API (renderCoordinateGrid) plus hydration of `.coordinate-grid`
   elements that carry data-* specs.
   =========================================================================== */

const NS = 'http://www.w3.org/2000/svg';

export interface GridPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  dx?: number;
  dy?: number;
  anchor?: 'start' | 'middle' | 'end';
  /** ציור וקטורי קטן על הנקודה — מפת הפארק: כל מילה עם ציור מתאים ומדויק. */
  icon?: 'gate' | 'bench' | 'fountain' | 'swing' | 'tree' | 'exit';
}
export interface GridSegment {
  from: [number, number];
  to: [number, number];
  dashed?: boolean;
  type?: 'guide' | 'shape';
  color?: string;
}
export interface GridArrow {
  from: [number, number];
  to: [number, number];
  label?: string;
  color?: string;
}
export interface GridPolygon {
  points: [number, number][];
}
export interface GridLabelBox {
  text: string;
  at: [number, number];
  to?: [number, number];
}
export interface GridSpec {
  points?: GridPoint[];
  segments?: GridSegment[];
  arrows?: GridArrow[];
  polygons?: GridPolygon[];
  labelboxes?: GridLabelBox[];
  xlabels?: (number | string)[];
  ylabels?: (number | string)[];
  /** Axis ranges — 8×6 unless the page's data needs more room. */
  xmax?: number;
  ymax?: number;
  /** Set false to hide the "ציר x" / "ציר y" names (tasks that ask for them). */
  axisNames?: boolean;
  /** With axisNames:false — ask for the origin's NAME (two words, two boxes)
      instead of just the letter O. */
  originName?: boolean;
  /** The right-angle mark in the corner at the origin — the two axes ARE
      perpendicular, and it is drawn on every system unless set to false. */
  originAngle?: boolean;
  /** Override the axis names, e.g. a real-life graph: "משקל" / "מחיר". */
  axisXName?: string;
  axisYName?: string;
  ariaLabel?: string;
}

// Geometry — identical to the original booklet.
/* Top/bottom margins are deliberately generous: the axis NAMES ("ציר x" /
   "ציר y") must sit in the margin, never inside the grid or on the arrow. */
/* R and T carry the axis NAMES, which are the largest type on the drawing and
   grow further when a small grid has its text put back to size. */
const W = 560, H = 380, L = 56, R = 104, T = 70, B = 82;
/* The axis ranges are 8×6 unless the page asks otherwise (data-xmax/data-ymax).
   A page whose DATA reaches 7 must say so — a point may never be plotted
   outside the system it stands in (עמוד 64: „הנקודה יצאה מהמערכת").
   Module-level and set per render: every drawing routine below reads X()/Y(),
   and rendering is synchronous, so the range can never leak across grids. */
let XM = 8, YM = 6;
let SX = (W - L - R) / XM;
let SY = (H - T - B) / YM;
const setRange = (xm: number, ym: number): void => {
  XM = xm; YM = ym;
  SX = (W - L - R) / XM;
  SY = (H - T - B) / YM;
};
const X = (x: number): number => L + x * SX;
const Y = (y: number): number => H - B - y * SY;

const AXIS = '#1f2a44';
const BLUE = '#1d4ed8';
const GRIDLINE = '#e7eaf1';
const GUIDE = '#64748b';

type Attrs = Record<string, string | number | undefined>;

let markerCounter = 0;

function el(tag: string, attrs: Attrs = {}, text = ''): SVGElement {
  const node = document.createElementNS(NS, tag) as SVGElement;
  /* Direction, decided by what the label actually contains.

     A label WITH Hebrew („ציר y”, „שיעור x = 4”) stays in the sheet's RTL
     direction, which puts the Hebrew word on the RIGHT. A Hebrew reader scans
     from the right, so „ציר” is the first word met — which is how it must
     read. Forcing such a label to LTR moves the Hebrew to the left, and then
     the reader meets „y” first and the label says „y ציר”: backwards.

     A label WITHOUT Hebrew („A”, „(2,5)”, „7”) is pinned LTR, because RTL
     mirrors brackets and can reorder a coordinate pair. */
  if (tag === 'text' && text !== '' && !/[֐-׿]/.test(text)) {
    node.setAttribute('direction', 'ltr');
  }
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== '' && v !== null && v !== undefined) node.setAttribute(k, String(v));
  }
  if (text !== '') node.textContent = text;
  return node;
}

/* ציורי המפה — קו נקי בצבעי השרטוט, ~24px, יושבים מעל-ומימין לנקודה כך
   שהנקודה עצמה (הדיוק המתמטי) נשארת גלויה. עמוד מפת-הפארק: „כל מילה צריכה
   באמת להיות עם ציור מתאים ומדויק". */
function pointIcon(kind: NonNullable<GridPoint['icon']>, px: number, py: number): SVGElement {
  /* גדול וקריא: קופסת 40 יחידות, ממורכזת מעל הנקודה; נקודה שיושבת על ציר y
     נדחפת ימינה כדי שהציור לא ירכב על הציר. הקו מתעבה עם ההגדלה. */
  const nudge = px <= L + 2 ? 18 : 0;
  const g = el('g', {
    transform: `translate(${px - 20 + nudge}, ${py - 48}) scale(1.8)`,
    'aria-hidden': 'true',
    /* קישוט השייך לנקודה שלו — לא סימן מבני של השרטוט. הביקורות שמחפשות
       „תווית שיושבת על סימן" מדלגות עליו, אחרת כל ציור יסמן את עצמו כתקלה. */
    'data-icon': '1',
  });
  const S = (attrs: Attrs, d: string): SVGElement => el('path', { d, fill: 'none', stroke: AXIS, 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs });
  const halo = el('rect', { x: -2, y: -2, width: 26, height: 26, rx: 6, fill: '#fff', opacity: 0.85 });
  g.append(halo);
  switch (kind) {
    case 'gate': // שני עמודים וקשת
      g.append(S({}, 'M3 22V8M19 22V8'), S({}, 'M1 9 Q11 -2 21 9'), S({ 'stroke-width': 1.2 }, 'M3 22H19'));
      break;
    case 'bench': // מושב, משענת ורגליים
      g.append(S({}, 'M2 13H20'), S({}, 'M3 13V21M19 13V21'), S({}, 'M4 13V6M18 13V6'), S({ 'stroke-width': 1.2 }, 'M4 8H18'));
      break;
    case 'fountain': // אגן וסילונים
      g.append(S({}, 'M3 17 H19 L17 22 H5 Z'), S({}, 'M11 16V9'), S({ stroke: BLUE }, 'M11 9 Q7 6 5 9'), S({ stroke: BLUE }, 'M11 9 Q15 6 17 9'), S({ stroke: BLUE }, 'M11 9 Q11 4 11 3'));
      break;
    case 'swing': // מסגרת ומושב תלוי
      g.append(S({}, 'M2 22 L6 4 H16 L20 22'), S({ 'stroke-width': 1.2 }, 'M8 5V15M14 5V15'), S({}, 'M7 15H15'));
      break;
    case 'tree': // גזע וצמרת
      g.append(S({}, 'M11 22V13'), el('circle', { cx: 11, cy: 8, r: 6.5, fill: 'none', stroke: AXIS, 'stroke-width': 1.7 }), el('circle', { cx: 11, cy: 8, r: 3, fill: 'none', stroke: AXIS, 'stroke-width': 1 }));
      break;
    case 'exit': // דלת וחץ יוצא
      g.append(S({}, 'M4 3 H14 V22 H4 Z'), S({ stroke: BLUE }, 'M14 12 H22'), S({ stroke: BLUE }, 'M19 9 L22 12 L19 15'));
      break;
  }
  return g;
}

/** Render a coordinate grid from a typed spec. Returns a standalone <svg>. */
export function renderCoordinateGrid(spec: GridSpec): SVGSVGElement {
  setRange(spec.xmax ?? 8, spec.ymax ?? 6);
  const id = 'cg-arrow-' + ++markerCounter;
  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    role: 'img',
    'aria-label': spec.ariaLabel || 'מערכת צירים ברביע הראשון',
    'shape-rendering': 'geometricPrecision',
    'text-rendering': 'geometricPrecision',
  }) as SVGSVGElement;

  // Arrowhead marker
  const defs = el('defs');
  const marker = el('marker', {
    id, viewBox: '0 0 10 10', refX: 8.5, refY: 5,
    markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse',
  });
  marker.append(el('path', { d: 'M0 0 L10 5 L0 10 z', fill: BLUE }));
  defs.append(marker);
  svg.append(defs);

  // Grid lines
  for (let x = 0; x <= XM; x++) {
    svg.append(el('line', { x1: X(x), y1: Y(0), x2: X(x), y2: Y(YM), stroke: GRIDLINE, 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }));
  }
  for (let y = 0; y <= YM; y++) {
    svg.append(el('line', { x1: X(0), y1: Y(y), x2: X(XM), y2: Y(y), stroke: GRIDLINE, 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }));
  }

  /* The axis always overhangs the last gridline by the same amount. It used to
     be cut short when the learner writes the axis name, to leave room for the
     answer box — but that put the arrowhead straight onto the „8”. The box goes
     further out instead; the margin has the room. */
  const over = 22;
  svg.append(
    el('line', { x1: X(0), y1: Y(0), x2: X(XM) + over, y2: Y(0), stroke: AXIS, 'stroke-width': 2.2, 'vector-effect': 'non-scaling-stroke' }),
    el('path', { d: `M ${X(XM) + over + 6} ${Y(0)} l-10-5v10z`, fill: AXIS }),
    el('line', { x1: X(0), y1: Y(0), x2: X(0), y2: Y(YM) - 18, stroke: AXIS, 'stroke-width': 2.2, 'vector-effect': 'non-scaling-stroke' }),
    el('path', { d: `M ${X(0)} ${Y(YM) - 25} l-5 10h10z`, fill: AXIS }),
  );

  // Ticks + numbers.
  // A point that sits ON an axis lands right next to that tick's number. The
  // learner is asked to READ that number, so it must never be crowded by the
  // dot: the clashing number is pushed further into the margin and gets a white
  // halo. (Never move it to the other side — the numbers must stay in one line.)
  // The clearance is sized for the LARGEST mark a board can put on an axis —
  // the maze's „■” wall, not just a 5px dot; 6px left them touching.
  const xl = spec.xlabels ?? Array.from({ length: XM + 1 }, (_, i) => i);
  const yl = spec.ylabels ?? Array.from({ length: YM + 1 }, (_, i) => i);
  const pts = spec.points ?? [];
  const onXAxis = new Set(pts.filter((p) => p.y === 0).map((p) => p.x));
  const onYAxis = new Set(pts.filter((p) => p.x === 0).map((p) => p.y));
  /* ראש חץ שנוחת על הציר מסתיר את הספרה בדיוק כמו נקודה — אותה התחמקות. */
  for (const a of spec.arrows ?? []) {
    for (const [ax, ay] of [a.from, a.to]) {
      if (ay === 0) onXAxis.add(ax);
      if (ax === 0) onYAxis.add(ay);
    }
  }
  const CLEAR = { 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4.5 };

  for (let x = 1; x <= XM; x++) {
    svg.append(el('line', { x1: X(x), y1: Y(0) - 4, x2: X(x), y2: Y(0) + 4, stroke: AXIS, 'stroke-width': 1.4, 'vector-effect': 'non-scaling-stroke' }));
    const lab = xl[x];
    if (lab === '') {
      // missing number — draw an empty answer box for the student to fill in
      svg.append(el('rect', { x: X(x) - 14, y: Y(0) + 8, width: 28, height: 22, rx: 4, fill: '#fff', stroke: BLUE, 'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke' }));
    } else if (lab !== null && lab !== undefined) {
      const clash = onXAxis.has(x);
      svg.append(el('text', {
        x: X(x), y: Y(0) + (clash ? 34 : 21), 'text-anchor': 'middle', direction: 'ltr',
        fill: AXIS, 'font-size': 17, 'font-weight': 700, ...(clash ? CLEAR : {}),
      }, String(lab)));
    }
  }
  for (let y = 1; y <= YM; y++) {
    svg.append(el('line', { x1: X(0) - 4, y1: Y(y), x2: X(0) + 4, y2: Y(y), stroke: AXIS, 'stroke-width': 1.4, 'vector-effect': 'non-scaling-stroke' }));
    const lab = yl[y];
    if (lab === '') {
      // missing number — draw an empty answer box for the student to fill in
      svg.append(el('rect', { x: X(0) - 42, y: Y(y) - 11, width: 28, height: 22, rx: 4, fill: '#fff', stroke: BLUE, 'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke' }));
    } else if (lab !== null && lab !== undefined) {
      const clash = onYAxis.has(y);
      svg.append(el('text', {
        x: X(0) - (clash ? 25 : 12), y: Y(y) + 5, 'text-anchor': 'end', direction: 'ltr',
        fill: AXIS, 'font-size': 17, 'font-weight': 700, ...(clash ? CLEAR : {}),
      }, String(lab)));
    }
  }

  /* Axis names and the origin letter sit in the margins. When the task IS to
     name them (data-axisnames="false") printing them would give the answer
     away — so the learner gets a box to write in, right where the name
     belongs, exactly like a missing number on an axis. */
  const answerBox = (x: number, y: number, w: number): SVGElement =>
    el('rect', {
      x, y, width: w, height: 22, rx: 4, fill: '#fff', stroke: BLUE,
      'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke',
    });

  /* The two axes meet at a RIGHT angle, and nothing on the drawing ever said
     so. The little square in the corner is how a textbook says it. */
  if (spec.originAngle !== false) {
    const side = 16;
    svg.append(el('path', {
      d: `M ${X(0) + side} ${Y(0)} L ${X(0) + side} ${Y(0) - side} L ${X(0)} ${Y(0) - side}`,
      fill: 'none', stroke: AXIS, 'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke',
    }));
  }

  if (spec.axisNames !== false) {
    svg.append(
      /* A sheet that marks the origin as one of ITS points already labels it.
         Drawing our own O beside it puts two of them on one corner. */
      ...((spec.points ?? []).some((p) => p.x === 0 && p.y === 0)
        ? []
        : [el('text', { x: X(0) - 11, y: Y(0) + 22, 'text-anchor': 'end', fill: AXIS, 'font-size': 17, 'font-weight': 800 }, 'O')]),
      // Mixed Hebrew+Latin flips text-anchor, so pin direction explicitly.
      /* Centred rather than anchored to an edge: in RTL, `start` anchors the
         RIGHT edge, so the name would grow back over the arrow. */
      /* „ציר x” fits past the arrow. A real-life name („דקות למידה (עשרות)”)
         does not — it reaches back over the last tick number — so a long one is
         centred UNDER the axis, where a textbook puts it. */
      ((): SVGElement => {
        const name = spec.axisXName ?? 'ציר x';
        return name.length > 8
          ? el('text', { x: X(XM / 2), y: Y(0) + 46, 'text-anchor': 'middle', fill: AXIS, 'font-size': 15, 'font-weight': 800, 'data-axisname': 'x' }, name)
          : el('text', { x: X(XM) + 46, y: Y(0) + 5, 'text-anchor': 'middle', fill: AXIS, 'font-size': 16, 'font-weight': 800, 'data-axisname': 'x' }, name);
      })(),
      el('text', { x: X(0), y: Y(YM) - 32, 'text-anchor': 'middle', fill: AXIS, 'font-size': 16, 'font-weight': 800, 'data-axisname': 'y' }, spec.axisYName ?? 'ציר y'),
    );
  } else {
    svg.append(
      answerBox(X(XM) + 36, Y(0) - 11, 52),     // to the RIGHT of the x arrow
      answerBox(X(0) - 28, Y(YM) - 48, 56),     // just above the y arrow
    );
    // „ראשית הצירים” is two words, so it gets two boxes — one word each.
    // Stacked in the corner below the origin, the only free space there.
    svg.append(
      ...(spec.originName
        ? [answerBox(X(0) - 54, Y(0) + 6, 52), answerBox(X(0) - 54, Y(0) + 32, 52)]
        : [answerBox(X(0) - 40, Y(0) + 6, 26)]),
    );
  }

  // Polygons
  for (const p of spec.polygons ?? []) {
    svg.append(el('polygon', {
      points: (p.points || []).map((v) => `${X(v[0])},${Y(v[1])}`).join(' '),
      fill: 'rgba(29,78,216,.08)', stroke: BLUE, 'stroke-width': 2.2, 'vector-effect': 'non-scaling-stroke',
    }));
  }

  // Segments
  for (const g of spec.segments ?? []) {
    svg.append(el('line', {
      x1: X(g.from[0]), y1: Y(g.from[1]), x2: X(g.to[0]), y2: Y(g.to[1]),
      stroke: g.color || (g.type === 'guide' ? GUIDE : BLUE),
      'stroke-width': g.type === 'guide' ? 1.7 : 3.4,
      'stroke-dasharray': g.dashed ? '7 5' : '',
      'vector-effect': 'non-scaling-stroke',
    }));
  }

  // Arrows (movement) with optional labels.
  // עמוד 72 לימד: תווית של חץ אופקי שרוע על ציר x נחתה על מספרי הציר, ותווית
  // של חץ אנכי נחתכה על הקו של עצמה. חץ אופקי — התווית מעליו (ומורמת יותר
  // כשהוא על הציר); חץ אנכי — התווית לצידו, לעולם לא עליו.
  for (const a of spec.arrows ?? []) {
    svg.append(el('line', {
      x1: X(a.from[0]), y1: Y(a.from[1]), x2: X(a.to[0]), y2: Y(a.to[1]),
      stroke: a.color || BLUE, 'stroke-width': 2.4, 'stroke-dasharray': '8 5',
      'marker-end': `url(#${id})`, 'vector-effect': 'non-scaling-stroke',
    }));
    if (a.label) {
      const mx = (X(a.from[0]) + X(a.to[0])) / 2;
      const my = (Y(a.from[1]) + Y(a.to[1])) / 2;
      const vertical = a.from[0] === a.to[0];
      const halo = { 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4.5 } as const;
      if (vertical) {
        svg.append(el('text', {
          x: mx + 9, y: my + 4, 'text-anchor': anchorFor(a.label, 9, false),
          fill: BLUE, 'font-size': 12, 'font-weight': 800, ...halo,
        }, a.label));
      } else {
        const onAxis = a.from[1] === 0 && a.to[1] === 0;
        svg.append(el('text', {
          x: mx, y: my - (onAxis ? 12 : 9), 'text-anchor': 'middle',
          fill: BLUE, 'font-size': 12, 'font-weight': 800, ...halo,
        }, a.label));
      }
    }
  }

  // Points with labels
  for (const [pi, p] of (spec.points ?? []).entries()) {
    if (p.icon) svg.append(pointIcon(p.icon, X(p.x), Y(p.y)));
    /* A point ON an axis sits on top of the axis line and the ray drawn along
       it, and all three are the same weight — „לא ברור בדיוק איפה נמצאת נקודה
       A”. The white ring cuts the line underneath so the mark reads as a mark. */
    svg.append(el('circle', {
      cx: X(p.x), cy: Y(p.y), r: 5.1, fill: p.color || BLUE,
      stroke: '#fff', 'stroke-width': 3.4, 'data-pt': pi,
    }));
    if (p.label !== undefined && p.label !== '') {
      /* A point at the origin is the one place the default up-and-right offset
         cannot go: that corner is occupied by the right-angle mark, and the
         letter lands inside the little square. It goes where the grid's own „O”
         goes — down and left of the corner, outside the quadrant, which is
         where a textbook names the origin anyway. */
      /* …but the corner slot holds a NAME, one or two letters. A whole word
         („התחלה” on the maze) does not fit there — it runs off the left edge,
         gets pulled back in, and lands on the first tick number. A word keeps
         the normal offset and is moved off the corner mark by measurement. */
      const atOrigin = p.x === 0 && p.y === 0 && p.label.length <= 2;
      // The sheet is RTL, and in RTL `text-anchor: start` anchors the RIGHT edge —
      // the label would grow leftwards, back across the dot and onto the axis
      // numbers. Pin the direction so "start" really means "to the right of dx".
      svg.append(el('text', {
        x: X(p.x) + (p.dx ?? (atOrigin ? -11 : 10)),
        y: Y(p.y) + (p.dy ?? (atOrigin ? 22 : -10)),
        /* The anchor is mirrored in RTL: `start` anchors the RIGHT edge, so a
           HEBREW label („התחלה”, „יעד”) placed at dx:+14 grew LEFTWARD, back
           over its own dot and onto the axis numbers. A Latin label does not,
           because el() pins those to LTR. So pick the anchor that makes the
           label grow the way dx points, whichever direction it is in. */
        'text-anchor': p.anchor ?? anchorFor(p.label, p.dx ?? (atOrigin ? -11 : 10), atOrigin),
        fill: p.color || BLUE,
        'font-size': 13, 'font-weight': 900, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4,
        /* Which mark this label belongs to. A label may legitimately sit ON its
           own point — the maze draws „■” centred on every wall — and pushing it
           off leaves a square beside a stray dot. It is moved off OTHER points
           only. */
        'data-pt': pi,
      }, p.label || `(${p.x},${p.y})`));
    }
  }

  // Label boxes with optional connector line
  for (const b of spec.labelboxes ?? []) {
    const bx = X(b.at[0]);
    const by = Y(b.at[1]);
    const w = Math.max(70, (b.text || '').length * 7 + 18);
    const hh = 28;
    if (b.to) {
      svg.append(el('line', { x1: bx, y1: by + hh / 2, x2: X(b.to[0]), y2: Y(b.to[1]), stroke: GUIDE, 'stroke-width': 1.3, 'stroke-dasharray': '4 3', 'vector-effect': 'non-scaling-stroke' }));
    }
    svg.append(
      el('rect', { x: bx - w / 2, y: by - hh / 2, width: w, height: hh, rx: 6, fill: '#fff', stroke: '#94a3b8', 'stroke-width': 1.2 }),
      el('text', { x: bx, y: by + 4, 'text-anchor': 'middle', fill: AXIS, 'font-size': 12, 'font-weight': 700 }, b.text),
    );
  }

  return svg;
}

function readJson<Tv>(elm: HTMLElement, key: string, fallback: Tv): Tv {
  const raw = elm.dataset[key];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as Tv;
  } catch {
    return fallback;
  }
}

/** Find every `.coordinate-grid` inside root and replace its content with SVG. */
export function hydrateGrids(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.coordinate-grid').forEach((elm) => {
    if (elm.dataset['hydrated'] === '1') return;
    const spec: GridSpec = {
      points: readJson(elm, 'points', []),
      segments: readJson(elm, 'segments', []),
      arrows: readJson(elm, 'arrows', []),
      polygons: readJson(elm, 'polygons', []),
      labelboxes: readJson(elm, 'labelboxes', []),
      ariaLabel: elm.getAttribute('aria-label') || undefined,
    };
    const xl = readJson<(number | string)[] | null>(elm, 'xlabels', null);
    const yl = readJson<(number | string)[] | null>(elm, 'ylabels', null);
    if (xl) spec.xlabels = xl;
    if (yl) spec.ylabels = yl;
    if (elm.dataset['axisnames'] === 'false') spec.axisNames = false;
    if (elm.dataset['originname'] === 'true') spec.originName = true;
    if (elm.dataset['originangle'] === 'false') spec.originAngle = false;
    if (elm.dataset['axisx']) spec.axisXName = elm.dataset['axisx'];
    if (elm.dataset['axisy']) spec.axisYName = elm.dataset['axisy'];
    if (elm.dataset['xmax']) spec.xmax = Number(elm.dataset['xmax']);
    if (elm.dataset['ymax']) spec.ymax = Number(elm.dataset['ymax']);
    elm.replaceChildren(renderCoordinateGrid(spec));
    elm.dataset['hydrated'] = '1';
  });
  /* Type inside an SVG shrinks with the drawing; put it back once every grid on
     this root is laid out. rAF, because a grid measured before layout is zero. */
  requestAnimationFrame(() => normaliseGridText(root));
}

/* An SVG scales everything inside it, type included. A drawing that renders at
   half its viewBox turns 13px axis numbers into 7px ones — the body text beside
   them stays 13px, and the drawing reads as blurred and cramped. Yaniv reported
   exactly that twice, and measuring the CONTAINER is what let it through: the
   box was the right size while the numbers inside it were not.

   So measure the scale each drawing actually got and put the type back. Capped,
   because doubling every label would push the axis names out of the margins. */
const TARGET_TEXT_PX = 12.5;
/** How wide a vertex should read on screen, in radius. */
const TARGET_DOT_PX = 4.6;
/* Measured, not guessed: at 1.75 the y-axis numbers on the smallest drawing
   collide with each other, and at 1.5 fourteen pages drop under 11px. 1.6 is
   the most the type can grow and still fit the drawing it is drawn on. A page
   that still reads too small at 1.6 needs a BIGGER DRAWING, not more growth —
   and the axis-number test is what says so. */
const MAX_GROWTH = 1.6;
/* A vertex may grow further than a letter: dots do not collide with each other
   the way a column of axis numbers does, and on a small drawing a dot has to
   grow more than the type to stay visible at all. */
const MAX_DOT_GROWTH = 2.2;

export function normaliseGridText(root: ParentNode = document): void {
  for (const svg of root.querySelectorAll<SVGSVGElement>('.coordinate-grid svg')) {
    const box = svg.viewBox.baseVal;
    const shown = svg.getBoundingClientRect();
    if (!box?.width || !box?.height || !shown.width) continue;
    /* An SVG with a viewBox is letterboxed inside its element: it takes the
       SMALLER of the two ratios, and the other axis is left as empty air. Every
       drawing in the booklet is in a box wider than it is tall, so the height
       binds — and measuring the width alone said „scale 1.12, the type is fine”
       while the drawing was really at 0.55 and its vertices were 2.8px dots.
       That is why the same complaint kept coming back after it was „fixed”. */
    const scale = Math.min(shown.width / box.width, shown.height / box.height);
    if (!(scale > 0)) continue;
    /* A point marker scales with the drawing exactly as the type does. At half
       size a vertex is a 5px dot — „הקודקודים לא רואים בכלל”. Yesterday's fix
       measured the letters and forgot the marks. */
    for (const c of svg.querySelectorAll<SVGCircleElement>('circle')) {
      const baseR = Number(c.dataset['baseR'] ?? c.getAttribute('r') ?? 5);
      c.dataset['baseR'] = String(baseR);
      const grow = Math.min(MAX_DOT_GROWTH, Math.max(1, TARGET_DOT_PX / (baseR * scale)));
      c.setAttribute('r', String(Math.round(baseR * grow * 10) / 10));
      const baseRing = Number(c.dataset['baseRing'] ?? c.getAttribute('stroke-width') ?? 3.4);
      c.dataset['baseRing'] = String(baseRing);
      c.setAttribute('stroke-width', String(Math.round(baseRing * grow * 10) / 10));
    }
    for (const t of svg.querySelectorAll<SVGTextElement>('text')) {
      const base = Number(t.dataset['baseSize'] ?? t.getAttribute('font-size') ?? 13);
      t.dataset['baseSize'] = String(base);
      // never shrink type, and never grow it past what the margins can hold
      const grow = Math.min(MAX_GROWTH, Math.max(1, TARGET_TEXT_PX / (base * scale)));
      t.setAttribute('font-size', String(Math.round(base * grow * 10) / 10));
    }
    clearTheArrows(svg);
    clearTheMarks(svg);
    keepInside(svg);
  }
}

/* A label that lands on a vertex hides the very thing it names. The renderer
   places labels at a fixed offset and the axis numbers at a fixed distance, and
   both were tuned before the pass above grows the type — so on a small drawing
   they end up back on the dot. Measured here, after the letters are final.

   The label is pushed the SHORTEST way out, so a number under an axis slides
   further down and a letter beside a point slides further out, which is what a
   person would do by hand. Two passes, so a label moved off one dot does not
   settle on the next. */
function clearTheMarks(svg: SVGSVGElement): void {
  const texts = [...svg.querySelectorAll<SVGTextElement>('text')];
  /* The vertices AND the right-angle mark in the corner: a label on either one
     hides what it names. („התחלה” landed on the corner mark, but only where the
     Hebrew font is wide enough — which is why it showed up on CI and not here.) */
  const marks = [
    ...svg.querySelectorAll<SVGCircleElement>('circle'),
    ...[...svg.querySelectorAll<SVGPathElement>('path')].filter((p) => p.getAttribute('fill') === 'none'),
  ].filter((e) => !e.closest('defs')).map((e) => ({ box: e.getBBox(), pt: e.getAttribute('data-pt') }));
  if (!marks.length) return;
  const vb = svg.viewBox.baseVal;
  const GAP = 2.5;
  const hits = (a: DOMRect, b: DOMRect): boolean =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

  for (const t of texts) {
    const b = t.getBBox();
    const own = t.getAttribute('data-pt');
    const mine = marks.filter((m) => m.pt === null || m.pt !== own).map((m) => m.box);
    const on = mine.find((m) => hits(b, m));
    if (!on) continue;
    /* Every OTHER label is an obstacle too. Without that, a number pushed off a
       vertex lands on its neighbour, which is then pushed onto ITS neighbour —
       a whole axis of numbers walking into each other. A move that would create
       a new clash is rejected, and if no direction is clean the label stays put:
       a label slightly on a dot beats a cascade down the axis. */
    const others = texts.filter((o) => o !== t).map((o) => o.getBBox());
    const outs = [
      { dx: 0, dy: on.y + on.height - b.y + GAP },
      { dx: 0, dy: on.y - (b.y + b.height) - GAP },
      { dx: on.x + on.width - b.x + GAP, dy: 0 },
      { dx: on.x - (b.x + b.width) - GAP, dy: 0 },
    ].sort((p, q) => Math.abs(p.dx || p.dy) - Math.abs(q.dx || q.dy));

    for (const o of outs) {
      const moved = new DOMRect(b.x + o.dx, b.y + o.dy, b.width, b.height);
      if (moved.x < 1 || moved.y < 1) continue;
      if (moved.x + moved.width > vb.width - 1 || moved.y + moved.height > vb.height - 1) continue;
      if (mine.some((m) => hits(moved, m))) continue;
      if (others.some((o2) => hits(moved, o2))) continue;
      t.setAttribute('x', String(Number(t.getAttribute('x') ?? 0) + o.dx));
      t.setAttribute('y', String(Number(t.getAttribute('y') ?? 0) + o.dy));
      break;
    }
  }
}

/* „לא רואים טוב את המילים ציר איקס”. The axis name is placed at a fixed x, and
   then the pass above grows it — so on a small drawing it slides back over the
   arrowhead it was meant to sit past. A constant cannot fix that, because the
   width is only known after the type is sized. So measure it here, once the
   letters are their final size, and push the name clear of the arrow.

   Everything is in viewBox units: getBBox reports them directly, unscaled. */
function clearTheArrows(svg: SVGSVGElement): void {
  /* Both arrowheads are 10×10, so shape cannot tell them apart: the x arrow is
     simply the one furthest to the right. */
  const arrow = [...svg.querySelectorAll<SVGPathElement>('path')]
    .filter((p) => p.getAttribute('fill') !== 'none' && !p.closest('defs') && !p.closest('marker'))
    .map((p) => p.getBBox())
    .sort((a, b) => b.x - a.x)[0];
  if (!arrow) return;
  const GAP = 6;
  /* Only the axis NAME. A tick number must never be pushed sideways — the „8”
     on page 1 was shoved right, straight into the empty box where the learner
     writes „ציר x”. A number that clashes is moved DOWN, by the renderer, and
     that decision is not this pass's to make. */
  for (const t of svg.querySelectorAll<SVGTextElement>('text[data-axisname]')) {
    const base = Number(t.dataset['baseX'] ?? t.getAttribute('x') ?? 0);
    t.dataset['baseX'] = String(base);
    t.setAttribute('x', String(base));
    const b = t.getBBox();
    // only names that live out past the last gridline, and only ones that clash
    if (b.x > arrow.x + arrow.width || b.x + b.width < arrow.x) continue;
    if (b.y > arrow.y + arrow.height || b.y + b.height < arrow.y) continue;
    const shift = arrow.x + arrow.width + GAP - b.x;
    const moved = base + shift;
    // never push a name off the drawing; if it will not fit, leave it be
    if (moved + b.width / 2 <= svg.viewBox.baseVal.width - 2) t.setAttribute('x', String(Math.round(moved)));
  }
}

/* Last word: nothing may end up outside the drawing. A long axis name („נרשמים
   (עשרות)”) is centred on the axis, so how far it reaches depends on how wide
   the Hebrew font happens to be — it fits on one machine and hangs off the edge
   on another. Measured and pulled back in, so the answer does not depend on
   which font the reader has. */
function keepInside(svg: SVGSVGElement): void {
  const vb = svg.viewBox.baseVal;
  for (const t of svg.querySelectorAll<SVGTextElement>('text')) {
    const b = t.getBBox();
    const dx = b.x < 1 ? 1 - b.x : b.x + b.width > vb.width - 1 ? vb.width - 1 - (b.x + b.width) : 0;
    const dy = b.y < 1 ? 1 - b.y : b.y + b.height > vb.height - 1 ? vb.height - 1 - (b.y + b.height) : 0;
    if (dx) t.setAttribute('x', String(Number(t.getAttribute('x') ?? 0) + dx));
    if (dy) t.setAttribute('y', String(Number(t.getAttribute('y') ?? 0) + dy));
  }
}

/** Which anchor makes a label grow away from its dot, in whichever direction. */
function anchorFor(label: string, dx: number, atOrigin: boolean): 'start' | 'end' {
  const rtl = /[֐-׿]/.test(label);
  if (atOrigin) return rtl ? 'start' : 'end';   // the corner slot grows leftward
  return dx < 0 ? (rtl ? 'start' : 'end') : rtl ? 'end' : 'start';
}
