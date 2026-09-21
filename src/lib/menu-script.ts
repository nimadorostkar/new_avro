/** A hash no element owns: closes a `:target` popup without scrolling the page. */
export const CLOSE_HASH = "#_";

/**
 * The only script on the menu page: Escape closes the open popup and, when one
 * opens, focus moves to its close button. Kept here so next.config.ts can hash
 * it for the Content-Security-Policy.
 */
export const MENU_SCRIPT = `addEventListener("keydown",e=>{if(e.key==="Escape"&&location.hash&&location.hash!=="${CLOSE_HASH}")location.hash="${CLOSE_HASH}"});addEventListener("hashchange",()=>document.querySelector(":target .lb-close")?.focus())`;
