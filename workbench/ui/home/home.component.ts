"use strict";

import { Component, OnInit, Renderer, ElementRef } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "home",
    templateUrl: "home.component.html",
    styleUrls: ["home.component.css"],
    inputs: ["styleObj", "dataSource"]
})
export class HomeComponent implements OnInit {
    styleObj: any;
    dataSource: any;

    constructor(private ele: ElementRef, private render: Renderer) {
    }

    ngOnInit() {
    }
}