import { gogResetUnnamedWarnings, gogWarnIfUnnamed } from './unnamed-warning';

describe('gogWarnIfUnnamed', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    gogResetUnnamedWarnings();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const element = (attrs: Record<string, string> = {}) => {
    const el = document.createElement('div');
    for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
    return el;
  };

  it('warns about an element with neither aria-label nor aria-labelledby', () => {
    gogWarnIfUnnamed(element(), 'gog-x', 'Name it.');
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0][0])).toContain('[gog-x] has no accessible name');
  });

  it('is quiet for an element named either way, and for a blank name it is not', () => {
    gogWarnIfUnnamed(element({ 'aria-label': 'Upload' }), 'gog-x', '');
    gogWarnIfUnnamed(element({ 'aria-labelledby': 'heading' }), 'gog-x', '');
    expect(warn).not.toHaveBeenCalled();
    gogWarnIfUnnamed(element({ 'aria-label': '  ' }), 'gog-x', '');
    expect(warn).toHaveBeenCalledOnce();
  });

  it('warns once per selector, not once per instance', () => {
    gogWarnIfUnnamed(element(), 'gog-x', '');
    gogWarnIfUnnamed(element(), 'gog-x', '');
    gogWarnIfUnnamed(element(), 'gog-y', '');
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
