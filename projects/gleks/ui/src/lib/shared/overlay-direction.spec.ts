import { scopedOverlayDirection } from './overlay-direction';

describe('scopedOverlayDirection', () => {
  let root: HTMLElement;

  beforeEach(() => {
    // Detached on purpose, like `overlay-theme.spec.ts`: `closest()` would otherwise walk past
    // this stub root into the real document and read whatever another spec file left there.
    root = document.createElement('html-stub');
  });

  /** `<root><scope?><trigger/></scope?></root>`, returning the trigger. */
  function tree(scopeDir: string | null): HTMLElement {
    const trigger = document.createElement('button');
    if (scopeDir === null) {
      root.appendChild(trigger);
    } else {
      const scope = document.createElement('div');
      scope.setAttribute('dir', scopeDir);
      scope.appendChild(trigger);
      root.appendChild(scope);
    }
    return trigger;
  }

  it('returns the direction of a scoped ancestor, so a portaled panel matches it', () => {
    expect(scopedOverlayDirection(tree('rtl'), root)).toBe('rtl');
  });

  it('returns an explicit ltr scope inside an rtl page', () => {
    expect(scopedOverlayDirection(tree('ltr'), root)).toBe('ltr');
  });

  it('returns the nearest scope when they nest', () => {
    const outer = document.createElement('div');
    outer.setAttribute('dir', 'rtl');
    const inner = document.createElement('div');
    inner.setAttribute('dir', 'ltr');
    const trigger = document.createElement('button');
    inner.appendChild(trigger);
    outer.appendChild(inner);
    root.appendChild(outer);

    expect(scopedOverlayDirection(trigger, root)).toBe('ltr');
  });

  it('returns null when the direction is on the document element — the overlay inherits it', () => {
    root.setAttribute('dir', 'rtl');
    expect(scopedOverlayDirection(tree(null), root)).toBeNull();
  });

  it('still returns a scope nested inside the document direction', () => {
    root.setAttribute('dir', 'rtl');
    expect(scopedOverlayDirection(tree('ltr'), root)).toBe('ltr');
  });

  it('returns null when nothing sets a direction', () => {
    expect(scopedOverlayDirection(tree(null), root)).toBeNull();
  });

  it('returns null without a trigger', () => {
    expect(scopedOverlayDirection(null, root)).toBeNull();
  });

  it('ignores a value that is not a direction', () => {
    // `dir="auto"` is valid HTML and means "let the browser decide from the content" — copying
    // it would freeze that decision to the panel's own text rather than the trigger's.
    expect(scopedOverlayDirection(tree('auto'), root)).toBeNull();
    expect(scopedOverlayDirection(tree('sideways'), root)).toBeNull();
  });
});
