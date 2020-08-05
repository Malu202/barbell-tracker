
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const boxesCheckbox = document.getElementById("boxes");
const pathCheckbox = document.getElementById("path");

let previousDetections = [];
let currentDetections = [];
let path = [];

function drawAnnotations(detection_boxes, detection_scores, detection_classes, num_detections) {
    canvas.width = input.videoWidth;
    canvas.height = input.videoHeight;

    ctx.drawImage(input, 0, 0, canvas.width, canvas.height)

    const textOffset = Math.round(canvas.height / 300);

    currentDetections = [];
    for (let i = 0; i < num_detections; i++) {
        detection_classes[i]
        if (detection_scores[i] > 0.5 && Math.round(detection_classes[i]) == 2) {
            currentDetections.push(new Detection(detection_boxes[i], detection_classes[i], detection_scores[i]))
        } else if (detection_scores[i] > 0.35) {
            if (Math.round(detection_classes[i]) == 1) currentDetections.push(new Detection(detection_boxes[i], detection_classes[i], detection_scores[i]))
        } else break;
    }

    if (drawBoxes) {
        ctx.beginPath();
        ctx.strokeStyle = "#0F0";
        ctx.fillStyle = "#0F0";
        const fontSize = textOffset * 7;
        ctx.font = "bold " + fontSize + "px Arial";
        ctx.lineWidth = 3;

        for (let i = 0; i < currentDetections.length; i++) {
            const d = currentDetections[i].drawingProperties(canvas.width, canvas.height);
            ctx.fillText(d.class + ": " + d.score + "%", d.x, d.y - textOffset);
            ctx.rect(d.x, d.y, d.width, d.height);
        }
        ctx.stroke();
    }
    if (drawPath) {
        threshold = (canvas.height + canvas.width) * 0.065;
        const newPoints = findCorrespondingDetections(currentDetections, previousDetections, threshold);
        path = path.concat(newPoints)

        ctx.beginPath();
        ctx.strokeStyle = "#F00";
        ctx.lineWidth = 2;
        for (let i = 0; i < path.length; i++) {
            ctx.moveTo(path[i][0] * canvas.width, path[i][1] * canvas.height);
            ctx.lineTo(path[i][2] * canvas.width, path[i][3] * canvas.height);
        }
        ctx.stroke();
    }

    previousDetections = currentDetections;
    currentDetections = [];
}

function findCorrespondingDetections(detections, previousDetections, threshold) {
    const newPoints = [];
    detections.forEach(function (newDetection) {
        if (newDetection.class == "hantel") return;

        let nearestDetection = { distanceSquared: Infinity }
        previousDetections.forEach(function (previousDetection) {

            const distanceSquared = previousDetection.distanceSquared(newDetection);
            const dWidth = previousDetection.dWidth(newDetection);
            const dHeight = previousDetection.dHeight(newDetection);
            const sameClass = previousDetection.class == newDetection.class;

            if (sameClass && distanceSquared < nearestDetection.distanceSquared && dWidth < 0.1 && dHeight < 0.1 && distanceSquared < threshold * threshold) {
                nearestDetection = {
                    distanceSquared: distanceSquared,

                    points: [
                        previousDetection.x + previousDetection.width * 0.5,
                        previousDetection.y + previousDetection.height * 0.5,
                        newDetection.x + newDetection.width * 0.5,
                        newDetection.y + newDetection.height * 0.5,
                    ]
                }
            }
        })
        delete newDetection.distanceSquared;
        if (nearestDetection.points) newPoints.push(nearestDetection.points)
    });
    return newPoints;
}

class Detection {
    constructor(detection_box, detection_class, detection_score) {
        if (detection_box && detection_class && detection_score) {
            const d = detection_box;
            this.y = d[0];
            this.x = d[1];
            this.height = d[2] - this.y;
            this.width = d[3] - this.x;
            this.class = CLASSES[Math.round(detection_class) - 1];
            this.score = detection_score;
        }
    }
    drawingProperties(width, height) {
        const drawing = new Detection();
        drawing.y = Math.round(this.y * height);
        drawing.x = Math.round(this.x * width);
        drawing.height = Math.round(this.height * height);
        drawing.width = Math.round(this.width * width);
        drawing.class = this.class;
        drawing.score = Math.round(this.score * 100) + "%";
        return drawing
    }
    distanceSquared(detection) {
        return (this.x - detection.x) * (this.x - detection.x) + (this.y - detection.y) * (this.y - detection.y)
    }
    dWidth(detection) {
        return Math.abs((this.width - detection.width) / this.width);
    }
    dHeight(detection) {
        return Math.abs((this.height - detection.height) / this.height);
    }
}

boxesCheckbox.addEventListener("change", newDrawingProperties);
pathCheckbox.addEventListener("change", newDrawingProperties);


let drawBoxes;
let drawPath;
function newDrawingProperties() {
    drawBoxes = boxesCheckbox.checked;
    drawPath = pathCheckbox.checked;
    console.log(drawBoxes, drawPath)
}
newDrawingProperties();

function clearCanvas() {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    previousDetections = [];
    currentDetections = [];
    path = [];

}