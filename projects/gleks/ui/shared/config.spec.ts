import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { GOG_CONFIG, provideGogConfig, resolveConfigured } from './config';

/** Reads GOG_CONFIG out of a child injector created with `providers`. */
function configIn(providers: unknown[], parent?: Injector) {
  const injector = Injector.create({
    providers: providers as never,
    parent: parent ?? TestBed.inject(Injector),
  });
  return runInInjectionContext(injector, () => injector.get(GOG_CONFIG));
}

describe('GOG_CONFIG', () => {
  it('resolves to an empty object when nothing provides it', () => {
    expect(TestBed.inject(GOG_CONFIG)).toEqual({});
  });

  it('applies a root-level provideGogConfig', () => {
    TestBed.configureTestingModule({
      providers: [provideGogConfig({ button: { debounce: 500 } })],
    });
    expect(TestBed.inject(GOG_CONFIG).button?.debounce).toBe(500);
  });

  describe('nested providers', () => {
    it('keeps sibling keys from the parent instead of replacing the whole object', () => {
      TestBed.configureTestingModule({
        providers: [provideGogConfig({ button: { debounce: 500 }, scroll: { hideDelay: 1000 } })],
      });

      const child = configIn([provideGogConfig({ tooltip: { showDelay: 0 } })]);

      // The regression this guards: before merging, a nested call dropped these silently.
      expect(child.button?.debounce).toBe(500);
      expect(child.scroll?.hideDelay).toBe(1000);
      expect(child.tooltip?.showDelay).toBe(0);
    });

    it('merges field by field within a component key, nearest provider winning', () => {
      TestBed.configureTestingModule({
        providers: [provideGogConfig({ tooltip: { showDelay: 300, position: 'top' } })],
      });

      const child = configIn([provideGogConfig({ tooltip: { showDelay: 0 } })]);

      expect(child.tooltip?.showDelay).toBe(0);
      expect(child.tooltip?.position).toBe('top');
    });

    it('layers through more than one level', () => {
      TestBed.configureTestingModule({
        providers: [provideGogConfig({ control: { size: 'sm' } })],
      });

      const middle = Injector.create({
        providers: [provideGogConfig({ control: { errorDisplay: 'auto' } })] as never,
        parent: TestBed.inject(Injector),
      });
      const leaf = configIn([provideGogConfig({ dropdown: { appendToBody: true } })], middle);

      expect(leaf.control?.size).toBe('sm');
      expect(leaf.control?.errorDisplay).toBe('auto');
      expect(leaf.dropdown?.appendToBody).toBe(true);
    });

    it('does not mutate the parent config object', () => {
      const parentConfig = { control: { size: 'sm' } as const };
      TestBed.configureTestingModule({ providers: [provideGogConfig(parentConfig)] });

      configIn([provideGogConfig({ control: { errorDisplay: 'auto' } })]);

      expect(TestBed.inject(GOG_CONFIG).control).toEqual({ size: 'sm' });
      expect(parentConfig.control).toEqual({ size: 'sm' });
    });
  });
});

describe('resolveConfigured', () => {
  it('prefers the instance value over both the config value and the fallback', () => {
    expect(resolveConfigured('lg', 'sm', 'md')).toBe('lg');
  });

  it('falls back to the configured value when the instance value is undefined', () => {
    expect(resolveConfigured(undefined, 'sm', 'md')).toBe('sm');
  });

  it('falls back to the component default when neither is set', () => {
    expect(resolveConfigured(undefined, undefined, 'md')).toBe('md');
  });

  it('treats a falsy-but-set instance value as set', () => {
    // The reason this is a helper rather than `||`: 0 and false are meaningful values for
    // `debounce`, `showDelay` and `appendToBody`.
    expect(resolveConfigured(0, 300, 500)).toBe(0);
    expect(resolveConfigured(false, true, true)).toBe(false);
  });
});
