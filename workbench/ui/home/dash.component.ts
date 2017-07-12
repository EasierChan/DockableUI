"use strict";

import { Component } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "dashboard",
    template: "dashboard",
    styleUrls: ["home.component.css"]
})
export class DashboardComponent {
    styleObj: any;
    dataSource: any;
    activeTab = "Dashboard";

    constructor() {

    }

    ngOnInit() {
    }
}