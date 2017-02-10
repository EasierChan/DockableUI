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
        let ret = this.appService.getUserProfile({
            username: this.username,
            password: this.password,
            roles: null,
            apps: null
        });

        if (ret !== true && ret instanceof Array) {
            this.isAuthorized = true;
            this.apps = ret;
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
        // alert(name);
        if (name) {
            if (!this.appService.startApp(name))
                this.showError("Error", `start ${name} app error!`, "alert");
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
