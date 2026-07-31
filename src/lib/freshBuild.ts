/* Make sure a device is not looking at yesterday's booklet.

   GitHub Pages serves index.html with `max-age=600` and the bundles under
   content-hashed names. A phone or a second computer that opened the site
   earlier can therefore keep an old index.html, load the old bundle it points
   at — which is still on the server — and show a booklet without the pages
   that were added since. Nothing looks broken; it is simply out of date, and
   that is exactly what Yaniv hit on another device.

   So: read index.html once, bypassing the cache, and compare the bundle it
   names with the bundle actually running. If they differ the page reloads,
   guarded by a session flag so a mismatch can never turn into a reload loop. */

const FLAG = 'reloaded-for-fresh-build';

export async function ensureFreshBuild(): Promise<void> {
  if (sessionStorage.getItem(FLAG)) return;

  const running = [...document.scripts]
    .map((s) => s.src.split('/').pop() ?? '')
    .find((name) => /^index-.+\.js$/.test(name));
  if (!running) return; // dev server: modules are not bundled

  try {
    const res = await fetch(`${import.meta.env.BASE_URL}?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const latest = /assets\/(index-[A-Za-z0-9_-]+\.js)/.exec(await res.text())?.[1];
    if (!latest || latest === running) return;

    sessionStorage.setItem(FLAG, '1');
    location.reload();
  } catch {
    // offline or blocked — keep showing what we have
  }
}
