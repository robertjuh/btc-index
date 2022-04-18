import {TimeStampAndNumber} from "./timestamp-and-number.interface";

export interface CoingeckoApiData {
  market_caps: TimeStampAndNumber[];
  // prices: TimeStampAndNumber[];
  prices: TimeStampAndNumber[];
  total_volumes: TimeStampAndNumber[];
}
