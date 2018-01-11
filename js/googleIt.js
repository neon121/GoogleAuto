//googling vars and function
var workingTab;
var readyDate;
var page;
var googling = false;
function googleIt(search_term, click_url, wait_seconds, hidden, useActive) {
    page = 0;
    googling = true;
    if (useActive == undefined) useActive = false;
    var googleIt = new Promise(function(resolve) {
        if (useActive) {
            chrome.tabs.query(
                {
                    active: true
                },
                function(tabs) {
                    workingTab = tabs[0];
                    resolve(workingTab);
                }
            );
        }
        else {
            chrome.windows.create(
                {
                    width: 1366,
                    height: 765,
                    focused: false,
                    type: 'popup'
                },
                function(window) {
                    if (hidden) chrome.windows.update(window.id, {top:9999, left: 9999});
                    chrome.tabs.create(
                        {
                            url: 'https://google.com',
                            active: false,
                            windowId: window.id

                        },
                        function (tab) {
                            workingTab = tab;
                            resolve(workingTab);
                        }
                    );
                }
            );
        }
    })
        .then(function() {return waitUntilReady();})
        .then(function() {return wait(rand(1000, 4000));})
        .then(function() {return enterSearchTerm(search_term);})
        .then(function() {return wait(2000);}) //wait cause content.js is waiting
        .then(function() {return checkThisPageForLink(click_url);})
        .then(function(result) {
            if (result != 'no_link') return wait(wait_seconds * 1000);
            else return true;
        })
        .then(function() {
            chrome.tabs.remove(workingTab.id);
            googling = false;
            return true;
        })
}
function checkThisPageForLink(click_url) {
    return (new Promise(function(resolve){resolve(true)}))
        .then(function() {return waitUntilReady()})
        .then(function() {return wait(rand(1000, 4000));})
        .then(function() {return scroll(rand(1000, 1500));})
        .then(function() {return wait(1500);})
        .then(function() {return getLinks();})
        .then(function(links) {
            var linkId = -1;
            for (var i = 0; i < links.length; i++) {
                if (links[i].indexOf(click_url) > -1) {
                    linkId = i;
                    break;
                }
            }
            if (linkId > -1) {
                return clickLink(linkId);
            }
            else {
                page++;
                if (page < 10) return nextPage().then(function() {checkThisPageForLink(click_url)});
                else return 'no_link'
            }
        })
}
function wait(milliseconds) {
    return new Promise(function (resolve) {
        setTimeout(
            function () {
                resolve(true);
            },
            milliseconds
        );
    });
}
function scroll(val) {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(workingTab.id, {action: "scroll", y: val}, function(response) {
            if (response && response.error) throw(response.error);
            resolve(response);
        });
    });
}
function waitUntilReady() {
    return new Promise(function(resolve) {
        var t = setInterval(function() {
            chrome.tabs.sendMessage(workingTab.id, {action: "getReadyDate"}, function(response) {
                if (response && response.error) throw(response.error);
                if (typeof response == 'number' && response != readyDate) {
                    readyDate = response;
                    clearInterval(t);
                    resolve(response);
                }
            });
        }, 10);
    });
}
function enterSearchTerm(search_term) {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(workingTab.id, {action: "enterSearchTerm", search_term: search_term}, function(response) {
            if (response && response.error) throw(response.error);
            resolve(true);
        });
    });
}
function getLinks() {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(workingTab.id, {action: "getLinks"}, function(response) {
            if (response && response.error) throw(response.error);
            resolve(response);
        });
    });
}
function clickLink(linkId) {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(workingTab.id, {action: 'clickLink', linkId: linkId}, function(response) {
            if (response && response.error) throw(response.error);
            resolve(true);
        });
    });
}
function nextPage() {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(workingTab.id, {action: 'nextPage'}, function(response) {
            if (response && response.error) throw(response.error);
            resolve(true);
        });
    });
}