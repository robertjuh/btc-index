import {AfterViewInit, Component, OnInit} from "@angular/core";
import {StateDataService} from "../../services/state-data.service";
import {ApiConnectorService} from "../../services/api-connector.service";
import {CompleteDataObject} from "../../models/interface/complete-data-object.interface";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

interface Trade {
  date: Date;
  action: "BUY" | "SELL";
  fngValue: number;
  btcPrice: number;
  usdAmount: number;
  btcAmount: number;
}

/* eslint-disable max-len */
@Component({
  selector: "strategy-screen",
  template: `
    <div class="strategy-host" style="color:whitesmoke">

      <!-- FORM -->
      <form class="strategy-form" [formGroup]="formGroup" (ngSubmit)="calculatePnL()" novalidate>

        <!-- Budget row -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Starting budget (USD)</mat-label>
          <input matInput type="number" formControlName="startBudget"/>
          <span matPrefix>$&nbsp;</span>
        </mat-form-field>

        <!-- Buy / Sell columns -->
        <div class="rule-columns">

          <div class="rule-col buy-col">
            <span class="col-title buy-title">Buy</span>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>F&amp;G below</mat-label>
              <input matInput type="number" formControlName="fearBuyIndex"/>
              <mat-error *ngIf="errorHandling('fearBuyIndex', 'max') || errorHandling('fearBuyIndex', 'min')">1–100</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>% of budget</mat-label>
              <input matInput type="number" formControlName="buyPercent"/>
              <span matSuffix>%</span>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Frequency</mat-label>
              <mat-select formControlName="buyFrequency">
                <mat-option value="daily">Daily</mat-option>
                <mat-option value="weekly">Weekly</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="rule-col sell-col">
            <span class="col-title sell-title">Sell</span>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>F&amp;G above</mat-label>
              <input matInput type="number" formControlName="greedSellIndex"/>
              <mat-error *ngIf="errorHandling('greedSellIndex', 'max') || errorHandling('greedSellIndex', 'min')">1–100</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>% of BTC</mat-label>
              <input matInput type="number" formControlName="sellPercent"/>
              <span matSuffix>%</span>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Frequency</mat-label>
              <mat-select formControlName="sellFrequency">
                <mat-option value="daily">Daily</mat-option>
                <mat-option value="weekly">Weekly</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

        </div>

        <button mat-stroked-button type="submit" class="run-btn" [disabled]="formGroup.invalid">Run backtest</button>

      </form>

      <!-- RESULTS -->
      <div *ngIf="calculated" class="results-section">

        <div *ngIf="trades.length === 0" class="no-trades">
          No trades were executed with these settings.
        </div>

        <ng-container *ngIf="trades.length > 0">

          <h3 class="section-title">Your strategy</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Buys</span>
              <span class="stat-value">{{ buyCount }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Sells</span>
              <span class="stat-value">{{ sellCount }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">USD invested</span>
              <span class="stat-value">\${{ totalUSDInvested | number:'1.0-0' }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">USD from sells</span>
              <span class="stat-value">\${{ totalUSDReceived | number:'1.0-0' }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Avg buy price</span>
              <span class="stat-value">\${{ avgBuyPrice | number:'1.0-0' }}</span>
            </div>
            <div class="stat-card" *ngIf="sellCount > 0">
              <span class="stat-label">Avg sell price</span>
              <span class="stat-value">\${{ avgSellPrice | number:'1.0-0' }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">BTC held</span>
              <span class="stat-value">{{ totalBTCHeld | number:'1.0-8' }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">USD budget left</span>
              <span class="stat-value">\${{ startBudgetLeft | number:'1.0-0' }}</span>
            </div>
            <div class="stat-card" *ngIf="todayBtcPrice">
              <span class="stat-label">BTC value today</span>
              <span class="stat-value">\${{ currentBTCValue | number:'1.0-0' }}</span>
            </div>
            <div class="stat-card highlight" *ngIf="todayBtcPrice">
              <span class="stat-label">Net worth</span>
              <span class="stat-value">\${{ netWorth | number:'1.0-0' }}</span>
            </div>
            <div class="stat-card" [class.positive]="returnPct >= 0" [class.negative]="returnPct < 0" *ngIf="todayBtcPrice">
              <span class="stat-label">Return</span>
              <span class="stat-value">{{ returnPct >= 0 ? '+' : '' }}{{ returnPct }}%</span>
            </div>
          </div>

          <h3 class="section-title" *ngIf="todayBtcPrice">Compare to benchmarks</h3>
          <div class="stats-grid" *ngIf="todayBtcPrice">
            <div class="stat-card">
              <span class="stat-label">HODL (all-in on day 1)</span>
              <span class="stat-value">\${{ hodlValue | number:'1.0-0' }}</span>
              <span class="stat-sub" [class.positive]="hodlReturn >= 0" [class.negative]="hodlReturn < 0">
                {{ hodlReturn >= 0 ? '+' : '' }}{{ hodlReturn }}%
              </span>
            </div>
            <div class="stat-card">
              <span class="stat-label">DCA (equal buys every day)</span>
              <span class="stat-value">\${{ dcaValue | number:'1.0-0' }}</span>
              <span class="stat-sub" [class.positive]="dcaReturn >= 0" [class.negative]="dcaReturn < 0">
                {{ dcaReturn >= 0 ? '+' : '' }}{{ dcaReturn }}%
              </span>
            </div>
          </div>

          <h3 class="section-title">Trade log ({{ trades.length }} trades)</h3>
          <div class="trade-log">
            <div class="trade-log-header">
              <span>Date</span>
              <span>Action</span>
              <span>F&amp;G</span>
              <span>BTC price</span>
              <span>USD</span>
              <span>BTC</span>
            </div>
            <div
              *ngFor="let trade of trades"
              class="trade-row"
              [class.buy-row]="trade.action === 'BUY'"
              [class.sell-row]="trade.action === 'SELL'"
            >
              <span>{{ trade.date | date:'dd MMM yy' }}</span>
              <span class="action-badge" [class.buy-badge]="trade.action === 'BUY'" [class.sell-badge]="trade.action === 'SELL'">
                {{ trade.action }}
              </span>
              <span>{{ trade.fngValue }}</span>
              <span>\${{ trade.btcPrice | number:'1.0-0' }}</span>
              <span>{{ trade.action === 'BUY' ? '-' : '+' }}\${{ trade.usdAmount | number:'1.0-0' }}</span>
              <span>{{ trade.action === 'BUY' ? '+' : '-' }}{{ trade.btcAmount | number:'1.0-6' }}</span>
            </div>
          </div>

        </ng-container>
      </div>

    </div>
  `,
  styleUrls: ["./strategy-screen.component.scss"]
})
export class StrategyScreenComponent implements OnInit, AfterViewInit {

