// window.onerror = function (error) {
//     displayError(error)
//     return false;

// }
window.addEventListener("error", function (error) {
    displayError(error)
    return false;

})
// window.addEventListener('unhandledrejection', function (event) {
//     displayError(event)
//     return false;

// })

function displayError(error) {
    // if (typeof error === 'string' || error instanceof String) {
    //     alert(error)
    // } else {
    //     alert("Error in: " + error.filename + '\n' + error.stack)
    // }
    alert(error.stack);
    throw error;
}