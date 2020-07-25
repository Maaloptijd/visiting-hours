import { VisitingHours, Utils } from '../src';
import regular from './resources/regularHours';
import { DateTime } from 'luxon';

describe('VisitingHours', () => {
  describe('Timezone hours', () => {
    test('Using luxon', () => {
      // The hours in the config were written in:
      const zone = 'America/New_York';

      // All of this has been set relative to the America/New_York timezone
      const hours = new VisitingHours({
        regular: {
          thursday: {
            hours: [
              { open: '10:00', close: '12:00' },
            ],
            isOpen: true
          },
        },
        special: [
          { date: '13/07', hours: [ { close: '20:00', open: '12:00' } ], isOpen: true },
          { date: '14/07', isOpen: false }
        ]
      });

      // First test if it's properly using luxon by checking a special date (the month would be off by 1 otherwise)
      // Monday July 13th. 18:30 in Europe/Amsterdam (12:30 in America/New_York).
      const specialOpened = DateTime.fromJSDate(new Date(2020, 6, 13, 18, 30)).setZone(zone);

      expect(hours.isOpen(specialOpened).open).toBeTruthy();

      // Monday July 13th. 16:30 in Europe/Amsterdam (10:30 in America/New_York).
      const specialClosed = DateTime.fromJSDate(new Date(2020, 6, 13, 16, 30)).setZone(zone);

      expect(hours.isOpen(specialClosed).open).toBeFalsy();

      // Monday July 13th. 16:30 in Europe/Amsterdam (10:30 in America/New_York).
      const specialDayClosed = DateTime.fromJSDate(new Date(2020, 6, 14, 16, 30)).setZone(zone);

      expect(hours.isOpen(specialDayClosed).open).toBeFalsy();

      // TZ has been set to Europe/Amsterdam in package.json already.
      // Test these hours pretending our local timezone is amsterdam...
      //  ... but we're checking hours in America/New_York.
      // Thursday July 16th. 15:40 in Europe/Amsterdam (9:40 in America/New_York).
      const localTimeClosed = DateTime.fromJSDate(new Date(2020, 6, 16, 15, 40)).setZone(zone);

      expect(hours.isOpen(localTimeClosed).open).toBeFalsy();

      // Thursday July 16th. 16:00 in Europe/Amsterdam (10:00 in America/New_York).
      const localTimeOpenExact = DateTime.fromJSDate(new Date(2020, 6, 16, 16)).setZone(zone);

      expect(hours.isOpen(localTimeOpenExact).open).toBeTruthy();

      // Thursday July 16th. 17:40 in Europe/Amsterdam (11:40 in America/New_York).
      const localTimeOpened = DateTime.fromJSDate(new Date(2020, 6, 16, 17, 40)).setZone(zone);

      expect(hours.isOpen(localTimeOpened).open).toBeTruthy();
      expect(hours.isOpen(new Date(2020, 6, 16, 17, 40)).open).toBeFalsy(); // Check if date object was detected

      // Thursday July 16th. 18:00 in Europe/Amsterdam (12:00 in America/New_York).
      const localTimeClosedExact = DateTime.fromJSDate(new Date(2020, 6, 16, 18)).setZone(zone);

      expect(hours.isOpen(localTimeClosedExact).open).toBeFalsy();
    });

    test('Using vanilla (requires IANA tz identifiers)', () => {
      // The hours in the config were written in:
      const zone = 'America/New_York';

      // All of this has been set relative to the America/New_York timezone
      const hours = new VisitingHours({
        regular: {
          thursday: {
            hours: [
              { open: '10:00', close: '12:00' },
            ],
            isOpen: true
          },
        },
      });

      // TZ has been set to Europe/Amsterdam in package.json already.
      // Test these hours pretending our local timezone is amsterdam...
      //  ... but we're checking hours in America/New_York.
      // Thursday July 16th. 15:40 in Europe/Amsterdam (9:40 in America/New_York).
      expect(hours.isOpen(Utils.fromDate(new Date(2020, 6, 16, 15, 40), zone)).open).toBeFalsy();

      // Thursday July 16th. 16:00 in Europe/Amsterdam (10:00 in America/New_York).

      expect(hours.isOpen(Utils.fromDate(new Date(2020, 6, 16, 16), zone)).open).toBeTruthy();

      // Thursday July 16th. 17:40 in Europe/Amsterdam (11:40 in America/New_York).
      expect(hours.isOpen(Utils.fromDate(new Date(2020, 6, 16, 17, 40), zone)).open).toBeTruthy();

      // Thursday July 16th. 18:00 in Europe/Amsterdam (12:00 in America/New_York).
      expect(hours.isOpen(Utils.fromDate(new Date(2020, 6, 16, 18), zone)).open).toBeFalsy();
    });

    test('Using vanilla through constructor (requires IANA tz identifiers)', () => {
      const hours = new VisitingHours({
        zone: 'America/New_York',
        regular: {
          thursday: {
            hours: [
              { open: '10:00', close: '12:00' },
            ],
            isOpen: true
          },
        },
      });

      // TZ has been set to Europe/Amsterdam in package.json already.
      // Test these hours pretending our local timezone is amsterdam...
      //  ... but we're checking hours in America/New_York.
      // Thursday July 16th. 15:40 in Europe/Amsterdam (9:40 in America/New_York).
      expect(hours.isOpen(new Date(2020, 6, 16, 15, 40)).open).toBeFalsy();

      // Thursday July 16th. 16:00 in Europe/Amsterdam (10:00 in America/New_York).

      expect(hours.isOpen(new Date(2020, 6, 16, 16)).open).toBeTruthy();

      // Thursday July 16th. 17:40 in Europe/Amsterdam (11:40 in America/New_York).
      expect(hours.isOpen(new Date(2020, 6, 16, 17, 40)).open).toBeTruthy();

      // Thursday July 16th. 18:00 in Europe/Amsterdam (12:00 in America/New_York).
      expect(hours.isOpen(new Date(2020, 6, 16, 18)).open).toBeFalsy();
    });

    test('properly handles live-caching when using a different timezone', () => {
      // The hours in the config were written in:
      const zone = 'America/New_York';

      // All of this has been set relative to the America/New_York timezone
      const hours = new VisitingHours({
        live: true,
        regular: {
          thursday: {
            hours: [
              { open: '10:00', close: '12:00' },
            ],
            isOpen: true
          },
        },
        special: [
          { date: '13/07', hours: [ { close: '20:00', open: '12:00' } ], isOpen: true },
          { date: '14/07', isOpen: false }
        ]
      });

      // First test if it's properly using luxon by checking a special date (the month would be off by 1 otherwise)
      // Monday July 13th. 18:30 in Europe/Amsterdam (12:30 in America/New_York) + 10 minutes
      const specialOpened = DateTime.fromJSDate(new Date(2020, 6, 13, 18, 30)).setZone(zone);
      const specialOpenedSame = DateTime.fromJSDate(new Date(2020, 6, 13, 18, 40)).setZone(zone);

      expect(hours.isOpen(specialOpened)).toBe(hours.isOpen(specialOpenedSame));
      expect(hours.isOpen(specialOpened).open).toBeTruthy();

      // Monday July 13th. 16:30 in Europe/Amsterdam (10:30 in America/New_York) + 10 minutes
      const specialClosed = DateTime.fromJSDate(new Date(2020, 6, 13, 16, 30)).setZone(zone);
      const specialClosedSame = DateTime.fromJSDate(new Date(2020, 6, 13, 16, 40)).setZone(zone);

      // Monday July 14th. 01:30 in Europe/Amsterdam (19:30 in America/New_York) + 10 minutes
      const specialOpenNew = DateTime.fromJSDate(new Date(2020, 6, 14, 1, 30)).setZone(zone);
      const specialOpenNewSame = DateTime.fromJSDate(new Date(2020, 6, 14, 1, 45)).setZone(zone);

      const specialClosedNew = DateTime.fromJSDate(new Date(2020, 6, 14, 2, 30)).setZone(zone);
      const specialClosedNewSame = DateTime.fromJSDate(new Date(2020, 6, 14, 2, 45)).setZone(zone);

      // Monday July 14th. 02:00 in Europe/Amsterdam (20:00 in America/New_York) + 10 minutes
      const specialClosedNewSameMidnight = DateTime.fromJSDate(new Date(2020, 6, 14, 5, 59, 59, 500)).setZone(zone);
      const specialClosedNewPastMidnight = DateTime.fromJSDate(new Date(2020, 6, 14, 6)).setZone(zone);

      expect(hours.isOpen(specialClosed)).toBe(hours.isOpen(specialClosedSame));
      expect(hours.isOpen(specialClosed).open).toBeFalsy();
      expect(hours.isOpen(specialClosedNewSameMidnight).open).toBeFalsy();
      expect(hours.isOpen(specialClosedNewPastMidnight).open).toBeFalsy();

      expect(hours.isOpen(specialClosedNewSameMidnight)).not.toBe(hours.isOpen(specialClosedNewPastMidnight));

      expect(hours.isOpen(specialOpenNew)).toBe(hours.isOpen(specialOpenNewSame));
      expect(hours.isOpen(specialClosedNew)).toBe(hours.isOpen(specialClosedNewSame));
      expect(hours.isOpen(specialClosedNew)).toBe(hours.isOpen(specialClosedNewSameMidnight));
    });
  });

  describe('Special hours', () => {
    test('override regular hours and set closed', () => {
      const specialHours = new VisitingHours({
        regular,
        special: [
          { date: '13/07', hours: [ { close: '20:00', open: '12:00' } ], isOpen: true },
          { date: '14/07', isOpen: false }
        ]
      });

      expect(specialHours.isOpen(new Date(2020, 6, 13, 11, 15)).open).toBeFalsy(); // Monday 13/07 at 11:15
      expect(specialHours.isOpen(new Date(2020, 6, 14, 11, 15)).open).toBeFalsy(); // Tuesday 14/07 at 11:15
      expect(specialHours.isOpen(new Date(2020, 6, 15, 11, 15)).open).toBeTruthy(); // Wednesday 15/07 at 11:15
      expect(specialHours.isOpen(new Date(2020, 6, 15, 23, 1)).open).toBeFalsy(); // Wednesday 15/07 at 23:01
    });

    test('override regular hours and set opened', () => {
      const specialHours = new VisitingHours({
        regular,
        special: [
          { date: '16/07', hours: [ { close: '20:00', open: '12:00' } ], isOpen: true },
        ]
      });

      expect(specialHours.isOpen(new Date(2020, 6, 16, 1, 15)).open).toBeFalsy(); // Thursday 01:15
      expect(specialHours.isOpen(new Date(2020, 6, 16, 10, 15)).open).toBeFalsy(); // Thursday 10:15
      expect(specialHours.isOpen(new Date(2020, 6, 16, 12, 15)).open).toBeTruthy(); // Thursday 12:15
      expect(specialHours.isOpen(new Date(2020, 6, 16, 13, 15)).open).toBeTruthy(); // Thursday 13:15
      expect(specialHours.isOpen(new Date(2020, 6, 16, 20, 15)).open).toBeFalsy(); // Thursday 20:15
    });

    test('override past midnight open/closed', () => {
      const specialHours = new VisitingHours({
        regular,
        special: [
          { date: '16/07', hours: [ { close: '02:00', open: '20:00' } ], isOpen: true },
        ]
      });

      expect(specialHours.isOpen(new Date(2020, 6, 16, 13, 15)).open).toBeFalsy(); // Thursday 13:15
      expect(specialHours.isOpen(new Date(2020, 6, 16, 20, 0)).open).toBeTruthy(); // Thursday 20:00
      expect(specialHours.isOpen(new Date(2020, 6, 16, 20, 15)).open).toBeTruthy(); // Thursday 20:15
      expect(specialHours.isOpen(new Date(2020, 6, 17, 1, 15)).open).toBeTruthy(); // Friday 01:15
      expect(specialHours.isOpen(new Date(2020, 6, 17, 2, 15)).open).toBeFalsy(); // Friday 02:15
    });

    test('override past midnight open/closed leap year', () => {
      const specialHours = new VisitingHours({
        regular,
        special: [
          { date: '28/02', hours: [ { close: '02:00', open: '22:00' } ], isOpen: true },
        ]
      });

      expect(specialHours.isOpen(new Date(2020, 1, 29, 1, 15)).open).toBeTruthy(); // Leap year, leap day. Past midnight.
      expect(specialHours.isOpen(new Date(2020, 1, 29, 2, 15)).open).toBeFalsy();
    });

    test('override past midnight leap year', () => {
      const specialHours = new VisitingHours({
        regular,
        special: [
          { date: '28/02', hours: [ { close: '03:00', open: '23:00' } ], isOpen: true },
          { date: '29/02', hours: [ { close: '02:00', open: '22:00' } ], isOpen: true },
        ]
      });

      expect(specialHours.isOpen(new Date(2020, 2, 1, 1, 15)).open).toBeTruthy(); // Leap year, leap day. Past midnight.
    });

    test('override past midnight leap day but not leap year', () => {
      const specialHours = new VisitingHours({
        regular,
        special: [
          { date: '29/02', hours: [ { close: '02:00', open: '22:00' } ], isOpen: true },
        ]
      });

      expect(specialHours.isOpen(new Date(2019, 2, 1, 1, 15)).open).toBeFalsy(); // Not a leap year, so pastMidnight of special won't affect this.
      expect(specialHours.isOpen(new Date(2020, 2, 1, 1, 15)).open).toBeTruthy(); // Leap year, pastMidnight will affect this.
    });

    test('override past midnight leap day but not leap year', () => {
      const specialHours = new VisitingHours({
        regular,
        special: [
          { date: '28/02', hours: [ { close: '02:00', open: '22:00' } ], isOpen: true },
        ]
      });

      expect(specialHours.isOpen(new Date(2019, 2, 1, 1, 15)).open).toBeTruthy(); // Not a leap year, so pastMidnight will affect because it's after the 28th
      expect(specialHours.isOpen(new Date(2020, 2, 1, 1, 15)).open).toBeFalsy();
    });

    test('caches for overrides; both hours and setting closed', () => {
      const specialHours = new VisitingHours({
        live: true,
        regular,
        special: [
          { date: '13/07', hours: [ { close: '20:00', open: '12:00' } ], isOpen: true },
          { date: '14/07', isOpen: false }
        ]
      });

      const h = [
        specialHours.isOpen(new Date(2020, 6, 13, 11, 15)), // 0. Closed
        specialHours.isOpen(new Date(2020, 6, 13, 11, 59)), // 1. Closed and same
        specialHours.isOpen(new Date(2020, 6, 13, 12)), // 2. Opened
        specialHours.isOpen(new Date(2020, 6, 13, 12, 5)), // 3. Opened and same
        specialHours.isOpen(new Date(2020, 6, 13, 19, 45)), // 4. Opened and same
        specialHours.isOpen(new Date(2020, 6, 13, 20)), // 5. Closed
        specialHours.isOpen(new Date(2020, 6, 13, 20, 15)), // 6. Closed and same
        specialHours.isOpen(new Date(2020, 6, 14, 2, 15)), // 7. Closed
        specialHours.isOpen(new Date(2020, 6, 14, 8)), // 8. Closed and same
        specialHours.isOpen(new Date(2020, 6, 14, 15, 15)), // 9. Closed and same
        specialHours.isOpen(new Date(2020, 6, 14, 23, 45)), // 10. Closed and same
        specialHours.isOpen(new Date(2020, 6, 14, 23, 59, 59)), // 11. Closed and same
        specialHours.isOpen(new Date(2020, 6, 15, 11, 15)), // 12. Opened
        specialHours.isOpen(new Date(2020, 6, 15, 12, 15)), // 13. Opened and same
        specialHours.isOpen(new Date(2020, 6, 15, 23, 1)), // 14. Closed
        specialHours.isOpen(new Date(2020, 6, 15, 23, 59, 59)), // 15. Closed and same
        specialHours.isOpen(new Date(2020, 6, 16)), // 16. Closed
        specialHours.isOpen(new Date(2020, 6, 17, 0, 0, 0, -1)), // 17. Closed and same
        specialHours.isOpen(new Date(2020, 6, 17)), // 18. Closed
        specialHours.isOpen(new Date(2020, 6, 17, 7, 59, 59)), // 19. Closed and same
        specialHours.isOpen(new Date(2020, 6, 17, 8, 15)), // 20. Opened
        specialHours.isOpen(new Date(2020, 6, 17, 17, 58)), // 21. Opened and same
      ];

      expect(h[0]).toBe(h[1]);
      expect(h[0]).not.toBe(h[2]); // Stuk
      expect(h[2]).toBe(h[3]);
      expect(h[2]).toBe(h[4]);
      expect(h[2]).not.toBe(h[5]);
      expect(h[5]).toBe(h[6]);
      expect(h[6]).not.toBe(h[7]);
      expect(h[7]).toBe(h[8]);
      expect(h[7]).toBe(h[9]);
      expect(h[7]).toBe(h[10]);
      expect(h[7]).toBe(h[11]);
      expect(h[7]).not.toBe(h[12]);
      expect(h[12]).toBe(h[13]);
      expect(h[12]).not.toBe(h[14]);
      expect(h[14]).toBe(h[15]);
      expect(h[14]).not.toBe(h[16]);
      expect(h[16]).toBe(h[17]);
      expect(h[16]).not.toBe(h[18]);
      expect(h[18]).toBe(h[19]);
      expect(h[18]).not.toBe(h[20]);
      expect(h[20]).toBe(h[21]);

      expect(h[0].open).toBeFalsy();
      expect(h[1].open).toBeFalsy();
      expect(h[2].open).toBeTruthy();
      expect(h[3].open).toBeTruthy();
      expect(h[4].open).toBeTruthy();
      expect(h[5].open).toBeFalsy();
      expect(h[6].open).toBeFalsy();
      expect(h[7].open).toBeFalsy();
      expect(h[8].open).toBeFalsy();
      expect(h[9].open).toBeFalsy();
      expect(h[10].open).toBeFalsy();
      expect(h[11].open).toBeFalsy();
      expect(h[12].open).toBeTruthy();
      expect(h[13].open).toBeTruthy();
      expect(h[14].open).toBeFalsy();
      expect(h[15].open).toBeFalsy();
      expect(h[16].open).toBeFalsy();
      expect(h[17].open).toBeFalsy();
      expect(h[18].open).toBeFalsy();
      expect(h[19].open).toBeFalsy();
      expect(h[20].open).toBeTruthy();
      expect(h[21].open).toBeTruthy();
    });
  });

  describe('Regular hours', () => {
    const hours = new VisitingHours({ regular });

    test('the basics', () => {
      const hours = new VisitingHours({
        regular: {
          sunday: { isOpen: false },
          monday: {
            hours: [
              { open: '08:00', close: '12:00' },

              // Had a really nice lunch break
              { open: '13:30', close: '20:00' },

              // Past midnight
              { open: '23:30', close: '03:30' },
            ],
            isOpen: true
          },
          friday: {
            hours: [
              { open: '08:00', close: '18:00' }
            ],
            isOpen: true
          },
        },
        special: [
          // This venue is down with Christmas.
          { date: '25/12', isOpen: false }
        ]
      });

      // Monday, July 13th of 2020 at 11:15, result: true
      expect(hours.isOpen(new Date(2020, 6, 13, 11, 15)).open).toBeTruthy();

      // Monday, July 13th of 2020 at 12:35, result: false
      expect(hours.isOpen(new Date(2020, 6, 13, 12, 35)).open).toBeFalsy();

      // Tuesday, July 14th of 2020 at 02:15, result: true
      expect(hours.isOpen(new Date(2020, 6, 14, 2, 15)).open).toBeTruthy();

      // Friday, July 17th of 2020 at 14:15, result: true
      expect(hours.isOpen(new Date(2020, 6, 17, 14, 15)).open).toBeTruthy();

      // Friday, December 25th of 2020 at 14:15, result: false
      expect(hours.isOpen(new Date(2020, 11, 25, 14, 15)).open).toBeFalsy();
    });

    test('is open during regular hours', () => {
      expect(hours.isOpen(new Date(2020, 6, 13, 12)).open).toBeTruthy(); // Monday, 12:00
    });

    test('is open at exactly the opening time', () => {
      expect(hours.isOpen(new Date(2020, 6, 13, 11, 15)).open).toBeTruthy(); // Monday, 11:15
    });

    test('is closed on normal closed times', () => {
      expect(hours.isOpen(new Date(2020, 6, 12, 12)).open).toBeFalsy(); // Sunday, 12:00
    });

    test('is closed right before opening time', () => {
      expect(hours.isOpen(new Date(2020, 6, 13, 11, 14, 59)).open).toBeFalsy(); // Monday, 11:14:59
    });

    test('is open right before midnight', () => {
      expect(hours.isOpen(new Date(2020, 6, 13, 23, 59, 59)).open).toBeTruthy(); // Monday, 23:59:59
    });

    test('is open past midnight', () => {
      expect(hours.isOpen(new Date(2020, 6, 14, 0, 30)).open).toBeTruthy(); // Tuesday 00:30
    });

    test('is open right past midnight', () => {
      expect(hours.isOpen(new Date(2020, 6, 14)).open).toBeTruthy(); // Tuesday 00:00
    });

    test('is closed right after midnight closing', () => {
      expect(hours.isOpen(new Date(2020, 6, 14, 1)).open).toBeFalsy(); // Tuesday 01:00
    });

    test('is closed after midnight closing', () => {
      expect(hours.isOpen(new Date(2020, 6, 14, 1, 15)).open).toBeFalsy(); // Tuesday 01:15
    });

    test('is closed when entire day is closed', () => {
      expect(hours.isOpen(new Date(2020, 6, 16, 1, 15)).open).toBeFalsy(); // Thursday 01:15
      expect(hours.isOpen(new Date(2020, 6, 16, 10, 15)).open).toBeFalsy(); // Thursday 10:15
      expect(hours.isOpen(new Date(2020, 6, 16, 12, 15)).open).toBeFalsy(); // Thursday 12:15
      expect(hours.isOpen(new Date(2020, 6, 16, 13, 15)).open).toBeFalsy(); // Thursday 13:15
      expect(hours.isOpen(new Date(2020, 6, 16, 20, 15)).open).toBeFalsy(); // Thursday 20:15
    });

    test('caches result as long as the date is in same range', () => {
      const hours = new VisitingHours({ live: true, regular });

      const firstResult = hours.isOpen(new Date(2020, 6, 13, 12));
      const secondResult = hours.isOpen(new Date(2020, 6, 13, 15, 35));
      const thirdResult = hours.isOpen(new Date(2020, 6, 14, 0, 55)); // Past-midnight, new match
      const fourthResult = hours.isOpen(new Date(2020, 6, 14, 0, 56));
      const fifthResult = hours.isOpen(new Date(2020, 6, 14, 1)); // Past opening hours, new non-match

      expect(firstResult.open).toBeTruthy();
      expect(secondResult.open).toBeTruthy();
      expect(thirdResult.open).toBeTruthy();
      expect(fourthResult.open).toBeTruthy();
      expect(fifthResult.open).toBeFalsy();

      expect(firstResult).toBe(secondResult);
      expect(firstResult).not.toBe(thirdResult);
      expect(thirdResult).toBe(fourthResult);
      expect(fourthResult).not.toBe(fifthResult);
    });

    test('caches results for the rest of the day when closed', () => {
      const hours = new VisitingHours({ live: true, regular });

      // Test Saturday, move on to Sunday (which is closed).
      const h = [
        hours.isOpen(new Date(2020, 6, 18, 7, 15)), // 0. Closed
        hours.isOpen(new Date(2020, 6, 18, 7, 59)), // 1. Closed and same
        hours.isOpen(new Date(2020, 6, 18, 8)), // 2. Open, different
        hours.isOpen(new Date(2020, 6, 18, 8, 1)), // 3. Open and same
        hours.isOpen(new Date(2020, 6, 18, 17, 22)), // 4. Open and same
        hours.isOpen(new Date(2020, 6, 18, 18, 15)), // 5. Closed and different
        hours.isOpen(new Date(2020, 6, 18, 22)), // 6. Closed and same
        hours.isOpen(new Date(2020, 6, 18, 23, 59)), // 7. Closed and same
        hours.isOpen(new Date(2020, 6, 19, 0, 10)), // 8. Closed but different (past midnight)
        hours.isOpen(new Date(2020, 6, 19, 0, 10)), // 9. Exact same time
      ];

      expect(h[0].open).toBeFalsy();
      expect(h[1].open).toBeFalsy();
      expect(h[2].open).toBeTruthy();
      expect(h[3].open).toBeTruthy();
      expect(h[4].open).toBeTruthy();
      expect(h[5].open).toBeFalsy();
      expect(h[6].open).toBeFalsy();
      expect(h[7].open).toBeFalsy();
      expect(h[8].open).toBeFalsy();

      expect(h[0]).toBe(h[1]);
      expect(h[1]).not.toBe(h[2]);
      expect(h[2]).toBe(h[3]);
      expect(h[2]).toBe(h[4]);
      expect(h[4]).not.toBe(h[5]);
      expect(h[5]).toBe(h[6]);
      expect(h[6]).toBe(h[7]);
      expect(h[7]).not.toBe(h[8]);
      expect(h[8]).toBe(h[9]);
    });
  });

  describe('Fetching hours', () => {
    test('it collects and merges all hours for date across three days', () => {
      const specialHours = new VisitingHours({
        regular: {
          tuesday: {
            isOpen: true,
            hours: [
              { open: '19:00', close: '23:00' },
              { open: '08:00', close: '18:00' },
              { open: '23:30', close: '03:30' },
            ],
          },
        },
        special: [
          { date: '03/08', hours: [ { close: '02:00', open: '12:00' } ], isOpen: true },
          { date: '05/08', isOpen: false } // Saturday, august 15th: { close: '18:00', open: '08:00' }
        ]
      });

      const now = new Date(2020, 7, 4, 1, 45);
      const asStrings = specialHours.getRemainingHours(now).map(({ open, close }) => ({ open: open.toString(), close: close.toString() }));
      const expected = [
        { open: '01:45', close: '02:00' },
        { open: '08:00', close: '18:00' },
        { open: '19:00', close: '23:00' },
        { open: '23:30', close: '03:30' }
      ];

      expect(asStrings).toEqual(expected);
    });

    test('it collects and merges all hours for date excluding past midnight', () => {
      const specialHours = new VisitingHours({
        regular: {
          tuesday: {
            isOpen: true,
            hours: [
              { open: '19:00', close: '23:00' },
              { open: '08:00', close: '18:00' },
              { open: '23:30', close: '03:30' },
            ],
          },
        },
        special: [
          { date: '03/08', hours: [ { close: '02:00', open: '12:00' } ], isOpen: true },
          { date: '05/08', isOpen: false } // Saturday, august 15th: { close: '18:00', open: '08:00' }
        ]
      });

      const now = new Date(2020, 7, 4, 2, 45);
      const asStrings = specialHours.getRemainingHours(now).map(({ open, close }) => ({ open: open.toString(), close: close.toString() }));
      const expected = [
        { open: '08:00', close: '18:00' },
        { open: '19:00', close: '23:00' },
        { open: '23:30', close: '03:30' }
      ];

      expect(asStrings).toEqual(expected);
    });

    test('it collects and merges all hours skipping the ones in the past', () => {
      const specialHours = new VisitingHours({
        regular: {
          tuesday: {
            isOpen: true,
            hours: [
              { open: '19:00', close: '23:00' },
              { open: '08:00', close: '18:00' },
              { open: '23:30', close: '03:30' },
            ],
          },
        },
        special: [
          { date: '03/08', hours: [ { close: '02:00', open: '12:00' } ], isOpen: true },
          { date: '05/08', isOpen: false } // Saturday, august 15th: { close: '18:00', open: '08:00' }
        ]
      });

      const now = new Date(2020, 7, 4, 19, 19);
      const asStrings = specialHours.getRemainingHours(now).map(({ open, close }) => ({ open: open.toString(), close: close.toString() }));
      const expected = [
        { open: '19:19', close: '23:00' },
        { open: '23:30', close: '03:30' }
      ];

      expect(asStrings).toEqual(expected);
    });

    test('Combines with range', () => {
      const specialHours = new VisitingHours({
        regular: {
          tuesday: {
            isOpen: true,
            hours: [
              { open: '19:00', close: '23:00' },
              { open: '08:00', close: '18:00' },
              { open: '23:30', close: '03:30' },
            ],
          },
        },
        special: [
          { date: '03/08', hours: [ { close: '02:00', open: '12:00' } ], isOpen: true },
          { date: '05/08', isOpen: false } // Saturday, august 15th: { close: '18:00', open: '08:00' }
        ]
      });

      const now = new Date(2020, 7, 4, 1, 45);
      const ranged = specialHours.getRemainingHours(now).reduce((acc, { open, close }) => {
        acc.push(...Utils.minuteInterval(open.military, close.military, 30));

        return acc;
      }, []);

      const expected = [
        '02:00',
        '08:00',
        '08:30',
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
        '18:00',
        '19:00',
        '19:30',
        '20:00',
        '20:30',
        '21:00',
        '21:30',
        '22:00',
        '22:30',
        '23:00',
        '23:30',
        '00:00',
        '00:30',
        '01:00',
        '01:30',
        '02:00',
        '02:30',
        '03:00',
        '03:30',
      ];

      expect(ranged.map(String)).toEqual(expected);
    });
  });
});
