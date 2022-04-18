import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ApiConnectorService} from "../services/api-connector.service";
import {StateDataService} from "../services/state-data.service";
import {MatDialog} from "@angular/material/dialog";
import {Subscription} from "rxjs";
import {CoingeckoApiData} from "../models/interface/coingecko-api-data.interface";
import {TimeStampAndNumber} from "../models/interface/timestamp-and-number.interface";
import {addDays, getColorForIndex} from "../services/utils";
import {MatOptionSelectionChange} from "@angular/material/core";
import {StartAndEndDate} from "../models/interface/start-and-end-date.interface";
import {Title} from "@angular/platform-browser";
import {Router} from "@angular/router";

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


        <!--
                <h1 [textContent]="mainTitleStr" class="main-title"></h1>
        -->
        <!--        <button [class.invisibleButton]="drawer.opened" mat-icon-button color="accent" class="menu-burger-button open-menu-button" (click)="drawer.toggle()">
                  <mat-icon>menu</mat-icon>
                </button>-->


        <!--        <button class="settings-button" (click)="drawer.toggle()" mat-raised-button>
                  Settings
                </button>-->


        <router-outlet></router-outlet>


        <!--<main-chart
          [btcPriceData]="btcPriceData"
        ></main-chart>-->
        <div class="subtext-container">
          <p class="donation-paragraph">Powered by coingecko and alternative.me</p>
          <p class="donation-paragraph">Donate: 0xCE222EE6b59DdCE73B774AD76C0fc787E2Ea3528</p>
        </div>
      </div>


    </mat-drawer-container>



  `,
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy {
  public title = "btc-index";

  public showContent = false;

  public get btcPriceData(): CoingeckoApiData {
    return this._dataSvc.btcPriceData;
  }

  public get mainTitleStr(): string {
    return this._dataSvc.lastFearIndex?.value ? "BTC Fear and greed index: " + this._dataSvc.lastFearIndex.value : "BTC Fear and greed index";
  }

  public get currentFearLvl(): string {
    return this._dataSvc.lastFearIndex?.value;
  }

  public get currentFearLvlColor(): string {
    return getColorForIndex(this._dataSvc.lastFearIndex?.value_classification);
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
    this._ordersLoadedSub = this.apiConnector.coingeckoApiDataLoaded.subscribe((result: CoingeckoApiData) => {
      this._dataSvc.btcPriceData = result;

      const array: TimeStampAndNumber[] = [];

      result.prices.forEach((priceItem: TimeStampAndNumber) => (
        array.push({
          timeStamp: priceItem[0],
          number: priceItem[1]
        })
      ));

      this._dataSvc.btcPriceData.prices = array;
    });

    /*    this._fearGreatDataIndexLoadedSub = this.apiConnector.fearGreedIndexDataLoaded.subscribe((result: FearGreedDataPoint[]) => {
          // this._dataSvc.fearGreedIndexData = result;
          this._dataSvc.loadedFearIndexes = result;
        });*/

    this._loadCollection();

    // this._loadTitleIndexNr();
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
