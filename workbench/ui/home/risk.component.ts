"use strict";

import { Component } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "risk",
    template: "risk",
    styleUrls: ["home.component.css"]
})
export class RiskComponent {
    styleObj: any;
    dataSource: any;
    activeTab = "Dashboard";

    constructor() {

    }

    ngOnInit() {
    }
}