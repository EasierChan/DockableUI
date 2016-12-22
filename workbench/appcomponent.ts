"use strict";


import { AppStoreService } from "../base/api/services/backendService";
import { Component } from "@angular/core";
import { IApp } from "../base/api/model/app.model";

@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "workbench.html",
    styleUrls: ["appcomponent.css"],
    providers: [
        AppStoreService
    ]
})
export class AppComponent {
    isAuthorized: boolean = false;
    username: string;
    password: string;
    apps: Array<IApp>;

    constructor(private appService: AppStoreService) {
    }

    OnLogin(): boolean {
        // alert("hello")
        console.log(this.username, this.password);
        // send username and password to server. get user profile to determine which apps user can access.
        if (this.username === "chenlei" && this.password === "123") {
            this.isAuthorized = true;

            this.apps = [
                {
                    id: "StrategyMonitor",
                    name: "StrategyMonitor",
                    desc: "StrategyMonitor",
                    category: "Transanctional"
                },
                {
                    id: "PortfolioMonitor",
                    name: "PortfolioMonitor",
                    desc: "PortfolioMonitor",
                    category: "Transanctional"
                },
                {
                    id: "DockDemo",
                    name: "DockDemo",
                    desc: "DockDemo",
                    category: "Transanctional"
                },
                {
                    id: "SpreadViewer",
                    name: "SpreadViewer",
                    desc: "SpreadViewer",
                    category: "Analytical"
                },
                {
                    id: "BookViewer",
                    name: "BookViewer",
                    desc: "BookViewer",
                    category: "Analytical"
                },
                {
                    id: "MultipleDemo",
                    name: "MultipleDemo",
                    desc: "MultipleDemo",
                    category: "Analytical"
                }
            ];

            let appnames = [];
            this.apps.forEach((item) => {
                appnames.push(item.name);
            });

            this.appService.initStore(appnames);
            return true;
        } else {
            this.showError("Error", "Username or password wrong.", "alert");
            return false;
        }
    }

    OnReset(): void {
        this.username = "";
        this.password = "";
    }

    OnStartApp(name: string): void {
        if (name) {
            if (!this.appService.startApp(name))
                this.showError("Error", "start app error!", "alert");
        } else {
            this.showError("Error", "App is unvalid!", "alert");
        }
    }

    showError(caption: string, content: string, type: string): void {
        $.Notify({
            caption: caption,
            content: content,
            type: type
        });
    }
}



/**
 * <div class="tile-square bg-orange fg-white" data-role="tile">
                    <div class="tile-content iconic">
                        <span class="icon mif-cloud"></span>
                        <span class="tile-label">Dockable-Layout</span>
                    </div>
                </div>
                <div class="title">
                <span class="close">&times;</span>
            </div>
 */
