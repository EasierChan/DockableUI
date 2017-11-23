"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL } from "../../bll/strategy.server";

@Component({
    moduleId: module.id,
    selector: "products",
    template: `<tilearea [dataSource]="productArea.dataSource" [styleObj]="productArea.styleObj"></tilearea>`
    // styleUrls: ["products.component.css"]
})
export class ProductsComponent implements OnInit {
    areas: TileArea[];

    productArea: TileArea;
    products: any[];
    selectedProduct: any;

    constructor(private appsrv: AppStoreService, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.areas = [];
        this.initializeProducts();
    }

    initializeProducts() {
        this.productArea = new TileArea();
        this.productArea.title = "产品";
        this.productArea.onClick = (event: MouseEvent, item: Tile) => {
            if (event.button === 0) {  // left click
                this.appsrv.startApp("产品信息", "Dialog", {
                    dlg_name: "product",
                    productID: item.id
                });
            }
        };

        this.products = this.configBll.getProducts();
        if (this.products) {
            this.products.forEach(product => {
                let tile = new Tile();
                tile.title = product.caname;
                tile.iconName = "folder-close";
                tile.id = product.caid;
                this.productArea.addTile(tile);
            });
        }

        this.areas.push(this.productArea);
    }
}