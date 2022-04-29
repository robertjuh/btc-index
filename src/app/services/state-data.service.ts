import {Injectable} from "@angular/core";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {CoingeckoApiData} from "../models/interface/coingecko-api-data.interface";
import {TimeStampAndNumber} from "../models/interface/timestamp-and-number.interface";
import {FearGreedDataPoint} from "../models/interface/fear-greed-data-point.interface";
import {Subject} from "rxjs";
import {CompleteDataObject} from "../models/interface/complete-data-object.interface";
import {FearAndGreedName} from "../models/enum/fear-and-greed-name.enum";

@Injectable({
  providedIn: "root"
})
export class StateDataService {
  // coingecko returns hourly if user chosen less than 90 days
  public amountOfDaysExceedsNinety: boolean = false;

  public everyThingLoaded = new Subject<{ coinPrices: any; fearGreed: any; }>();
  public everyThingLoadedAndTransformed = new Subject<CompleteDataObject[]>();

  public btcPriceDataPrices: TimeStampAndNumber[];

  public loadedFearIndexes: FearGreedDataPoint[] = [];
  public loadedCoinPrices: TimeStampAndNumber[] = [];

  public loadedCompleteData: CompleteDataObject[] = [];

  public get lastFearIndex(): string {
    if (this.loadedCompleteData[0]) {
      return this.loadedCompleteData[0].fngValue ? this.loadedCompleteData[this.loadedCompleteData.length - 1].fngValue : undefined;
    }
  }

  public get lastFearIndexName(): FearAndGreedName {
    if (this.loadedCompleteData[0]) {
      return this.loadedCompleteData[0].fngValueName ? this.loadedCompleteData[this.loadedCompleteData.length - 1].fngValueName : undefined;
    }
  }

  private _btcPriceData: CoingeckoApiData;

  constructor(
    private _sanitizer: DomSanitizer
  ) {
  }

}
