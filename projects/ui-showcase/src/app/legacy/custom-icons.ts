/**
 * Icons this app adds to the library's built-in set, registered once in `app.config.ts` via
 * `provideGogIcons`. Any `gog-icon` — and any component that takes an icon *name* (`gog-tag`,
 * `gog-chip`, `gog-tabs`, `ToastService`, …) — can then ask for them by name, with no
 * `<ng-template>` at the use site.
 *
 * Sizing and colour are deliberately absent: `gog-icon`'s own stylesheet drives width, height
 * and stroke width from the `--gog-icon-*` tokens, and `currentColor` makes the glyph inherit
 * from wherever it sits. That is what makes a registered icon behave like a built-in.
 */
export const CUSTOM_ICONS: Readonly<Record<string, string>> = {
  cart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,

  rocket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,

  /** Deliberately shares a name with a built-in, to demonstrate that a registration wins. */
  copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16V6a2 2 0 0 1 2-2h10"/><rect width="14" height="14" x="6" y="6" rx="2"/></svg>`,
};
