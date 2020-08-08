import { IndexInterface } from './IndexInterface';
import { SpecialIndexInterface } from './SpecialIndexInterface';

export interface HoursIndexConfigInterface {
  regularIndex?: IndexInterface;
  specialIndex?: SpecialIndexInterface;
}
