import { gogScrolledOutOfView } from './scrolled-out-of-view';

/** jsdom lays nothing out, so every box is given by hand. */
function box(element: Element, top: number, height = 20, left = 0, width = 100): void {
  element.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + height,
      left,
      right: left + width,
      width,
      height,
    }) as DOMRect;
}

describe('gogScrolledOutOfView', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => root.remove());

  function anchorIn(parent: HTMLElement): HTMLElement {
    const anchor = document.createElement('button');
    parent.appendChild(anchor);
    return anchor;
  }

  it('is in view while any part of the anchor is inside the viewport', () => {
    const anchor = anchorIn(root);
    box(anchor, 100);
    expect(gogScrolledOutOfView(anchor)).toBe(false);

    box(anchor, -10);
    expect(gogScrolledOutOfView(anchor)).toBe(false);
  });

  it('is out of view once the anchor is entirely past an edge of the viewport', () => {
    const anchor = anchorIn(root);

    box(anchor, -20);
    expect(gogScrolledOutOfView(anchor)).toBe(true);

    box(anchor, window.innerHeight);
    expect(gogScrolledOutOfView(anchor)).toBe(true);

    box(anchor, 100, 20, window.innerWidth + 5);
    expect(gogScrolledOutOfView(anchor)).toBe(true);
  });

  it('is out of view once a clipping ancestor has scrolled it away', () => {
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    root.appendChild(scroller);
    box(scroller, 200, 100);
    const anchor = anchorIn(scroller);

    box(anchor, 250);
    expect(gogScrolledOutOfView(anchor)).toBe(false);

    // Still inside the viewport, but above the scroller's top edge.
    box(anchor, 170);
    expect(gogScrolledOutOfView(anchor)).toBe(true);
  });

  it('ignores an ancestor that clips only the other axis', () => {
    const strip = document.createElement('div');
    strip.style.overflowX = 'auto';
    strip.style.overflowY = 'visible';
    root.appendChild(strip);
    box(strip, 200, 100);
    const anchor = anchorIn(strip);

    box(anchor, 170);
    expect(gogScrolledOutOfView(anchor)).toBe(false);
  });

  it('cannot call an anchor with no box out of view', () => {
    const anchor = anchorIn(root);
    expect(gogScrolledOutOfView(anchor)).toBe(false);
  });
});
