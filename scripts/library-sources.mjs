/**
 * Where the library's source lives, for every script that scans it.
 *
 * **One list, because the layout has moved twice and each move blinded a check.** Until 21.13.0
 * everything was under `projects/gleks/ui/src/lib`. 21.13.0 moved shared code to `shared/`, beside
 * `src/`, and `check:layering` kept scanning a directory that no longer existed and passed on 29
 * units instead of 36. 21.14.0 moved `gog-table`, `gog-datepicker`/`gog-calendar` and `gog-dialog`
 * into their own entry-point directories (`docs/entry-points.md`, phase 2) — and ten scripts
 * had `src/lib` spelled out. A script that walks one of these lists learns the next directory the
 * day it is added here.
 *
 * A directory an entry point owns has to hold its own files — ng-packagr refuses a
 * `public-api.ts` that reaches into `src/` by relative path — so these are real directories rather
 * than aliases, and a scan that misses one misses those components entirely.
 */

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The published package's project directory. */
export const UI_ROOT = path.join(rootDir, 'projects/gleks/ui');

/** The root entry point's component, directive and service code. */
export const ROOT_LIB_DIR = path.join(UI_ROOT, 'src/lib');

/** `@guildofgleks/ui/shared` — internal, imported by every other entry point. */
export const SHARED_DIR = path.join(UI_ROOT, 'shared');

/**
 * Internal entry points nested in `shared/` — `@guildofgleks/ui/shared/date`, `/shared/dropdown`,
 * `/shared/virtual`. Split off the floor because an app shell imports `shared` eagerly, and the
 * Angular CLI places in the initial chunk whatever any lazy page uses of an eagerly reachable
 * module (`docs/component-entry-points.md`, iteration 2b). Discovered like the component entry
 * points: a directory in `shared/` holding an `ng-package.json`.
 */
export const SHARED_SUB_ENTRY_POINTS = readdirSync(SHARED_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(path.join(SHARED_DIR, name, 'ng-package.json')))
  .sort();

/**
 * The heavy units split out of the root so a lazy route can keep them out of an app's initial
 * bundle. The root does not export them and must never import one (`check:layering` rule D).
 */
export const HEAVY_ENTRY_POINTS = ['table', 'datepicker', 'dialog', 'scheduler'];

/**
 * One entry point per component, opt-in (`docs/component-entry-points.md`): `@guildofgleks/ui/icon`
 * and so on. The root re-exports every one of them, so a root import keeps working, and an app
 * that imports only subpaths gets them split by route.
 *
 * **Discovered, not listed** — any directory beside `src/` holding an `ng-package.json`, other than
 * `shared/` and the heavy units. The layout moved twice before and each move blinded a check whose
 * list nobody updated; a directory that is an entry point is now one here the day it is created.
 */
export const COMPONENT_ENTRY_POINTS = readdirSync(UI_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => name !== 'shared' && !HEAVY_ENTRY_POINTS.includes(name))
  .filter((name) => existsSync(path.join(UI_ROOT, name, 'ng-package.json')))
  .sort();

/** Every entry point whose code lives beside `src/` rather than in it, `shared` aside. */
export const SPLIT_ENTRY_POINTS = [...HEAVY_ENTRY_POINTS, ...COMPONENT_ENTRY_POINTS];

/** Each of those entry points' own directory, in the order above. */
export const SPLIT_DIRS = SPLIT_ENTRY_POINTS.map((name) => path.join(UI_ROOT, name));

/**
 * Every directory holding component code: the root's `src/lib` and each split entry point. Not
 * `shared/`, which several checks treat differently — add `SHARED_DIR` where it belongs.
 */
export const COMPONENT_SOURCE_DIRS = [ROOT_LIB_DIR, ...SPLIT_DIRS];

/** Everything above, `shared/` included. */
export const LIBRARY_SOURCE_DIRS = [ROOT_LIB_DIR, SHARED_DIR, ...SPLIT_DIRS];
