import {AppComponent} from "../components/app.component";
import {StateDataService} from "../services/state-data.service";
import {SvgRenderService} from "../services/svg-render.service";
import {MatDialogModule} from "@angular/material/dialog";
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatButtonModule} from "@angular/material/button";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {FilterCheckboxSelectComponent} from "../components/base/filter-checkbox-select/filter-checkbox-select.component";
import {AppRoutingModule} from "./app-routing.module";
import {ServiceWorkerModule} from "@angular/service-worker";
import {environment} from "../../environments/environment.prod";
import {SidebarInfoPanelComponent} from "../components/sidebar-info/sidebar-info-panel.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {CommonModule} from "@angular/common";
import {GoogleMapsModule} from "@angular/google-maps";
import {HttpClientJsonpModule, HttpClientModule} from "@angular/common/http";
import {MainChartComponent} from "../components/charts/main-chart.component";
import { MatFormFieldModule} from "@angular/material/form-field";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {DiagnosticsScreenComponent} from "../components/datascience/diagnostics-screen.component";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {StrategyScreenComponent} from "../components/datascience/strategy-screen.component";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonToggleModule} from "@angular/material/button-toggle";

@NgModule({
  declarations: [
    AppComponent,
    FilterCheckboxSelectComponent,
    SidebarInfoPanelComponent,
    MainChartComponent,
    DiagnosticsScreenComponent,
    StrategyScreenComponent,
    // mdInputContaine
  ],
    imports: [
        BrowserModule,
        CommonModule,
        GoogleMapsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatButtonModule,
        AppRoutingModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        HttpClientModule,
        MatCheckboxModule,
        MatSelectModule,
        HttpClientJsonpModule,
        MatIconModule,
        MatToolbarModule,
        MatTabsModule,
        ServiceWorkerModule.register("ngsw-worker.js", {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the app is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: "registerWhenStable:30000"
        }),
        MatExpansionModule,
        FontAwesomeModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatButtonToggleModule
    ],
  providers: [
    StateDataService,
    SvgRenderService,
    FontAwesomeModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
