import {Injectable} from "@angular/core";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {CoingeckoApiData} from "../models/interface/coingecko-api-data.interface";
import {TimeStampAndNumber} from "../models/interface/timestamp-and-number.interface";
import {FearGreedDataPoint} from "../models/interface/fear-greed-data-point.interface";
import {Subject} from "rxjs";
import {CompleteDataObject} from "../models/interface/complete-data-object.interface";
import {FearAndGreedName} from "../models/enum/fear-and-greed-name.enum";
import {CryptoCompareApiData} from "../models/interface/cryptoCompare-api-data.interface";
import {CryptoCompareApiDataPoint} from "../models/interface/cryptoCompare-api-data-point.interface";

@Injectable({
  providedIn: "root"
})
export class StateDataService {
  // coingecko returns hourly if user chosen less than 90 days
//  public amountOfDaysExceedsNinety: boolean = false;

  public everyThingLoaded = new Subject<{ coinPrices: CryptoCompareApiData; fearGreed: any; }>();
  public everyThingLoadedAndTransformed = new Subject<CompleteDataObject[]>();

  public btcPriceDataPrices: TimeStampAndNumber[];

  public loadedFearIndexes: FearGreedDataPoint[] = [];
  // public loadedCoinPrices: TimeStampAndNumber[] = [];
  public loadedCoinPrices: CryptoCompareApiDataPoint[] = [];

  public loadedCompleteData: CompleteDataObject[] = [];

  public get lastFearIndex(): string {
    if (this.loadedCompleteData[0]) {
      return this.loadedCompleteData[0].fngValue ? this.loadedCompleteData[this.loadedCompleteData.length - 1].fngValue : undefined;
    }
  }

  public get lastBtcPrice(): number {
    return this._lastBtcPrice;
  }

  public set lastBtcPrice(value: number) {
    this._lastBtcPrice = value;
  }

  public get lastFearIndexName(): FearAndGreedName {
    if (this.loadedCompleteData[0]) {
      return this.loadedCompleteData[0].fngValueName ? this.loadedCompleteData[this.loadedCompleteData.length - 1].fngValueName : undefined;
    }
  }

  private _btcPriceData: CoingeckoApiData;
  private _lastBtcPrice: number;


  constructor(
    private _sanitizer: DomSanitizer
  ) {
  }

  public setLastBTCPrice(data: CryptoCompareApiDataPoint[]): void {
    this.lastBtcPrice = data[data.length - 1].close;
  }
}
