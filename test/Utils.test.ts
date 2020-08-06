import { Utils } from '../src';
import { VisitingHour } from '../src/VisitingHour';

describe('Utils', () => {
  describe('.minuteInterval()', () => {
    xtest('Creates a normal range', () => {
      const result = Utils.minuteInterval('08:01', '09:14', 15);

      expect(result[0]).toBeInstanceOf(VisitingHour);

      expect(result.map(String)).toEqual(['08:15', '08:30', '08:45', '09:00']);
    });

    xtest('Creates a range where startAt is part of range', () => {
      const result = Utils.minuteInterval('08:00', '09:14', 15).map(String);

      expect(result).toEqual(['08:00', '08:15', '08:30', '08:45', '09:00']);
    });

    xtest('Creates a range where endAt is part of range', () => {
      const result = Utils.minuteInterval('08:00', '09:15', 15).map(String);

      expect(result).toEqual(['08:00', '08:15', '08:30', '08:45', '09:00', '09:15']);
    });

    xtest('Creates a range where both values are exact range', () => {
      const result = Utils.minuteInterval('08:15', '09:30', 15).map(String);

      expect(result).toEqual(['08:15', '08:30', '08:45', '09:00', '09:15', '09:30']);
    });

    xtest('Uneven check with 30 minute interval', () => {
      const result = Utils.minuteInterval('08:15', '09:31', 30).map(String);

      expect(result).toEqual(['08:30', '09:00', '09:30']);
    });

    xtest('Exact check with 30 minute interval', () => {
      const result = Utils.minuteInterval('08:30', '10:00', 30).map(String);

      expect(result).toEqual(['08:30', '09:00', '09:30', '10:00']);
    });
  });
});
