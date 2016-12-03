"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * created by chenlei
 */
var core_1 = require("@angular/core");
var DockContainerComponent = (function () {
    function DockContainerComponent() {
    }
    return DockContainerComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], DockContainerComponent.prototype, "styleObj", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], DockContainerComponent.prototype, "dataSource", void 0);
DockContainerComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'dock-control',
        templateUrl: 'controlTree.html',
        inputs: ['className', 'children']
    }),
    __metadata("design:paramtypes", [])
], DockContainerComponent);
exports.DockContainerComponent = DockContainerComponent;
var Control = (function () {
    function Control() {
    }
    return Control;
}());
exports.Control = Control;
var DockContainer = (function (_super) {
    __extends(DockContainer, _super);
    function DockContainer(type, width, height) {
        var _this = _super.call(this) || this;
        if (type === "v") {
            _this.className = "dock-container vertical";
            _this.styleObj = {
                type: '',
                width: width == undefined ? 300 : width,
                height: null
            };
        }
        else {
            _this.className = "dock-container horizental";
            _this.styleObj = {
                type: '',
                width: null,
                height: height == undefined ? 200 : height
            };
        }
        _this.children = [];
        return _this;
    }
    DockContainer.prototype.addChild = function (containerRef) {
        this.children.push(containerRef);
        return this;
    };
    return DockContainer;
}(Control));
exports.DockContainer = DockContainer;
var Splitter = (function (_super) {
    __extends(Splitter, _super);
    function Splitter(type) {
        var _this = _super.call(this) || this;
        _this.className = type == "v" ? "splitter-bar vertical" : "splitter-bar horizental";
        return _this;
    }
    return Splitter;
}(Control));
exports.Splitter = Splitter;
var TabPanel = (function (_super) {
    __extends(TabPanel, _super);
    function TabPanel() {
        var _this = _super.call(this) || this;
        _this.pages = new TabPages();
        _this.headers = new TabHeaders();
        _this.className = "tab-panel";
        _this.children = [];
        _this.children.push(_this.pages);
        _this.children.push(_this.headers);
        return _this;
    }
    TabPanel.prototype.addTab = function (pageId, pageTitle) {
        this.headers.addHeader(new TabHeader(pageId));
        this.pages.addPage(new TabPage(pageId, pageTitle));
        return this;
    };
    TabPanel.prototype.addTab2 = function (page) {
        this.headers.addHeader(new TabHeader(page.id));
        this.pages.addPage(page);
        return this;
    };
    TabPanel.prototype.setActive = function (pageId) {
        this.pages.getAllPage().forEach(function (page) {
            if (page.id == pageId)
                page.setActive();
        });
        this.headers.getAllHeader().forEach(function (header) {
            if (header.targetId == pageId)
                header.setActive();
        });
        return this;
    };
    return TabPanel;
}(Control));
exports.TabPanel = TabPanel;
var TabPages = (function (_super) {
    __extends(TabPages, _super);
    function TabPages() {
        var _this = _super.call(this) || this;
        _this.pages = [];
        return _this;
    }
    TabPages.prototype.addPage = function (page) {
        this.pages.push(page);
        return this;
    };
    TabPages.prototype.getAllPage = function () {
        return this.pages;
    };
    return TabPages;
}(Control));
exports.TabPages = TabPages;
var TabHeaders = (function (_super) {
    __extends(TabHeaders, _super);
    function TabHeaders() {
        var _this = _super.call(this) || this;
        _this.headers = [];
        return _this;
    }
    TabHeaders.prototype.addHeader = function (header) {
        this.headers.push(header);
        return this;
    };
    TabHeaders.prototype.getAllHeader = function () {
        return this.headers;
    };
    return TabHeaders;
}(Control));
exports.TabHeaders = TabHeaders;
var TabPage = (function (_super) {
    __extends(TabPage, _super);
    function TabPage(id_, title_) {
        var _this = _super.call(this) || this;
        _this.id_ = id_;
        _this.title_ = title_;
        _this.className = "tab-page";
        return _this;
    }
    Object.defineProperty(TabPage.prototype, "id", {
        get: function () {
            return this.id_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TabPage.prototype, "title", {
        get: function () {
            return this.title_;
        },
        enumerable: true,
        configurable: true
    });
    TabPage.prototype.setActive = function () {
        this.className = this.className + " active";
        return this;
    };
    return TabPage;
}(Control));
exports.TabPage = TabPage;
var TabHeader = (function (_super) {
    __extends(TabHeader, _super);
    function TabHeader(targetId) {
        var _this = _super.call(this) || this;
        _this.targetId = "";
        _this.className = "tab";
        _this.targetId = targetId;
        return _this;
    }
    TabHeader.prototype.setTargetId = function (value) {
        this.targetId = value;
    };
    TabHeader.prototype.setActive = function () {
        this.className = this.className + " active";
        return this;
    };
    return TabHeader;
}(Control));
exports.TabHeader = TabHeader;
//# sourceMappingURL=control.js.map