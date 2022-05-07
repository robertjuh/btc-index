import {AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit} from "@angular/core";
import {Chart, ChartOptions, DatasetChartOptions, registerables, ScriptableLineSegmentContext} from "chart.js";
import {CoingeckoApiData} from "../../models/interface/coingecko-api-data.interface";
import {TimeStampAndNumber} from "../../models/interface/timestamp-and-number.interface";
import {StateDataService} from "../../services/state-data.service";
import {ApiConnectorService} from "../../services/api-connector.service";
import {addDays, getColorForIndex, getColorForSegment} from "../../services/utils";
import {StartAndEndDate} from "../../models/interface/start-and-end-date.interface";
import {Title} from "@angular/platform-browser";
import {Subscription} from "rxjs";
import {CompleteDataObject} from "../../models/interface/complete-data-object.interface";

Chart.register(...registerables);

@Component({
  selector: "main-chart",
  template: `
    <div class="main-chart-container">

      <div class="chart-frame">
        <canvas id="myChart" width="400" height="400"></canvas>
      </div>
      <div class="chart-toolbar">
<!--        <button mat-stroked-button (click)="handleDayAmountSelection(30)">1M</button>
        <button mat-stroked-button (click)="handleDayAmountSelection(90)">3M</button>
        <button mat-stroked-button (click)="handleDayAmountSelection(180)">6m</button>
        <button mat-stroked-button (click)="handleDayAmountSelection(365)">1Y</button>
        <button mat-stroked-button (click)="handleDayAmountSelectionYTD()">YTD</button>
        <button mat-stroked-button (click)="handleDayAmountSelectionAll()">MAX</button>-->

        <mat-button-toggle-group #group="matButtonToggleGroup" value="1Y">
          <mat-button-toggle (click)="handleDayAmountSelection(30)" value="1M">
            <span>1M</span>
          </mat-button-toggle>

          <mat-button-toggle (click)="handleDayAmountSelection(90)" value="3M">
            <span>3M</span>
          </mat-button-toggle>

          <mat-button-toggle (click)="handleDayAmountSelection(180)" value="6m">
            <span>6m</span>
          </mat-button-toggle>

          <mat-button-toggle  (click)="handleDayAmountSelection(365)" value="1Y">
            <span>1Y</span>
          </mat-button-toggle>

          <mat-button-toggle  (click)="handleDayAmountSelectionYTD()" value="YTD">
            <span>YTD</span>
          </mat-button-toggle>

          <mat-button-toggle  (click)="handleDayAmountSelectionAll()" value="MAX">
            <span>MAX</span>
          </mat-button-toggle>
        </mat-button-toggle-group>

        <mat-button-toggle-group #group="matButtonToggleGroup" value="1Y">
          <mat-button-toggle  (click)="toggleLogScale()" value="logScale">
            <span>Toggle Log scale</span>
          </mat-button-toggle>
        </mat-button-toggle-group>

      </div>



    </div>
  `,
  styleUrls: ["./main-chart.component.scss"]
})
export class MainChartComponent implements AfterViewInit, OnDestroy {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public mainChart: Chart;

  public isLogScale: boolean = false;

  public set screenWidth(value: number) {
    this._screenWidth = value;

    if (this.mainChart) {
      let amountOfXLabels: number;
      if (value < 500) {
        amountOfXLabels = 3;
      } else if (value >= 500 && value < 900) {
        amountOfXLabels = 5;
      } else if (value >= 900) {
        amountOfXLabels = 8;
      }


      this.mainChart.config.options.scales.x.ticks.maxTicksLimit = amountOfXLabels;

      this.mainChart.update();
    }
  }

  private _ordersLoadedSub: Subscription;
  private _fearGreatDataIndexLoadedSub: Subscription;

  private _screenWidth: number;
  private _btcPriceData: TimeStampAndNumber[];

