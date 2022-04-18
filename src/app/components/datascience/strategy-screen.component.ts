import {AfterViewInit, Component} from "@angular/core";
import {TimeStampAndNumber} from "../../models/interface/timestamp-and-number.interface";
import {StateDataService} from "../../services/state-data.service";
import {ApiConnectorService} from "../../services/api-connector.service";
import {FearGreedDataPoint} from "../../models/interface/fear-greed-data-point.interface";


@Component({
  selector: "strategy-screen",
  template: `
    <div class="main-container" style="color:whitesmoke">
      <div class="form">
        <mat-form-field class="example-form-field" appearance="fill">
          <mat-label>Starting BTC</mat-label>
          <input matInput (change)="startBudgetValueChanged($event)" type="number" [defaultValue]="startBudget" class="example-right-align">
        </mat-form-field>

        <mat-form-field class="example-form-field" appearance="fill">
          <mat-label>Buy when FnG is below:</mat-label>
          <input matInput (change)="fngBelowValueChanged($event)" type="number" [defaultValue]="defaultFearBuy" class="example-right-align">
        </mat-form-field>

        <mat-form-field class="example-form-field" appearance="fill">
          <mat-label>Sell when FnG is above:</mat-label>
          <input matInput (change)="fngAboveValueChanged($event)" type="number" [defaultValue]="defaultGreedSell"
                 class="example-right-align">
        </mat-form-field>

        <div class="calculate-button">
          <button mat-stroked-button (click)="calculatePnL()">Calculate</button>
        </div>

      </div>

      <div class="results-view">

      </div>

    </div>
  `,
  styleUrls: ["./diagnostics-screen.component.scss"]
})
export class StrategyScreenComponent implements AfterViewInit {
  // public startBudget: number = 10000;
  public startBudget: number = 100;
  public defaultFearBuy: number = 20;
  public defaultGreedSell: number = 80;

  public get coinPrices(): TimeStampAndNumber[] {
    return this.dataService.loadedCoinPrices;
  }

  public get fngIndices(): FearGreedDataPoint[] {
    return this.dataService.loadedFearIndexes;
  }

  constructor(
    public dataService: StateDataService,
    public apiConnectorService: ApiConnectorService,
  ) {

  }

  ngAfterViewInit(): void {
    console.log("init");

  }

  public startBudgetValueChanged(event: any): void {
    console.log(event.target.valueAsNumber);
  }

  public fngBelowValueChanged(event: any): void {
    console.log(event.target.valueAsNumber);
  }

  public fngAboveValueChanged(event: any): void {
    console.log(event.target.valueAsNumber);
  }

  public calculatePnL(): void {
    console.log("calculate pnl");
  }

}
