const video = document.getElementById('video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models/tiny_face_detector'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models/face_expression')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Camera error:", err);
      alert("Camera access denied or not found");
    });
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
  
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
    const ctx = canvas.getContext("2d"); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    faceapi.draw.drawDetections(canvas, resizedDetections);
  
    resizedDetections.forEach(detection => {
      const { expressions, detection: box } = detection;
  
      // Find top expression
      const [topExpression, confidence] = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0];
  
      // Select emoji and label
      let emoji = "";
      let label = "";
  
      switch (topExpression) {
        case "happy":
          emoji = "😊";
          label = "Happy";
          break;
        case "sad":
          emoji = "😢";
          label = "Sad";
          break;
        case "neutral":
          emoji = "😐";
          label = "Neutral";
          break;
        case "angry":
          emoji = "😠";
          label = "Angry";
          break;
        case "surprised":
          emoji = "😲";
          label = "Surprised";
          break;
        case "fearful":
          emoji = "😨";
          label = "Fear";
          break;
        case "disgusted":
          emoji = "🤢";
          label = "Disgust";
          break;
        default:
          emoji = "";
          label = topExpression;
      }
  
      // Draw inside the box
      const x = box.box.x;
      const y = box.box.y;
      const width = box.box.width;
      const height = box.box.height;
  
      // Set font & draw emoji + label
      ctx.font = "50px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText(emoji, x + width / 2, y + height / 2 - 10);     // Emoji
      ctx.font = "20px Arial";
      ctx.fillText(label, x + width / 2, y + height / 2 + 30);     // Label
    });
  }, 100);

});
