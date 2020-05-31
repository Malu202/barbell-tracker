const MODEL_URL = "web_model/model.json";
const CLASSES = ["hantel", "scheibe"]
// const input = document.getElementById("input");
const input = document.getElementById("videoInput")
const fileInput = document.getElementById('file-input');
const computeButton = document.getElementById("compute");

load();

let model;
async function load() {
    model = await tf.loadGraphModel(MODEL_URL);
    detect();
}

async function detect() {
    input.currentTime = input.currentTime;
    input.oncanplay = async function () {
        input.oncanplay = null;
        const computeStart = performance.now();

        const inputData = getInputData();

        const output = await model.executeAsync({ 'image_tensor': inputData },
            ['detection_boxes', 'detection_scores', 'detection_classes', 'num_detections']);

        inputData.dispose();


        const detection_boxes = output[0].arraySync()[0];
        const detection_scores = output[1].arraySync()[0];
        const detection_classes = output[2].arraySync()[0];
        const num_detections = output[3].arraySync()[0];
        tf.dispose(output);

        // console.log(detection_boxes, '\n', detection_scores, '\n', detection_classes, '\n', num_detections)

        drawAnnotations(detection_boxes, detection_scores, detection_classes, num_detections);

        const inferenceTime = Math.round((performance.now() - computeStart));
        // console.log("inference: " + inferenceTime + "ms");
        addInferenceTime(inferenceTime)
        input.currentTime += inferenceTime * 0.001 * 0.5;

        // console.log('numTensors ' + JSON.stringify(tf.memory()));
        if (input.currentTime >= input.duration) computeButton.click();

        if (!stopped) detect();
    };
}

function getInputData() {
    return tf.tidy(function () {
        let inputData;
        if (input.width != 640 || input.height != 640) {
            inputData = tf.image.resizeNearestNeighbor(tf.browser.fromPixels(input), [640, 640])
                .expandDims(0);
        } else inputData = tf.browser.fromPixels(input).expandDims(0);
        return inputData;
    })
}

let stopped = false;
computeButton.addEventListener("click", function () {
    stopped = !stopped;
    if (!stopped) {
        computeButton.innerText = "stop";
        detect();
    } else {
        computeButton.innerText = "start";
        showInferenceTime();
    }
})

fileInput.addEventListener('change', function (event) {
    var fileURL = URL.createObjectURL(fileInput.files[0]);
    input.src = fileURL;
    computeButton.disabled = false;
});

const performanceLabel = document.getElementById("performanceLabel")
const performanceAveraging = 4;
let inferenceSum = 0;
let performanceIndex = 0;
function addInferenceTime(time) {
    console.log("add " + time);
    //ignore first time, because it includes setup
    if (inferenceSum == 0) {
        inferenceSum = 1;
        return;
    }
    inferenceSum += time;
    performanceIndex++;
}
function showInferenceTime() {
    performanceLabel.innerText = "inference: " + Math.round(inferenceSum / performanceIndex) + "ms";
    performanceIndex = 0;
    inferenceSum = 0;
}
