var tabid;
function googleIt(search_term, click_url, wait_seconds) {
    var googleIt = new Promise(function(resolve) {
            chrome.tabs.create(
                {
                    url: 'https://google.com',
                    active: false,
                    //pinned: true
                },
                function(tab) {resolve(tab);}
            );
        })
        .then(function (tab) {
            tabid = tab.id;
            return new Promise(function(resolve) {
                chrome.tabs.onUpdated.addListener(function _listener(tabId, changeInfo, tab) {
                    if (changeInfo.status == 'complete') {
                        chrome.tabs.onUpdated.removeListener(_listener);
                        //here we got google page
                        resolve(true);
                    }
                })
            });
        })
        .then(function() {return wait(rand(1000, 2500))})
        .then(function() {console.log("done")})
    ;
}

function wait(milliseconds) {
    return new Promise(function(resolve) {
        setTimeout(function () {resolve(true);}, milliseconds);
    });
}

function rand(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}