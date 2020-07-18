import { VisitingHours, Utils } from '../src';
import { DateTime } from 'luxon';

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
