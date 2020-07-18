export interface LuxonShapeInterface {
  isLuxonDateTime?: boolean;
  valueOf: () => number;
  month: number;
  offset: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
  isInLeapYear: boolean;
  zoneName: string;
}
