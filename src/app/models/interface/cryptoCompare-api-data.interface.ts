import {CryptoCompareApiDataData} from "./cryptoCompare-api-data-data.interface";

export interface CryptoCompareApiData {
  Data: CryptoCompareApiDataData;
  HasWarning: boolean;
  Message: string;
  RateLimit: any;
  Response: string;
  Type: number;
}
