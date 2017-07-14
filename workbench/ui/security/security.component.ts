"use strict";

import { Component } from "@angular/core";
import { DataTable, DataTableColumn, HBox, Label, TextBox, Button } from "../../../base/controls/control";

@Component({
    moduleId: module.id,
    selector: "security-master",
    templateUrl: "security.component.html",
    styleUrls: ["security.component.css"]
})
export class SecurityComponent {
    conditionBox: HBox;
    resTable: DataTable;

    constructor() {
        this.conditionBox = new HBox();
        this.conditionBox.height = 50;
        let txt_code = new TextBox();
        txt_code.Title = "Code:";
        txt_code.Width = 100;
        this.conditionBox.addChild(txt_code);
        this.resTable = new DataTable("table2");
        this.resTable.addColumn2(new DataTableColumn("UKey", false, true));
        this.resTable.addColumn2(new DataTableColumn("Symbol", false, true));
        this.resTable.addColumn2(new DataTableColumn("ChineseName", false, true));
        this.resTable.addColumn2(new DataTableColumn("ReleaseData", false, true));
        this.resTable.addColumn2(new DataTableColumn("OutDate", false, true));
    }
}