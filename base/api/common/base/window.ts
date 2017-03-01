/**
 * chenlei 2016/09/08
 */

"use strict";

import * as path from "path";
import * as objects from "lodash";
import { shell, screen, BrowserWindow, Menu } from "electron";
import { TValueCallback } from "./common";
import * as platform from "./platform";
import { DefaultLogger } from "./logger";

export interface IWindowState {
	width?: number;
	height?: number;
	x?: number;
	y?: number;
	wStyle?: WindowStyle;
	mode?: WindowMode;
}

export interface IWindowCreationOptions {
	state: IWindowState;
	viewUrl?: string;
	allowFullscreen?: boolean;
	menuTemplate?: any;
}

export enum WindowStyle {
	System,
	Aqy,
}

export enum WindowMode {
	Maximized,
	Normal,
	Minimized,
	Fullscreen
}

export const defaultWindowState = function (mode = WindowMode.Normal): IWindowState {
	return {
		width: 800,
		height: 600,
		wStyle: WindowStyle.System,
		mode: mode
	};
};

export enum ReadyState {
	// This window has not loaded any HTML yet
	NONE,

	// This window is loading HTML
	LOADING,

	// This window is navigating to another HTML
	NAVIGATING,

	// This window is done loading HTML

	READY
}

export class UWindow {

	public static menuBarHiddenKey = "menuBarHidden";
	public static colorThemeStorageKey = "theme";
	public onClosed: () => void;

	protected static MIN_WIDTH = 300;
	protected static MIN_HEIGHT = 120;

	protected options: IWindowCreationOptions;
	private showTimeoutHandle: any;
	private _id: number;
	private _win: Electron.BrowserWindow;
	private _lastFocusTime: number;
	private _readyState: ReadyState;
	private _menu: Electron.Menu;
	private windowState: IWindowState;
	private currentWindowMode: WindowMode;
	// ...
	private whenReadyCallbacks: TValueCallback<UWindow>[];

