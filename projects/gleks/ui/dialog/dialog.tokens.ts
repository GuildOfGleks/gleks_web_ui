import { InjectionToken } from '@angular/core';

export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');
export interface DialogRef<TResult = unknown> {
  close(result?: TResult): void;
}

export const DIALOG_REF = new InjectionToken<DialogRef<unknown>>('DIALOG_REF');
