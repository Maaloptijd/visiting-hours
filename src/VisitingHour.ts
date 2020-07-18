export class VisitingHour {
  private _date?: Date;

  private _hours?: number;

  private _minutes?: number;

  private _military?: string;

  private _formatted?: string;

  public constructor (private _timeValue: number) {}

  public get hours (): number {
    if (!this._hours) {
      this._hours = Math.floor(this._timeValue / 100);
    }

    return this._hours;
  }

  public get military (): string {
    if (!this._military) {
      this._military = `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}`;
    }

    return this._military;
  }

  public get minutes (): number {
    if (!this._minutes) {
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
    if (!this._formatted) {
      this._formatted = this.date.toLocaleTimeString();
    }

    return this._formatted;
  }
}
