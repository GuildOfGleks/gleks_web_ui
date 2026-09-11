import packageJson from '@guildofgleks/ui/package.json';

/**
 * The version of `@guildofgleks/ui` this site was built against.
 *
 * The lab resolves the library from the **published** npm package (`tsconfig.app.json` clears
 * `paths` to force that), so the installed package's own `package.json` is the only honest
 * source — anything hand-written here would drift the moment the dependency is bumped and
 * nothing would fail. The package's `exports` map lists `./package.json`, which is what makes
 * this import resolvable.
 *
 * Every `since` marker on the site is read against this: an API row carrying a version higher
 * than this one would mean the site is describing something the reader cannot install.
 */
export const LIBRARY_VERSION: string = packageJson.version;

/** The package's page on npm, pinned to the exact version above. */
export const LIBRARY_NPM_URL = `https://www.npmjs.com/package/@guildofgleks/ui/v/${LIBRARY_VERSION}`;

/** `'21.4.1'` → `'21.4'`. */
function minor(version: string): string {
  return version.split('.').slice(0, 2).join('.');
}

/**
 * Whether `version` names the current release line — the test behind a `since` chip's filled
 * styling.
 *
 * Compared at major.minor, not exactly: a patch release adds no API, so `21.4.0`'s additions are
 * still "what's new" for someone who installed `21.4.1`. Comparing the full version would
 * un-highlight a whole feature set the moment a bug fix shipped.
 *
 * Lives here rather than in the badge component because **both** renderers of that chip need it —
 * `<app-since>` on the doc pages and the hand-written `<span class="since">` in
 * `public/docs/*.md`, which the markdown renderer marks up on its way out. Two copies of this
 * comparison is how the markdown half silently stopped being able to highlight anything.
 */
export function isLatestVersion(version: string): boolean {
  return minor(version) === minor(LIBRARY_VERSION);
}
