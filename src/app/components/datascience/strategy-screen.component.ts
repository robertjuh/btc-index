import {AfterViewInit, Component, OnInit} from "@angular/core";
import {TimeStampAndNumber} from "../../models/interface/timestamp-and-number.interface";
import {StateDataService} from "../../services/state-data.service";
import {ApiConnectorService} from "../../services/api-connector.service";
import {FearGreedDataPoint} from "../../models/interface/fear-greed-data-point.interface";
import {CompleteDataObject} from "../../models/interface/complete-data-object.interface";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Subject} from "rxjs";


@Component({
  selector: "strategy-screen",
  template: `
    <div class="main-container" style="color:whitesmoke">
      <form class="form" [formGroup]="formGroup">
        <form [formGroup]="formGroup" (ngSubmit)="calculatePnL()" novalidate>

          <mat-label>Starting budget in USD</mat-label>
          <mat-form-field class="example-full-width">
            <input matInput type="number" formControlName="startBudget" [(ngModel)]="startBudget"/>
          </mat-form-field>


          <mat-label>Buy when FnG is below:</mat-label>
          <mat-form-field class="example-full-width">
            <input matInput type="number" formControlName="fearBuyIndex" [(ngModel)]="fearBuyIndex"/>
          </mat-form-field>
          <mat-error *ngIf="errorHandling('fearBuyIndex', 'max')">
            Number should be lower than 100 and higher than 1
          </mat-error>

          <!--<mat-label>Sell when FnG is above:</mat-label>
          <mat-form-field class="example-full-width">
            <input matInput type="number" formControlName="greedSellIndex" [(ngModel)]="greedSellIndex"/>
          </mat-form-field>
          <mat-error *ngIf="errorHandling('greedSellIndex', 'max')">
            Number should be lower than 100 and higher than 1
          </mat-error>-->


          <div class="calculate-button">
            <button mat-stroked-button>Calculate</button>
          </div>

        </form>


      </form>

      <div *ngIf="totalBTCBought" class="results-view">
        <p class="results-text">If you put 10% of your budget into btc everytime the fear and greed index was below {{fearBuyIndex}}, you
          would now have:</p>


        <div class="btc-usd-results-container">
          <div class="row">
            <p [textContent]="'Starting budget left: '"></p>
            <p [textContent]="'$' + startBudgetLeft"></p>
          </div>
          <div class="row">
            <p [textContent]="'BTC bought: '"></p>
            <p [textContent]="totalBTCBought"></p>
          </div>
          <div class="row">
            <p [textContent]="'Which today is worth: '"></p>
            <p [textContent]="'$' + todayWorth"></p>
          </div>
        </div>


      </div>

      <div *ngIf="!totalBTCBought" class="results-view">
        <p class="results-text">No buys were executed</p>
      </div>

    </div>
  `,
  styleUrls: ["./diagnostics-screen.component.scss"]
})
export class StrategyScreenComponent implements OnInit, AfterViewInit {
  // public startBudget: number = 10000;
  public startBudget: number = 10000;
  public fearBuyIndex: number = 20;
  public greedSellIndex: number = 80;

  public totalBTCBought: number = 0; // expressed in satoshi
  public startBudgetLeft: number = 0; // expressed in satoshi


  public todayWorth: number = 0;

  public formControl: FormControl;
  public formGroup: FormGroup;

  public SubjectsArray: Subject<any>[] = [];

  constructor(
    public dataService: StateDataService,
    public apiConnectorService: ApiConnectorService,
    private _fb: FormBuilder
  ) {

  }

  public ngOnInit(): void {
    this.createReactiveForm();

    /*
    this.formGroup = this._fb.group({
      name: ["", [Validators.required]],
      areas: this._fb.array([this.area()])
    });*/
  }

  ngAfterViewInit(): void {
    this.apiConnectorService.coingeckoTodayDataLoaded.subscribe((value: number) => {
      if (value) {
        this.todayWorth = Math.floor(this.totalBTCBought * value);
      }
    });
  }

  public createReactiveForm(): void {
    this.formGroup = this._fb.group({
      fearBuyIndex: ["", [Validators.max(100), Validators.min(1)]],
      greedSellIndex: ["", [Validators.max(100), Validators.min(1)]],
      startBudget: [""],
      subjects: [this.SubjectsArray],
    });
  }

  public startBudgetValueChanged(event: any): void {
    this.startBudget = Number(event.target.value);
  }

  public fngBelowValueChanged(event: any): void {
    this.fearBuyIndex = Number(event.target.value);
  }

  public fngAboveValueChanged(event: any): void {
    console.log(event.target.valueAsNumber);
  }

  public calculatePnL(): void {
    console.log(this.formGroup);
    console.log(this.formGroup.value);

    this.totalBTCBought = 0;
    this.startBudgetLeft = this.startBudget;

    this.dataService.loadedCompleteData.forEach((dataPoint: CompleteDataObject) => {
      if (parseInt(dataPoint.fngValue, 0) <= this.fearBuyIndex) {
        const amountBoughtInUSD = (0.1 * this.startBudgetLeft);
        const amountOfBTCBought = amountBoughtInUSD / dataPoint.btcPrice;

        this.totalBTCBought += amountOfBTCBought;
        this.startBudgetLeft -= amountBoughtInUSD;
      }

    });

    this.startBudgetLeft = Number(parseFloat(this.startBudgetLeft.toString()).toFixed(2));
    this.totalBTCBought = Number(parseFloat(this.totalBTCBought.toString()).toFixed(8));
    this.startBudget = Number(parseFloat(this.startBudget.toString()).toFixed(2));

    this.apiConnectorService.loadTodaysPrice();
  }

  public errorHandling = (control: string, error: string) => {
    return this.formGroup.controls[control].hasError(error);
  };

}
