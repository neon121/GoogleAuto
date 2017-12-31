//googleIt(1,'nplus1.ru/',3, true)
var workingTab;
var readyDate;
var page = 0;
function googleIt(search_term, click_url, wait_seconds, useActive) {
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
                chrome.tabs.create(
                    {
                        url: 'https://google.com',
                        active: false,
                        //pinned: true
                    },
                    function (tab) {
                        workingTab = tab;
                        resolve(workingTab);
                    }
                );
            }
        })
        .then(function() {return waitUntilReady();})
        .then(function() {return wait(rand(500, 1000));})
        .then(function() {return enterSearchTerm(search_term);})
        .then(function() {return wait(2000);}) //wait cause content.js is waiting
        .then(function() {return checkThisPageForLink(click_url);})
        .then(function(result) {
            if (result != 'no_link') return wait(wait_seconds * 1000);
            else return true;
        })
        .then(function() {
            chrome.tabs.remove(workingTab.id);
            return true;
        })
}

/* todo:
logic: debug
humanization: more human-like behavior (mouse events, scroll events)
make it ready to get data from remote server and work with lists
 */

function checkThisPageForLink(click_url) {
    page = 0;
    return waitUntilReady()
        .then(function() {return wait(rand(500, 1000));})
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
            function () {resolve(true);},
            milliseconds);
    });
}
function waitUntilReady() {
    return new Promise(function(resolve) {
        var t = setInterval(function() {
            chrome.tabs.sendMessage(workingTab.id, {action: "getReadyDate"}, function(response) {
                if (response && response.error) console.error(response.error);
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
            if (response && response.error) console.error(response.error);
            resolve(true);
        });
    });
}
function getLinks() {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(workingTab.id, {action: "getLinks"}, function(response) {
            resolve(response);
        });
    });
}
function searchLink(links) {

}
function clickLink(linkId) {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(workingTab.id, {action: 'clickLink', linkId: linkId}, function(response) {
            if (response && response.error) console.error(response.error);
            resolve(true);
        });
    });
}
function nextPage() {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(workingTab.id, {action: 'nextPage'}, function(response) {
            if (response && response.error) console.error(response.error);
            resolve(true);
        });
    });
}
function rand(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}