	constructor(config?: IWindowCreationOptions) {
		if (config) {
			this.options = config;
		} else {
			this.options = { state: defaultWindowState() };
		}

		this._lastFocusTime = -1;
		this._readyState = ReadyState.NONE;
		this.whenReadyCallbacks = [];

		// Load window state
		this.restoreWindowState(this.options.state);
		const useLightTheme = true;

		// in case we are maximized or fullscreen, only show later after the call to maximize/fullscreen (see below)
		const isFullscreenOrMaximized = (this.currentWindowMode === WindowMode.Maximized || this.currentWindowMode === WindowMode.Fullscreen);

		let options: Electron.BrowserWindowOptions = {
			width: this.windowState.width,
			height: this.windowState.height,
			x: this.windowState.x,
			y: this.windowState.y,
			backgroundColor: useLightTheme ? "#FFFFFF" : platform.isMacintosh ? "#131313" : "#1E1E1E", // https://github.com/electron/electron/issues/5150
			minWidth: UWindow.MIN_WIDTH,
			minHeight: UWindow.MIN_HEIGHT,
			show: false, // !isFullscreenOrMaximized,
			useContentSize: true,
			autoHideMenuBar: true,
			// title: this.envService.product.nameLong,
			webPreferences: {
				backgroundThrottling: false, // by default if Code is in the background, intervals and timeouts get throttled
				nodeIntegration: true
			}
		};

		if (this.options.state.wStyle === WindowStyle.Aqy) {
			options.frame = false;
		}

		if (platform.isLinux) {
			// options.icon = path.join(appRoot, "resources/linux/code.png"); // Windows and Mac are better off using the embedded icon(s)
		}

		// Create the browser window.
		this._win = new BrowserWindow(options);
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

	public setMenu(menuTemplate: any): void {
		try {
			if (Array.isArray(menuTemplate)) {
				this._menu = Menu.buildFromTemplate(menuTemplate);
				this.win.setMenu(this._menu);
			}
		} catch (err) {
			DefaultLogger.error(err);
		}
	}

	public get id(): number {
		return this._id;
	}

	public get win(): Electron.BrowserWindow {
		return this._win;
	}

	public focus(): void {
		if (!this._win) {
			return;
		}

		if (this._win.isMinimized()) {
			this._win.restore();
		}

		this._win.focus();
	}

	public get lastFocusTime(): number {
		return this._lastFocusTime;
	}

	public setReady(): void {
		this._readyState = ReadyState.READY;

		// inform all waiting promises that we are ready now
		while (this.whenReadyCallbacks.length) {
			this.whenReadyCallbacks.pop()(this);
		}
	}

	public ready(): Promise<UWindow> {
		return new Promise<UWindow>((c) => {
			if (this._readyState === ReadyState.READY) {
				return c(this);
			}

			// otherwise keep and call later when we are ready
			this.whenReadyCallbacks.push(c);
		});

	}

	public get readyState(): ReadyState {
		return this._readyState;
	}

	private registerListeners(): void {

		// Remember that we loaded
		this._win.webContents.on("did-finish-load", () => {
			this._readyState = ReadyState.LOADING;

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
			DefaultLogger.info("window#%d is ready!", this.id);
			this.setReady();
		});

		// Handle code that wants to open links
		this._win.webContents.on("new-window", (event: Event, url: string) => {
			event.preventDefault();

			shell.openExternal(url);
		});

		// Window Focus
		this._win.on("focus", () => {
			this._lastFocusTime = Date.now();
		});

		// Window Failed to load
		this._win.webContents.on("did-fail-load", (event: Event, errorCode: string, errorDescription: string, surl: string) => {
			DefaultLogger.warn("[electron event]: fail to load, ", errorDescription, surl);
		});

	}

	public loadURL(contentUrl?: string): void {
		if (!contentUrl)
			return;

		this.options.viewUrl = contentUrl;
		this.registerListeners();

		if (this.options.state.wStyle === WindowStyle.Aqy) {
			this.setMenuBarVisibility(false);
			this.win.loadURL(`file://${__dirname}/titlebar.tpl`);
			this.win.webContents.executeJavaScript("window.document.getElementById('fr_content').src = '" + contentUrl + "';");
		} else {
			if (this.options.menuTemplate) {
				this.setMenuBarVisibility(true);
			}
			this.win.loadURL(`file://${contentUrl}`);
		}
		// this.win.webContents.reloadIgnoringCache();
	}

	public show(): void {
		if (this.win !== null) {
			this.win.show();
		}
	}

	public close(): void {
		if (this.win !== null && !this.win.isDestroyed())
			this.win.close();
	}

	public serializeWindowState(): IWindowState {
		if (this.win.isFullScreen()) {
			return {
				mode: WindowMode.Fullscreen
			};
		}

		const state: IWindowState = Object.create(null);
		let mode: WindowMode;

		// get window mode
		if (!platform.isMacintosh && this.win.isMaximized()) {
			mode = WindowMode.Maximized;
		} else if (this.win.isMinimized()) {
			mode = WindowMode.Minimized;
		} else {
			mode = WindowMode.Normal;
		}

		// we don't want to save minimized state, only maximized or normal
		if (mode === WindowMode.Maximized) {
			state.mode = WindowMode.Maximized;
		} else if (mode !== WindowMode.Minimized) {
			state.mode = WindowMode.Normal;
		}

		// only consider non-minimized window states
		if (mode === WindowMode.Normal || mode === WindowMode.Maximized) {
			const pos = this.win.getPosition();
			const size = this.win.getSize();

			state.x = pos[0];
			state.y = pos[1];
			state.width = size[0];
			state.height = size[1];
		}

		return state;
	}

	private restoreWindowState(state?: IWindowState): void {
		if (state) {
			try {
				state = this.validateWindowState(state);
			} catch (err) {
				DefaultLogger.log(`Unexpected error validating window state: ${err}\n${err.stack}`); // somehow display API can be picky about the state to validate
			}
		}

		if (!state) {
			state = defaultWindowState();
		}

		this.windowState = state;
		this.currentWindowMode = this.windowState.mode;
	}

	private validateWindowState(state: IWindowState): IWindowState {
		if (!state) {
			return null;
		}

		if (state.mode === WindowMode.Fullscreen) {
			if (this.options.allowFullscreen) {
				return state;
			}

			return null;
		}

		if ([state.x, state.y, state.width, state.height].some(n => typeof n !== "number")) {
			return null;
		}

		if (state.width <= 0 || state.height <= 0) {
			return null;
		}

		const displays = screen.getAllDisplays();

		// Single Monitor: be strict about x/y positioning
		if (displays.length === 1) {
			const displayBounds = displays[0].bounds;

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
				return defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
			}

			return state;
		}

		// Multi Monitor: be less strict because metrics can be crazy
		const bounds = { x: state.x, y: state.y, width: state.width, height: state.height };
		const display = screen.getDisplayMatching(bounds);
		if (display && display.bounds.x + display.bounds.width > bounds.x && display.bounds.y + display.bounds.height > bounds.y) {
			if (state.mode === WindowMode.Maximized) {
				const defaults = defaultWindowState(WindowMode.Maximized); // when maximized, make sure we have good values when the user restores the window
				defaults.x = state.x; // carefull to keep x/y position so that the window ends up on the correct monitor
				defaults.y = state.y;

				return defaults;
			}

			return state;
		}

		return null;
	}

	public getBounds(): Electron.Rectangle {
		const pos = this.win.getPosition();
		const dimension = this.win.getSize();

		return { x: pos[0], y: pos[1], width: dimension[0], height: dimension[1] };
	}

	public toggleFullScreen(): void {
		const willBeFullScreen = !this.win.isFullScreen();

		this.win.setFullScreen(willBeFullScreen);

		// Windows & Linux: Hide the menu bar but still allow to bring it up by pressing the Alt key
		if (platform.isWindows || platform.isLinux) {
			if (willBeFullScreen) {
				this.setMenuBarVisibility(false);
			} else {
				; // restore as configured
			}
		}
	}

	public setMenuBarVisibility(visible: boolean): void {
		this.win.setMenuBarVisibility(visible);
		this.win.setAutoHideMenuBar(!visible);
	}

	public sendWhenReady(channel: string, ...args: any[]): void {
		this.ready().then(() => {
			this.send(channel, ...args);
		});
	}

	public send(channel: string, ...args: any[]): void {
		this._win.webContents.send(channel, ...args);
	}


	public build(): void {
		this._win.on("closed", () => {
			this.dispose();
			if (this.onClosed) {
				this.onClosed();
			}
		});
	}

	public dispose(): void {
		if (this.showTimeoutHandle) {
			clearTimeout(this.showTimeoutHandle);
		}

		this._win = null; // Important to dereference the window object to allow for GC
	}
}
