/**
 * RecordService
 * ipc, socketから視線データと録画データを保存
 */
const path = require("path");
const fs = require("fs");

const USER_DIR = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
const SAVE_DIR = path.join(USER_DIR, "./Desktop");
const SOCKET_URL = "http://localhost:3000";

const { ipcMain } = require("electron");
const WindowService = require("./WindowService");
const socket = require("socket.io-client")(SOCKET_URL);
const { ScreenRecorder } = require("screen-recorder").ScreenRecorder;

var isReady = true; // WARN: true => false
var isRecording = false;
var userName = "noname";

socket.on("connect", ()=>{
  isReady = true;
});
socket.on("disconnect", ()=>{

});

ipcMain.on("start_record", (event, message) => {
  if(isReady){
    RecordService.startRecording();
    userName = message.name + (new Date()).getTime();
    console.log(userName);
    isRecording = true;
  }
});

socket.on("gaze", (message) => {
  if(isRecording){
    RecordService.appendGazeData(message.gazeData);
  }
});

class RecordService {

  static startRecording(){
    this.gazeDataStack = [];
    WindowService.createStopTray(()=>{
      this.stopRecording();
    });
    WindowService.mainWindow.minimize();
  }

  static async stopRecording(){
    try {
      await RecordService.saveGazeData();
      await RecordService.saveMovie();
      WindowService.terminate();
    } catch (error) {
      console.error(error);
    }
  }

  static async appendGazeData(gazeData) {
    // TODO: 時系列データを追加
    this.gazeDataStack.append(gazeData);
  }

  static async saveGazeData() {
    return new Promise((resolve, reject) => {
      // TODO: ファイルにして保存
      console.log("saveGazeData");
      resolve();
    });
  }

  static saveMovie() {
    return new Promise((resolve, reject) => {
      // TODO: 終了処理
      console.log("saveMovie");
      resolve();
    });
  }


}

module.exports = RecordService;
