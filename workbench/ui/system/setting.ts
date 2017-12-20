"use strict";

import { Component, OnInit } from "@angular/core";
import { AppStoreService } from "../../../base/api/services/backend.service";
import { DataTable } from "../../../base/controls/control";

@Component({
    moduleId: module.id,
    selector: "setting",
    templateUrl: "setting.html",
    styleUrls: ["../home/home.component.css", "./setting.css"]
})
export class SettingComponent implements OnInit {
    name: string = "设置";
    versionTable: DataTable;
    setting: any;

    constructor(private appServ: AppStoreService) {
    }

    ngOnInit() {
        this.createVersionTable();
        this.setting = this.appServ.getSetting();

        if (this.setting.externalLinks === undefined) {
            this.setting.externalLinks = {};
        }
    }

    createVersionTable() {
        this.versionTable = new DataTable();
        this.versionTable.RowIndex = false;
        this.versionTable.addColumn("名称", "信息");
        let row = this.versionTable.newRow();
        row.cells[0].Text = "版本（主）";
        row.cells[1].Text = "1.0.2.1";

        row = this.versionTable.newRow();
        row.cells[0].Text = "版本（N）";
        row.cells[1].Text = "7.1.0";

        row = this.versionTable.newRow();
        row.cells[0].Text = "版本（E）";
        row.cells[1].Text = "1.6.1";

        row = this.versionTable.newRow();
        row.cells[0].Text = "版本（G）";
        row.cells[1].Text = "53.0.2785.113";

        row = this.versionTable.newRow();
        row.cells[0].Text = "Build";
        row.cells[1].Text = "36f99c195c019db1654275ec9220f4bb39041f1b";
    }

    saveSetting() {
        this.appServ.saveSetting(this.setting);
    }
}