  public formGroup: FormGroup;
  public calculated = false;

  public totalBTCBought = 0;
  public totalBTCSold = 0;
  public startBudgetLeft = 0;
  public totalUSDInvested = 0;
  public totalUSDReceived = 0;
  public get todayBtcPrice(): number {
    return this.dataService.lastBtcPrice ?? 0;
  }
  public trades: Trade[] = [];

  public hodlValue = 0;
  public hodlReturn = 0;
  public dcaValue = 0;
  public dcaReturn = 0;

  constructor(
    public dataService: StateDataService,
    public apiConnectorService: ApiConnectorService,
    private _fb: FormBuilder
  ) {}

  public get totalBTCHeld(): number {
    return Math.max(0, this.totalBTCBought - this.totalBTCSold);
  }

  public get currentBTCValue(): number {
    return this.todayBtcPrice ? parseFloat((this.totalBTCHeld * this.todayBtcPrice).toFixed(2)) : 0;
  }

  public get netWorth(): number {
    return parseFloat((this.startBudgetLeft + this.currentBTCValue).toFixed(2));
  }

  public get returnPct(): number {
    const budget = this.formGroup.value.startBudget;
    if (!budget) return 0;
    return parseFloat(((this.netWorth - budget) / budget * 100).toFixed(2));
  }

  public get buyCount(): number {
    return this.trades.filter(t => t.action === "BUY").length;
  }

  public get sellCount(): number {
    return this.trades.filter(t => t.action === "SELL").length;
  }

  public get avgBuyPrice(): number {
    const buys = this.trades.filter(t => t.action === "BUY");
    if (!buys.length) return 0;
    const totalUsd = buys.reduce((sum, t) => sum + t.usdAmount, 0);
    const totalBtc = buys.reduce((sum, t) => sum + t.btcAmount, 0);
    return totalBtc ? parseFloat((totalUsd / totalBtc).toFixed(2)) : 0;
  }

