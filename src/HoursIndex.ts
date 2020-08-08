import type { SpecialIndexInterface } from './Interface/SpecialIndexInterface';
import type { IndexedHoursInterface } from './Interface/IndexedHoursInterface';
import type { DateInputInterface } from './Interface/DateInputInterface';
import type { HourMatchInterface } from './Interface/HourMatchInterface';
import type { HoursIndexConfigInterface } from './Interface/HoursIndexConfigInterface';
import type { IndexInterface } from './Interface/IndexInterface';
import type { HoursQuery } from './HoursQuery';

import { Utils } from './Utils';

interface DateKeysInterface {
  specialDate: IndexedHoursInterface | null;
  leapYearDate: IndexedHoursInterface | null;
  postLeapYearDate: IndexedHoursInterface | null;
  regularDate: IndexedHoursInterface | null;
}

export class HoursIndex {
  private index?: IndexInterface;

  private specialIndex?: SpecialIndexInterface;

  public constructor ({ regularIndex, specialIndex }: HoursIndexConfigInterface) {
    if (regularIndex) this.index = regularIndex;
    if (specialIndex) this.specialIndex = specialIndex;
  }

  public dateKeys (date: DateInputInterface): DateKeysInterface {
    const { month, day, weekday } = date;

    return {
      specialDate: this.specialIndex?.[`${day}/${month}`] || null,
      leapYearDate: this.specialIndex?.[Utils.leapYearKey] || null,
      postLeapYearDate: this.specialIndex?.[Utils.postLeapYearKey] || null,
      regularDate: this.index?.[weekday] || null
    };
  }

  public checkSpecialDay(query: HoursQuery): HourMatchInterface | void {
    const dayResult = this.checkDay(query);

    if (dayResult) {
      return dayResult;
    }

    if (typeof query.day?.open === 'boolean') {
      return this.makeHourResult(query);
    }
  }

  public checkDay (query: HoursQuery): HourMatchInterface {
    const { day } = query;

    if (!day?.open && !day?.pastMidnight) {
      return this.makeHourResult(query);
    }

    return this.findHour(query);
  }

  private findHour(query: HoursQuery): HourMatchInterface {
    const { key, skipSoonest, day } = query;

    if (!day) return this.makeHourResult(query);

    // No need to check soonest, do fast lookup.
    if (skipSoonest) {
      const open = day.hours?.find(([o, c]) => (key-o ^ key-c) < 0);

      return this.makeHourResult(query, open);
    }

    let soonest: number | null = null;

    for (const hour of day.hours) {
      const [o, c] = hour;

      // When open stop looking for soonest (because we don't care)
      if ((key-o ^ key-c) < 0) {
        return this.makeHourResult(query, hour);
      }

      // No match yet, keep track of soonest opening hours.
      if (o > key && (soonest === null || soonest > o)) soonest = o;
    }

    if (soonest === null) return this.makeHourResult(query);

    return this.makeHourResult(query, undefined, soonest);
  }

  private makeHourResult (query: HoursQuery, hours?: [number, number], soonest?: number): HourMatchInterface {
    // fromTimeValues(hours, minut)
    return {
      open: !!hours,
      soonest: soonest ? query.makeVisitingHour(soonest) : null,
      match: hours ? { open: query.makeVisitingHour(hours[0]), close: query.makeVisitingHour(hours[1]) } : null,
    };
  }
}
