import { scopedOverlayTheme } from './overlay-theme';

describe('scopedOverlayTheme', () => {
  let root: HTMLElement;
  let created: HTMLElement[];

  beforeEach(() => {
    // Deliberately not appended to `document.body`: `scopedOverlayTheme` walks up with
    // `closest()`, which would escape this stub root and find whatever `data-theme` another
    // spec file left on the real `documentElement`. Detached, the walk stops here — and the
    // function reads nothing that needs layout.
    root = document.createElement('html-stub');
    created = [root];
  });

  afterEach(() => {
    for (const el of created) el.remove();
  });

  /** `<root><scope?><trigger/></scope?></root>`, returning the trigger. */
  function tree(scopeTheme: string | null): HTMLElement {
    const trigger = document.createElement('button');
    if (scopeTheme === null) {
      root.appendChild(trigger);
    } else {
      const scope = document.createElement('div');
      scope.setAttribute('data-theme', scopeTheme);
      scope.appendChild(trigger);
      root.appendChild(scope);
    }
    return trigger;
  }

  it('returns the theme of a scoped ancestor, so an overlay opened inside it matches', () => {
    expect(scopedOverlayTheme(tree('slate'), root)).toBe('slate');
  });

  it('returns the nearest scope when they nest', () => {
    const outer = document.createElement('div');
    outer.setAttribute('data-theme', 'dark');
    const inner = document.createElement('div');
    inner.setAttribute('data-theme', 'one-light');
    const trigger = document.createElement('button');
    inner.appendChild(trigger);
    outer.appendChild(inner);
    root.appendChild(outer);

    expect(scopedOverlayTheme(trigger, root)).toBe('one-light');
  });

  describe('when the theme is on the document root', () => {
    beforeEach(() => root.setAttribute('data-theme', 'dark'));

    it('returns null, because the overlay already inherits it', () => {
      // Copying it would make the overlay match `theme.css`'s derived layer locally and
      // re-resolve every component token against the plain preset — discarding anything set on
      // the root that the preset does not itself declare.
      expect(scopedOverlayTheme(tree(null), root)).toBeNull();
    });

    it('still returns a scoped theme nested inside it', () => {
      expect(scopedOverlayTheme(tree('slate'), root)).toBe('slate');
    });
  });

  it('returns null when nothing is themed at all', () => {
    expect(scopedOverlayTheme(tree(null), root)).toBeNull();
  });

  it('returns null without a trigger', () => {
    expect(scopedOverlayTheme(null, root)).toBeNull();
  });

  it('passes an empty data-theme through unchanged, which callers treat as "no theme"', () => {
    // `getAttribute` gives `''` for a bare `data-theme`; both overlays guard with `if (theme)`,
    // so an empty string is falsy and nothing is copied.
    expect(scopedOverlayTheme(tree(''), root)).toBe('');
  });
});
