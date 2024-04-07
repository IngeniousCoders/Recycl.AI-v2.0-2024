const captureButton = document.getElementById('capture');
const cameraView = document.getElementById('video');
const inferencedImg = document.getElementById('serverimage');

animateBtn.addEventListener('click', () => {
  cameraView.style.transform = 'translateX(-100%)';
  inferencedImg.style.transform = 'translateX(0)';
  inferencedImg.style.opacity = '1'; // Make box 2 visible
  inferencedImg.style.pointerEvents = 'auto'; // Enable pointer events on box 2
});
