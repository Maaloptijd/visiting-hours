import type { IndexedHoursInterface } from './Interface/IndexedHoursInterface';
import { VisitingHour } from './VisitingHour';

export class HoursQuery {
  public skipSoonest = false;

  constructor (
    public key: number,
    public day?: IndexedHoursInterface | null,
    skipSoonest = false,
    public zone?: string,
    public relativeToTimestamp?: number
  ) {
    this.skipSoonest = skipSoonest || !day?.open;
  }

  public makeVisitingHour (timeValue: number | null, hours?: number, minutes?: number): VisitingHour {
    return new VisitingHour({ zone: this.zone, relativeToTimestamp: this.relativeToTimestamp, timeValue, hours, minutes });
  }
}
