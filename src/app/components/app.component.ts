import {AfterViewInit, Component, OnDestroy, OnInit} from "@angular/core";
import {ApiConnectorService} from "../services/api-connector.service";
import {StateDataService} from "../services/state-data.service";
import {MatDialog} from "@angular/material/dialog";
import {Subscription} from "rxjs";
import {CoingeckoApiData} from "../models/interface/coingecko-api-data.interface";
import {TimeStampAndNumber} from "../models/interface/timestamp-and-number.interface";
import {addDays, dayCheck, getColorForIndex} from "../services/utils";
import {MatOptionSelectionChange} from "@angular/material/core";
import {StartAndEndDate} from "../models/interface/start-and-end-date.interface";
import {Title} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {FearAndGreedName} from "../models/enum/fear-and-greed-name.enum";
import {FearGreedDataPoint} from "../models/interface/fear-greed-data-point.interface";

/*<button class="close-button" (click)="drawer.toggle()" mat-raised-button>
Close
</button>*/

@Component({
  selector: "app-root",
  template: `
    <mat-drawer-container class="sidenav-content-container" autosize>
      <mat-drawer #drawer class="drawer-content" mode="side">
        <div class="drawer-content-header">
          <h1 style="color: whitesmoke;" [textContent]="'Settings'"></h1>

          <button mat-icon-button color="" class="menu-burger-button sidebar-close-button" (click)="drawer.toggle()">
            <mat-icon>close</mat-icon>
          </button>

        </div>

        <sidebar-info-panel
          (dateRangeSelected)="handleDateRangeSelected($event)"
          (amountOfDaysToSHowSelectionChange)="handleAmountOfDaysToSHowSelectionChange($event)"
        ></sidebar-info-panel>
      </mat-drawer>


      <div class="main-container">


        <mat-toolbar>
          <button *ngIf="!drawer.opened" (click)="drawer.toggle()" mat-icon-button class="example-icon"
                  aria-label="Example icon-button with menu icon">
            <mat-icon>menu</mat-icon>
          </button>


          <div class="url-container" style="display:flex">
            <a [routerLink]="'chart'" [class.active]="isActive('/chart')">
              <h4>Chart</h4>
            </a>
            <a [routerLink]="'strategy'" [class.active]="isActive('/strategy')">
              <h3>Strategy</h3>
            </a>
          </div>

          <span class="fear-index-number-block-p" [style]="'color:' + currentFearLvlColor + ';'" [textContent]="currentFearLvl"></span>

        </mat-toolbar>


        <router-outlet></router-outlet>


        <div class="subtext-container">
          <p class="donation-paragraph">Powered by coingecko and alternative.me</p>
          <p class="donation-paragraph">Donate: 0xCE222EE6b59DdCE73B774AD76C0fc787E2Ea3528</p>
        </div>
      </div>


    </mat-drawer-container>



  `,
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  public title = "btc-index";

  public showContent = false;

  public get mainTitleStr(): string {
    return this._dataSvc.lastFearIndex ? "BTC Fear and greed index: " + this._dataSvc.lastFearIndex : "BTC Fear and greed index";
  }

  public get currentFearLvl(): string {
    return this._dataSvc.lastFearIndex;
  }

  public get currentFearLvlColor(): string {
    return getColorForIndex(this._dataSvc.lastFearIndexName);
  }

  private _ordersLoadedSub: Subscription;
  private _fearGreatDataIndexLoadedSub: Subscription;

  constructor(
    public apiConnector: ApiConnectorService,
    private _dialogRef: MatDialog,
    private _dataSvc: StateDataService,
    private _titleService: Title,
    private _router: Router
  ) {
  }

  ngOnInit(): void {
    this._loadCollection();

    // this._loadTitleIndexNr();
  }

  ngAfterViewInit(): void {
    if (!this._dataSvc.everyThingLoaded.observers?.length) {
      this._dataSvc.everyThingLoaded.subscribe((value: { coinPrices: CoingeckoApiData; fearGreed: any; }) => {


        this._dataSvc.loadedCoinPrices = value.coinPrices.prices;
        this._dataSvc.loadedFearIndexes = [...value.fearGreed.data];
        this._dataSvc.loadedFearIndexes.reverse();
        this._dataSvc.loadedCompleteData = [];


        let previousDate: Date;
        let lastKnownFearValue: string;
        let lastKnownFearValueStr: FearAndGreedName;
        this._dataSvc.loadedCoinPrices.forEach((fgObj: TimeStampAndNumber, index: number) => {
          // const englishDateStr: string = this._dataSvc.loadedFearIndexes[index].timestamp;
          // this._dataSvc.loadedFearIndexes[index].timestamp = convertDate(englishDateStr);


          const dateStrArr: string[] = this._dataSvc.loadedFearIndexes[index].timestamp.toString().split("-");

          // previousDate = new Date(this._dataSvc.loadedFearIndexes[index].timestamp);
          // @ts-ignore
          const today: Date = new Date(this._dataSvc.loadedFearIndexes[index].timestamp.toString().replaceAll("-", "/"));
          // const today: Date = new Date(parseInt(dateStrArr[2], 10), parseInt(dateStrArr[0], 10), parseInt(dateStrArr[1], 10));

          // const today: Date = new Date(this._dataSvc.loadedFearIndexes[index].timestamp);
          today.setHours(0, 0, 0, 0);


          if (previousDate) {


            const isConsecutiveDate: boolean = dayCheck([previousDate, today]);


            if (isConsecutiveDate) {

              lastKnownFearValue = this._dataSvc.loadedFearIndexes[index].value;
              lastKnownFearValueStr = this._dataSvc.loadedFearIndexes[index].value_classification;
              // wat je moet doen is de dayCheck functie aanroepen met een array met 2 dates
              // previousDate en current date.
              // dan iets van: this._dataSvc.loadedFearIndexes.splice(index - 1, 0, dummyDataObj);*/
              // probeer ff met lage dataset
              // 12 april 2018 tot 19 april 2018

              // Check if the next day is aanslutend op de previous
              // zo niet, blijf toevoegen

            } else {
              const dummyObj: FearGreedDataPoint = {
                value: lastKnownFearValue,
                value_classification: lastKnownFearValueStr, // TODO Je kan deze ook neutraal maken ofzo? dat ie dan zwart word
                // @ts-ignore
                timestamp: new Date(fgObj[0]).toLocaleDateString("en-us").replaceAll("/", "-")
              };
              console.log("-=-=-=-=");
              console.log("not a consecutive date:", today);
              console.log("previousdate was:", previousDate);
              this._dataSvc.loadedFearIndexes.splice(index, 0, dummyObj);

            }

          }

          // previousDate = new Date(fgObj.timestamp);

          // previousDate = new Date(this._dataSvc.loadedFearIndexes[index].timestamp);
          // @ts-ignore
          previousDate = new Date(this._dataSvc.loadedFearIndexes[index].timestamp.toString().replaceAll("-", "/"));

          // previousDate = new Date(parseInt(dateStrArr[2], 10), parseInt(dateStrArr[0], 10), parseInt(dateStrArr[1], 10));
          previousDate.setHours(0, 0, 0, 0);
        });


        /*this._dataSvc.loadedCoinPrices.forEach((fgObj: TimeStampAndNumber, index: number) => {
          const date1: Date = new Date(this._dataSvc.loadedFearIndexes[index].timestamp);
          date1.setHours(0, 0, 0, 0);
          const date2: Date = new Date(this._dataSvc.loadedFearIndexes[index].timestamp);
          date1.setHours(0, 0, 0, 0);

          if (previousDate) {
            if (fgObj.timeStamp) {

              // wat je moet doen is de dayCheck functie aanroepen met een array met 2 dates
              // previousDate en current date.
              // dan iets van: this._dataSvc.loadedFearIndexes.splice(index - 1, 0, dummyDataObj);*!/
              // probeer ff met lage dataset
              // 12 april 2018 tot 19 april 2018

              // Check if the next day is aanslutend op de previous
              // zo niet, blijf toevoegen

            }

          }

          previousDate = new Date(fgObj.timestamp);


        });*/


        // Check the feargreed dataset first and insert dummy data in missing datapoints
        this._dataSvc.loadedCoinPrices.forEach((coinPriceItem: TimeStampAndNumber, index: number) => {


          // insert hier wat shit in je loadedFearIndexes
          /*const dummyDataObj: FearGreedDataPoint = {
            value: "14",
            timestamp: date2.toLocaleDateString(),
            value_classification: FearAndGreedName.NullValue,
          };

          this._dataSvc.loadedFearIndexes.splice(index, 0, dummyDataObj);*/

        });
        console.log("na de modificatie", this._dataSvc.loadedFearIndexes);

        this._dataSvc.loadedCoinPrices.forEach((coinPriceItem: TimeStampAndNumber, index: number) => {
          if (!this._dataSvc.loadedFearIndexes[index]) {
            console.log("wat gebeurt er?");
          }

          // coinPriceItem.timeStamp = new Date(coinPriceItem.timeStamp).setTime(new Date(this._dataSvc.loadedFearIndexes[0].timestamp).getTime());

          const date1: Date = new Date(this._dataSvc.loadedFearIndexes[index].timestamp);
          date1.setHours(0, 0, 0, 0);
          const date2: Date = new Date(coinPriceItem[0]);
          date2.setHours(0, 0, 0, 0);

          // console.log("-=-");
          // console.log(date1);
          // console.log(date2);

          if (date1.getTime() !== date2.getTime()) {
            console.log("wtff");

            // Insert filler data when missing feargreedDatapoints
            /*            this._dataSvc.loadedCompleteData.push({
                          fngValueName: this._dataSvc.loadedFearIndexes[index].value_classification,
                          fngValue: this._dataSvc.loadedFearIndexes[index].value,
                          btcPrice: coinPriceItem[1],
                          date: new Date(coinPriceItem[0])
                        });*/
          } else {

          }

          if (!this._dataSvc.loadedFearIndexes[index]) {
            console.log("wow", coinPriceItem);
          }
          this._dataSvc.loadedCompleteData.push({
            fngValueName: this._dataSvc.loadedFearIndexes[index].value_classification,
            fngValue: this._dataSvc.loadedFearIndexes[index].value,
            btcPrice: coinPriceItem[1],
            date: new Date(coinPriceItem[0])
          });
        });

        console.log("ja alles compleet", this._dataSvc.loadedCompleteData);

        this._dataSvc.everyThingLoadedAndTransformed.next(this._dataSvc.loadedCompleteData);
      });
    }
  }

  ngOnDestroy(): void {
    // this._ordersLoadedSub.unsubscribe();
    // this._fearGreatDataIndexLoadedSub.unsubscribe();
  }

  public handleDateRangeSelected(event: StartAndEndDate): void {
    this.apiConnector.loadCollectionWithParams(event);
    // this._loadCollectionWithParams(event);
  }

  public isActive(routerStr: string): boolean {
    return (this._router.url !== "/") ? this._router.url === routerStr : (routerStr === "/chart");
  }

  public handleAmountOfDaysToSHowSelectionChange(event: MatOptionSelectionChange): void {
    if (event.isUserInput) {
      const today: Date = new Date();
      const determinedStartDate: Date = addDays(today, -(event.source.value + 1));

      const startAndEndDate: StartAndEndDate = {
        startDate: determinedStartDate,
        endDate: today,
      };

      this.apiConnector.loadCollectionWithParams(startAndEndDate);
    }
  }


  private _loadCollection(): void {
    const startDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const endDate: Date = new Date(new Date());

    this.handleDateRangeSelected({startDate, endDate});
  }

  /*  private _loadTitleIndexNr(): void {

      /!*this.apiConnector.*!/
      this._titleService.setTitle("Current FnG index: " + this._dataSvc.currentFearLevel);
    }*/
}
