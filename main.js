const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

var screenWidth, screenHeight;

const WindowService = require("./services/WindowService");
const RecordService = require("./services/RecordService");

app.on('ready', () => {
  // createWindow();
  screenWidth = electron.screen.getPrimaryDisplay().workAreaSize.width;
  screenHeight = electron.screen.getPrimaryDisplay().workAreaSize.height;

  WindowService.createMainWindow(screenWidth, screenHeight);
});
