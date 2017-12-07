/**
 * created by 2017/12/07
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { QtpService } from "../../bll/services";
import { SSGW_MSG, ServiceType } from "../../../base/api/model";

@Component({
    moduleId: module.id,
    selector: "basket-admin",
    templateUrl: "basket.html"
})
export class BasketComponent implements OnInit {

    constructor(private appsrv: AppStoreService, private tradeEndPoint: QtpService, private configBll: ConfigurationBLL, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.registerListeners();
    }

    registerListeners() {
    }
}
