import { gogFromZonedTime, gogResolveTimeZone, gogToZonedTime } from './time-zone';

/** Local fields of a wall `Date`, so the assertions hold whatever zone the test runner is in. */
function fields(date: Date): number[] {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ];
}

describe('time zones', () => {
  describe('gogToZonedTime', () => {
    it('reads an instant on the zone clock', () => {
      const instant = new Date(Date.UTC(2026, 5, 10, 20, 0, 0));
      expect(fields(gogToZonedTime(instant, 'Asia/Tokyo'))).toEqual([2026, 6, 11, 5, 0, 0]);
      expect(fields(gogToZonedTime(instant, 'America/New_York'))).toEqual([2026, 6, 10, 16, 0, 0]);
      expect(fields(gogToZonedTime(instant, 'UTC'))).toEqual([2026, 6, 10, 20, 0, 0]);
    });

    it('handles a zone whose offset is not whole hours', () => {
      const instant = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
      expect(fields(gogToZonedTime(instant, 'Asia/Kolkata'))).toEqual([2026, 1, 1, 5, 30, 0]);
    });

    it('keeps the milliseconds', () => {
      const instant = new Date(Date.UTC(2026, 0, 1, 0, 0, 0, 250));
      expect(gogToZonedTime(instant, 'UTC').getMilliseconds()).toBe(250);
    });
  });

  describe('gogFromZonedTime', () => {
    it('gives the instant a wall time means in the zone', () => {
      const wall = new Date(2026, 2, 8, 9, 0, 0);
      expect(gogFromZonedTime(wall, 'America/New_York').toISOString()).toBe(
        '2026-03-08T13:00:00.000Z',
      );
      expect(gogFromZonedTime(wall, 'Asia/Tokyo').toISOString()).toBe('2026-03-08T00:00:00.000Z');
    });

    it('round-trips with gogToZonedTime', () => {
      const instant = new Date(Date.UTC(2026, 9, 18, 11, 22, 33, 444));
      for (const zone of ['UTC', 'Europe/Berlin', 'America/Los_Angeles', 'Asia/Kolkata']) {
        expect(gogFromZonedTime(gogToZonedTime(instant, zone), zone).getTime()).toBe(
          instant.getTime(),
        );
      }
    });

    it('moves a time the clocks skip forward by the length of the gap', () => {
      // New York springs forward at 02:00 on 8 March 2026; 02:30 never happens, 03:30 EDT does.
      const skipped = new Date(2026, 2, 8, 2, 30, 0);
      expect(gogFromZonedTime(skipped, 'America/New_York').toISOString()).toBe(
        '2026-03-08T07:30:00.000Z',
      );
    });

    it('takes the earlier of a time the clocks pass twice', () => {
      // New York falls back at 02:00 on 1 November 2026; 01:30 happens in EDT, then in EST.
      const repeated = new Date(2026, 10, 1, 1, 30, 0);
      expect(gogFromZonedTime(repeated, 'America/New_York').toISOString()).toBe(
        '2026-11-01T05:30:00.000Z',
      );
    });
  });

  describe('gogResolveTimeZone', () => {
    it('passes a known zone through and treats an empty one as the browser zone', () => {
      expect(gogResolveTimeZone('Europe/Berlin')).toBe('Europe/Berlin');
      expect(gogResolveTimeZone(undefined)).toBeNull();
      expect(gogResolveTimeZone('')).toBeNull();
    });

    it('falls back to the browser zone on an unknown name, warning once', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      expect(gogResolveTimeZone('Mars/Olympus_Mons')).toBeNull();
      expect(gogResolveTimeZone('Mars/Olympus_Mons')).toBeNull();
      expect(warn).toHaveBeenCalledOnce();
      expect(String(warn.mock.calls[0][0])).toContain('Mars/Olympus_Mons');
      warn.mockRestore();
    });
  });
});
