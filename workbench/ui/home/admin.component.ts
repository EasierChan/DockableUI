"use strict";

import { Component } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "admin",
    template: "admin",
    styleUrls: ["home.component.css"]
})
export class AdminComponent {
    styleObj: any;
    dataSource: any;
    activeTab = "Dashboard";

    constructor() {

    }

    ngOnInit() {
    }
}