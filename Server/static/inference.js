let imageToDetect = null;

const videoContainer = document.getElementById('videoContainer');
const captureButton = document.getElementById('capture');
const returnButton = document.getElementById('returnButton');
const resultcontainer = document.getElementById('result-container')
const resultplaceholder = document.getElementById('result-placeholder')
const serverImage = document.getElementById('serverimage')
const noresult = document.getElementById('noresult')
const cameraselect = document.getElementById('camera-select')
resultcontainer.hidden = true;
resultplaceholder.hidden = false;
serverImage.hidden = true;
noresult.hidden = true;
const detectedobject = document.getElementById("detectedobject")
const itemconfidence = document.getElementById("item-confidence")
const itemdetails = document.getElementById("item-details")
const itemlinks = document.getElementById("item-links")
const inferencespeed = document.getElementById("inference-speed")
const maxVideoWidth = 640; // Maximum allowed video width
const maxVideoHeight = 640; // Maximum allowed video height

var isInFreezeFrame = false;

const rotatingarrows = "M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"
const camera =         "M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"


names = {
  0: 'Deposit Recycling',
  1: 'Flexible Plastic', 
  2: 'Regular recycling'
}

links = {
  0:'https://www.return-it.ca/',
  1:'http://www.return-it.ca/recycling/',
  2:'http://www.return-it.ca/recycling/'
}


paragraphs = {
  0: 'This image contains items that can be recycled. These items can be recycled in a blue bin or recycled at a bottle depo to get a refund of 10 cents per item. Fun fact: 80% of what we throw into the garbage is actually recyclable.' , 
  1: 'This image contains items are classified as flexible plastic. Flexible plastic packaging is a type of plastic that is used to package food, chip bags, and other products. Flexible plastic packaging is lightweight, durable, and cost-effective, hence why it is used for packaging a wide range of products.  Recycling flexible plastic packaging helps to conserve resources, reduce waste, and protect the environment.',  
   2: 'This image contains items that can be recycled. These items can be recycled in a blue bin. These items are either made from high polyethylene terephthalate, polypropylene, or high-density polyethylene. Fun fact nearly 80% of trash can actually be recycled or reused and are made from these materials.', 
}

videodevices = []
navigator.mediaDevices.enumerateDevices().then((devices) => {
  devices.forEach((device) => {
    if(device.kind === "videoinput"){
      option = document.createElement("option")
      option.value = device.deviceId
      option.innerHTML = device.label
      cameraselect.appendChild(option)
    }
  });
})

// Get access to the user's webcam with limited resolution
function startCameraStream(cameraid){
  navigator.mediaDevices.getUserMedia({ 
    video: {
      width: { ideal: maxVideoWidth },
      height: { ideal: maxVideoHeight },
      deviceId: cameraid ? {exact: cameraid} : undefined
    }
  })
  .then((stream) => {
    const videoElement = document.getElementById('video');
    document.getElementById("loading-text").hidden = true;
    videoElement.srcObject = stream;
    videoElement.onloadedmetadata = () => {
      videoElement.play();
    };
  })
  .catch((error) => {
    console.error('Error accessing webcam:', error);
  });
}
startCameraStream()

function changedCameraStream(){
  targetcamera = cameraselect.value
  startCameraStream(targetcamera)
}

captureButton.addEventListener('click', () => {
  const videoElement = document.getElementById('video');
  captureButton.classList.toggle("spinning")
  isInFreezeFrame = !isInFreezeFrame
  if(isInFreezeFrame){
    document.getElementById("buttonpath").setAttribute('d', rotatingarrows)
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    // Save the captured image to the "imageToDetect" variable
    imageToDetect = canvas.toDataURL('image/png');
    fetch('http://127.0.0.1:3000/processimage', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "file": imageToDetect })
    })
    .then(response => response.json())
    .then(json => loadedJSON(json))
  }
});
function loadedJSON(json){
  resultplaceholder.hidden = true;
  if(json["failed"]){
    serverImage.hidden = true
    noresult.hidden = false;
    resultcontainer.hidden = true;
  } else{
    noresult.hidden = true;
    resultcontainer.hidden = false;
    console.log(JSON.stringify(json))

    detectedobject.innerHTML = names[json["nameid"]]
    itemdetails.innerHTML = links[json["nameid"]]
    itemconfidence.innerHTML = ((json["confidence"].toFixed(2)) * 100) + "%";
    itemdetails.innerHTML = paragraphs[json["nameid"]]
    inferencespeed.innerHTML = (json["speed"] / 1000).toFixed(2) + " seconds to process"
  }
  captureButton.classList.toggle("spinning")
  serverImage.hidden = false;
  // TESTING : serverImage.src = "https://raw.githubusercontent.com/aaronw-dev/Recycl-AI-2023/main/Server/static/output.png"
  serverImage.src = "http://127.0.0.1:3000/static/image0.jpg?t=" + new Date().getTime();
  serverImage.classList.remove("closed")
  isInFreezeFrame = !isInFreezeFrame
  document.getElementById("buttonpath").setAttribute('d', camera);
  setTimeout(function(){
    console.log("minimizing thingy")
    serverImage.classList.add("closed")
  }, 2000)
}