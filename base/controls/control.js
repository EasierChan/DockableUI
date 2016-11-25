/**
 * created by chenlei
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Control = (function () {
    function Control() {
    }
    return Control;
}());
exports.Control = Control;
var DockContainer = (function (_super) {
    __extends(DockContainer, _super);
    function DockContainer(type) {
        _super.call(this);
        this.children = [];
        if (type === "v") {
            this.className = "dock-container vertical";
        }
        else {
            this.className = "dock-container horizental";
        }
    }
    DockContainer.prototype.addChildContianer = function (containerRef) {
        this.children.push(containerRef);
        return this;
    };
    return DockContainer;
}(Control));
exports.DockContainer = DockContainer;
var Splitter = (function (_super) {
    __extends(Splitter, _super);
    function Splitter(type) {
        _super.call(this);
        this.className = type == "v" ? "splitter-bar vertical" : "splitter-bar horizental";
    }
    return Splitter;
}(Control));
exports.Splitter = Splitter;
//# sourceMappingURL=control.js.map