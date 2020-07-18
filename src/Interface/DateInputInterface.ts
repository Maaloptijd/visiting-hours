export interface DateInputInterface {
  ts: number;
  offset: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  zoneName?: string;
  minute: number;
  isInLeapYear: boolean;
}
