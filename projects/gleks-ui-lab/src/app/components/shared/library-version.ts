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
