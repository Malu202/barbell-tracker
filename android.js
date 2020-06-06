
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
if(typeof Android !== "undefined"){
    console.log("hi")
    if(Android.exists) adck = true;
}
const IS_ANDROID = adck;
if(IS_ANDROID) alert("hi android!")

let newVideo;
if(IS_ANDROID) {
    tf = null;

    document.getElementById('file-input').addEventListener("click",function(){
        Android.loadFile();
    });

    newVideo = function(path){
        document.getElementById('input').src = path;
    }
}

