/*
 * `@guildofgleks/ui/shared/date` -- internal: the date and time-zone helpers.
 *
 * Its own entry point rather than part of `@guildofgleks/ui/shared` because a module is placed in
 * an app's initial chunk whole-or-used: with `shared` imported eagerly (every app shell provides
 * `GOG_CONFIG`), whatever any lazy page used from it -- these helpers, for a datepicker on a
 * settings page -- was moved into the initial chunk with it (docs/component-entry-points.md,
 * iteration 2b). Nothing here declares an `InjectionToken`, so nothing here needs the single
 * instance `shared` exists to guarantee.
 *
 * Internal, like `shared`: the public subset is `@guildofgleks/ui/date`'s named list.
 */
export * from './date-utils';
export * from './time-zone';
