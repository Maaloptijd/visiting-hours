import { Timezone } from './Timezone';

export class VisitingHour {
  private _date?: Date;

  private _hours?: number;

  private _minutes?: number;

  private _military?: string;

  private _formatted?: string;

  private _timeValue: number;

  public zone?: string;

  public relativeToTimestamp?: number;

  public constructor ({ timeValue, hours, minutes, zone, relativeToTimestamp }: VisitingHourOptions) {
    if (typeof timeValue === 'number') {
      this._timeValue = timeValue;

      return;
    }

    if (typeof hours !== 'number' || typeof minutes !== 'number') {
      this._timeValue = 0;

      return;
    }

    this.relativeToTimestamp = relativeToTimestamp;
    this.zone = zone;
    this._hours = hours;
    this._minutes = minutes;
    this._timeValue = +`${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
  }

  public static withZone(zone?: string, timeValue?: number | null, hours?: number, minutes?: number): VisitingHour {
    // Forced typing because it's too flexible for TypeScript's liking.
    const visitingHour = new VisitingHour({ timeValue, hours, minutes });

    if (zone) visitingHour.setZone(zone);

    return visitingHour;
  }

  public get hours (): number {
    if (typeof this._hours !== 'number') {
      this._hours = Math.floor(this._timeValue / 100);
    }

    return this._hours;
  }

  public get military (): string {
    if (typeof this._military !== 'string') {
      this._military = `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}`;
    }

    return this._military;
  }

  public get minutes (): number {
    if (typeof this._minutes !== 'number') {
      this._minutes = this._timeValue % 100;
    }

    return this._minutes;
  }

  public setZone(zone: string): void {
    this.zone = zone;
  }

  public getZonedDate (zone: string, from: Date = new Date): Date {
    return Timezone.fromTimeValues(this.hours, this.minutes, zone, from);
  }

  public get date (): Date {
    if (!this._date) {
      this._date = Timezone.fromTimeValues(this.hours, this.minutes, this.zone, this.relativeToTimestamp ? new Date(this.relativeToTimestamp) : new Date());
    }

    return this._date;
  }

  public get formatted (): string {
    if (typeof this._formatted !== 'string') {
      this._formatted = this.date.toLocaleTimeString();
    }

    return this._formatted;
  }

  public get timeValue (): number {
    return this._timeValue;
  }

  public toString (): string {
    return this.military;
  }
}

interface VisitingHourOptions {
  relativeToTimestamp?: number;
  zone?: string;
  timeValue?: number | null;
  hours?: number;
  minutes?: number;
}
