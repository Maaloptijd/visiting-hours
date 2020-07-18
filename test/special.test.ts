import { VisitingHours } from '../src';
import regular from './resources/regularHours';

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
