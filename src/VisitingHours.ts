import { VisitingHoursConfigInterface } from './Interface/VisitingHoursConfigInterface';
import { Utils } from './Utils';
import { IndexInterface } from './Interface/IndexInterface';
import { SpecialIndexInterface } from './Interface/SpecialIndexInterface';
import { IndexedHoursInterface } from './Interface/IndexedHoursInterface';
import { DateInputInterface } from './Interface/DateInputInterface';
import { LuxonShapeInterface } from './Interface/LuxonShapeInterface';
import { VisitingHour } from './VisitingHour';
import { HourMatchInterface } from './Interface/HourMatchInterface';
import { Timezone } from './Timezone';

export class VisitingHours {
  private index?: IndexInterface;

  private specialIndex?: SpecialIndexInterface;

  private zone?: string;

  private live: boolean;

  private lastTimeStamp: number | null = null;

  private lastMatch: HourMatchInterface | null = null;

  private validUntil = 0;

  public constructor ({ regular, special, zone, live }: VisitingHoursConfigInterface) {
    if (regular) this.index = Utils.buildIndex(regular);
    if (special) this.specialIndex = Utils.buildSpecialIndex(special);
    if (zone) this.zone = zone;

    this.live = !!live;
  }

  public isOpen (inputDate: UndeterminedDateInputType): HourMatchInterface {
    const date = this.getDateInput(inputDate);
    const cacheResult = this.checkCache(date);

    if (cacheResult) return cacheResult;

    const { hour, minute, month, day } = date;
    const key = +`${hour}${minute.toString().padStart(2, '0')}`;
    const { regularDate, specialDate, leapYearDate, postLeapYearDate } = this.dateKeys(date);

    if (postLeapYearDate && month === 2 && day === 1 && date.isInLeapYear) {
      const result = this.checkSpecialDay(key, postLeapYearDate);

      if (typeof result !== 'undefined') return this.writeCache(result, date);
    }

    if (leapYearDate && ((month === 1 && day === 29) || (month === 2 && day === 1 && !date.isInLeapYear))) {
      const result = this.checkSpecialDay(key, leapYearDate);

      if (typeof result !== 'undefined') return this.writeCache(result, date);
    }

    if (specialDate) {
      const result = this.checkSpecialDay(key, specialDate);

      if (typeof result !== 'undefined') return this.writeCache(result, date);
    }

    return this.writeCache(this.checkDay(key, regularDate), date);
  }

  private getDateInput (inputDate: UndeterminedDateInputType): DateInputInterface {
    const asLuxon = (inputDate as LuxonShapeInterface);

    return inputDate instanceof Date
      ? Utils.fromDate(inputDate, this.zone)
      : asLuxon.isLuxonDateTime ? Utils.fromLuxon(asLuxon) : inputDate as DateInputInterface;
  }

  private dateKeys (date: DateInputInterface) {
    const { month, day, weekday } = date;

    return {
      specialDate: this.specialIndex?.[`${day}/${month}`] || null,
      leapYearDate: this.specialIndex?.[Utils.leapYearKey] || null,
      postLeapYearDate: this.specialIndex?.[Utils.postLeapYearKey] || null,
      regularDate: this.index?.[weekday]
    };
  }

  private checkSpecialDay(key: number, day: IndexedHoursInterface): HourMatchInterface | void {
    const dayResult = this.checkDay(key, day);

    if (dayResult) {
      return dayResult;
    }

    if (typeof day.open === 'boolean') {
      return this.makeHourResult();
    }
  }

  private checkDay (key: number, day?: IndexedHoursInterface): HourMatchInterface {
    if (!day?.open && !day?.pastMidnight) {
      return this.makeHourResult();
    }

    return this.findHour(day?.hours ?? [], key, !day.open);
  }

  private findHour(hours: IndexedHoursInterface['hours'] = [], x: number, skipSoonest = false): HourMatchInterface {
    // No need to check soonest, do fast lookup.
    if (!this.live || skipSoonest) {
      const open = hours?.find(([o, c]) => (x-o ^ x-c) < 0);

      return this.makeHourResult(open);
    }

    let soonest: number | null = null;

    for (const hour of hours) {
      const [o, c] = hour;

      // When open stop looking for soonest (because we don't care)
      if ((x-o ^ x-c) < 0) {
        return this.makeHourResult(hour);
      }

      // No match yet, keep track of soonest opening hours.
      if (o > x && (soonest === null || soonest > o)) soonest = o;
    }

    if (soonest === null) return this.makeHourResult();

    return this.makeHourResult(undefined, soonest);
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

  private writeCache (hoursMatch: HourMatchInterface, input: DateInputInterface): HourMatchInterface {
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

  private makeHourResult (hours?: [number, number], soonest?: number): HourMatchInterface {
    return {
      open: !!hours,
      soonest: soonest ? new VisitingHour(soonest) : null,
      match: hours ? { open: new VisitingHour(hours[0]), close: new VisitingHour(hours[1]) } : null,
    };
  }
}

export type UndeterminedDateInputType = Date | DateInputInterface | LuxonShapeInterface;
