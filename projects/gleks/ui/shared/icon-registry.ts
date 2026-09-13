import { InjectionToken, Provider, inject } from '@angular/core';

/**
 * Icons an app has registered, keyed by the name `gog-icon` will be asked for. Resolves to `{}`
 * — only the built-ins are available — until a `provideGogIcons(...)` call fills it in.
 *
 * Values are raw `<svg>` markup, injected with `bypassSecurityTrustHtml` exactly like the
 * built-ins. See `provideGogIcons` for what that means for you.
 */
export const GOG_ICONS = new InjectionToken<Readonly<Record<string, string>>>('GOG_ICONS', {
  providedIn: 'root',
  factory: () => ({}),
});

/**
 * Registers icons by name, so `<gog-icon name="cart" />` works for glyphs the library does not
 * ship. This is the supported way to use your own icon set: the alternative — a `TemplateRef`
 * per instance through the `template` input — costs a `<ng-template>` at every use site and is
 * meant for one-offs, not for an icon set.
 *
 * ```ts
 * // app.config.ts
 * providers: [
 *   provideGogIcons({
 *     cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">…</svg>',
 *     user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">…</svg>',
 *   }),
 * ]
 * ```
 *
 * **A registered name overrides a built-in of the same name**, which is how you swap the
 * library's checkmark or chevron for your own without touching every component that renders one.
 *
 * **Providing this again further down the injector tree layers onto the parent's set** rather
 * than replacing it, matching `provideGogConfig`: a lazy feature can register the three icons
 * only it uses, and the app-wide set stays available inside it.
 *
 * ## What to put in the SVG
 *
 * Use `stroke="currentColor"` (or `fill="currentColor"`) and a `viewBox`, and leave the sizing
 * alone — `gog-icon`'s stylesheet drives width, height and stroke width from the
 * `--gog-icon-*` tokens, so an icon inherits size and colour from wherever it is used, the same
 * as a built-in.
 *
 * ## Security
 *
 * The markup is inserted with `DomSanitizer.bypassSecurityTrustHtml`, because Angular's HTML
 * sanitizer strips SVG and would leave you with nothing. That is safe for what this is for —
 * static icon markup you wrote or imported at build time — and unsafe for anything derived from
 * user input or fetched at runtime. **Never build a registered icon string from data you did
 * not author.** If you need remote icons, fetch them yourself, sanitize them with a real SVG
 * sanitizer, and register the result.
 */
export function provideGogIcons(icons: Readonly<Record<string, string>>): Provider {
  return {
    provide: GOG_ICONS,
    // skipSelf so this reads the *parent* injector's set rather than recursing into the provider
    // being defined here; optional because at the root there is no parent providing it.
    useFactory: () => ({
      ...(inject(GOG_ICONS, { skipSelf: true, optional: true }) ?? {}),
      ...icons,
    }),
  };
}
