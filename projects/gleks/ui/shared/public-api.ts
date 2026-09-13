/*
 * `@guildofgleks/ui/shared` -- the floor every other entry point stands on.
 *
 * An entry point of its own for one reason, measured in docs/entry-points.md: an
 * `InjectionToken` is one instance only if the file declaring it is compiled into one bundle, and
 * a file imported across entry points by relative path is compiled into every bundle that
 * reaches it. So `GOG_CONFIG` and everything beside it live here, and the root and every
 * secondary import them by package path.
 *
 * Whole modules are re-exported because this barrel is the package's internal plumbing, not a
 * consumer-facing API: `src/public-api.ts` names what the root publishes, one symbol at a time.
 */
export * from './checkable-control.config';
export * from './clearable-state';
export * from './config';
export * from './control-id';
export * from './deprecations';
export * from './dropdown-base';
export * from './dropdown-overlay';
export * from './dropdown-position';
export * from './error-state';
export * from './float-label-state';
export * from './icon-registry';
export * from './icons';
export * from './option-accessor';
export * from './overlay-direction';
export * from './overlay-theme';
export * from './ripple-state';
export * from './roving-focus';
export * from './token-names';
export * from './token-values';
export * from './tooltip-position';
export * from './types';
export * from './variable-window';
export * from './virtual-window';
