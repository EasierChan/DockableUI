/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */
"use strict";

import {
    Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef, HostListener,
    EventEmitter
} from "@angular/core";
import {
    DockContainer, BookViewer, Splitter
} from "../../base/controls/control";
import {
    AppStateCheckerRef, SecuMasterService, TranslateService,
    AppStoreService
} from "../../base/api/services/backend.service";

/**
 * date 2017/07/24
 * author: cl
 * desc: to draw the lines with EchartDirective 
 */
@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "../DockDemo/app.component.html",
    providers: [
        AppStateCheckerRef,
        TranslateService,
        SecuMasterService
    ]
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly apptype = "bookviewer";
    quoteHeart: any;
    option: any;
    languageType = 0;
    kwlist: number[];
    name: string;
    ukeys: number[];
    tableMatrix: number[];
    layout: any;
    main: DockContainer;

    constructor(private state: AppStateCheckerRef,
        private secuinfo: SecuMasterService, private langSrv: TranslateService) {
        this.state.onInit(this, this.onReady);
        this.state.onResize(this, this.onResize);
        this.state.onDestory(this, this.onDestroy);
    }

    onReady(option: any) {
        this.option = option;
        let language = this.option.lang;

        switch (language) {
            case "zh-cn":
                this.languageType = 1;
                break;
            case "en-us":
                this.languageType = 0;
                break;
            default:
                this.languageType = 0;
                break;
        }
    }

    onResize() {
        // this.main.reallocSize()
    }

    onDestroy() {
        if (this.name.length < 1)
            return;

        this.state.saveAs(this, this.name, {
            name: this.name, ukeys: this.ukeys,
            tableMatrix: this.tableMatrix,
            layout: this.layout
        });
    }

    ngOnInit() {
        this.name = this.option.name || "";
        this.ukeys = this.option.ukeys || [];
        this.tableMatrix = this.option.tableMatrix || [2, 2];
        let [width, height, halfW, halfH] = [window.innerWidth - 10, window.innerHeight, Math.round((window.innerWidth - 10 - Splitter.size) / 2), Math.round((window.innerHeight - Splitter.size) / 2)];
        this.layout = this.option.layout || {
            w: width,
            h: height,
            subs: [
                {
                    w: width, h: halfH,
                    subs: [
                        { w: halfW, h: halfH },
                        { w: width - halfW - Splitter.size, h: halfH }
                    ]
                },
                {
                    w: width, h: height - halfH,
                    subs: [
                        { w: halfW, h: height - halfH - Splitter.size },
                        { w: width - halfW - Splitter.size, h: height - halfH - Splitter.size }
                    ]
                }
            ]
        };

        this.initializeComponents();
    }

    save() {
        if (this.name.length < 1)
            return;

        this.state.saveAs(this, this.name, { name: this.name });
    }

    ngOnDestroy() {
    }

    initializeComponents() {
        let bvContainers = [];
        this.main = new DockContainer(null, "v", this.layout.w, this.layout.h); // this.option.layout.height

        for (let irow = 0; irow < this.tableMatrix[0]; ++irow) {
            let hContainer = new DockContainer(this.main, "h", this.layout.subs[irow].w, this.layout.subs[irow].h);

            for (let icol = 0; icol < this.tableMatrix[1]; ++icol) {
                let vContainer = new DockContainer(hContainer, "v", this.layout.subs[irow].subs[icol].w, this.layout.subs[irow].subs[icol].h);
                bvContainers.push(vContainer);
                hContainer.addChild(vContainer);

                if (icol < this.tableMatrix[1] - 1) {
                    hContainer.addChild(new Splitter("v", hContainer));
                }
            }

            this.main.addChild(hContainer);

            if (irow < this.tableMatrix[0] - 1) {
                this.main.addChild(new Splitter("h", this.main));
            }
        }

        let count = 0;
        // bookviewTable
        if (this.ukeys) {
            this.ukeys.forEach((ukey, idx) => {
                let codeInfo = this.secuinfo.getSecuinfoByUKey(ukey);
                let bookviewer = new BookViewer(this.langSrv);
                bookviewer.codeValue = { symbolCode: codeInfo[ukey].symbolCode };
                bookviewer.ukey = ukey;
                bvContainers[idx].addChild(bookviewer);

                ++count;
            });
        }

        let len = this.tableMatrix[0] * this.tableMatrix[1];

        for (let i = count; i < len; ++i) {
            let bookviewer = new BookViewer(this.langSrv);
            bvContainers[i].addChild(bookviewer);
        }
    }
}
