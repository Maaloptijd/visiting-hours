import { VisitingHours } from '../src';
import regular from './resources/regularHours';

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
  });
});
