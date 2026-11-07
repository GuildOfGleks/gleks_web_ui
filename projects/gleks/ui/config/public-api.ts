/*
 * `@guildofgleks/ui/config` -- app-wide configuration: `provideGogConfig` and `GOG_CONFIG`, and the types shared across components. Opt-in; the root re-exports all of it
 * (docs/component-entry-points.md). The code lives in the internal `@guildofgleks/ui/shared`;
 * this list is what of it is public.
 */
export {
  GOG_CONFIG,
  GOG_DEPRECATIONS,
  provideGogConfig,
  resolveConfigured,
} from '@guildofgleks/ui/shared';
export type {
  GogDeprecation,
  GogDeprecationKind,
  GogFloatLabelVariant,
  GogGlobalConfig,
  GogOrientation,
  GogSeverity,
  GogSize,
  GogSurfaceVariant,
  GogVariant,
} from '@guildofgleks/ui/shared';
