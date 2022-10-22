import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {Order} from "../../models/interface/Order.interface";
import {MatDatepickerInputEvent, MatDateRangePicker} from "@angular/material/datepicker";
import {CheckboxSelection} from "../../models/interface/checkbox-selection.interface";
import {DropdownSelectionValue} from "../../models/interface/dropdown-selection-value.interface";
import {MatOptionSelectionChange} from "@angular/material/core";
import {StartAndEndDate} from "../../models/interface/start-and-end-date.interface";
import {Router} from "@angular/router";

@Component({
  selector: "sidebar-info-panel",
  template: `
    <div class="main-info-box-container">
      <!--      <mat-form-field appearance="fill">
              <mat-label [style]="'color: whitesmoke'">Enter a date range</mat-label>
              <mat-date-range-input [rangePicker]="$any(picker)" [min]="minPickableDate"
                                    [max]="maxPickableDate">
                <input matStartDate (dateChange)="handleStartDateChange($event)" placeholder="Start date">
                <input matEndDate (dateChange)="handleEndDateChange($event)" #endDateComp placeholder="End date">
              </mat-date-range-input>
              <mat-hint></mat-hint>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-date-range-picker #picker></mat-date-range-picker>
            </mat-form-field>-->

      <div class="url-container" style="display:flex">
        <a [routerLink]="'chart'" [class.active]="isActive('/chart')" (click)="onMenuItemClick.emit()">
          <h4>Chart</h4>
        </a>
        <a [routerLink]="'strategy'" [class.active]="isActive('/strategy')" (click)="onMenuItemClick.emit()">
          <h3>Strategy</h3>
        </a>
      </div>
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
/*  @ViewChild(MatDateRangePicker, {static: false})
  public pickerComp: MatDateRangePicker<Date>;

  @ViewChild("endDateComp")
  public endDateComp: ElementRef;*/

  /*
    @Output()
    public dateRangeSelected: EventEmitter<StartAndEndDate> = new EventEmitter<StartAndEndDate>();
  */

  @Output()
  public amountOfDaysToSHowSelectionChange: EventEmitter<MatOptionSelectionChange> = new EventEmitter<MatOptionSelectionChange>();

  @Output()
  public onMenuItemClick: EventEmitter<void> = new EventEmitter<void>();


  /*  public minPickableDate: Date;
    public maxPickableDate: Date;*/

/*
  private _ytdDays: number;
*/

  /*
    public dateSelections: DropdownSelectionValue[] = [];
  */

  constructor(private _router: Router
  ) {

    /*    this.minPickableDate = new Date(2018, 1, 3);
        this.maxPickableDate = new Date();*/


    /*
        this._getYTD();
    */

    /*    this.dateSelections = [
          {value: 30, viewValue: "30 Days"},
          {value: 90, viewValue: "90 days"},
          {value: 180, viewValue: "6 months"},
          {value: 365, viewValue: "1 year"},
          {value: this._ytdDays, viewValue: "YTD"}
        ];*/
  }

  public isActive(routerStr: string): boolean {
    return (this._router.url !== "/") ? this._router.url === routerStr : (routerStr === "/chart");
  }

}
