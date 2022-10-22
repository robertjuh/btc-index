import {CryptoCompareApiDataPoint} from "./cryptoCompare-api-data-point.interface";

export interface CryptoCompareApiDataData {
  Aggregated: boolean;
  Data: CryptoCompareApiDataPoint[];
  TimeFrom: number;
  TimeTo: number;
}
