import { HoursInterface } from './HoursInterface';

export interface HoursDayInterface {
  date?: string;
  hours?: HoursInterface[];
  isOpen: boolean;
}
