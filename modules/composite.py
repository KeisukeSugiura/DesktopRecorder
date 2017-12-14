import sys
import json
import os
from PIL import Image
import cv2
import datetime
import numpy as np

DIR_NAME = os.path.join(os.getenv("HOME"), "Desktop" , "Gaze")
GAZE_FILE_NAME = "gaze.json"
MOVIE_FILE_NAME = "monitor.mp4"
GEN_MOVIE_FILE_NAME = "gaze_monitor.mp4"
RENDER_FILE_PATH = os.path.join(os.getenv("HOME"), "Desktop", "Gaze", "lion.png")
FRAME_LATE = 30

GAZE_RATIO = int(2 * 1920 / 1920) # mac録画分 * mac画面width / windows画面width
userName = ""


def main():
  gazeData = openGazeData()
  overlay_movie(gazeData)

def overlay_movie(gazeData):
  
  # 入力する動画と出力パスを指定。
  target = os.path.join(DIR_NAME, userName, MOVIE_FILE_NAME)
  result = os.path.join(DIR_NAME, userName, GEN_MOVIE_FILE_NAME)  #.m4vにしないとエラーが出る

  # 動画の読み込みと動画情報の取得
  movie = cv2.VideoCapture(target) 
  fps    = movie.get(cv2.CAP_PROP_FPS)
  height = movie.get(cv2.CAP_PROP_FRAME_HEIGHT)
  width  = movie.get(cv2.CAP_PROP_FRAME_WIDTH)

  # 形式はMP4Vを指定
  fourcc = cv2.VideoWriter_fourcc('m', 'p', '4', 'v')

  # 出力先のファイルを開く
  out = cv2.VideoWriter(result, int(fourcc), fps, (int(width), int(height)))

  # オーバーレイ画像の読み込み
  ol_imgae_path = RENDER_FILE_PATH
  ol_image = cv2.imread(ol_imgae_path,cv2.IMREAD_UNCHANGED)

  # 最初の1フレームを読み込む
  if movie.isOpened() == True:
    ret,frame = movie.read()
  else:
    ret = False

  time = 0
  pointer = 0
  render_x = None
  render_y = None

  # フレームの読み込みに成功している間フレームを書き出し続ける
  while ret:
    
    if((pointer+1 < len(gazeData)) and (abs(time - int(gazeData[pointer+1]["time"])) < 100 / 3 ) and (time - int(gazeData[pointer]["time"]) > time - int(gazeData[pointer+1]["time"]))):
      pointer = pointer+1
      render_x = int(float(gazeData[pointer]["x"]))
      render_y = int(float(gazeData[pointer]["y"]))
      print("update")
      
    

    if render_x is not None:
      frame = overlayOnPart(frame, ol_image, render_x, render_y)
      
    time = time + 1000 / 30
    # 読み込んだフレームを書き込み
    out.write(frame)

    # 次のフレームを読み込み
    ret,frame = movie.read()

    # 経過を確認するために100フレームごとに経過を出力
    if movie.get(cv2.CAP_PROP_POS_FRAMES)%10 == 0:
      date = datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S")
      print(date + '  現在フレーム数：'+str(int(movie.get(cv2.CAP_PROP_POS_FRAMES))))

    # 長いので途中のフレームまでで終了する
#        if movie.get(cv2.CAP_PROP_POS_FRAMES) > 1000:
#            break

  print("完了")

# PILを使って画像を合成
def overlayOnPart(src_image, overlay_image, posX, posY):

  # オーバレイ画像のサイズを取得
  ol_height, ol_width = overlay_image.shape[:2]

  # OpenCVの画像データをPILに変換
  #　BGRAからRGBAへ変換
  src_image_RGBA = cv2.cvtColor(src_image, cv2.COLOR_BGR2RGB)
  overlay_image_RGBA = cv2.cvtColor(overlay_image, cv2.COLOR_BGRA2RGBA)

  #　PILに変換
  src_image_PIL=Image.fromarray(src_image_RGBA)
  overlay_image_PIL=Image.fromarray(overlay_image_RGBA)

  # 合成のため、RGBAモードに変更
  src_image_PIL = src_image_PIL.convert('RGBA')
  overlay_image_PIL = overlay_image_PIL.convert('RGBA')

  # 同じ大きさの透過キャンパスを用意
  tmp = Image.new('RGBA', src_image_PIL.size, (255, 255,255, 0))
  # 用意したキャンパスに上書き
  tmp.paste(overlay_image_PIL, (posX * GAZE_RATIO, posY * GAZE_RATIO), overlay_image_PIL)
  # オリジナルとキャンパスを合成して保存
  result = Image.alpha_composite(src_image_PIL, tmp)

  # COLOR_RGBA2BGRA から COLOR_RGBA2BGRに変更。アルファチャンネルを含んでいるとうまく動画に出力されない。
  return  cv2.cvtColor(np.asarray(result), cv2.COLOR_RGBA2BGR)



def openGazeData():
  return json.load(open(os.path.join(DIR_NAME, userName, GAZE_FILE_NAME), "r"))






####################################################################################3

argvs = sys.argv  # コマンドライン引数を格納したリストの取得
argc = len(argvs) # 引数の個数

print(DIR_NAME)
if (argc == 2):
  userName = argvs[1]
  main()
else :
  print('Usage: # python3 %s filename' % argvs[0])
  quit()         # プログラムの終了