  public get avgSellPrice(): number {
    const sells = this.trades.filter(t => t.action === "SELL");
    if (!sells.length) return 0;
    const totalUsd = sells.reduce((sum, t) => sum + t.usdAmount, 0);
    const totalBtc = sells.reduce((sum, t) => sum + t.btcAmount, 0);
    return totalBtc ? parseFloat((totalUsd / totalBtc).toFixed(2)) : 0;
  }

  public ngOnInit(): void {
    this.formGroup = this._fb.group({
      startBudget: [10000, [Validators.required, Validators.min(1)]],
      fearBuyIndex: [25, [Validators.required, Validators.max(100), Validators.min(1)]],
      buyPercent: [10, [Validators.required, Validators.max(100), Validators.min(1)]],
      buyFrequency: ["daily"],
      greedSellIndex: [75, [Validators.required, Validators.max(100), Validators.min(1)]],
      sellPercent: [25, [Validators.required, Validators.max(100), Validators.min(1)]],
      sellFrequency: ["daily"],
    });
  }

  public ngAfterViewInit(): void {}

  public calculatePnL(): void {
    const v = this.formGroup.value;

    this.totalBTCBought = 0;
    this.totalBTCSold = 0;
    this.totalUSDInvested = 0;
    this.totalUSDReceived = 0;
    this.startBudgetLeft = v.startBudget;
    this.trades = [];
    this.calculated = true;

    let lastBuyDate: Date | null = null;
    let lastSellDate: Date | null = null;

    const data = [...this.dataService.loadedCompleteData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    data.forEach((dataPoint: CompleteDataObject) => {
      const fng = parseInt(dataPoint.fngValue, 10);
      const date = new Date(dataPoint.date);

      // BUY
      if (fng <= v.fearBuyIndex && this.startBudgetLeft >= 1) {
        if (this._canTrade(date, lastBuyDate, v.buyFrequency)) {
          const usdAmount = (v.buyPercent / 100) * this.startBudgetLeft;
          if (usdAmount < 1) { return; }
          const btcAmount = usdAmount / dataPoint.btcPrice;
          this.totalBTCBought += btcAmount;
          this.startBudgetLeft -= usdAmount;
          this.totalUSDInvested += usdAmount;
          lastBuyDate = date;
          this.trades.push({ date, action: "BUY", fngValue: fng, btcPrice: dataPoint.btcPrice, usdAmount, btcAmount });
        }
      }

      // SELL
      const btcHeld = this.totalBTCBought - this.totalBTCSold;
      if (fng >= v.greedSellIndex && btcHeld > 0) {
        if (this._canTrade(date, lastSellDate, v.sellFrequency)) {
          const btcAmount = (v.sellPercent / 100) * btcHeld;
          const usdReceived = btcAmount * dataPoint.btcPrice;
          this.totalBTCSold += btcAmount;
          this.startBudgetLeft += usdReceived;
          this.totalUSDReceived += usdReceived;
          lastSellDate = date;
          this.trades.push({ date, action: "SELL", fngValue: fng, btcPrice: dataPoint.btcPrice, usdAmount: usdReceived, btcAmount });
        }
      }
    });

    this._calcBenchmarks(data, v.startBudget);
  }

  public errorHandling = (control: string, error: string): boolean => {
    return this.formGroup.controls[control].hasError(error);
  }

  private _canTrade(current: Date, last: Date | null, frequency: string): boolean {
    if (!last) return true;
    if (frequency === "daily") return true;
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    return (current.getTime() - last.getTime()) >= msInWeek;
  }

  private _calcBenchmarks(data: CompleteDataObject[], budget: number): void {
    if (!data.length) return;

    // HODL: invest entire budget at first data point price
    const hodlBtc = budget / data[0].btcPrice;
    if (this.todayBtcPrice) {
      this.hodlValue = parseFloat((hodlBtc * this.todayBtcPrice).toFixed(2));
      this.hodlReturn = parseFloat(((this.hodlValue - budget) / budget * 100).toFixed(2));
    }

    // DCA: spread budget evenly across every day in the dataset
    const dailyBuy = budget / data.length;
    let dcaBtc = 0;
    data.forEach(d => { dcaBtc += dailyBuy / d.btcPrice; });
    if (this.todayBtcPrice) {
      this.dcaValue = parseFloat((dcaBtc * this.todayBtcPrice).toFixed(2));
      this.dcaReturn = parseFloat(((this.dcaValue - budget) / budget * 100).toFixed(2));
    }
  }

}
