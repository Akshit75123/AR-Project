let videoStream = null;
let model = null;

// Load COCO-SSD model
async function loadModel() {
    model = await cocoSsd.load();
    console.log("Model Loaded!");
}
loadModel(); // Load model on startup

document.getElementById("openBackCamera").addEventListener("click", async function () {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
        });

        let video = document.getElementById("webcam");
        video.srcObject = videoStream;
        video.onloadedmetadata = () => {
            video.play();
            detectObjects(); // Start object detection
        };
    } catch (error) {
        console.error("Error accessing back camera:", error);
    }
});

document.getElementById("closeCamera").addEventListener("click", function () {
    if (videoStream) {
        let tracks = videoStream.getTracks();
        tracks.forEach((track) => track.stop()); // Stop all tracks
        videoStream = null;
    }

    // Remove video element from the DOM
    document.getElementById("webcam").remove();
    document.getElementById("canvas").remove();
});

// Object detection function
async function detectObjects() {
    const video = document.getElementById("webcam");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (!model) {
        console.log("Model not loaded yet...");
        return;
    }

    async function detect() {
        const predictions = await model.detect(video);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        predictions.forEach((prediction) => {
            const [x, y, width, height] = prediction.bbox;
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            ctx.fillStyle = "red";
            ctx.font = "16px Arial";
            ctx.fillText(
                prediction.class + " (" + Math.round(prediction.score * 100) + "%)",
                x,
                y - 10
            );
        });

        requestAnimationFrame(detect); // Loop detection
    }

    detect(); // Start detecting
}
