import type { VisitingHoursConfigInterface } from './Interface/VisitingHoursConfigInterface';
import type { DateInputInterface } from './Interface/DateInputInterface';
import type { LuxonShapeInterface } from './Interface/LuxonShapeInterface';
import type { HourMatchInterface } from './Interface/HourMatchInterface';
import type { HourMatchSetInterface } from './Interface/HourMatchSetInterface';
import type { HoursInterface } from './Interface/HoursInterface';
import { Timezone } from './Timezone';
import { Utils } from './Utils';
import { VisitingHour } from './VisitingHour';
import { HoursIndex } from './HoursIndex';
import { HoursQuery } from './HoursQuery';

export class VisitingHours {
  private zone?: string;

  private live: boolean;

  private lastTimeStamp: number | null = null;

  private lastMatch: HourMatchInterface | null = null;

  private validUntil = 0;

  private hoursIndex: HoursIndex;

  public constructor ({ regular, special, zone, live }: VisitingHoursConfigInterface) {
    this.hoursIndex = new HoursIndex({
      regularIndex: regular ? Utils.buildIndex(regular) : undefined,
      specialIndex: special ? Utils.buildSpecialIndex(special) : undefined
    });

    if (zone) this.zone = zone;

    this.live = !!live;
  }

  public isOpen (inputDate: UndeterminedDateInputType): HourMatchInterface {
    const date = this.getDateInput(inputDate);
    const cacheResult = this.checkCache(date);

    if (cacheResult) return cacheResult;

    const { hour, minute, month, day, zoneName, ts } = date;
    const zone = zoneName || this.zone;
    const key = +`${hour}${minute.toString().padStart(2, '0')}`;
    const { regularDate, specialDate, leapYearDate, postLeapYearDate } = this.hoursIndex.dateKeys(date);

    if (postLeapYearDate && month === 2 && day === 1 && date.isInLeapYear) {
      const result = this.hoursIndex.checkSpecialDay(new HoursQuery(key, postLeapYearDate, !this.live, zone, ts));

      if (typeof result !== 'undefined') return this.writeCache(result, date);
    }

    if (leapYearDate && ((month === 1 && day === 29) || (month === 2 && day === 1 && !date.isInLeapYear))) {
      const result = this.hoursIndex.checkSpecialDay(new HoursQuery(key, leapYearDate, !this.live, zone, ts));

      if (typeof result !== 'undefined') return this.writeCache(result, date);
    }

    if (specialDate) {
      const result = this.hoursIndex.checkSpecialDay(new HoursQuery(key, specialDate, !this.live, zone, ts));

      if (typeof result !== 'undefined') return this.writeCache(result, date);
    }

    return this.writeCache(this.hoursIndex.checkDay(new HoursQuery(key, regularDate, !this.live, zone, ts)), date);
  }

  /**
   * Returns all the remaining hour ranges for the provided date, included left-overs past midnight.
   */
  public getRemainingHours (inputDate: UndeterminedDateInputType): HourMatchSetInterface[] {
    const date = this.getDateInput(inputDate);
    const { hour, minute, month, day, zoneName, ts } = date;
    const zone = zoneName || this.zone;
    const key = +`${hour}${minute.toString().padStart(2, '0')}`;
    const { regularDate, specialDate, leapYearDate, postLeapYearDate } = this.hoursIndex.dateKeys(date);
    const allHours: HourMatchSetInterface[] = [];

    function addBase (forHours: HoursInterface[]) {
      let lowest = 2400;

      forHours.forEach(h => {
        const [o, c] = Utils.timeValues(h);

        // We only want future times here.
        if ((c < o ? c + 2400 : c) < key) return;

        allHours.push({ open: new VisitingHour({ timeValue: o > key ? o : key, relativeToTimestamp: ts, zone }), close: new VisitingHour({ timeValue: c, relativeToTimestamp: ts, zone })});

        if (o < lowest) lowest = o;
      });

      return lowest;
    }

    const lowest = addBase(specialDate?.raw ?? regularDate?.raw ?? []);

    // Lowest is already at midnight, so it really doesn't matter what else there is.
    if (lowest === 0) {
      return allHours;
    }

    function collect (hours: [number, number][]) {
      const hour = hours?.find(([o, c]) => o === 0 && c > key && c < lowest);

      if (hour) allHours.push({ open: new VisitingHour({ timeValue: key, relativeToTimestamp: ts, zone }), close: new VisitingHour({ timeValue: hour[1], relativeToTimestamp: ts, zone })});
    }

    // Now let's collect a range past midnight. It can only be one of these.
    if (postLeapYearDate?.pastMidnight && month === 2 && day === 1 && date.isInLeapYear) {
      collect(postLeapYearDate.hours);
    } else if (leapYearDate?.pastMidnight && ((month === 1 && day === 29) || (month === 2 && day === 1 && !date.isInLeapYear))) {
      collect(leapYearDate.hours);
    } else if (specialDate?.pastMidnight) {
      collect(specialDate.hours);
    } else if (regularDate?.pastMidnight) {
      collect(regularDate.hours);
    }

    return allHours.sort((a, b) => a.open.timeValue - b.open.timeValue);
  }

  private getDateInput (inputDate: UndeterminedDateInputType): DateInputInterface {
    const asLuxon = (inputDate as LuxonShapeInterface);

    return inputDate instanceof Date
      ? Utils.fromDate(inputDate, this.zone)
      : asLuxon.isLuxonDateTime ? Utils.fromLuxon(asLuxon) : inputDate as DateInputInterface;
  }

  private checkCache (input: DateInputInterface): HourMatchInterface | void {
    if (!this.live || !this.lastMatch || input.ts >= this.validUntil || (this?.lastTimeStamp ?? 0) > input.ts) return;

    return this.lastMatch;
  }

  private sourceDate (source: Date, zoneName?: string) {
    if (!zoneName || Intl.DateTimeFormat().resolvedOptions().timeZone === zoneName) {
      return { source, offset: 0 };
    }

    const inTZ = Timezone.utcToZonedTime(source, zoneName);

    return { source: inTZ, offset: source.getTime() - inTZ.getTime() };
  }

  // @todo see if we can use Timezone.fromTimeValues here
  private writeCache (hoursMatch: HourMatchInterface, input: DateInputInterface): HourMatchInterface {
    if (!this.live) return hoursMatch;

    const { open, match, soonest } = hoursMatch;
    const { source, offset } = this.sourceDate(new Date(input.ts), input.zoneName);
    const cache = open && match
      ? match.close
      : soonest instanceof VisitingHour ? soonest : null;

    source.setHours((cache?.hours ?? 0));
    source.setMinutes((cache?.minutes ?? 0));
    source.setSeconds(0);
    source.setMilliseconds(offset);

    if (!cache) source.setDate(source.getDate() + 1);

    this.lastTimeStamp = input.ts;
    this.validUntil = source.getTime();
    this.lastMatch = hoursMatch;

    return hoursMatch;
  }
}

export type UndeterminedDateInputType = Date | DateInputInterface | LuxonShapeInterface;
