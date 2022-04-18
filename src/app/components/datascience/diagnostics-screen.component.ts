import {AfterViewInit, Component, Input, OnInit} from "@angular/core";
import {Chart, ChartOptions, registerables, ScriptableLineSegmentContext, TooltipItem} from "chart.js";
import {CoingeckoApiData} from "../../models/interface/coingecko-api-data.interface";
import {TimeStampAndNumber} from "../../models/interface/timestamp-and-number.interface";
import {StateDataService} from "../../services/state-data.service";
import {ApiConnectorService} from "../../services/api-connector.service";
import {FearGreedDataPoint} from "../../models/interface/fear-greed-data-point.interface";


@Component({
  selector: "diagnostics-screen",
  template: `
    <div class="main-container">
        diagnosticz
    </div>
  `,
  styleUrls: ["./diagnostics-screen.component.scss"]
})
export class DiagnosticsScreenComponent implements AfterViewInit {
  @Input()
  public set btcPriceData(priceData: CoingeckoApiData) {
    if (priceData?.prices) {
      this._btcPriceData = priceData.prices;
    }
  }

  private _btcPriceData: TimeStampAndNumber[];


  constructor(
    public dataService: StateDataService,
    public apiConnectorService: ApiConnectorService,
  ) {

  }

  ngAfterViewInit(): void {
    console.log("init");

  }


}
