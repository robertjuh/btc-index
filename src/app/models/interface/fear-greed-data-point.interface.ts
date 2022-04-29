import {FearAndGreedName} from "../enum/fear-and-greed-name.enum";

export interface FearGreedDataPoint {
  value: string;
  value_classification: FearAndGreedName;
  timestamp: string;
  time_until_update?: string;
}
