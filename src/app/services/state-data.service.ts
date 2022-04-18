import {Injectable} from "@angular/core";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {CoingeckoApiData} from "../models/interface/coingecko-api-data.interface";
import {TimeStampAndNumber} from "../models/interface/timestamp-and-number.interface";
import {FearGreedDataPoint} from "../models/interface/fear-greed-data-point.interface";
import {Subject} from "rxjs";
import {CompleteDataObject} from "../models/interface/complete-data-object.interface";

@Injectable({
  providedIn: "root"
})
export class StateDataService {
  public get btcPriceData(): CoingeckoApiData {
    return this._btcPriceData;
  }

  public set btcPriceData(value: CoingeckoApiData) {
    this._btcPriceData = value;
    this.btcPriceDataPrices = value.prices;
  }

  // coingecko returns hourly if user chosen less than 90 days
  public amountOfDaysExceedsNinety: boolean = false;

  public everyThingLoaded = new Subject<{ coinPrices: any; fearGreed: any; }>();

  public btcPriceDataPrices: TimeStampAndNumber[];

  public loadedFearIndexes: FearGreedDataPoint[] = [];
  public loadedCoinPrices: TimeStampAndNumber[] = [];

  public loadedCompleteData: CompleteDataObject[] = [];

  public get lastFearIndex(): FearGreedDataPoint {
    return this.loadedFearIndexes[0] ? this.loadedFearIndexes[this.loadedFearIndexes.length - 1] : undefined;
  }

  private _btcPriceData: CoingeckoApiData;

  constructor(
    private _sanitizer: DomSanitizer
  ) {
  }

}
