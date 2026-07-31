/* Hash router for the workbook and LMS screens. */
export interface RouteMatch {
  name:
    | 'home'
    | 'menu'
    | 'page'
    | 'book'
    | 'print'
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

  if (head === 'menu') return { name: 'menu', params: {} };
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

  return { name: 'home', params: {} };
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
