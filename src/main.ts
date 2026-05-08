import { app, BrowserWindow, ipcMain, dialog } from "electron";
export let mainWindow: BrowserWindow | undefined = undefined;
const path = require("path");
const url = require("url");

let currentLocation = "ende";
let menuWindow: BrowserWindow | undefined = undefined;

export function getCurrentLocation(): string {
	return currentLocation;
}

function createMenuWindow() {
	if (menuWindow && !menuWindow.isDestroyed()) {
		menuWindow.focus();
		return;
	}
	menuWindow = new BrowserWindow({
		width: 300,
		height: 310,
		resizable: false,
		alwaysOnTop: true,
		skipTaskbar: true,
		title: "Scoreboard Settings",
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});
	menuWindow.setMenu(null);
	menuWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "../assets/html/menu.html"),
			protocol: "file:",
			slashes: true,
		})
	);
	menuWindow.once("ready-to-show", () => {
		menuWindow?.webContents.send("menu-init-state", { location: currentLocation });
		menuWindow?.show();
	});
	menuWindow.on("closed", () => {
		menuWindow = undefined;
	});
}

function initialize() {
	function createWindow() {
		const mainWindow = new BrowserWindow({
			width: 1920,
			height: 1080,
			show: false,
			resizable: true,
			autoHideMenuBar: true,
			frame: false,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
			},
		});

		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, "../assets/html/index.html"),
				protocol: "file:",
				slashes: true,
			})
		);

		return mainWindow;
	}

	app.whenReady().then(() => {
		let win = createWindow();
		win.once("ready-to-show", () => {
			win.show();
		});

		app.on("activate", function () {
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});

		mainWindow = win;
	});

	app.on("window-all-closed", function () {
		if (process.platform !== "darwin") app.quit();
	});
}

require("./apiHandler.js");

ipcMain.on("open-menu-window", () => createMenuWindow());

ipcMain.on("menu-set-location", (_, location: string) => {
	currentLocation = location;
	mainWindow?.webContents.send("update-title", location);
});

ipcMain.on("menu-toggle-fullscreen", (_, value: boolean) => {
	mainWindow?.setFullScreen(value);
});

ipcMain.on("menu-exit", () => app.quit());

ipcMain.on("menu-open-banner-dialog", async () => {
	if (!mainWindow) return;
	const result = await dialog.showOpenDialog(mainWindow, {
		filters: [{ name: "PNG Images", extensions: ["png"] }],
		properties: ["openFile"],
	});
	if (!result.canceled && result.filePaths.length > 0) {
		mainWindow.webContents.send("set-banner", result.filePaths[0]);
	}
});

initialize();
