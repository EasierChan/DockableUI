"use strict";

import { Control } from "../../base/controls/control";

export class CustomControl extends Control {
    constructor() {
        super();
        this.styleObj = {
            type: "custom",
            subtype: "",
        };

        this.dataSource = {
        };
    }

    set name(value: string) {
        this.styleObj.subtype = value;
    }

    get name() {
        return this.styleObj.subtype;
    }
}