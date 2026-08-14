import '../styles/lms-feedback.css';

/**
 * Legacy compatibility hook retained while the LMS answer layer is being
 * migrated. Despite the historical function name, canonical workbook targets
 * must never be hidden or declared "not required" in the computerized version.
 *
 * Every printable task remains present on screen. Tasks that need a different
 * computerized response mechanism are adapted explicitly by the digital
 * interaction layer while preserving the original mathematical objective.
 */
export function hideUngradedDigitalTargets(
  root: ParentNode,
  pageNumber: number,
): () => void {
  void root;
  void pageNumber;
  return () => {};
}
