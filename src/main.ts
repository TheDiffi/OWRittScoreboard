import electron, { app, BrowserWindow, ipcMain, Menu } from "electron";
export let mainWindow: BrowserWindow | undefined = undefined;
const path = require("path");
const url = require("url");

function initialize() {
	function createWindow() {
		// Create the browser window.
		const mainWindow = new BrowserWindow({
			width: 1920,
			height: 1080,
			show: false,
			resizable: true,
			autoHideMenuBar: true,
			//transparent: true,
			frame: false,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false,
			},
		});

		// Open the DevTools.
		// mainWindow.webContents.openDevTools();

		// and load the index.html of the app.
		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, "../assets/html/index.html"),
				protocol: "file:",
				slashes: true,
			})
		);

		return mainWindow;
	}

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.whenReady().then(() => {
		let win = createWindow();
		win.once("ready-to-show", () => {
			win.show();
		});

		app.on("activate", function () {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});

		mainWindow = win;
	});

	// Quit when all windows are closed, except on macOS. There, it's common
	// for applications and their menu bar to stay active until the user quits
	// explicitly with Cmd + Q.
	app.on("window-all-closed", function () {
		if (process.platform !== "darwin") app.quit();
	});
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

require("./apiHandler.js");
ipcMain.on("toggle-fullscreen", (event, value) => {
	mainWindow?.setFullScreen(value);
});
ipcMain.on("exit", () => {
	app.quit();
});
initialize();
