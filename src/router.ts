/* Hash-based router — works on any static host (GitHub Pages included) with no
   server rewrites. Routes:
     #/                  first-entry explanation: guest practice vs registration
     #/home              the rich learning/materials landing
     #/menu              everything you can do
     #/solutions         dynamic solutions (teacher-gated in the LMS)
     #/print-aids        printable coordinate-system aid sheets
     #/workbook/:n       single page viewer (the LMS practice layer lives here)
     #/book              the digital flipbook — the way the booklet is READ
     #/print             continuous full booklet — the way the booklet PRINTS
     #/login #/admin #/progress #/keys   the LMS screens
*/
export interface RouteMatch {
  name:
    | 'welcome'
    | 'home'
    | 'menu'
    | 'solutions'
    | 'page'
    | 'book'
    | 'print'
    | 'aids'
    | 'login'
    | 'admin'
    | 'progress'
    | 'keys';
  params: Record<string, string>;
}

export function parseHash(hash: string): RouteMatch {
  const path = hash.replace(/^#/, '');
  const parts = path.split('/').filter(Boolean);
  const [head, sub] = parts;

  if (!head) return { name: 'welcome', params: {} };
  if (head === 'home') return { name: 'home', params: {} };
  if (head === 'menu') return { name: 'menu', params: {} };
  if (head === 'solutions') return { name: 'solutions', params: {} };
  if (head === 'print-aids') return { name: 'aids', params: {} };
  if (head === 'login') return { name: 'login', params: {} };
  if (head === 'admin') return { name: 'admin', params: {} };
  if (head === 'progress') return { name: 'progress', params: {} };
  if (head === 'keys') return { name: 'keys', params: {} };
  if (head === 'workbook') {
    return sub
      ? { name: 'page', params: { n: sub } }
      : { name: 'book', params: {} };
  }
  if (head === 'book') return { name: 'book', params: {} };
  if (head === 'print') return { name: 'print', params: {} };
  if (head === 'games') return { name: 'book', params: {} };

  return { name: 'welcome', params: {} };
}

export const navigate = (to: string): void => {
  if (location.hash === to) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = to;
  }
};

export function startRouter(
  onChange: (match: RouteMatch) => void,
): void {
  const handler = (): void => onChange(parseHash(location.hash));
  window.addEventListener('hashchange', handler);
  handler();
}