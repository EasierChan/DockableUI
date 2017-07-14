"use strict";

import { Component, OnInit } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";

@Component({
    moduleId: module.id,
    selector: "backtest",
    templateUrl: "backtest.component.html"
})
export class BacktestComponent implements OnInit {
    tileArea: TileArea;

    constructor() {
    }

    ngOnInit() {

        this.tileArea = new TileArea();
        this.tileArea.title = "Tests";

        for (let i = 0; i < 20; ++i) {
            let tile = new Tile();
            tile.title = "hello";
            tile.iconName = "repeat";
            tile.backgroundColor = "#aaa";
            this.tileArea.addTile(tile);
        }

        this.tileArea.onClick = (item: Tile) => {
            alert(item.title);
        };

        this.tileArea.onCreate = () => {
            alert("onCreate");
        };

        this.tileArea.onSettingClick = () => {
            alert("onSetting");
        };
    }
}