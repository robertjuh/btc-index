import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {Order} from "../../models/interface/Order.interface";
import {MatDatepickerInputEvent, MatDateRangePicker} from "@angular/material/datepicker";
import {CheckboxSelection} from "../../models/interface/checkbox-selection.interface";
import {DropdownSelectionValue} from "../../models/interface/dropdown-selection-value.interface";
import { MatOptionSelectionChange } from "@angular/material/core";
import {StartAndEndDate} from "../../models/interface/start-and-end-date.interface";

@Component({
  selector: "sidebar-info-panel",
  template: `
    <div class="main-info-box-container">
      <mat-form-field appearance="fill">
        <mat-label [style]="'color: whitesmoke'">Enter a date range</mat-label>
        <mat-date-range-input [rangePicker]="$any(picker)" [min]="minPickableDate"
                              [max]="maxPickableDate">
          <input matStartDate (dateChange)="handleStartDateChange($event)" placeholder="Start date">
          <input matEndDate (dateChange)="handleEndDateChange($event)" #endDateComp placeholder="End date">
        </mat-date-range-input>
        <mat-hint></mat-hint>
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-date-range-picker #picker></mat-date-range-picker>
      </mat-form-field>

      <!--<mat-form-field appearance="fill">
        <mat-label>Timeframe</mat-label>
        <mat-select>
          <mat-option *ngFor="let dateSelection of dateSelections" [value]="dateSelection.value" (onSelectionChange)="amountOfDaysToSHowSelectionChange.emit($event)">
            {{dateSelection.viewValue}}
          </mat-option>
        </mat-select>
      </mat-form-field>-->

    </div>


  `,
  styleUrls: ["./sidebar-info-panel.component.scss"]
})
export class SidebarInfoPanelComponent {
  @ViewChild(MatDateRangePicker, {static: false})
  public pickerComp: MatDateRangePicker<Date>;

  @ViewChild("endDateComp")
  public endDateComp: ElementRef;

  @Output()
  public dateRangeSelected: EventEmitter<StartAndEndDate> = new EventEmitter<StartAndEndDate>();

  @Output()
  public amountOfDaysToSHowSelectionChange: EventEmitter<MatOptionSelectionChange> = new EventEmitter<MatOptionSelectionChange>();

  public minPickableDate: Date;
  public maxPickableDate: Date;

  private _ytdDays: number;

  public dateSelections: DropdownSelectionValue[] = [];

  constructor() {
    this.minPickableDate = new Date(2018, 1, 3);
    this.maxPickableDate = new Date();


    this._getYTD();

    this.dateSelections = [
      {value: 30, viewValue: "30 Days"},
      {value: 90, viewValue: "90 days"},
      {value: 180, viewValue: "6 months"},
      {value: 365, viewValue: "1 year"},
      {value: this._ytdDays, viewValue: "YTD"}
    ];
  }

  public handleStartDateChange(event: MatDatepickerInputEvent<any, any>): void {
    if (this.endDateComp.nativeElement.value) {
      this.handleEndDateChange(event);
    }
  }

  public handleEndDateChange(event: any): void {
    const startDate: Date = new Date(this.pickerComp.startAt);
    const endDate: Date = new Date(this.endDateComp.nativeElement.value);

    this.dateRangeSelected.next({
      startDate,
      endDate
    });
  }

  // returns amount of days from this year untill now
  private _getYTD(): void {
    const now: Date = new Date();
    const currentYearTillNow: Date = new Date(new Date().getFullYear(), 0, 1);

    // Dit rekent het verschil tussen de daterange uit
    const diffTime: number = Math.abs(now.getTime() - currentYearTillNow.getTime());
    const diffDays: number = Math.floor(diffTime / (1000 * 60 * 60 * 24));


    console.log("diffDays", diffDays);
    this._ytdDays = diffDays;
  }

}
