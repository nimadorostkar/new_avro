/**
 * The burger and the full-screen menu it opens. On narrow screens this is the
 * only way to the primary links and the drink names. The panel is server-
 * rendered (hidden) next to the interface layer so the animated nav can never
 * become its containing block.
 */
export function mountMenu(root: HTMLElement): () => void {
  const trigger = root.querySelector<HTMLButtonElement>("[data-menu-open]");
  const panel = root.querySelector<HTMLElement>("[data-menu]");
  if (!trigger || !panel) return () => {};

  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    document.documentElement.classList.toggle("menu-open", open);
    if (open) panel.querySelector<HTMLElement>("a, button")?.focus();
    else trigger.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !panel.hidden) setOpen(false);
  };
  const onPanelClick = (e: MouseEvent) => {
    // links and drink shortcuts close the menu; the scroll itself is handled by the engine
    if ((e.target as Element).closest("a, [data-menu-close], [data-rail-item]")) setOpen(false);
  };
  const onOpen = () => setOpen(true);

  trigger.addEventListener("click", onOpen);
  panel.addEventListener("click", onPanelClick);
  window.addEventListener("keydown", onKey);
  return () => {
    trigger.removeEventListener("click", onOpen);
    panel.removeEventListener("click", onPanelClick);
    window.removeEventListener("keydown", onKey);
  };
}
