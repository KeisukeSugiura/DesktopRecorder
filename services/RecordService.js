/**
 * RecordService
 * ipc, socketから視線データと録画データを保存
 */
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");

const USER_DIR = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
const SAVE_DIR = path.join(USER_DIR, "./Desktop/Gaze");
const SOCKET_URL = "http://10.211.55.3:50000";

const mClientScreenWidth  = 1920
const mClientScreenHeight = 1200
const mServerScreenWidth = 1920
const mServerScreenHeight = 1200
const GAZE_SCALE_X = mClientScreenWidth / mServerScreenWidth;
const GAZE_SCALE_Y = mClientScreenHeight / mServerScreenHeight;

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
  if(isRecording){
    RecordService.appendGazeData(message);
    //console.log(RecordService.gazeDataStack);
  }
});


ipcMain.on("start_record", (event, message) => {
  if(isReady){
    userName = message.name + (new Date()).getTime();
    console.log(userName);
    isRecording = true;
    socket.emit("requestGazeData");
    RecordService.startRecording();    
  }
});


class RecordService {

  static startRecording(){
    this.gazeDataStack = [];
    WindowService.createStopTray(()=>{
      isRecording = false; // Warn
      socket.disconnect();
      //this.stopRecording();
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
      //await RecordService.createGazeMovie();
      WindowService.terminate();
    } catch (error) {
      console.error(error);
    }
  }

  static appendGazeData(gazeData) {
    this.gazeDataStack.push({
      x: gazeData[0],
      y: gazeData[1],
      time: gazeData[2]
    });
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

  static createGazeMovie() {
    return new Promise((resolve, reject) => {
      console.log("gaze movie");
      child_process.exec("python3 " + "./modules/composite.py "+ userName, (err, stdout, stderr) => {
        console.log("OK")
        resolve()
      });
    });
  }



}

module.exports = RecordService;
