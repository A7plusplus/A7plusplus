var script  = document.createElement("script");

script.setAttribute("type", "text/javascript");
script.setAttribute("src", chrome.extension.getURL('data/Addic7ed.js'));

var waitForHead = setInterval(function()
{
    if (document.head)
    {
        clearInterval(waitForHead);
        document.head.appendChild(script);
    }
}, 25);
