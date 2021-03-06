var readyDate;
var t = setInterval(function() {
    if (document.readyState === 'complete') {
        readyDate = new Date();
        clearInterval(t);
    }
}, 10);

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    try {
        switch (request.action) {
            case 'getReadyDate':
                if (readyDate === undefined) sendResponse(false);
                else sendResponse(readyDate.getTime());
                break;
            case 'enterSearchTerm':
                var inputs = document.getElementsByTagName('form')[0].getElementsByTagName('input');
                for (var i = 0; i < inputs.length; i++) {
                    var input = inputs[i];
                    if (input.type === 'text' && input.spellcheck === false) break;
                }
                input.value = request.search_term;
                setTimeout(
                    function () {
                        document.getElementsByTagName('form')[0].submit();
                        sendResponse('done');
                    },
                    rand(250, 1500)
                );
                sendResponse(true);
                break;
            case 'getLinks':
                var nodes = getANodes();
                if (nodes === undefined) throw 'no links';
                var resp = [];
                for (var i = 0; i < nodes.length; i++) {
                    console.log(i, nodes);
                    resp.push(nodes[i].href)
                }
                sendResponse(resp);
                break;
            case 'clickLink':
                var nodes = getANodes();
                nodes[request.linkId].click();
                sendResponse(true);
                break;
            case 'nextPage':
                var divs = document.getElementsByTagName('div');
                for (i = 0; i < divs.length; i++) {
                    var div = divs[i];
                    if (
                        div.id == 'foot' &&
                        div.attributes.role &&
                        div.attributes.role.value == 'navigation'
                    ) break;
                }
                var node = div.getElementsByTagName('table');
                if (node.length == 0) throw 'no table';
                var tds = node[0].getElementsByTagName('td');
                var td = tds[tds.length - 1];
                td.getElementsByTagName('a')[0].click();
                sendResponse();
                break;
            case 'scroll':
                var scrollStart = window.pageYOffset;
                var maxY = document.documentElement.scrollHeight - window.innerHeight;
                if (request.y == undefined || request.y > maxY) var targetY = maxY;
                else targetY = request.y;
                var t = setInterval(function() {
                    if (window.pageYOffset == targetY) {
                        clearInterval(t);
                        sendResponse('scroll');
                    }
                    else {
                        var scrollNow = window.pageYOffset;
                        var step = Math.round((targetY - scrollStart) / 100);
                        window.scroll({top: scrollNow + step});
                    }
                }, 15);
                sendResponse(true);
                break;
        }
    } catch (e) {
        sendResponse({error: "FROM CONTENT:\n" + e.stack});
    }
});

function getANodes() {
    var divsAll = document.getElementsByTagName('div');
    for (var i = 0; i < divsAll.length; i++) {
        var div = divsAll[i];
        if (div.dataset.asyncContext && div.dataset.asyncContext.indexOf('query') > -1) break;
    }
    var divsAll = div.getElementsByTagName('h3');
    var ret = [];
    for (var i = 0; i < divsAll.length; i++) {
        var a = divsAll[i].getElementsByTagName('a')[0];
        if (a != undefined) ret.push(a);
    }
    return ret;
}

document.addEventListener('DOMContentLoaded', function() {
    readyDate = new Date();
});