import {AfterViewInit, Component, EventEmitter, HostListener, OnDestroy, Output} from "@angular/core";
import {Chart, ChartOptions, DatasetChartOptions, registerables, ScriptableLineSegmentContext} from "chart.js";
import {TimeStampAndNumber} from "../../models/interface/timestamp-and-number.interface";
import {StateDataService} from "../../services/state-data.service";
import {ApiConnectorService} from "../../services/api-connector.service";
import {getColorForIndex, getColorForSegment, getPastDaysRange} from "../../services/utils";
import {StartAndEndDate} from "../../models/interface/start-and-end-date.interface";
import {Title} from "@angular/platform-browser";
import {Subscription} from "rxjs";
import {CompleteDataObject} from "../../models/interface/complete-data-object.interface";
import {MatDatepickerInputEvent} from "@angular/material/datepicker";

Chart.register(...registerables);

@Component({
  selector: "main-chart",
  template: `
    <div class="main-chart-container">

      <div class="chart-frame">
        <canvas id="myChart" width="400" height="400"></canvas>
      </div>
      <div class="chart-toolbar">
        <div class="toolbar-left">
          <mat-button-toggle-group [(value)]="selectedRangePreset">
          <mat-button-toggle (click)="handleDayAmountSelection(30)" value="1M">
            <span>1M</span>
          </mat-button-toggle>

          <mat-button-toggle (click)="handleDayAmountSelection(90)" value="3M">
            <span>3M</span>
          </mat-button-toggle>

          <mat-button-toggle (click)="handleDayAmountSelection(180)" value="6m">
            <span>6m</span>
          </mat-button-toggle>

          <mat-button-toggle (click)="handleDayAmountSelection(365)" value="1Y">
            <span>1Y</span>
          </mat-button-toggle>

          <mat-button-toggle (click)="handleDayAmountSelectionYTD()" value="YTD">
            <span>YTD</span>
          </mat-button-toggle>

          <mat-button-toggle (click)="handleDayAmountSelectionAll()" value="MAX">
            <span>MAX</span>
          </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <div class="toolbar-center">
          <mat-form-field appearance="fill" class="date-range-field">
                <mat-label>Custom date range</mat-label>
                <mat-date-range-input [rangePicker]="$any(picker)" [min]="minPickableDate" [max]="maxPickableDate">
                  <input matStartDate (dateChange)="handleStartDateChange($event)" placeholder="Start date">
                  <input matEndDate (dateChange)="handleEndDateChange($event)" placeholder="End date">
                </mat-date-range-input>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-date-range-picker #picker></mat-date-range-picker>
          </mat-form-field>
        </div>

        <div class="toolbar-right">
          <mat-button-toggle (click)="toggleRsi()" [checked]="showRsi">
            <span>RSI</span>
          </mat-button-toggle>
          <mat-button-toggle (click)="toggleLogScale()" [checked]="isLogScale">
            <span>Log scale</span>
          </mat-button-toggle>
        </div>
      </div>


    </div>
  `,
  styleUrls: ["./main-chart.component.scss"]
})
export class MainChartComponent implements AfterViewInit, OnDestroy {
  @Output()
  public dateRangeSelected: EventEmitter<StartAndEndDate> = new EventEmitter<StartAndEndDate>();

  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public mainChart: Chart;

  public isLogScale: boolean = false;
  public showRsi: boolean = false;
  public selectedRangePreset: string = "1Y";

  public minPickableDate: Date;
  public maxPickableDate: Date;
  public selectedStartDate: Date | null = null;
  public selectedEndDate: Date | null = null;

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
  private _ytdDays: number;

