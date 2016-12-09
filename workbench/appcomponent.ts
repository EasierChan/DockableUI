'use strict';

import { UApplication } from '../base/api/common/app/appstore';
import { Component } from "@angular/core";
import { IApp } from '../base/api/model/app.model';

@Component({
    moduleId: module.id,
    selector: 'body',
    templateUrl: 'workbench.html',
    styleUrls: ['appcomponent.css']
})
export class AppComponent {
    isAuthorized: boolean = false;
    username: string;
    password: string;
    apps: Array<Object>;

    OnLogin(): boolean {
        //alert('hello')
        console.log(this.username, this.password);
        // send username and password to server. get user profile to determine which apps user can access.
        if (this.username == 'chenlei' && this.password == '123') {
            this.isAuthorized = true;
            this.apps = [
                {
                    name: 'Dockable-layout'
                },
                {
                    name: 'SpreadViewer'
                }
            ]
            return true;
        } else {
            $.Notify({
                caption: 'Error',
                content: 'Username or password wrong.',
                type: 'alert'
            })
            return false;
        }
    }

    OnReset(): void {
        this.username = '';
        this.password = '';
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
