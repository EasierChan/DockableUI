"use strict";

import { Component } from "@angular/core";
import { TradeService } from "../../bll/services";

@Component({
    moduleId: module.id,
    selector: "risk",
    template: "risk",
    styleUrls: ["home.component.css"]
})
export class RiskComponent {
    styleObj: any;
    dataSource: any;

    constructor(private trade: TradeService) {

    }

    ngOnInit() {
        this.registerListeners();
        this.trade.send(130, 2001, {});
    }

    registerListeners() {
        this.trade.addSlot({
            appid: 130,
            packid: 2002,
            callback: (msg) => {
                console.info(msg);
            }
        });
    }
}