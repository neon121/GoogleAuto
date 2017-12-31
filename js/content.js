var xhr = new XMLHttpRequest();
var include =  chrome.extension.getURL('/js/include.js');
xhr.open("GET", include, true);
xhr.onreadystatechange = function()
{
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200)
    {
        var allText = xhr.responseText;
        eval(allText);
    }
};
xhr.send();