  private _defaultChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // maintainAspectRatio: true,
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0,
          major: {
            enabled: true
          },
          // color: (context) => context.tick && context.tick.major && "#f1f1f1",
        }
      },
      y: {
        type: "linear",
        display: true,
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          /*getToolTipText*/
          footer: (tooltipItems): string => {
            let sum = 0;

            tooltipItems.forEach((tooltipItem) => {
              return sum += tooltipItem.parsed.y;
            });
            return "BTC: $" + Math.floor(this.dataService.loadedCompleteData[tooltipItems[0].dataIndex].btcPrice);
          },
          label: (tooltipItem): string => {
            // return "Fear/Greed index value: " + this.dataService.loadedFearIndexes[tooltipItem.dataIndex].value;
            return "Fear/Greed index value: " + this.dataService.loadedCompleteData[tooltipItem.dataIndex].fngValue;
          },
          /* label(tooltipItem: TooltipItem<any>): string | string[] {
             return "LABELTJE";
           }*/
        }
      }
    },
    onResize(chart: any, size: { width: number; height: number }): void {
      if (window.visualViewport.height < 600) {
        // if (true) {
        // chart.canvas.parentNode.style.height =  (window.visualViewport.height - 136) + "px"; // eerste button rij net zichtbaar op kleine schermen
        chart.canvas.parentNode.style.height = (window.visualViewport.height - 136) + "px";
      } else {
        chart.canvas.parentNode.style.height = (window.visualViewport.height - 194) + "px";

        // chart.canvas.parentNode.style.height = "500px";
      }
      // chart.canvas.parentNode.style.width = size.width + "px";
    },
    resizeDelay: 250
  };


  @HostListener("window:resize", ["$event"])
  public onResize(event): void {
    this.screenWidth = window.innerWidth;
  }

  constructor(
    public dataService: StateDataService,
    public apiConnectorService: ApiConnectorService,
    private _titleService: Title
  ) {
    console.log("Constructor");


  }

  ngAfterViewInit(): void {
    this.canvas = document.getElementById("myChart") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");

    this.dataService.everyThingLoadedAndTransformed.subscribe((completeDataObj: CompleteDataObject[]) => {
      if (this.dataService.loadedCompleteData.length) {
        if (this.mainChart) {
          this._updateChartData();
        } else {
          this._createChartComponentWithData();
        }
      }
    });

    if (this.dataService.loadedCompleteData.length) {
      if (this.mainChart) {
        this._updateChartData();
      } else {
        this._createChartComponentWithData();
      }
    }


  }

  ngOnDestroy(): void {
    // this.mainChart?.destroy();
    // this.dataService.everyThingLoaded.unsubscribe();
  }

  public toggleLogScale(): void {
    this.isLogScale = !this.isLogScale;
    this.isLogScale ? this.mainChart.config.options.scales.y.type = "logarithmic" : this.mainChart.config.options.scales.y.type = "linear";
    this.mainChart.update();
  }


  // private _createChartComponentWithData(fearGreedIndexData: FearGreedDataPoint[], coinGeckoPriceData: TimeStampAndNumber[]): void {
  private _createChartComponentWithData(): void {

    const priceDataSeries: number[] = [];
    // const labels: string[] = [];
    const labels: any[] = [];
    const backgroundColors: string[] = [];
    // const backgroundGradientCOlors: string[] = [];

    const segments: string[] = [];


    // gradient deze werkt goed!
    // const backgroundGradient: CanvasGradient = this.ctx.createLinearGradient(1, 0, 200, 600);
    const backgroundGradient: CanvasGradient = this.ctx.createLinearGradient(300, 110, 200, 600);

    /*backgroundGradient.addColorStop(0, "rgba(73,13,149,0.99)");
    backgroundGradient.addColorStop(1, "rgba(255,0,0,0.66)");*/

    // deze is mooi op moble
    backgroundGradient.addColorStop(0, "rgba(73,13,149,0.27)");
    backgroundGradient.addColorStop(1, "rgba(16,16,16,0.08)");

    /*    backgroundGradient.addColorStop(0, "rgba(0,0,0,0.06)");
        backgroundGradient.addColorStop(1, "rgba(0,0,0,0)");*/


    // this.dataService.loadedCoinPrices.forEach((priceDateDataPoint: TimeStampAndNumber, index: number) => {
    this.dataService.loadedCompleteData.forEach((completeDataObject: CompleteDataObject, index: number) => {
      priceDataSeries.push(Math.floor(completeDataObject.btcPrice));
      const newDate: Date = new Date(completeDataObject.date);

      // const newDate: Date = new Date(priceDateDataPoint[0]);

      // backgroundColors.push(getColorForIndex(this.dataService.loadedFearIndexes[index].value_classification));
      backgroundColors.push(getColorForIndex(this.dataService.loadedCompleteData[index].fngValueName));

      // labels.push((newDate.getDate()) + " - " + (newDate.getMonth() + 1) + " - " + newDate.getFullYear());
      labels.push((newDate.getDate()) + "-" + (newDate.getMonth() + 1) + "-" + newDate.getFullYear());
      // labels.push(newDate);
    });

    // this.mainChart?.destroy();

    this.mainChart = new Chart(this.ctx, {
      options: this._defaultChartOptions,
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "BTC price",

          // backgroundColor: gradientTest,  // deze werkt goed!
          backgroundColor: backgroundGradient,  // deze werkt goed!
          // backgroundColor: backgroundColors,
          data: priceDataSeries,
          // data: data2,
          fill: true,
          // borderColor: "transparent", // Invisible line :D
          borderColor: "black",
          segment: {
            borderColor: (ctx: ScriptableLineSegmentContext) => {
              // return getColorForSegment(ctx, priceDataSeries, this.dataService.loadedFearIndexes[ctx.p1DataIndex].value_classification);
              return getColorForSegment(this.dataService.loadedCompleteData[ctx.p1DataIndex].fngValueName);
              /*return !!this.dataService.loadedCompleteData[ctx.p1DataIndex] ? getColorForSegment(ctx, priceDataSeries,
                this.dataService.loadedCompleteData[ctx.p1DataIndex].fngValueName) : undefined;*/
            },
            // borderDash: ctx => skipped(ctx, [6, 6]),
          },
          tension: 0.3,
          pointBorderColor: backgroundColors,
          pointBackgroundColor: backgroundColors,
          pointHitRadius: 20,
          pointRadius: 2
          /*          segment: {
                      borderColor: this.ctx => fear(this.ctx, value)
                    }*/
        }]
      }
    });

    this.screenWidth = window.innerWidth;
  }

  public handleDayAmountSelection(amountOfDays: number): void {
    const today: Date = new Date();
    const determinedStartDate: Date = addDays(today, -(amountOfDays + 1));

    const startAndEndDate: StartAndEndDate = {
      startDate: determinedStartDate,
      endDate: today,
    };

    this.apiConnectorService.loadCollectionWithParams(startAndEndDate);

  }

  public handleDayAmountSelectionAll(): void {
    const start: Date = new Date("02/01/2018");
    const end: Date = new Date();

    const startAndEndDate: StartAndEndDate = {
      startDate: start,
      endDate: end,
    };

    this.apiConnectorService.loadCollectionWithParams(startAndEndDate);
  }

  public handleDayAmountSelectionYTD(): void {
    const currentYearTillNow: Date = new Date(new Date().getFullYear(), 0, 1);

    const end: Date = new Date();

    const startAndEndDate: StartAndEndDate = {
      startDate: currentYearTillNow,
      endDate: end,
    };

    this.apiConnectorService.loadCollectionWithParams(startAndEndDate);
  }

  private _updateChartData(): void {
    console.log("_updateChartData", this.mainChart);

    const priceDataSeries: number[] = [];
    const labels: any[] = [];
    const backgroundColors: string[] = [];

    const segments: string[] = [];


    const backgroundGradient: CanvasGradient = this.ctx.createLinearGradient(300, 110, 200, 600);

    // deze is mooi op moble
    backgroundGradient.addColorStop(0, "rgba(73,13,149,0.27)");
    backgroundGradient.addColorStop(1, "rgba(16,16,16,0.08)");


    this.dataService.loadedCompleteData.forEach((completeDataObject: CompleteDataObject, index: number) => {
      priceDataSeries.push(Math.floor(completeDataObject.btcPrice));
      const newDate: Date = new Date(completeDataObject.date);
      backgroundColors.push(getColorForIndex(this.dataService.loadedCompleteData[index].fngValueName));

      labels.push((newDate.getDate()) + "-" + (newDate.getMonth() + 1) + "-" + newDate.getFullYear());
    });

    /*this.mainChart.config.data.labels = labels;
    this.mainChart.config.data.datasets[0].data = priceDataSeries;
    // @ts-ignore
    this.mainChart.config.data.datasets[0].pointBorderColor = backgroundColors;
    // @ts-ignore
    this.mainChart.config.data.datasets[0].pointBackgroundColor = backgroundColors;*/
    this.mainChart.data = {
      labels,
      datasets: [{
        label: "BTC price",

        // backgroundColor: gradientTest,  // deze werkt goed!
        backgroundColor: backgroundGradient,  // deze werkt goed!
        // backgroundColor: backgroundColors,
        data: priceDataSeries,
        // data: data2,
        fill: true,
        // borderColor: "transparent", // Invisible line :D
        borderColor: "black",
        segment: {
          borderColor: (ctx: ScriptableLineSegmentContext) => {
            // return getColorForSegment(ctx, priceDataSeries, this.dataService.loadedFearIndexes[ctx.p1DataIndex].value_classification);
            return getColorForSegment(this.dataService.loadedCompleteData[ctx.p1DataIndex].fngValueName);
            /*return !!this.dataService.loadedCompleteData[ctx.p1DataIndex] ? getColorForSegment(ctx, priceDataSeries,
              this.dataService.loadedCompleteData[ctx.p1DataIndex].fngValueName) : undefined;*/
          },
          // borderDash: ctx => skipped(ctx, [6, 6]),
        },
        tension: 0.3,
        pointBorderColor: backgroundColors,
        pointBackgroundColor: backgroundColors,
        pointHitRadius: 20,
        pointRadius: 2
        /*          segment: {
                    borderColor: this.ctx => fear(this.ctx, value)
                  }*/
      }]
    };

    this.mainChart.update();
  }

  private _createXaXis(): void {
    const startDate: Date = new Date(this._btcPriceData[0].timeStamp);
  }

}
