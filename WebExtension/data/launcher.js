function createScript(fileToLoad)
{
    var script  = document.createElement('script');

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('data/JS/' + fileToLoad));

    return script;
}

var waitForHead = setInterval(function()
{
    if (document.head)
    {
        clearInterval(waitForHead);

        document.head.appendChild(createScript('Settings.js'));
        document.head.appendChild(createScript('Localization.js'));

        document.head.appendChild(createScript('InitFunctions.js'));
        document.head.appendChild(createScript('UtilsFunctions.js'));
        document.head.appendChild(createScript('HTMLCreation.js'));
        document.head.appendChild(createScript('Accessors.js'));

        document.head.appendChild(createScript('TextEvents.js'));
        document.head.appendChild(createScript('TimeEvents.js'));
        document.head.appendChild(createScript('CommentEvents.js'));
        document.head.appendChild(createScript('UpdateEvents.js'));

        document.head.appendChild(createScript('Extra.js'));
        document.head.appendChild(createScript('A7Init.js'));
    }
}, 25);
