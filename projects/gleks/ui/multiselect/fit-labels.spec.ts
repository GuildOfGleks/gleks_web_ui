import { fitLabels } from './fit-labels';

/**
 * The trigger's one-line summary: which of the selected labels fit, and the `+N` for the rest.
 *
 * Tested as a pure function because jsdom measures no text — through the component this logic
 * is unreachable, which is how it stayed uncovered until 21.5.0's test-depth pass.
 *
 * The measurer here is deliberately crude — one unit per character — so every expectation below
 * can be read as "this many characters fit".
 */
const perCharacter = (text: string) => text.length;

describe('fitLabels', () => {
  it('keeps every label when they all fit', () => {
    expect(fitLabels(['aa', 'bb'], 100, perCharacter)).toEqual({ text: 'aa, bb', hidden: 0 });
  });

  it('stops at the last label that fits and reports the rest as hidden', () => {
    // 'alpha, bravo' is 12 wide, plus the ' +3' badge's 3 = 15; 'alpha, bravo, charlie' is 21.
    const result = fitLabels(['alpha', 'bravo', 'charlie'], 16, perCharacter);

    expect(result).toEqual({ text: 'alpha, bravo', hidden: 1 });
  });

  it('reserves room for the badge before it is needed, so adding it cannot overflow', () => {
    // Without the reservation 'alpha, bravo' (12) fits in 13 and the ' +3' would then not.
    const result = fitLabels(['alpha', 'bravo', 'charlie'], 13, perCharacter);

    expect(result).toEqual({ text: 'alpha', hidden: 2 });
  });

  it('spends the reserved room on the final label, since no badge follows it', () => {
    // 'aa, bb' is 6 and there is no third label to announce, so the full width is available.
    expect(fitLabels(['aa', 'bb'], 6, perCharacter)).toEqual({ text: 'aa, bb', hidden: 0 });
  });

  it('always shows one label, even when it cannot fit — CSS ellipsises it', () => {
    const result = fitLabels(['a-very-long-label', 'second'], 4, perCharacter);

    expect(result).toEqual({ text: 'a-very-long-label', hidden: 1 });
  });

  it('reserves nothing for a single selection', () => {
    expect(fitLabels(['only'], 4, perCharacter)).toEqual({ text: 'only', hidden: 0 });
  });

  it('counts the badge against the real number of labels, not the fitted ones', () => {
    // ' +5' is 3 wide: the reservation has to be sized for what the badge will actually say.
    const labels = ['aa', 'bb', 'cc', 'dd', 'ee'];
    const measured: string[] = [];
    fitLabels(labels, 20, (text) => {
      measured.push(text);
      return text.length;
    });

    expect(measured[0]).toBe(' +5');
  });

  it('survives a measurer that reports zero for everything', () => {
    // `measureWith` returns `() => 0` when the canvas context is unavailable; everything then
    // "fits", which is the right degradation — the trigger ellipsises instead of lying with +N.
    expect(fitLabels(['aa', 'bb', 'cc'], 1, () => 0)).toEqual({ text: 'aa, bb, cc', hidden: 0 });
  });
});
