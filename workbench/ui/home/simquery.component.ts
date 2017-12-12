"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, MenuItem, AppStoreService } from "../../../base/api/services/backend.service";
import { SSGW_MSG, ServiceType } from "../../../base/api/model";
import { QtpService } from "../../bll/services";

@Component({
    moduleId: module.id,
    selector: "sim-query",
    templateUrl: "simquery.html"
})
export class SimQueryComponent {
}