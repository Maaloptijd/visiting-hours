import { VisitingHour } from '../VisitingHour';
import { HourMatchSetInterface } from './HourMatchSetInterface';

export interface HourMatchInterface {
  open: boolean;
  match: HourMatchSetInterface | null;
  soonest?: VisitingHour | null;
}
