import {Injectable} from "@angular/core";
import {forkJoin, Observable, Subject} from "rxjs";
import {CoingeckoApiData} from "../models/interface/coingecko-api-data.interface";
import {FearGreedDataPoint} from "../models/interface/fear-greed-data-point.interface";
import {HttpClient} from "@angular/common/http";
import {StartAndEndDate} from "../models/interface/start-and-end-date.interface";
import {getDayDiff} from "./utils";
import {StateDataService} from "./state-data.service";


/**
 * Service used for getting data from the backend
 */
@Injectable({
  providedIn: "root"
})
export class ApiConnectorService {
  public coingeckoApiDataLoaded = new Subject<CoingeckoApiData>();
  public fearGreedIndexDataLoaded = new Subject<FearGreedDataPoint[]>();
  public coingeckoTodayDataLoaded = new Subject<number>();


  constructor(
    public http: HttpClient,
    public dataService: StateDataService,
  ) {
  }

  // public fearGreadURL: string = "https://api.alternative.me/fng/?limit=231&date_format=world";

  public loadTodaysPrice(): void {
    const url: string = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=USD";
    const requestOptions: any = {
      method: "GET",
      redirect: "follow",
    };

    // TODO make type
    fetch(
      url,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        const coingeckoAPIResult: any = JSON.parse(result);

        if (coingeckoAPIResult.bitcoin?.usd) {
          this.coingeckoTodayDataLoaded.next(coingeckoAPIResult.bitcoin?.usd);
        }

      })
      .catch((error) => {
        console.log("error", error);
      });
  }


  public async loadAllPrices(coinGeckoUrl: string): Promise<void> {

    const requestOptions: any = {
      method: "GET",
      redirect: "follow",
    };

    // TODO make type
    fetch(
      coinGeckoUrl,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        const coingeckoAPIResult: CoingeckoApiData = JSON.parse(result);

        /*if (pricesResult?.prices.length) {
          this.pricesLoaded.next(pricesResult.prices);
        }
        */
        if (coingeckoAPIResult?.prices.length) {
          this.coingeckoApiDataLoaded.next(coingeckoAPIResult);
        }

      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  public async loadFearGreedIndex(fearGreadURL: string): Promise<void> {

    const requestOptions: any = {
      method: "GET",
      redirect: "follow",
      headers: {
        "Accept": "application/json"
      }
    };

    // TODO make type
    fetch(
      fearGreadURL,
      requestOptions
    )
      .then((response: Response) => {
        return response.text();
      })
      .then((result) => {
        // const fearGreedData: FearGreedDataPoint[] = JSON.parse(result) as FearGreedDataPoint[];
        const fearGreedData: any = JSON.parse(result);

        if (fearGreedData?.data) {
          // this.fearGreedIndexDataLoaded.next(fearGreedData.data.reverse());
        }

      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  public forkjoinLoadPrices(coinGeckoUrl: string): Observable<any> {
    return this.http.get(coinGeckoUrl);

  }

  public forkjoinLoadFearGreed(feargreedURL: string): Observable<any> {
    return this.http.get(feargreedURL);
  }

  public loadCollectionWithParams(stardAndEndDate: StartAndEndDate): void {
    // const unixTimeStart: number = new Date(stardAndEndDate.start).getTime() / 1000;
    const unixTimeStart: number = new Date(stardAndEndDate.startDate).getTime() / 1000;
    // const unixTimeStart: number = addDays(new Date(stardAndEndDate.startDate), 1).getTime() / 1000;
    const unixTimeEnd: number = new Date(stardAndEndDate.endDate).getTime() / 1000;

    // Dit rekent het verschil tussen de daterange uit
    const diffTime: number = Math.abs(stardAndEndDate.endDate.getTime() - stardAndEndDate.startDate.getTime());
    const diffDays: number = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      this.dataService.amountOfDaysExceedsNinety = true;
    } else {
      this.dataService.amountOfDaysExceedsNinety = false;
    }

    // Nu reken je het verschil tussen de stardate en vandaag, en dan pak je de eerste diffDays records
    const diffTimeBetweenStartAndToday: number = getDayDiff(new Date(stardAndEndDate.startDate), new Date());
    // const daysUntillNow: number = Math.ceil(diffTimeBetweenStartAndToday / (1000 * 60 * 60 * 24));


    // Default query
    // const coinGeckoUrl: string = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${unixTimeStart}&to=${unixTimeEnd}`;
    const coinGeckoUrl: string = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${Math.floor(unixTimeStart)}&to=${Math.floor(unixTimeEnd)}`;
    // const fearGreadURL: string = `https://api.alternative.me/fng/?limit=${diffTimeBetweenStartAndToday}&date_format=us`;
    const fearGreadURL: string = `https://api.alternative.me/fng/?limit=${diffTimeBetweenStartAndToday}&date_format=nl`;


    forkJoin({
      coinPrices: this.forkjoinLoadPrices(coinGeckoUrl),
      fearGreed: this.forkjoinLoadFearGreed(fearGreadURL)
    }).subscribe(
      (value: { coinPrices: any; fearGreed: any; }) => {
        if (value.coinPrices?.prices.length) {

          const tempArry: any[] = [];
          const tempy3 = [];

          // coingecko returns hourly instead of daily when requesting under 90 days;
          if (!this.dataService.amountOfDaysExceedsNinety) {
            value.coinPrices.prices.forEach((priceObj) => {
              const testDate = new Date(priceObj[0]);
              if (!tempArry.includes(testDate.toDateString()) &&
                new Date().toLocaleDateString() !== testDate.toLocaleDateString()) {
                tempArry.push(testDate.toDateString());
                tempy3.push(priceObj);
              }
            });
            value.coinPrices.prices = tempy3;
          }


          this.dataService.everyThingLoaded.next(value);
        } else {
          console.warn("something went wrong when loading the collections", value);
        }
      }
    );


    this.loadAllPrices(coinGeckoUrl);
    this.loadFearGreedIndex(fearGreadURL);
  }

}
