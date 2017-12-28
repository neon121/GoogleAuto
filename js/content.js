chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request) {
        case 'keypress':
            //keyboardEvent('press', 'a');

            sendResponse('pressed');
            break;
    }
});

$(function() {
    console.log('readystate');
    //includeJS();
});

function includeJS()
{
    var xhr = new XMLHttpRequest();
    var include =  chrome.extension.getURL('/js/include.js');
    xhr.open("GET", include, true);
    xhr.onreadystatechange = function()
    {
        if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
        {
            var allText = xhr.responseText;
            var head = document.getElementsByTagName('head')[0];
            script = document.createElement('script');
            script.innerHTML = allText;
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('charset', 'utf-8');
            head.insertBefore(script, head.firstChild);
        }
    };
    xhr.send();
}