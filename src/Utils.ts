import { RegularHoursInterface } from './Interface/RegularHoursInterface';
import { IndexInterface } from './Interface/IndexInterface';
import { HoursDayInterface } from './Interface/HoursDayInterface';
import { IndexedHoursInterface } from './Interface/IndexedHoursInterface';
import { SpecialIndexInterface } from './Interface/SpecialIndexInterface';
import { DateInputInterface } from './Interface/DateInputInterface';
import { LuxonShapeInterface } from './Interface/LuxonShapeInterface';
import { Timezone } from './Timezone';
import { VisitingHour } from './VisitingHour';

export class Utils {
  public static leapYearKey = '__leapYear';
  public static postLeapYearKey = '__postLeapYear';

  public static dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ];

  public static isLeapYear(date: Date): boolean {
    return new Date(date.getFullYear(), 1, 29).getDate() === 29;
  }

  public static dayNumber (name: string): number {
    return Utils.dayNames.indexOf(name);
  }

  public static dayName (index: number): string {
    return Utils.dayNames[index];
  }

  /**
   * Create an array of times between `startAt` and `endAt` with an interval of `interval` minutes.
   * Each entry in the array is a VisitingHour instance for easy manipulation.
   *
   *  Example: minuteInterval('07:55', '09:00', 15); // ['08:00', '08:15', '08:30', '08:45', '09:00']
   *
   * @param startAt
   * @param endAt
   * @param interval
   */
  public static minuteInterval (startAt: string, endAt: string, interval: number): VisitingHour[] {
    const [sh, sm] = startAt.split(':').map(Number);
    const [eh, em] = endAt.split(':').map(Number);
    const lastStep = (60 - interval);
    const trailing = sm % interval;
    const startMinute = sm > lastStep ? 0 : (sm - trailing) + (trailing ? interval : 0);
    const lastMinute = em - (em % interval);
    const startHour = sh + (sm > lastStep ? 1 : 0);
    const values = [];

    for (let i = startHour; i <= eh; i++) {
      for (let j = startHour === i ? startMinute : 0; j <= (i === eh ? lastMinute : lastStep); j += interval) {
        values.push(new VisitingHour(null, i, j));
      }
    }

    return values;
  }

  public static fromLuxon (date: LuxonShapeInterface): DateInputInterface {
    const { month, zoneName, offset, day, weekday, hour, minute, isInLeapYear } = date;

    return {
      month: month - 1,
      ts: date.valueOf(),
      offset: -offset,
      zoneName,
      weekday,
      isInLeapYear,
      day,
      hour,
      minute,
    };
  }

  public static fromDate (inputDate: Date, zone?: string): DateInputInterface {
    const date = typeof zone === 'string' ? Timezone.utcToZonedTime(inputDate, zone) : inputDate;

    return {
      zoneName: zone,
      get isInLeapYear () { return Utils.isLeapYear(date); },
      offset: date.getTimezoneOffset(),
      ts: date.getTime(),
      month: date.getMonth(),
      day: date.getDate(),
      weekday: date.getDay(),
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }

  public static dateName (date = new Date): string {
    return Utils.dayName(date.getDay());
  }

  public static nextDay(day: number): DayNumber {
    return (day + 1) % 7 as DayNumber;
  }

  public static buildSpecialIndex (special: HoursDayInterface[]): SpecialIndexInterface {
    return special.reduce((acc, specialHour) => {
      if (!specialHour.date) {
        throw new Error('Missing required date for special hours entry.');
      }

      const [d, month] = specialHour.date.split('/').map(Number);
      const m = month - 1;
      const key = `${d}/${m}`;

      acc[key] = Utils.makeDayIndex(specialHour, acc, acc[key], () => {
        const tomorrow = new Date(Date.UTC(1972, m, d + 1));
        const nextKey = `${tomorrow.getDate()}/${tomorrow.getMonth()}`;

        if (m === 1 && d === 28) return Utils.leapYearKey;
        if (m === 1 && d === 29) return Utils.postLeapYearKey;

        return nextKey;
      });

      return acc;
    }, {} as SpecialIndexInterface);
  }

  public static buildIndex (regular: RegularHoursInterface): IndexInterface {
    return Reflect.ownKeys(regular).reduce((index, key) => {
      const dayNumber = Utils.dayNumber(key as string);
      index[dayNumber] = Utils.makeDayIndex(regular[key as string], index, index[dayNumber], () => Utils.nextDay(dayNumber));

      return index;
    }, {} as IndexInterface);
  }

  private static makeDayIndex (
    day: HoursDayInterface,
    index: IndexInterface | SpecialIndexInterface,
    fallback: IndexedHoursInterface,
    nextKey: () => string | number
  ): IndexedHoursInterface {
    return {
      ...fallback,
      open: day.isOpen,
      hours: day.hours?.reduce((acc, { open, close }) => {
        const [o, c] = [+open.replace(':', ''), +close.replace(':', '')];

        if (o < c) {
          acc.push([o, c]);
        } else {
          const nextDay = nextKey();
          const nd = (index as {[key: string]: IndexedHoursInterface})[nextDay] as IndexedHoursInterface;

          (index as {[key: string]: IndexedHoursInterface})[nextDay] = { ...nd, hours: [[0, c], ...(nd?.hours ?? [])], pastMidnight: true };

          acc.push([o, 2400]);
        }

        return acc;
      }, fallback?.hours ?? []) ?? []
    };
  }
}

type DayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;
