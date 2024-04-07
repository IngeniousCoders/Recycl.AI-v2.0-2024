from flask import Flask, render_template, request, jsonify
import base64
import shutil
print("Importing AI Packages...")
print("Importing YOLO...")
from ultralytics import YOLO
print("YOLO imported. Importing numpy...")
import numpy as np
print("numpy imported. Importing PIL...")
from PIL import Image
import os
print("PIL imported.")

print("Loading model...")
model = YOLO("recyclAI_seg.pt")
print("Model loaded.")

app = Flask(__name__) # Create an Instance
@app.route('/')
def homepage():
  return render_template('index.html')

@app.route('/inference')
def inferencepage():
  return render_template('inference copy.html')

@app.route('/resources')
def resourcepage():
  return render_template('resource.html')

@app.route('/processimage', methods=["GET","POST"])
def processimage():
  filecontents = request.json["file"][22:]
  filecontents = str.encode(filecontents)
  with open("output.png", "wb") as file:
    file.write(base64.decodebytes(filecontents))

  #wipe old file
  if os.path.isfile("../Server/static/image0.jpg"):
    os.remove("../Server/static/image0.jpg")
    
  #wipe folder
  folder_path = "../runs/"
  for item in os.listdir(folder_path):
        item_path = os.path.join(folder_path, item)
        if os.path.isfile(item_path):
            os.remove(item_path)
        elif os.path.isdir(item_path):
            shutil.rmtree(item_path)

  image = Image.open("output.png").convert('RGB')
  image = np.asarray(image)
  image = image[...,::-1]
  results = model.predict(image, save=True, show_boxes=True, show_labels=True, retina_masks=True, imgsz=640)
  for r in results:
    boxes = r.boxes
    speed = r.speed['inference']
    confidencelist = []
    classlist = []
    for box in boxes:
      boxclass = box.cls.tolist()[0]
      classlist.append(boxclass)
      confidencelist.append(box.conf.tolist()[0])
  print("Class list: "+ str(classlist))
  confidencelist.sort(reverse=True)
  print("Confidences: "+ str(confidencelist))
  try:
    didfail = classlist[0] is None
  except Exception as e:
    didfail = True
  print(didfail)
  for count in classlist:
    jsonresults = {
      "nameid" : int(classlist[0]) if not didfail else 0,
      "confidence" : confidencelist[0] if not didfail else 0,
      "speed" : speed,
      "failed" : didfail
  }
  os.rename("../runs/segment/predict/image0.jpg", "../Server/static/image0.jpg")
  # shutil.move("../runs/segment/predict/image0.jpg", ".../image0.jpg", copy_function=shutil.copy2)
  
  
  print("The Inference results are: "+ str(jsonresults) )
  return jsonify(jsonresults)

@app.route("/500")
def fakefivehundo():
  print(1 + "asdasd")
  return "how in the hell does this still work"

@app.errorhandler(500)
def fivehundrederror(error):
  return render_template('error_500.html')
  
@app.errorhandler(404)
def invalid_route(error):
  return render_template('error_404.html')

print("Starting server...")
app.run(host='0.0.0.0', port=3000, debug=False)