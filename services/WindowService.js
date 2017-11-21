/**
 * WindowService
 */

const { BrowserWindow, app, Menu, Tray } = require("electron");
const path = require('path');
const url = require('url');

const CLIENT_DIR_PATH = path.join(__dirname, "../clients");
const RESOURCE_DIR_PATH = path.join(__dirname, "../res");
const ICON_IMAGE_NAME = "GraceKellyIcon_16x16.png";

class WindowService {

  static createMainWindow(width, height) {
    this.mainWindow = new BrowserWindow({width: width, height: height});
    this.mainWindow.loadURL(url.format({
      pathname: path.join(CLIENT_DIR_PATH, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
    
    // Open the DevTools.
    this.mainWindow.webContents.openDevTools()

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  static createStopTray(callback){
    this.isNowRecording = true;
    this.stopTray = new Tray(path.join(RESOURCE_DIR_PATH, ICON_IMAGE_NAME));
    var contextMenu = Menu.buildFromTemplate([
      {label: "録画終了", click: callback}
    ]);
    this.stopTray.setToolTip('This is my application.')
    this.stopTray.setContextMenu(contextMenu)
  }

  static terminate(){
    this.mainWindow.close();
    this.mainWindow = null;
    app.quit();
  }


  static startRecording(){
    this.createStopTray();
    this.mainWindow.minimize();
  }

  static setOnWindowAllClosed(){
    app.on('window-all-closed',() => {

    })
  }


}

module.exports = WindowService;
