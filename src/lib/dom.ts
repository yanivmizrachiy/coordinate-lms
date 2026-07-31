/* Tiny DOM helpers — keep view code declarative without a framework. */

type Child = Node | string | null | undefined | false;

export function elem<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Record<string, unknown>> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = String(v);
    else if (k === 'html') node.innerHTML = String(v);
    else if (k === 'text') node.textContent = String(v);
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    } else if (k === 'dataset' && typeof v === 'object') {
      Object.assign(node.dataset, v);
    } else {
      node.setAttribute(k, String(v));
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** Build a detached element tree from a trusted HTML string. */
export function fromHTML(htmlString: string): DocumentFragment {
  const tpl = document.createElement('template');
  tpl.innerHTML = htmlString.trim();
  return tpl.content;
}

export const clear = (node: Node): void => {
  while (node.firstChild) node.removeChild(node.firstChild);
};
