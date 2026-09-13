/*
 * `@guildofgleks/ui/dialog` -- `gog-dialog`, the confirmation dialog, `DialogService` and the dialog tokens.
 *
 * Its own entry point since 21.13.0, and since 21.14.0 the only place these are exported from: the
 * root stopped re-exporting them, which is what lets a lazy route that uses them keep them out of
 * an app's initial bundle. A root that re-exports a module drags it into every app that imports
 * anything from the root (docs/entry-points.md, Part 2, finding 2).
 *
 * The code here imports the rest of the library from `@guildofgleks/ui` and never the reverse --
 * `check:layering` rule D.
 */
export { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
export type { ConfirmDialogData } from './confirmation-dialog/confirmation-dialog.component';
export { DialogComponent } from './dialog.component';
export { DIALOG_DATA, DIALOG_REF } from './dialog.tokens';
export type { DialogRef } from './dialog.tokens';
export { DialogService } from './dialog.service';
export type { DialogConfig, DialogHandle, OpenDialog } from './dialog.service';
