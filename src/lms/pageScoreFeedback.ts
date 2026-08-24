import { pageScoreVoice } from './teacherVoice';

function pageNumberFromHash(): number {
  const match = location.hash.match(/^#\/workbook\/(\d+)/);
  const page = Number(match?.[1] ?? '1');
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function decorateScore(scoreNode: HTMLElement): void {
  if (scoreNode.dataset.pageFeedback === 'ready') return;

  const numberNode = scoreNode.querySelector<HTMLElement>('.lms-score__num');
  const score = Number(numberNode?.textContent?.trim() ?? '');
  if (!Number.isFinite(score)) return;

  const note = document.createElement('p');
  note.className = 'lms-score__teacher';
  note.textContent = pageScoreVoice(score, pageNumberFromHash());
  scoreNode.append(note);
  scoreNode.dataset.pageFeedback = 'ready';
}

function decorateAll(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.lms-score').forEach(decorateScore);
}

/**
 * Page score rendering is owned by the LMS engine. This tiny presentation hook
 * adds the teacher sentence after the engine has rendered a final score, while
 * all wording remains single-owned by teacherVoice.ts.
 */
export function installPageScoreFeedback(root: HTMLElement): () => void {
  decorateAll(root);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches('.lms-score')) decorateScore(node);
        decorateAll(node);
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}
