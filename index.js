const urlParams = new URLSearchParams(window.location.search);
let modelName = urlParams.get('model');
if (modelName == undefined) modelName = "resnet50";

const MODEL_URL = "models/" + modelName + "/model.json";
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

        console.log(detection_boxes, '\n', detection_scores, '\n', detection_classes, '\n', num_detections)

        drawAnnotations(detection_boxes, detection_scores, detection_classes, num_detections);

        const inferenceTime = Math.round((performance.now() - computeStart));
        // console.log("inference: " + inferenceTime + "ms");
        addInferenceTime(inferenceTime)
        if (phoneMode) input.currentTime += 0.3;
        else input.currentTime += inferenceTime * 0.001 * 0.5;

        // console.log('numTensors ' + JSON.stringify(tf.memory()));
        if (input.currentTime >= input.duration) computeButton.click();

        if (!stopped) detect();
    };
}

function getInputData() {
    return tf.tidy(function () {
        let resolution = 320;
        if (modelName == "resnet50") resolution = 640;
        let inputData = tf.image.resizeNearestNeighbor(tf.browser.fromPixels(input), [resolution, resolution]).expandDims(0);
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
    //console.log("add " + time);
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

const phoneModeCheckbox = document.getElementById("phoneMode")
let phoneMode = phoneModeCheckbox.checked;
phoneModeCheckbox.addEventListener("click", function () {
    phoneMode = phoneModeCheckbox.checked;
});