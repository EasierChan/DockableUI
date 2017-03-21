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
var backendService_1 = require("../base/api/services/backendService");
var ip20Service_1 = require("../base/api/services/ip20Service");
var core_1 = require("@angular/core");
var app_model_1 = require("../base/api/model/app.model");
var strategy_server_1 = require("./bll/strategy.server");
var AppComponent = (function () {
    function AppComponent(appService, tgw, ref) {
        var _this = this;
        this.appService = appService;
        this.tgw = tgw;
        this.ref = ref;
        this.ssBll = new strategy_server_1.StrateServerBLL();
        this.isAuthorized = false;
        this.channels = [];
        this.config = new app_model_1.WorkspaceConfig();
        this.config.curstep = 1;
        this.bDetails = false;
        this.bLeftSelectedAll = this.bRightSelectedAll = false;
        this.selectedList = [];
        this.queryList = [];
        this.contextMenu = new backendService_1.Menu();
        this.contextMenu.addItem("Open", function () {
            _this.onStartApp(_this.config.apptype);
        });
        this.contextMenu.addItem("Modify", function () {
            _this.onPopup(1);
        });
        this.contextMenu.addItem("Remove", function () {
            _this.configs.forEach(function (config, index) {
                if (config.name === _this.config.name) {
                    _this.configs.splice(index);
                    _this.ref.detectChanges();
                }
            });
        });
        var timestamp = new Date();
        timestamp = timestamp.format("yyyymmddHHMMss") + "" + timestamp.getMilliseconds();
        timestamp = timestamp.substr(0, timestamp.length - 1);
        this.tgw.connect(6114, "172.24.51.9");
        var loginObj = { "cellid": "1", "userid": "1.1", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 10, "clientdisksn": "", "clientnetip": "172.24.51.6", "clientnetmac": "f48e38bb77ce", "clientesn": "9693a58a65e2e97fe42a41c10616ae29223fb6364b04e0d9336252fba9ed339b030d4592f987fa526edca6cca021721db6f42eeae0bdf750febd9b938526d0a9", "clienttgwapi": "tgwapi253", "clientapp": "", "clientwip": "0.0.0.0", "clienttm": timestamp, "clientcpuid": "BFEBFBFF000506E3" };
        console.info(loginObj);
        this.tgw.send(17, 41, loginObj);
        setTimeout(function () {
            _this.tgw.send(270, 194, { "head": { "realActor": "getTemplate", "pkgId": 4 }, "page": { "page": 1, "pagesize": 2 } });
        }, 2000);
    }
    AppComponent.prototype.onClick = function (e, item) {
        this.curItem = item;
        if (e.button === 2) {
            // TODO Show Menu
            this.contextMenu.popup();
        }
        else {
            console.info(this.config.name);
            this.onStartApp(this.config.apptype);
        }
    };
    AppComponent.prototype.next = function () {
        this.config.curstep++;
    };
    AppComponent.prototype.prev = function () {
        this.config.curstep--;
    };
    AppComponent.prototype.finish = function () {
        this.closePanel();
    };
    AppComponent.prototype.closePanel = function (e) {
        window.hideMetroDialog("#config");
    };
    Object.defineProperty(AppComponent.prototype, "detailClass", {
        get: function () {
            return this.bDetails
                ? "tile-small bg-blue fg-white"
                : "tile-square bg-blue fg-white";
        },
        enumerable: true,
        configurable: true
    });
    AppComponent.prototype.toggleDetails = function () {
        var _this = this;
        this.bDetails = !this.bDetails;
        setTimeout(function () {
            if (_this.detailClass.startsWith("tile-small"))
                window.showMetroCharm("#detailCharm");
            else
                window.hideMetroCharm("#detailCharm");
        }, 0);
    };
    /**
     * @param type 0 is new config, 1 is modify config.
     */
    AppComponent.prototype.onPopup = function (type) {
        var _this = this;
        if (type === void 0) { type = 0; }
        this.config = null;
        // this.bPopPanel = true;
        this.strategyCores = this.ssBll.getTemplates();
        if (type === 0) {
            this.config = new app_model_1.WorkspaceConfig();
            this.panelTitle = "New Config";
        }
        else {
            // getTheConfig by this.curItem on click
            this.config = this.curItem;
            this.panelTitle = this.config.name;
            var templateObj_1 = this.ssBll.getTemplateByName(this.config.strategyCoreName);
            if (templateObj_1 === null) {
                this.showError("Error: getTemplateByName", "not found " + this.config.name, "alert");
                return;
            }
            this.channels = [];
            templateObj_1["SSGWs"].forEach(function (channelName) {
                var channel = new app_model_1.Channel();
                channel.enable = _this.config.channels.includes(channelName); // default
                channel.name = templateObj_1["SSGW"]["name"][channelName];
                channel.type = templateObj_1["SSGW"]["type"][channelName];
                channel.addr = templateObj_1["SSGW"]["addr"][channelName];
                channel.port = templateObj_1["SSGW"]["port"][channelName];
                _this.channels.push(channel);
            });
        }
        this.ref.detectChanges();
        window.showMetroDialog("#config");
    };
    AppComponent.prototype.queryCodes = function () {
        this.queryList = [];
        for (var i = 0; i < 5; ++i) {
            this.queryList.push({
                bChecked: false,
                ukey: i + 1,
                code: "000001",
                name: "pinan"
            });
        }
    };
    AppComponent.prototype.appendCodes = function () {
        var _this = this;
        var count = this.selectedList.length;
        var i = 0;
        this.queryList.forEach(function (queryItem) {
            if (queryItem.bChecked) {
                for (i = 0; i < count; ++i) {
                    if (_this.selectedList[i].ukey === queryItem.ukey)
                        break;
                }
                if (i === count)
                    _this.selectedList.push(Object.assign({}, queryItem));
            }
        });
        count = null;
        i = null;
    };
    AppComponent.prototype.removeCodes = function () {
        for (var i = this.selectedList.length - 1; i >= 0; --i) {
            if (this.selectedList[i].bChecked)
                this.selectedList.splice(i, 1);
        }
    };
    AppComponent.prototype.leftSelectAll = function () {
        var _this = this;
        this.bLeftSelectedAll = !this.bLeftSelectedAll;
        this.queryList.forEach(function (item) {
            item.bChecked = _this.bLeftSelectedAll;
        });
    };
    AppComponent.prototype.rightSelectAll = function () {
        var _this = this;
        this.bRightSelectedAll = !this.bRightSelectedAll;
        this.selectedList.forEach(function (item) {
            item.bChecked = _this.bRightSelectedAll;
        });
    };
    AppComponent.prototype.addInstance = function () {
        if (!this.config.strategyCoreName || this.config.strategyCoreName.length === 0) {
            this.showError("Warning", "a strategycore needed.", "alert");
            return;
        }
        var newInstance = new app_model_1.StrategyInstance();
        newInstance.id = this.newestInstanceName;
        newInstance.params = {};
        this.config.strategyInstances.push(newInstance);
    };
    AppComponent.prototype.removeInstance = function (e, index) {
        this.config.strategyInstances.splice(index, 1);
        e.preventDefault();
        e.stopPropagation();
    };
    AppComponent.prototype.onSelectServer = function (item) {
        this.serverinfo = item;
    };
    AppComponent.prototype.onSelectStrategy = function (value) {
        var _this = this;
        this.config.strategyCoreName = value;
        var templateObj = this.ssBll.getTemplateByName(this.config.strategyCoreName);
        if (templateObj === null) {
            this.showError("Error: getTemplateByName", "not found " + this.config.name, "alert");
            return;
        }
        this.channels = [];
        templateObj["SSGWs"].forEach(function (channelName) {
            var channel = new app_model_1.Channel();
            channel.enable = _this.config.channels.includes(channelName); // default
            channel.name = templateObj["SSGW"]["name"][channelName];
            channel.type = templateObj["SSGW"]["type"][channelName];
            channel.addr = templateObj["SSGW"]["addr"][channelName];
            channel.port = templateObj["SSGW"]["port"][channelName];
            _this.channels.push(channel);
        });
    };
    AppComponent.prototype.onLogin = function () {
        // alert("hello")
        // console.log(this.username, this.password);
        // send username and password to server. get user profile to determine which apps user can access.
        var ret = this.appService.getUserProfile({
            username: this.username,
            password: this.password,
            roles: null,
            apps: null
        });
        this.isAuthorized = true;
        if (this.isAuthorized) {
            this.configs = this.ssBll.getAllConfigs();
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
            backendService_1.AppStoreService,
            ip20Service_1.IP20Service,
            backendService_1.Menu
        ]
    }),
    __metadata("design:paramtypes", [backendService_1.AppStoreService, ip20Service_1.IP20Service, core_1.ChangeDetectorRef])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=appcomponent.js.map