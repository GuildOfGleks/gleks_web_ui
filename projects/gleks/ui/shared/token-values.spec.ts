import { resolveLengthToken, resolveNumberToken } from './token-values';

/**
 * These run in jsdom, which has no layout engine: `getComputedStyle` there returns the
 * *specified* string, so the probe path cannot resolve anything and correctly refuses to guess.
 * What is testable here is the fast path, the refusal, and the cleanup.
 *
 * **The probe actually resolving `calc()` is verified in a real browser** — see
 * `docs/backlog.md`'s entry on JS-parsed tokens for why this helper exists at all. A unit test
 * that asserted `calc(24px * 1)` resolves to 24 would fail in this environment for a reason that
 * has nothing to do with the code being right.
 */
describe('token-values', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => host.remove());

  it('should read a plain pixel token', () => {
    host.style.setProperty('--probe-size', '24px');
    expect(resolveLengthToken(host, '--probe-size', 32)).toBe(24);
  });

  it('should read a fractional pixel token', () => {
    host.style.setProperty('--probe-size', '7.5px');
    expect(resolveLengthToken(host, '--probe-size', 32)).toBe(7.5);
  });

  it('should fall back when the token is not declared', () => {
    expect(resolveLengthToken(host, '--probe-missing', 32)).toBe(32);
  });

  it('should fall back rather than mis-parse a value it cannot resolve here', () => {
    // parseFloat('calc(24px * 1)') is NaN and parseFloat('2em') is 2 — both wrong. Without a
    // layout engine the only correct answer is the fallback, and never the leading digits.
    host.style.setProperty('--probe-size', 'calc(24px * 1)');
    expect(resolveLengthToken(host, '--probe-size', 32)).toBe(32);

    host.style.setProperty('--probe-size', '2em');
    expect(resolveLengthToken(host, '--probe-size', 32)).toBe(32);
  });

  it('should read a plain numeric token', () => {
    host.style.setProperty('--probe-z', '300');
    expect(resolveNumberToken(host, '--probe-z', 7)).toBe(300);
  });

  it('should fall back on a numeric token it cannot resolve here', () => {
    host.style.setProperty('--probe-z', 'calc(300 + 5)');
    expect(resolveNumberToken(host, '--probe-z', 7)).toBe(7);
  });

  it('should leave no probe element behind', () => {
    host.style.setProperty('--probe-size', 'calc(8px * 2)');
    resolveLengthToken(host, '--probe-size', 32);
    host.style.setProperty('--probe-z', 'calc(1 + 1)');
    resolveNumberToken(host, '--probe-z', 7);
    expect(host.children.length).toBe(0);
  });
});
