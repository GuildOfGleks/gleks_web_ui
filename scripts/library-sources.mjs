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
 * Entry points split out of the root so a lazy route can keep them out of an app's initial
 * bundle. The root must never import one (`check:layering` rule D).
 */
export const SPLIT_ENTRY_POINTS = ['table', 'datepicker', 'dialog'];

/** Each split entry point's own directory, in the order above. */
export const SPLIT_DIRS = SPLIT_ENTRY_POINTS.map((name) => path.join(UI_ROOT, name));

/**
 * Every directory holding component code: the root's `src/lib` and each split entry point. Not
 * `shared/`, which several checks treat differently — add `SHARED_DIR` where it belongs.
 */
export const COMPONENT_SOURCE_DIRS = [ROOT_LIB_DIR, ...SPLIT_DIRS];

/** Everything above, `shared/` included. */
export const LIBRARY_SOURCE_DIRS = [ROOT_LIB_DIR, SHARED_DIR, ...SPLIT_DIRS];
