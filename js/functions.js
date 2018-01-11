function rand(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

function dSet(obj) {
    chrome.storage.local.set(obj);
}
function dGet(obj) {
    if (obj === undefined) obj = null;
    return new Promise(function(resolve) {
        chrome.storage.local.get(obj, function(data) {resolve(data)});
    });
}