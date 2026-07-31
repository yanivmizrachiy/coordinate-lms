export interface ViewContext {
  outlet: HTMLElement;
  setTitle: (t: string) => void;
}
export type View = (ctx: ViewContext) => (() => void) | void;