  private _defaultChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0,
          major: { enabled: true },
        }
      },
      y: {
        type: "linear",
        display: true,
      },
      y1: {
        type: "linear",
        display: false,
        position: "right",
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: {
          color: "rgba(255, 152, 0, 0.7)",
          stepSize: 10,
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          footer: (tooltipItems): string => {
            const btcItem = tooltipItems.find(t => t.datasetIndex === 0);
            if (!btcItem) return "";
            return "BTC: $" + Math.floor(this._getDisplayData()[btcItem.dataIndex]?.btcPrice ?? 0);
          },
          label: (tooltipItem): string => {
            if (tooltipItem.datasetIndex === 0) {
              return "Fear/Greed: " + (this._getDisplayData()[tooltipItem.dataIndex]?.fngValue ?? "");
            }
            if (tooltipItem.dataset.label === "RSI (14)") {
              return "RSI (14): " + tooltipItem.parsed.y;
            }
            return "";
          },
        }
      }
    },
    onResize(chart: any, size: { width: number; height: number }): void {
      if (window.visualViewport.height < 600) {
        chart.canvas.parentNode.style.height = (window.visualViewport.height - 136) + "px";
      } else {
        chart.canvas.parentNode.style.height = (window.visualViewport.height - 194) + "px";
      }
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
    this.minPickableDate = new Date(2018, 1, 3);
    this.maxPickableDate = new Date();
    this._getYTD();
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
  }

  public toggleLogScale(): void {
    this.isLogScale = !this.isLogScale;
    this.isLogScale
      ? this.mainChart.config.options.scales.y.type = "logarithmic"
      : this.mainChart.config.options.scales.y.type = "linear";
    this.mainChart.update();
  }

  public toggleRsi(): void {
    this.showRsi = !this.showRsi;
    if (!this.mainChart) return;

    if (this.showRsi) {
      const { displayData, allPrices } = this._getDisplayAndFullPrices();
      this.mainChart.data.datasets.push(...this._buildRsiDatasets(allPrices, displayData.length));
      this.mainChart.config.options.scales["y1"].display = true;
    } else {
      this.mainChart.data.datasets = this.mainChart.data.datasets.filter(
        d => !["RSI (14)", "RSI 70", "RSI 30"].includes(d.label)
      );
      this.mainChart.config.options.scales["y1"].display = false;
    }
    this.mainChart.update();
  }

  private _createChartComponentWithData(): void {
    const { displayData, allPrices } = this._getDisplayAndFullPrices();

    const priceDataSeries: number[] = [];
    const labels: any[] = [];
    const backgroundColors: string[] = [];

    const backgroundGradient: CanvasGradient = this.ctx.createLinearGradient(300, 110, 200, 600);
    backgroundGradient.addColorStop(0, "rgba(73,13,149,0.27)");
    backgroundGradient.addColorStop(1, "rgba(16,16,16,0.08)");

    displayData.forEach((completeDataObject: CompleteDataObject) => {
      priceDataSeries.push(Math.floor(completeDataObject.btcPrice));
      const newDate: Date = new Date(completeDataObject.date);
      backgroundColors.push(getColorForIndex(completeDataObject.fngValueName));
      labels.push((newDate.getDate()) + "-" + (newDate.getMonth() + 1) + "-" + newDate.getFullYear());
    });

    const btcDataset: any = {
      label: "BTC price",
      backgroundColor: backgroundGradient,
      data: priceDataSeries,
      fill: true,
      borderColor: "black",
      segment: {
        borderColor: (ctx: ScriptableLineSegmentContext) =>
          getColorForSegment(displayData[ctx.p1DataIndex].fngValueName),
      },
      tension: 0.3,
      pointBorderColor: backgroundColors,
      pointBackgroundColor: backgroundColors,
      pointHitRadius: 20,
      pointRadius: 2,
    };

    const datasets: any[] = [btcDataset];
    if (this.showRsi) {
      datasets.push(...this._buildRsiDatasets(allPrices, displayData.length));
    }

    this.mainChart = new Chart(this.ctx, {
      options: this._defaultChartOptions,
      type: "line",
      data: { labels, datasets }
    });

    if (this.showRsi) {
      this.mainChart.config.options.scales["y1"].display = true;
    }

    this.screenWidth = window.innerWidth;
  }

  public handleDayAmountSelection(amountOfDays: number): void {
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    const startAndEndDate: StartAndEndDate = getPastDaysRange(amountOfDays);
    this.apiConnectorService.loadCollectionWithParams(startAndEndDate);
  }

  public handleDayAmountSelectionAll(): void {
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    const startAndEndDate: StartAndEndDate = {
      startDate: new Date(2018, 1, 1),
      endDate: new Date(),
    };
    this.apiConnectorService.loadCollectionWithParams(startAndEndDate);
  }

  public handleDayAmountSelectionYTD(): void {
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    const startAndEndDate: StartAndEndDate = {
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
    };
    this.apiConnectorService.loadCollectionWithParams(startAndEndDate);
  }

  public handleStartDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.selectedRangePreset = "";
    this.selectedStartDate = event.value ? new Date(event.value) : null;
    this._loadCustomRangeIfComplete();
  }

  public handleEndDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.selectedRangePreset = "";
    this.selectedEndDate = event.value ? new Date(event.value) : null;
    this._loadCustomRangeIfComplete();
  }

  private _getYTD(): void {
    const now: Date = new Date();
    const currentYearTillNow: Date = new Date(new Date().getFullYear(), 0, 1);
    const diffTime: number = Math.abs(now.getTime() - currentYearTillNow.getTime());
    this._ytdDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private _updateChartData(): void {
    const { displayData, allPrices } = this._getDisplayAndFullPrices();

    const priceDataSeries: number[] = [];
    const labels: any[] = [];
    const backgroundColors: string[] = [];

    const backgroundGradient: CanvasGradient = this.ctx.createLinearGradient(300, 110, 200, 600);
    backgroundGradient.addColorStop(0, "rgba(73,13,149,0.27)");
    backgroundGradient.addColorStop(1, "rgba(16,16,16,0.08)");

    displayData.forEach((completeDataObject: CompleteDataObject) => {
      priceDataSeries.push(Math.floor(completeDataObject.btcPrice));
      const newDate: Date = new Date(completeDataObject.date);
      backgroundColors.push(getColorForIndex(completeDataObject.fngValueName));
      labels.push((newDate.getDate()) + "-" + (newDate.getMonth() + 1) + "-" + newDate.getFullYear());
    });

    const btcDataset: any = {
      label: "BTC price",
      backgroundColor: backgroundGradient,
      data: priceDataSeries,
      fill: true,
      borderColor: "black",
      segment: {
        borderColor: (ctx: ScriptableLineSegmentContext) =>
          getColorForSegment(displayData[ctx.p1DataIndex].fngValueName),
      },
      tension: 0.3,
      pointBorderColor: backgroundColors,
      pointBackgroundColor: backgroundColors,
      pointHitRadius: 20,
      pointRadius: 2,
    };

    const datasets: any[] = [btcDataset];
    if (this.showRsi) {
      datasets.push(...this._buildRsiDatasets(allPrices, displayData.length));
    }

    this.mainChart.data = { labels, datasets };
    this.mainChart.config.options.scales["y1"].display = this.showRsi;
    this.mainChart.update();
  }

  private _getDisplayData(): CompleteDataObject[] {
    return this._getDisplayAndFullPrices().displayData;
  }

  // Returns display-range data (sliced from displayStartDate) and full price array for RSI warmup
  private _getDisplayAndFullPrices(): { displayData: CompleteDataObject[]; allPrices: number[] } {
    const all = this.dataService.loadedCompleteData;
    const allPrices = all.map(d => d.btcPrice);
    const displayStart = this.dataService.displayStartDate;

    if (!displayStart) {
      return { displayData: all, allPrices };
    }

    const startTime = displayStart.getTime();
    const firstDisplayIdx = all.findIndex(d => new Date(d.date).getTime() >= startTime);
    const displayData = firstDisplayIdx >= 0 ? all.slice(firstDisplayIdx) : all;

    return { displayData, allPrices };
  }

  private _calcRSI(prices: number[], period = 14): (number | null)[] {
    if (prices.length < period + 1) return prices.map(() => null);

    const result: (number | null)[] = new Array(period).fill(null);

    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) avgGain += change;
      else avgLoss += Math.abs(change);
    }
    avgGain /= period;
    avgLoss /= period;

    const firstRS = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    result.push(parseFloat((100 - 100 / (1 + firstRS)).toFixed(2)));

    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
      result.push(parseFloat((100 - 100 / (1 + rs)).toFixed(2)));
    }

    return result;
  }

  private _buildRsiDatasets(allPrices: number[], displayLength: number): any[] {
    // Calculate RSI on the full array (includes warmup), then slice to display range
    const fullRsi = this._calcRSI(allPrices);
    const rsiData = fullRsi.slice(allPrices.length - displayLength);
    const len = displayLength;
    const sharedOpts = {
      yAxisID: "y1",
      fill: false,
      pointRadius: 0,
      pointHitRadius: 0,
      tension: 0.3,
      borderWidth: 1,
    };

    return [
      {
        ...sharedOpts,
        label: "RSI (14)",
        data: rsiData,
        borderColor: "rgba(255, 152, 0, 0.9)",
        borderWidth: 1.5,
        pointHitRadius: 10,
      },
      {
        ...sharedOpts,
        label: "RSI 70",
        data: new Array(len).fill(70),
        borderColor: "rgba(244, 67, 54, 0.35)",
        borderDash: [5, 4],
      },
      {
        ...sharedOpts,
        label: "RSI 30",
        data: new Array(len).fill(30),
        borderColor: "rgba(76, 175, 80, 0.35)",
        borderDash: [5, 4],
      },
    ];
  }

  private _createXaXis(): void {
    const startDate: Date = new Date(this._btcPriceData[0].timeStamp);
  }

  private _loadCustomRangeIfComplete(): void {
    if (!this.selectedStartDate || !this.selectedEndDate) {
      return;
    }
    this.apiConnectorService.loadCollectionWithParams({
      startDate: this.selectedStartDate,
      endDate: this.selectedEndDate
    });
  }
}
