/**
 * RecordService
 * ipc, socketから視線データと録画データを保存
 */
const path = require("path");
const fs = require("fs");

const USER_DIR = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
const SAVE_DIR = path.join(USER_DIR, "./Desktop/Gaze");
const SOCKET_URL = "http://localhost:3000";

const { ipcMain } = require("electron");
const WindowService = require("./WindowService");
const socket = require("socket.io-client")(SOCKET_URL);
const { ScreenRecorder } = require("screen-recorder");

var isReady = false;
var isRecording = false;
var userName = "noname";

socket.on("connect", (client)=>{
  isReady = true;
  console.log("connect");
  
 
});
socket.on("disconnect", async ()=>{
  // TODO: event handling
  console.log("disconnect");
  try {
    isRecording = false;
    await RecordService.stopRecording();
  } catch (err) {
    console.log(err);
  }
});

socket.on("gazeData", (message) => {
  console.log("gazeData")
  if(isRecording){
    RecordService.appendGazeData(message);
    console.log(RecordService.gazeDataStack);
  }
});


ipcMain.on("start_record", (event, message) => {
  if(isReady){
    userName = message.name + (new Date()).getTime();
    console.log(userName);
    isRecording = true;
    socket.emit("start_record");
    RecordService.startRecording();    
  }
});


class RecordService {

  static startRecording(){
    this.gazeDataStack = [];
    WindowService.createStopTray(()=>{
      isRecording = false; // Warn
      this.stopRecording();
    });
    WindowService.mainWindow.hide();
    fs.mkdirSync(path.join(SAVE_DIR,userName))
    const { screen } = require("electron");
    this.movie = new ScreenRecorder(path.join(SAVE_DIR, userName, 'monitor.mp4')) // [, displayId]
    this.movie.setCapturesMouseClicks(false)
    this.movie.setCropRect(0, 0, 1920, 1200)
    this.movie.setFrameRate(30) // default is 15
    this.movie.start()

  }

  // asyncメソッド
  static async stopRecording(){
    try {
      await RecordService.saveMovie();      
      await RecordService.saveGazeData();
      WindowService.terminate();
    } catch (error) {
      console.error(error);
    }
  }

  static appendGazeData(gazeData) {
    this.gazeDataStack.push(gazeData);
  }

  // Promiseメソッド
  static saveGazeData() {
    return new Promise((resolve, reject) => {
      console.log("saveGazeData");
      const data = JSON.stringify(this.gazeDataStack);
      fs.writeFileSync(path.join(SAVE_DIR,userName,"gaze.json"), data);
      resolve();
    });
  }

  // Promiseメソッド
  static saveMovie() {
    return new Promise((resolve, reject) => {
      // TODO: 終了処理
      console.log("saveMovie");
      this.movie.stop()
      resolve();
    });
  }



}

module.exports = RecordService;
