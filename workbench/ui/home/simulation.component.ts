"use strict";

import { Component } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "simulation",
    template: "simulation",
    styleUrls: ["home.component.css"]
})
export class SimulationComponent {
    styleObj: any;
    dataSource: any;
    activeTab = "Dashboard";

    constructor() {

    }

    ngOnInit() {
    }
}