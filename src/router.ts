/* Hash-based router — works on any static host (GitHub Pages included) with no
   server rewrites. Routes:
     #/                  the landing site — the tram film is its front page
     #/menu              everything you can do
     #/workbook/:n       single page viewer
     #/book              the digital flipbook — the way the booklet is READ
     #/print             continuous full booklet — the way the booklet PRINTS
   There is no chapter-list page: Yaniv asked for one contents page only, the
   coloured one that prints as the booklet's second sheet. Bare #/workbook and
   the legacy #/games both land on the flipbook, where that page lives.
*/
export interface RouteMatch {
  name: 'home' | 'menu' | 'page' | 'book' | 'print';
  params: Record<string, string>;
}

export function parseHash(hash: string): RouteMatch {
  const path = hash.replace(/^#/, '');
  const parts = path.split('/').filter(Boolean);
  const [head, sub] = parts;
  if (head === 'menu') return { name: 'menu', params: {} };
  if (head === 'workbook') return sub ? { name: 'page', params: { n: sub } } : { name: 'book', params: {} };
  if (head === 'book') return { name: 'book', params: {} };
  if (head === 'print') return { name: 'print', params: {} };
  if (head === 'games') return { name: 'book', params: {} };
  return { name: 'home', params: {} };
}

export const navigate = (to: string): void => {
  if (location.hash === to) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = to;
};

export function startRouter(onChange: (match: RouteMatch) => void): void {
  const handler = (): void => onChange(parseHash(location.hash));
  window.addEventListener('hashchange', handler);
  handler();
}
