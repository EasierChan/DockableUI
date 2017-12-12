/**
 * created by 2017/12/07
 */
"use strict";

import { Component, OnInit } from "@angular/core";
import { VBoxDirective } from "../../../base/controls/user.component";
import { DataTable, Dialog } from "../../../base/controls/control";
import { ConfigurationBLL } from "../../bll/strategy.server";
import { File, AppStoreService } from "../../../base/api/services/backend.service";
import { QtpService } from "../../bll/services";
import { SSGW_MSG, ServiceType, BasketPCF } from "../../../base/api/model";

@Component({
    moduleId: module.id,
    selector: "basket-admin",
    templateUrl: "basket.html",
    styleUrls: ["home.component.css", "basket.css"]
})
export class BasketComponent implements OnInit {
    basketsTable: DataTable;
    items: any[];
    dialog: Dialog;
    basketCount: number;
    changing: boolean;
    reqMap: any = {};
    static reqsn: number = 0;

    constructor(private appsrv: AppStoreService, private tradeEndPoint: QtpService, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.dialog = this.appsrv.getDialog();
        this.basketsTable = new DataTable("table2");
        this.basketsTable.addColumn("名称", "价格");
        this.items = [];
        this.changing = false;

        this.registerListeners();
        // File.readPCF("/mnt/dropbox/basket/basket_example.bkt").then((value: BasketPCF) => {
        //     console.info(value.params);
        // });
    }

    registerListeners() {
        this.tradeEndPoint.addSlotOfCMS("getBasketInfo", (data) => {
            let obj = JSON.parse(data.toString());
            this.basketsTable.rows.length = 0;

            obj.body.forEach(item => {
                let row = this.basketsTable.newRow();
                row.cells[0].Data = item.basketid;
                row.cells[0].Text = item.basket_name;
                row.cells[0].Text = "0.0000";
            });

            this.basketCount = this.basketsTable.rows.length;
        }, this);

        this.tradeEndPoint.addSlotOfCMS("getBasketTradingDay", (data) => {
            let obj = JSON.parse(data.toString());
            obj.body.forEach(item => {
                this.items.push({ title: item.trday, id: item.basketid });
            });
        }, this);

        this.tradeEndPoint.addSlotOfCMS("createBasketInfo", (data) => {
            let ret = JSON.parse(data.toString());
            if (ret.msret.msgcode !== "00") {
                alert(ret.msret.msg);
                return;
            }

            if (this.reqMap[ret.head.reqsn]) {
                this.basketsTable.rows[this.reqMap[ret.head.reqsn]].cells[0].Data = ret.body[0].basketid;
                this.reqMap[ret.head.reqsn] = null;
            }
        }, this);

        this.tradeEndPoint.sendToCMS("getBasketInfo", JSON.stringify({ data: { body: {} } }));

        this.basketsTable.onRowDBClick = (row) => {
            this.tradeEndPoint.sendToCMS("getBasketTradingDay", JSON.stringify({ data: { body: { basketid: row.cells[0].Data } } }));
        };
    }

    onBasketCreate() {
        let row = this.basketsTable.newRow();
        row.cells[0].Type = "textbox";

        this.changing = true;
    }

    onSubmit() {
        let row;

        for (let i = this.basketCount; i < this.basketsTable.rows.length; ++i) {
            row = this.basketsTable.rows[i];

            if (row.cells[0].Text === "") {
                alert("篮子名称不能为空!");
                break;
            }

            row.cells[0].Type = "plaintext";
            this.tradeEndPoint.sendToCMS("createBasketInfo", JSON.stringify({
                data: {
                    head: { reqsn: BasketComponent.reqsn, userid: this.configBll.get("user").userid },
                    body: { basket_name: row.cells[0].Text, basket_type: 0, owerid: this.configBll.get("user").userid }
                }
            }));

            this.reqMap[BasketComponent.reqsn] = i;
            ++BasketComponent.reqsn;
        }

        row = null;
    }
}
