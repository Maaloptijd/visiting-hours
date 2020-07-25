import { HoursInterface } from './HoursInterface';

export interface IndexedHoursInterface {
  hours: [number, number][];
  open: boolean;
  raw?: HoursInterface[];
  pastMidnight?: boolean;
}
