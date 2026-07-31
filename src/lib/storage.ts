/* localStorage wrapper — namespaced, defensive, and typed.
   Used only for simple local UI state: last page, menu/view preferences,
   and which practice items the learner ticked. */

const PREFIX = 'cfq:'; // coordinate-first-quadrant

export function readValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode); local state is non-essential */
  }
}

export const lastPage = {
  get: (): number => readValue<number>('lastPage', 1),
  set: (n: number): void => writeValue('lastPage', n),
};

/* How big the reader wants a sheet on screen: 'fit' shrinks it to the room the
   window has, a number is a fixed scale they chose. Remembered, because having
   to set it again on every page is exactly the discomfort it fixes. */
export const sheetZoom = {
  get: (): 'fit' | number => readValue<'fit' | number>('sheetZoom', 1),
  set: (z: 'fit' | number): void => writeValue('sheetZoom', z),
};
