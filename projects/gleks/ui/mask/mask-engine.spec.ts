import { caretAfterSlots, compileMask, conformMask, formatMask, isSlotAt } from './mask-engine';

const PHONE = '+38 (000) 000-00-00';

describe('mask engine', () => {
  const phone = compileMask(PHONE);

  describe('typing', () => {
    it('inserts literals as it goes, and shows one only once a slot after it is filled', () => {
      expect(conformMask(phone, '0').display).toBe('+38 (0');
      expect(conformMask(phone, '050').display).toBe('+38 (050');
      expect(conformMask(phone, '0501').display).toBe('+38 (050) 1');
      expect(conformMask(phone, '0501234567')).toEqual({
        display: '+38 (050) 123-45-67',
        raw: '0501234567',
        complete: true,
        slots: 10,
      });
    });

    it('accepts the literals themselves at their position, so re-conforming is stable', () => {
      const once = conformMask(phone, '0501234567').display;
      expect(conformMask(phone, once).display).toBe(once);
      expect(conformMask(phone, '+38 (050) 12').raw).toBe('05012');
    });

    it('drops a character a slot rejects, and stops at the end of the pattern', () => {
      expect(conformMask(phone, '05x0').raw).toBe('050');
      expect(conformMask(phone, '050123456789').raw).toBe('0501234567');
    });

    it('closes a gap left by a deletion, pulling the rest left', () => {
      // The 0 at index 6 deleted from "+38 (050) 12".
      expect(conformMask(phone, '+38 (05) 12').display).toBe('+38 (051) 2');
    });

    it('is empty and not complete for no input', () => {
      expect(conformMask(phone, '')).toEqual({ display: '', raw: '', complete: false, slots: 10 });
    });
  });

  describe('a raw value', () => {
    it('never reads a digit as a literal digit', () => {
      // Typed, "38" matches the "+38" prefix; raw, it is the first two slots.
      expect(conformMask(phone, '3812', true).display).toBe('+38 (381) 2');
      expect(conformMask(phone, '3812', false).raw).toBe('12');
    });

    it('formats for display without a control', () => {
      expect(formatMask('0501234567', PHONE)).toBe('+38 (050) 123-45-67');
      expect(formatMask('', PHONE)).toBe('');
    });
  });

  describe('slots', () => {
    it('has a digit, a letter and either, with an escape for a literal slot character', () => {
      const plate = compileMask('aa 0000 \\a*');
      expect(conformMask(plate, 'ab1234x9', true).display).toBe('ab 1234 ax');
      expect(conformMask(plate, 'ab 1234 a9', false).raw).toBe('ab12349');
      expect(conformMask(compileMask('aaa'), 'éßж').raw).toBe('éßж');
    });

    it('takes extra slot characters, and a stateful flag does not make them skip', () => {
      const hex = compileMask('HH:HH', { H: /[0-9a-f]/gi });
      expect(conformMask(hex, 'a0F1').display).toBe('a0:F1');
      expect(conformMask(hex, 'zz12').raw).toBe('12');
    });

    it('calls a mask numeric only when no slot can take a letter', () => {
      expect(phone.numeric).toBe(true);
      expect(compileMask('aa 0000').numeric).toBe(false);
      expect(compileMask('HH', { H: /[0-9a-f]/i }).numeric).toBe(false);
      expect(compileMask('DD', { D: /[0-9]/ }).numeric).toBe(true);
      expect(compileMask('---').numeric).toBe(false);
    });
  });

  describe('several patterns', () => {
    const card = compileMask(['0000 0000 0000 0000', '0000 0000 0000 0000 000']);

    it('uses the first with room, and is complete when one is filled exactly', () => {
      const sixteen = conformMask(card, '1234567812345678', true);
      expect([sixteen.display, sixteen.complete]).toEqual(['1234 5678 1234 5678', true]);
      const seventeen = conformMask(card, '12345678123456789', true);
      expect([seventeen.display, seventeen.complete, seventeen.slots]).toEqual([
        '1234 5678 1234 5678 9',
        false,
        19,
      ]);
    });

    it('does not reach for the longer pattern over a trailing literal', () => {
      expect(conformMask(card, '1234 5678 1234 5678 ').slots).toBe(16);
    });
  });

  describe('the caret', () => {
    it('lands after the same number of slot characters', () => {
      const display = '+38 (050) 123-45-67';
      expect(caretAfterSlots(phone, display, 0)).toBe(0);
      expect(caretAfterSlots(phone, display, 3)).toBe(8);
      expect(caretAfterSlots(phone, display, 4)).toBe(11);
      expect(caretAfterSlots(phone, display, 99)).toBe(display.length);
    });

    it('tells a slot character from a literal by position', () => {
      const display = '+38 (050) 1';
      expect([1, 4, 5, 8, 10].map((i) => isSlotAt(phone, display, i))).toEqual([
        false,
        false,
        true,
        false,
        true,
      ]);
    });
  });
});
