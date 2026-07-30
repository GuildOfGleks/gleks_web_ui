import { signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { GogErrorDisplay, GogErrorState } from './error-state';

function fakeNgControl(touched: boolean, invalid: boolean): NgControl {
  return { control: { touched, invalid } } as unknown as NgControl;
}

describe('GogErrorState', () => {
  describe('manual (default)', () => {
    it('is visible exactly as long as errorMessage is non-empty', () => {
      const errorMessage = signal('');
      const state = new GogErrorState(errorMessage, signal<GogErrorDisplay>('manual'), null);

      expect(state.hasError()).toBe(false);

      errorMessage.set('Required');
      expect(state.hasError()).toBe(true);
      expect(state.visibleError()).toBe('Required');

      errorMessage.set('');
      expect(state.hasError()).toBe(false);
    });

    it('ignores control touched/invalid state even when a control is attached', () => {
      const errorMessage = signal('Required');
      const state = new GogErrorState(errorMessage, signal<GogErrorDisplay>('manual'), fakeNgControl(false, true));

      expect(state.hasError()).toBe(true);
    });
  });

  describe('auto', () => {
    it('falls back to manual when there is no attached control', () => {
      const errorMessage = signal('Required');
      const state = new GogErrorState(errorMessage, signal<GogErrorDisplay>('auto'), null);

      expect(state.hasError()).toBe(true);
    });

    it('stays hidden until the control is both touched and invalid', () => {
      const errorMessage = signal('Required');
      const ngControl = fakeNgControl(false, true);
      const state = new GogErrorState(errorMessage, signal<GogErrorDisplay>('auto'), ngControl);

      state.check();
      expect(state.hasError()).toBe(false);

      (ngControl.control as unknown as { touched: boolean }).touched = true;
      state.check();
      expect(state.hasError()).toBe(true);
      expect(state.visibleError()).toBe('Required');
    });

    it('hides again once the control becomes valid', () => {
      const errorMessage = signal('Required');
      const ngControl = fakeNgControl(true, true);
      const state = new GogErrorState(errorMessage, signal<GogErrorDisplay>('auto'), ngControl);

      state.check();
      expect(state.hasError()).toBe(true);

      (ngControl.control as unknown as { invalid: boolean }).invalid = false;
      state.check();
      expect(state.hasError()).toBe(false);
    });

    it('does nothing when the control has not been created yet', () => {
      const errorMessage = signal('Required');
      const ngControl = { control: null } as unknown as NgControl;
      const state = new GogErrorState(errorMessage, signal<GogErrorDisplay>('auto'), ngControl);

      state.check();
      expect(state.hasError()).toBe(false);
    });
  });
});
