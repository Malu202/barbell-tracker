
// const disabledTfjs = document.getElementById("tfjs");
// const tfjs = document.createElement("script");


// for(var i = 0, l = disabledTfjs.attributes.length; i < l; ++i){
// 	var nodeName  = disabledTfjs.attributes.item(i).nodeName;
// 	var nodeValue = disabledTfjs.attributes.item(i).nodeValue;

// 	tfjs.setAttribute(nodeName, nodeValue);
// }
// document.currentScript.insertAdjacentElement('afterend', tfjs);
// disabledTfjs.parentNode.removeChild(disabledTfjs);

let adck = false;
if (typeof Android !== "undefined") {
    adck = true;
}
const ANDROID = adck;

let newVideo;
//let tf;
if (ANDROID) {

    tf = {};
    alert = function(msg) {Android.showToast(msg);};
    
    alert("Android mode enabled")

    // document.getElementById('file-input').addEventListener("click", function () {
    //     Android.loadFile();
    // });

    // newVideo = function (path) {
    //     document.getElementById('videoInput').src = path;
    // }

    tf.loadGraphModel = function () {
        return {
            modelUrl: "",
            executeAsync:function () { }
        }
    };
    tf.tidy = function(){};
    tf.getBackend = function(){return "Android"}
}

