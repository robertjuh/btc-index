import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {MainChartComponent} from "../components/charts/main-chart.component";
import {StrategyScreenComponent} from "../components/datascience/strategy-screen.component";

/*
const routes: Routes = [];
*/
const routes: Routes = [
  {
    path: "", component: MainChartComponent
  },
  {path: "chart", component: MainChartComponent},
  {path: "strategy", component: StrategyScreenComponent},
  {path: "btc-index/chart", component: MainChartComponent},
  {path: "btc-index/strategy", component: StrategyScreenComponent},
  // directs all other routes to the main page
  {path: "**", redirectTo: "/chart"}
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
