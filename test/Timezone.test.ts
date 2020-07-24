import { Timezone } from '../src/Timezone';

describe('Timezone', () => {
  describe('.utcToZonedTime()', () => {
    test('it creates a new Date in the right time', () => {
      const now = new Date(2020, 6, 24, 11, 35);
      const zonedBack = Timezone.utcToZonedTime(now, 'America/New_York'); // -4
      const zonedForward = Timezone.utcToZonedTime(now, 'Europe/Istanbul'); // +3

      expect(now.getTime() - zonedBack.getTime()).toEqual(6 * 60 * 60 * 1000); // 6 hours
      expect(zonedForward.getTime() - now.getTime()).toEqual(1 * 60 * 60 * 1000); // 1 hour
    });
  });

  describe('.fromTimeString()', () => {
    test('it creates a date instance that represents a time in the future', () => {
      const zone = 'Europe/Istanbul'; // +03:00
      const now = new Date(2020, 6, 24, 11, 45, 0, 0);
      const expectedTime = new Date(2020, 6, 24, 17, 45, 0, 0).getTime();
      const desired = Timezone.fromTimeString('18:45', zone, now);

      expect(desired.getTime()).toEqual(expectedTime);
    });

    test('it creates a date instance for a day later', () => {
      const zone = 'Europe/Istanbul'; // +03:00
      const now = new Date(2020, 6, 24, 11, 45, 0, 0);
      const expectedTime = new Date(2020, 6, 25, 1).getTime();
      const desired = Timezone.fromTimeString('02:00', zone, now);

      expect(desired.getTime()).toEqual(expectedTime);
    });
  });
});
