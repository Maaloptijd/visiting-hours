import { RegularHoursInterface } from './RegularHoursInterface';
import { HoursDayInterface } from './HoursDayInterface';

export interface VisitingHoursConfigInterface {
  live?: boolean;
  zone?: string;
  regular?: RegularHoursInterface;
  special?: HoursDayInterface[];
}
