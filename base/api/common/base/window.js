/**
 * chenlei 2016/09/08
 */
"use strict";
var electron_1 = require("electron");
var platform = require("./platform");
var logger_1 = require("./logger");
(function (WindowStyle) {
    WindowStyle[WindowStyle["System"] = 0] = "System";
    WindowStyle[WindowStyle["Aqy"] = 1] = "Aqy";
})(exports.WindowStyle || (exports.WindowStyle = {}));
var WindowStyle = exports.WindowStyle;
(function (WindowMode) {
    WindowMode[WindowMode["Maximized"] = 0] = "Maximized";
    WindowMode[WindowMode["Normal"] = 1] = "Normal";
    WindowMode[WindowMode["Minimized"] = 2] = "Minimized";
    WindowMode[WindowMode["Fullscreen"] = 3] = "Fullscreen";
})(exports.WindowMode || (exports.WindowMode = {}));
var WindowMode = exports.WindowMode;
exports.defaultWindowState = function (mode) {
    if (mode === void 0) { mode = WindowMode.Normal; }
    return {
        width: 800,
        height: 600,
        wStyle: WindowStyle.System,
        mode: mode
    };
};
(function (ReadyState) {
    // This window has not loaded any HTML yet
    ReadyState[ReadyState["NONE"] = 0] = "NONE";
    // This window is loading HTML
    ReadyState[ReadyState["LOADING"] = 1] = "LOADING";
    // This window is navigating to another HTML
    ReadyState[ReadyState["NAVIGATING"] = 2] = "NAVIGATING";
    // This window is done loading HTML
    ReadyState[ReadyState["READY"] = 3] = "READY";
})(exports.ReadyState || (exports.ReadyState = {}));
var ReadyState = exports.ReadyState;
var UWindow = (function () {
    function UWindow(config) {
        if (config) {
            this.options = config;
        }
        else {
            this.options = { state: exports.defaultWindowState() };
        }
        this._lastFocusTime = -1;
        this._readyState = ReadyState.NONE;
        this.whenReadyCallbacks = [];
        // Load window state
        this.restoreWindowState(this.options.state);
        var useLightTheme = true;
        // in case we are maximized or fullscreen, only show later after the call to maximize/fullscreen (see below)
        var isFullscreenOrMaximized = (this.currentWindowMode === WindowMode.Maximized || this.currentWindowMode === WindowMode.Fullscreen);
        var options = {
            width: this.windowState.width,
            height: this.windowState.height,
            x: this.windowState.x,
            y: this.windowState.y,
            backgroundColor: useLightTheme ? "#FFFFFF" : platform.isMacintosh ? "#131313" : "#1E1E1E",
            minWidth: UWindow.MIN_WIDTH,
            minHeight: UWindow.MIN_HEIGHT,
            show: false,
            useContentSize: true,
            autoHideMenuBar: true,
            // title: this.envService.product.nameLong,
            webPreferences: {
                backgroundThrottling: false,
                nodeIntegration: true
            }
        };
        if (this.options.state.wStyle === WindowStyle.Aqy) {
            options.frame = false;
        }
        if (platform.isLinux) {
        }
        // Create the browser window.
        this._win = new electron_1.BrowserWindow(options);
        this._id = this._win.id;
        if (isFullscreenOrMaximized) {
            this.win.maximize();
            if (this.currentWindowMode === WindowMode.Fullscreen) {
                this.win.setFullScreen(true);
            }
            if (!this.win.isVisible()) {
                this.win.show(); // to reduce flicker from the default window size to maximize, we only show after maximize
            }
        }
        this._lastFocusTime = Date.now(); // since we show directly, we need to set the last focus time too
        // load menu
        if (this.options.menuTemplate) {
            this.setMenu(config.menuTemplate);
        }
        // this.registerListeners();
        this.loadURL(this.options.viewUrl);
        this.build();
    }
    UWindow.prototype.setMenu = function (menuTemplate) {
        try {
            if (Array.isArray(menuTemplate)) {
                this._menu = electron_1.Menu.buildFromTemplate(menuTemplate);
                this.win.setMenu(this._menu);
            }
        }
        catch (err) {
            logger_1.DefaultLogger.error(err);
        }
    };
    Object.defineProperty(UWindow.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UWindow.prototype, "win", {
        get: function () {
            return this._win;
        },
        enumerable: true,
        configurable: true
    });
    UWindow.prototype.focus = function () {
        if (!this._win) {
            return;
        }
        if (this._win.isMinimized()) {
            this._win.restore();
        }
        this._win.focus();
    };
    Object.defineProperty(UWindow.prototype, "lastFocusTime", {
        get: function () {
            return this._lastFocusTime;
        },
        enumerable: true,
        configurable: true
    });
    UWindow.prototype.setReady = function () {
        this._readyState = ReadyState.READY;
        // inform all waiting promises that we are ready now
        while (this.whenReadyCallbacks.length) {
            this.whenReadyCallbacks.pop()(this);
        }
    };
    UWindow.prototype.ready = function () {
        var _this = this;
        return new Promise(function (c) {
            if (_this._readyState === ReadyState.READY) {
                return c(_this);
            }
            // otherwise keep and call later when we are ready
            _this.whenReadyCallbacks.push(c);
        });
    };
    Object.defineProperty(UWindow.prototype, "readyState", {
        get: function () {
            return this._readyState;
        },
        enumerable: true,
        configurable: true
    });
    UWindow.prototype.registerListeners = function () {
        var _this = this;
        // Remember that we loaded
        this._win.webContents.on("did-finish-load", function () {
            _this._readyState = ReadyState.LOADING;
            // To prevent flashing, we set the window visible after the page has finished to load but before VSCode is loaded
            // if (!this.win.isVisible()) {
            // 	if (this.currentWindowMode === WindowMode.Maximized) {
            // 		this.win.maximize();
            // 	}
            // 	if (!this.win.isVisible()) { // maximize also makes visible
            // 		this.win.show();
            // 	}
            // }
            // ready
            logger_1.DefaultLogger.info("window#%d is ready!", _this.id);
            _this.setReady();
        });
        // Handle code that wants to open links
        this._win.webContents.on("new-window", function (event, url) {
            event.preventDefault();
            electron_1.shell.openExternal(url);
        });
        // Window Focus
        this._win.on("focus", function () {
            _this._lastFocusTime = Date.now();
        });
        // Window Failed to load
        this._win.webContents.on("did-fail-load", function (event, errorCode, errorDescription, surl) {
            logger_1.DefaultLogger.warn("[electron event]: fail to load, ", errorDescription, surl);
        });
    };
    UWindow.prototype.loadURL = function (contentUrl) {
        if (!contentUrl)
            return;
        this.options.viewUrl = contentUrl;
        this.registerListeners();
        if (this.options.state.wStyle === WindowStyle.Aqy) {
            this.setMenuBarVisibility(false);
            this.win.loadURL("file://" + __dirname + "/titlebar.tpl");
            this.win.webContents.executeJavaScript("window.document.getElementById('fr_content').src = '" + contentUrl + "';");
        }
        else {
            if (this.options.menuTemplate) {
                this.setMenuBarVisibility(true);
            }
            this.win.loadURL("file://" + contentUrl);
        }
        // this.win.webContents.reloadIgnoringCache();
    };
    UWindow.prototype.show = function () {
        if (this.win !== null) {
            this.win.show();
        }
    };
    UWindow.prototype.close = function () {
        if (this.win !== null && !this.win.isDestroyed())
            this.win.close();
    };
    UWindow.prototype.serializeWindowState = function () {
        if (this.win.isFullScreen()) {
            return {
                mode: WindowMode.Fullscreen
            };
        }
        var state = Object.create(null);
        var mode;
        // get window mode
        if (!platform.isMacintosh && this.win.isMaximized()) {
            mode = WindowMode.Maximized;
        }
        else if (this.win.isMinimized()) {
            mode = WindowMode.Minimized;
        }
        else {
            mode = WindowMode.Normal;
        }
        // we don't want to save minimized state, only maximized or normal
        if (mode === WindowMode.Maximized) {
            state.mode = WindowMode.Maximized;
        }
        else if (mode !== WindowMode.Minimized) {
            state.mode = WindowMode.Normal;
        }
        // only consider non-minimized window states
        if (mode === WindowMode.Normal || mode === WindowMode.Maximized) {
            var pos = this.win.getPosition();
            var size = this.win.getSize();
            state.x = pos[0];
            state.y = pos[1];
            state.width = size[0];
            state.height = size[1];
        }
        return state;
    };
    UWindow.prototype.restoreWindowState = function (state) {
        if (state) {
            try {
                state = this.validateWindowState(state);
            }
            catch (err) {
                logger_1.DefaultLogger.log("Unexpected error validating window state: " + err + "\n" + err.stack); // somehow display API can be picky about the state to validate
            }
        }
        if (!state) {
            state = exports.defaultWindowState();
        }
        this.windowState = state;
        this.currentWindowMode = this.windowState.mode;
    };
    UWindow.prototype.validateWindowState = function (state) {
        if (!state) {
            return null;
        }
        if (state.mode === WindowMode.Fullscreen) {
            if (this.options.allowFullscreen) {
                return state;
            }
            return null;
        }
        if ([state.x, state.y, state.width, state.height].some(function (n) { return typeof n !== "number"; })) {
            return null;
        }
        if (state.width <= 0 || state.height <= 0) {
            return null;
        }
        var displays = electron_1.screen.getAllDisplays();
        // Single Monitor: be strict about x/y positioning
        if (displays.length === 1) {
            var displayBounds = displays[0].bounds;
            // Careful with maximized: in that mode x/y can well be negative!
            if (state.mode !== WindowMode.Maximized && displayBounds.width > 0 && displayBounds.height > 0 /* Linux X11 sessions sometimes report wrong display bounds */) {
                if (state.x < displayBounds.x) {
                    state.x = displayBounds.x; // prevent window from falling out of the screen to the left
                }
                if (state.y < displayBounds.y) {
                    state.y = displayBounds.y; // prevent window from falling out of the screen to the top
                }
                if (state.x > (displayBounds.x + displayBounds.width)) {
                    state.x = displayBounds.x; // prevent window from falling out of the screen to the right
                }
                if (state.y > (displayBounds.y + displayBounds.height)) {
                    state.y = displayBounds.y; // prevent window from falling out of the screen to the bottom
                }
                if (state.width > displayBounds.width) {
                    state.width = displayBounds.width; // prevent window from exceeding display bounds width
                }
                if (state.height > displayBounds.height) {
                    state.height = displayBounds.height; // prevent window from exceeding display bounds height
                }
            }
            if (state.mode === WindowMode.Maximized) {
                return exports.defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
            }
            return state;
        }
        // Multi Monitor: be less strict because metrics can be crazy
        var bounds = { x: state.x, y: state.y, width: state.width, height: state.height };
        var display = electron_1.screen.getDisplayMatching(bounds);
        if (display && display.bounds.x + display.bounds.width > bounds.x && display.bounds.y + display.bounds.height > bounds.y) {
            if (state.mode === WindowMode.Maximized) {
                var defaults = exports.defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
                defaults.x = state.x; // carefull to keep x/y position so that the window ends up on the correct monitor
                defaults.y = state.y;
                return defaults;
            }
            return state;
        }
        return null;
    };
    UWindow.prototype.getBounds = function () {
        var pos = this.win.getPosition();
        var dimension = this.win.getSize();
        return { x: pos[0], y: pos[1], width: dimension[0], height: dimension[1] };
    };
    UWindow.prototype.toggleFullScreen = function () {
        var willBeFullScreen = !this.win.isFullScreen();
        this.win.setFullScreen(willBeFullScreen);
        // Windows & Linux: Hide the menu bar but still allow to bring it up by pressing the Alt key
        if (platform.isWindows || platform.isLinux) {
            if (willBeFullScreen) {
                this.setMenuBarVisibility(false);
            }
            else {
                ; // restore as configured
            }
        }
    };
    UWindow.prototype.setMenuBarVisibility = function (visible) {
        this.win.setMenuBarVisibility(visible);
        this.win.setAutoHideMenuBar(!visible);
    };
    UWindow.prototype.sendWhenReady = function (channel) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.ready().then(function () {
            _this.send.apply(_this, [channel].concat(args));
        });
    };
    UWindow.prototype.send = function (channel) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (_a = this._win.webContents).send.apply(_a, [channel].concat(args));
        var _a;
    };
    UWindow.prototype.build = function () {
        var _this = this;
        this._win.on("closed", function () {
            _this.dispose();
            if (_this.onClosed) {
                _this.onClosed();
            }
        });
    };
    UWindow.prototype.dispose = function () {
        if (this.showTimeoutHandle) {
            clearTimeout(this.showTimeoutHandle);
        }
        this._win = null; // Important to dereference the window object to allow for GC
    };
    UWindow.menuBarHiddenKey = "menuBarHidden";
    UWindow.colorThemeStorageKey = "theme";
    UWindow.MIN_WIDTH = 300;
    UWindow.MIN_HEIGHT = 120;
    return UWindow;
}());
exports.UWindow = UWindow;
//# sourceMappingURL=window.js.map