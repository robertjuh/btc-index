import {Component, EventEmitter, Input, Output, QueryList, ViewChildren} from "@angular/core";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {CheckboxSelection} from "../../../models/interface/checkbox-selection.interface";
import {StateDataService} from "../../../services/state-data.service";

@Component({
  selector: "filter-checkbox-select",
  template: `
    <button class="reset-button"
            (click)="resetSelections()"
            type="button"
            mat-button>
      Reset
    </button>
    <div class="checkbox-container">

      <h3 [textContent]="checkboxTitle + ' ' + 'filter'"></h3>

      <ng-container >
        <mat-checkbox *ngFor="let item of collection; let index = index"
          [checked]="checkedModel"
          [labelPosition]="'after'"
          [disabled]="disabled"
          (change)="handleChange($event, item)">
          <p [textContent]="item" class="textbox-text">
        </mat-checkbox>
      </ng-container>
    </div>
  `,
  styleUrls: ["./filter-checkbox-select.component.scss"]
})
export class FilterCheckboxSelectComponent {
  public checkedModel: boolean = true;
  public disabled: boolean = false;
  public indeterminate: boolean = true;

  @ViewChildren(MatCheckbox)
  public allCheckBoxes: QueryList<MatCheckbox>;

  @Input()
  public checkboxTitle: string;

  @Input()
  public set collection(inputCollection: string[]) {
    this._collection = inputCollection;
  }

  @Output()
  public checkboxValueChanged: EventEmitter<CheckboxSelection> = new EventEmitter<CheckboxSelection>();

  @Output()
  public selectionsReset: EventEmitter<void> = new EventEmitter<void>();

  public get collection(): string[] {
    return this._collection;
  }

  private _collection: string[];

  constructor(
    private _dataSvc: StateDataService
  ) {
  }

  public handleChange(event: MatCheckboxChange, changedItem: string): void {
    this.checkboxValueChanged.emit({
      checked: event.checked,
      changedItem: changedItem,
    });
  }

  public resetSelections(): void {
    this.allCheckBoxes.forEach((checkbox: MatCheckbox) => {
      checkbox.checked = true;
    });

    this.selectionsReset.emit();
  }
}
