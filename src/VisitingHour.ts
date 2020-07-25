export class VisitingHour {
  private _date?: Date;

  private _hours?: number;

  private _minutes?: number;

  private _military?: string;

  private _formatted?: string;

  private _timeValue: number;

  public constructor (timeValue: number)
  public constructor (timeValue: null, hours: number, minutes: number)
  public constructor (timeValue?: number | null, hours?: number, minutes?: number) {
    if (typeof timeValue === 'number') {
      this._timeValue = timeValue;

      return;
    }

    if (typeof hours !== 'number' || typeof minutes !== 'number') {
      this._timeValue = 0;

      return;
    }

    this._hours = hours;
    this._minutes = minutes;
    this._timeValue = +`${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
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

  public get date (): Date {
    if (!this._date) {
      const fixedDate = new Date();

      fixedDate.setHours(this.hours);
      fixedDate.setMinutes(this.minutes);
      fixedDate.setSeconds(0);
      fixedDate.setMilliseconds(0);

      this._date = fixedDate;
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
