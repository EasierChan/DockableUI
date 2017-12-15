/**
 * created by 2017/12/07
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { VBoxDirective } from "../../../base/controls/user.component";
import { DataTable, Dialog } from "../../../base/controls/control";
import { ConfigurationBLL } from "../../bll/strategy.server";
import { File, AppStoreService, MessageBox, path } from "../../../base/api/services/backend.service";
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
    stockTable: DataTable;
    items: any[];
    dialog: Dialog;
    basketCount: number;
    changing: boolean;
    reqMap: any = {};
    userid: any;
    curBasketID: any;
    curBasketName: any;
    curTrday: any;
    static reqsn: number = 0;

    constructor(private appsrv: AppStoreService, private tradeEndPoint: QtpService, private configBll: ConfigurationBLL,
        private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.dialog = this.appsrv.getDialog();
        this.basketsTable = new DataTable("table2");
        this.basketsTable.addColumn("选中", "名称", "数据目录", "价格");
        this.basketsTable.columns[0].hidden = true;
        this.basketsTable.columns[0].maxWidth = 50;

        this.stockTable = new DataTable("table2");
        this.stockTable.addColumn("名称", "数量", "金额");

        this.items = [];
        this.changing = false;
        this.userid = this.configBll.get("user").userid;

        this.registerListeners();
    }

    registerListeners() {
        this.configBll.on("getBasketInfo", (obj) => {
            this.basketsTable.rows.length = 0;

            obj.body.forEach(item => {
                let row = this.basketsTable.newRow();
                row.cells[0].Type = "checkbox";
                row.cells[0].Text = false;
                row.cells[1].Data = item.basketid;
                row.cells[1].Text = item.basket_name;
                row.cells[3].Text = "0.0000";
            });

            this.basketCount = this.basketsTable.rows.length;
        });

        this.tradeEndPoint.addSlotOfCMS("getBasketTradingDay", (data) => {
            this.items.length = 0;
            let obj = JSON.parse(data.toString());
            obj.body.forEach(item => {
                this.items.push(item);
            });

            this.curTrday = this.items.length > 0 ? this.items[0].trday : null;
            this.ref.detectChanges();
            this.viewBasketInfo();
        }, this);

        this.tradeEndPoint.addSlotOfCMS("createBasketInfo", (data) => {
            let ret = JSON.parse(data.toString());

            if (ret.msret.msgcode !== "00") {
                alert(ret.msret.msg);
                return;
            }

            if (this.reqMap[ret.head.reqsn]) {
                this.basketsTable.rows[this.reqMap[ret.head.reqsn]].cells[1].Data = ret.body[0].basketid;
                this.basketsTable.rows[this.reqMap[ret.head.reqsn]].cells[1].Type = "plaintext";
                this.basketsTable.rows[this.reqMap[ret.head.reqsn]].cells[2].Type = "plaintext";
                this.basketsTable.rows[this.reqMap[ret.head.reqsn]].cells[3].Text = "0.0000";
                delete this.reqMap[ret.head.reqsn];
            }

            this.changing = false;
            this.basketCount = this.basketsTable.rows.length;
        }, this);

        this.tradeEndPoint.addSlotOfCMS("getBasketInstance", (data) => {
            let ret = JSON.parse(data.toString());

            if (ret.msret.msgcode !== "00") {
                alert(ret.msret.msg);
                return;
            }

            if (ret.body && ret.body.length > 0 && ret.body[0].basketid === this.curBasketID && ret.body[0].trday === this.curTrday) {
                if (ret.body[0].content) {
                    let basket = File.parsePCF(ret.body[0].content);

                    basket.components.forEach(item => {
                        let row = this.stockTable.newRow();
                        row.cells[0].Text = item.code;
                        row.cells[1].Text = item.amount;
                        row.cells[2].Text = item.cash_rep;
                    });
                } else {
                    console.error("UNVALID BASKET CONTENT!");
                }
            }
        }, this);

        this.tradeEndPoint.addSlotOfCMS("createBasketInstance", (data) => {
            let ret = JSON.parse(data.toString());

            if (ret.msret.msgcode !== "00") {
                alert(ret.msret.msg);
                return;
            }

            if (this.reqMap[ret.head.reqsn] && this.reqMap[ret.head.reqsn].length > 1) {
                if (this.reqMap[ret.head.reqsn][0] === this.curBasketID) {
                    this.items.push({ trday: this.reqMap[ret.head.reqsn][1] });
                }
            }
        }, this);

        this.tradeEndPoint.addSlotOfCMS("deleteBaksetInfo", (data) => {
            let ret = JSON.parse(data.toString());

            if (ret.msret.msgcode !== "00") {
                alert(ret.msret.msg);
                return;
            }


        }, this);

        this.tradeEndPoint.sendToCMS("getBasketInfo", JSON.stringify({ data: { head: { reqsn: 1 }, body: { userid: this.userid } } }));

        this.basketsTable.onRowDBClick = (row) => {
            this.stockTable.rows.length = 0;
            this.curBasketID = row.cells[1].Data;
            this.curBasketName = row.cells[1].Text;
            this.tradeEndPoint.sendToCMS("getBasketTradingDay", JSON.stringify({ data: { head: { reqsn: 1, userid: this.userid }, body: { basketid: this.curBasketID } } }));
        };
    }

    onBasketCreate() {
        this.basketCount = this.basketsTable.rows.length;
        let row = this.basketsTable.newRow();
        row.cells[1].Type = "textbox";
        row.cells[2].Type = "textbox";

        this.changing = true;
    }

    onBasketRemove() {
        this.basketsTable.columns[0].hidden = false;

        this.changing = true;
    }

    onSubmit() {
        let row;

        if (this.basketsTable.columns[0].hidden) {
            for (let i = this.basketCount; i < this.basketsTable.rows.length; ++i) {
                row = this.basketsTable.rows[i];

                if (row.cells[1].Text === "") {
                    alert("篮子名称不能为空!");
                    break;
                }

                this.tradeEndPoint.sendToCMS("createBasketInfo", JSON.stringify({
                    data: {
                        head: { reqsn: BasketComponent.reqsn, userid: this.userid },
                        body: { basket_name: row.cells[1].Text, basket_type: 0, oid: this.userid }
                    }
                }));

                this.reqMap[BasketComponent.reqsn] = i;
                ++BasketComponent.reqsn;
            }
        } else {
            for (let i = 0; i < this.basketsTable.rows.length;) {
                if (this.basketsTable.rows[0].cells[0].Text) {
                    this.tradeEndPoint.sendToCMS("deleteBasketInfo", JSON.stringify({
                        data: {
                            head: { reqsn: BasketComponent.reqsn, userid: this.userid },
                            body: { basketid: this.basketsTable.rows[0].cells[1].Data }
                        }
                    }));

                    this.basketsTable.rows.splice(i, 1);
                    ++BasketComponent.reqsn;
                    continue;
                }

                ++i;
            }

            this.changing = false;
            this.basketsTable.columns[0].hidden = true;
        }

        row = null;
    }

    onUndo() {
        this.basketsTable.rows.length = this.basketCount;
        this.basketsTable.columns[0].hidden = true;
        this.changing = false;
    }

    viewBasketInfo() {
        if (this.curBasketID && this.curTrday) {
            this.tradeEndPoint.sendToCMS("getBasketInstance", JSON.stringify({
                data: {
                    head: { reqsn: BasketComponent.reqsn, userid: this.userid },
                    body: { basketid: this.curBasketID, trday: this.curTrday }
                }
            }));

            ++BasketComponent.reqsn;
        }
    }

    onImport() {
        MessageBox.openFileDialog("导入篮子", (filenames: string[]) => {
            if (!filenames)
                return;

            filenames.forEach(name => {
                let [trday, version] = File.basename(name, ".bkt").split("-");
                this.tradeEndPoint.sendToCMS("createBasketInstance", JSON.stringify({
                    data: {
                        head: { reqsn: BasketComponent.reqsn, userid: this.userid },
                        body: { trday: trday, basketid: this.curBasketID, content: File.readFileSync(name) }
                    }
                }));

                this.reqMap[BasketComponent.reqsn] = [this.curBasketID, trday];
                ++BasketComponent.reqsn;
            });
        });
    }
}
