interface ChoiceBinding {
  observer: MutationObserver;
  radios: HTMLInputElement[];
  onChange: EventListener;
}

function selectedValue(radios: HTMLInputElement[]): string {
  return radios.find((radio) => radio.checked)?.value || '';
}

function syncFromProxy(
  proxy: HTMLElement,
  options: HTMLElement,
  radios: HTMLInputElement[],
): void {
  const value = (proxy.textContent || '').trim();

  for (const radio of radios) {
    radio.checked = value !== '' && radio.value === value;
    radio.disabled =
      proxy.dataset['lmsState'] === 'correct' ||
      proxy.dataset['lmsState'] === 'locked';
  }

  options.dataset['lmsState'] =
    proxy.dataset['lmsState'] || 'empty';
}

/**
 * Creates an LMS answer proxy for each existing true/false radio group.
 * Students keep using the original radio buttons; the proxy lets the generic
 * three-attempt and scoring engine persist, check and restore the selection.
 */
export function hydrateChoiceAnswerInputs(
  root: ParentNode,
): () => void {
  const bindings: ChoiceBinding[] = [];

  for (const row of root.querySelectorAll<HTMLElement>(
    '.tf-table tr[data-answer]',
  )) {
    const options = row.querySelector<HTMLElement>('.tf-options');
    const radios = Array.from(
      row.querySelectorAll<HTMLInputElement>(
        'input[type="radio"]',
      ),
    );

    if (!options || radios.length === 0) continue;
    if (options.dataset['lmsChoice'] === 'ready') continue;

    options.dataset['lmsChoice'] = 'ready';

    const expected = row.dataset['answer'];
    const proxy = document.createElement('span');
    proxy.className = 'blank lms-choice-proxy';
    proxy.setAttribute('aria-hidden', 'true');

    if (expected) {
      proxy.dataset['lmsAnswers'] = JSON.stringify([
        expected,
        expected === 'true' ? 'נכון' : 'לא נכון',
      ]);
    }

    options.insertAdjacentElement('afterend', proxy);

    const onChange: EventListener = () => {
      proxy.textContent = selectedValue(radios);
      proxy.dispatchEvent(
        new Event('input', { bubbles: true }),
      );
    };

    for (const radio of radios) {
      radio.addEventListener('change', onChange);
    }

    const observer = new MutationObserver(() => {
      syncFromProxy(proxy, options, radios);
    });

    observer.observe(proxy, {
      attributes: true,
      attributeFilter: ['data-lms-state'],
      childList: true,
      characterData: true,
      subtree: true,
    });

    syncFromProxy(proxy, options, radios);
    bindings.push({ observer, radios, onChange });
  }

  return () => {
    for (const binding of bindings) {
      binding.observer.disconnect();

      for (const radio of binding.radios) {
        radio.removeEventListener('change', binding.onChange);
      }
    }
  };
}
