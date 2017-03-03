"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var backendService_1 = require("../base/api/services/backendService");
var core_1 = require("@angular/core");
var AppComponent = (function () {
    function AppComponent(appService) {
        this.appService = appService;
        this.isAuthorized = false;
        this.bPopPanel = false;
        this.config = new WorkspaceConfig();
        this.config.step = 1;
    }
    AppComponent.prototype.next = function () {
        this.config.step++;
        console.info(this.config.step);
    };
    AppComponent.prototype.prev = function () {
        this.config.step--;
    };
    AppComponent.prototype.finish = function () {
        this.closePanel();
    };
    AppComponent.prototype.closePanel = function (e) {
        if (e) {
            if (e.target.className.startsWith("dialog-overlay"))
                this.bPopPanel = false;
        }
        else
            this.bPopPanel = false;
        window.hideMetroDialog("#config");
    };
    AppComponent.prototype.onPopup = function () {
        this.bPopPanel = true;
        this.config.step = 1;
        window.showMetroDialog("#config");
        if (!this.config.name || this.config.name.trim() === "")
            this.panelTitle = "New Config";
        else
            this.panelTitle = this.config.name;
    };
    AppComponent.prototype.addInstance = function () {
        var newInstance = new StrategyInstance();
        newInstance.id = this.newestInstanceName;
        newInstance.params = {};
        this.config.strategyInstances.push(newInstance);
    };
    AppComponent.prototype.removeInstance = function (e, index) {
        console.info(index);
        this.config.strategyInstances.splice(index, 1);
        e.preventDefault();
        e.stopPropagation();
    };
    AppComponent.prototype.onSelectServer = function (item) {
        this.serverinfo = item;
    };
    AppComponent.prototype.selectStrategy = function (value) {
        this.config.selectedStrategy = value;
    };
    AppComponent.prototype.onLogin = function () {
        // alert("hello")
        console.log(this.username, this.password);
        // send username and password to server. get user profile to determine which apps user can access.
        var ret = this.appService.getUserProfile({
            username: this.username,
            password: this.password,
            roles: null,
            apps: null
        });
        if (ret !== false && ret instanceof Array) {
            this.isAuthorized = true;
            this.apps = ret;
            return true;
        }
        else {
            this.showError("Error", "Username or password wrong.", "alert");
            return false;
        }
    };
    AppComponent.prototype.onReset = function () {
        this.username = "";
        this.password = "";
    };
    AppComponent.prototype.onStartApp = function (name) {
        // alert(name);
        if (name) {
            if (!this.appService.startApp(name))
                this.showError("Error", "start " + name + " app error!", "alert");
        }
        else {
            this.showError("Error", "App is unvalid!", "alert");
        }
    };
    AppComponent.prototype.showError = function (caption, content, type) {
        window.$.Notify({
            caption: caption,
            content: content,
            type: type
        });
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: "body",
        templateUrl: "workbench.html",
        styleUrls: ["appcomponent.css"],
        providers: [
            backendService_1.AppStoreService
        ]
    }),
    __metadata("design:paramtypes", [backendService_1.AppStoreService])
], AppComponent);
exports.AppComponent = AppComponent;
var WorkspaceConfig = (function () {
    function WorkspaceConfig() {
        this._tradingUniverse = [];
        this._strategyInstances = [];
    }
    Object.defineProperty(WorkspaceConfig.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorkspaceConfig.prototype, "step", {
        get: function () {
            return this._curstep;
        },
        set: function (value) {
            this._curstep = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorkspaceConfig.prototype, "selectedStrategy", {
        get: function () {
            return this._strategyCoreName;
        },
        set: function (value) {
            this._strategyCoreName = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorkspaceConfig.prototype, "strategyInstances", {
        get: function () {
            return this._strategyInstances;
        },
        enumerable: true,
        configurable: true
    });
    return WorkspaceConfig;
}());
var StrategyInstance = (function () {
    function StrategyInstance() {
    }
    return StrategyInstance;
}());
var Channel = (function () {
    function Channel() {
    }
    return Channel;
}());
//# sourceMappingURL=appcomponent.js.map