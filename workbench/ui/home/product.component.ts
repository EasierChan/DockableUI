"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL } from "../../bll/strategy.server";
import { QtpService } from "../../bll/services";

@Component({
    moduleId: module.id,
    selector: "products",
    templateUrl: "product.html",
    styleUrls: ["product.css"]
})
export class ProductsComponent implements OnInit {
    areas: TileArea[];

    productArea: TileArea;
    products: any[];
    selectedProduct: any;
    userId: any;
    // monitorProductsData: any;

    constructor(private tradePoint: QtpService, private appsrv: AppStoreService,  private config: ConfigurationBLL, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.userId = Number(this.config.get("user").userid);
        this.tradePoint.sendToCMS("getMonitorProducts", JSON.stringify({ data: { head: { userid: this.userId }, body: {  } } }));
        this.tradePoint.addSlotOfCMS("getMonitorProducts", (msg) => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode !== "00") {
                alert("getMonitorProducts:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            this.products = data.body;
            if (this.products.length > 0) {
                this.products.forEach((item, index) => {
                    item.totalAssets = Number(item.totalint) + Number(item.subject_amount);
                    // 期货权益
                    item.futuresProfit = Number(item.futures_validamt) + Number(item.futures_value);
                    // 风险度
                    item.riskDegree = (item.futuresProfit === 0) ? 0 : 100 * item.totalmargin / item.futuresProfit;
                    item.riskDegree = Math.abs(item.riskDegree) > 100 ? Number(item.riskDegree.toFixed(0)) : Number(item.riskDegree.toFixed(2));
                    // 当日盈亏
                    item.totalProfitAndLoss = this.toThousands(((Number(item.hold_closepl) + Number(item.hold_posipl)) / 1000).toFixed(1));
                    // 浮动盈亏
                    item.floatProfitAndLoss = this.toThousands((item.hold_posipl / 1000).toFixed(1));
                    // 敞口比例
                    item.riskExposure = (Number(item.totalint) === 0) ? 0 : 100 * Number(Number(item.risk_exposure) / Number(item.totalint));
                    item.riskExposure = Math.abs(item.riskExposure) > 100 ? Number(item.riskExposure.toFixed(0)) : Number(item.riskExposure.toFixed(2));
                    // 可用资金
                    item.availableFund = this.toThousands(((Number(item.stock_validamt) + Number(item.futures_validamt)) / 10000 ).toFixed(2));
                });
            }
        }, this);
    }
    toProductsDetail(product) {
        console.log(product);
        this.appsrv.startApp(product.caname, "ProductTrader", {
            productID: product.caid
        });
    }
    // 千分符
    toThousands(num) {
        let intNumber = typeof (num) !== "String" ? num.toString() : num;
        let numArr = intNumber.split(".");
        let newstr = numArr[0].replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
            return s + ",";
        });
        if (numArr.length === 2) {
            newstr = newstr + "." + numArr[1];
        }
        return newstr;
    }



}