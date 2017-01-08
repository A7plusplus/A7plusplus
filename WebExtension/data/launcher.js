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

        document.head.appendChild(createScript('Jsmodal-1.0d.min.js'));

        document.head.appendChild(createScript('TextEvents.js'));
        document.head.appendChild(createScript('TimeEvents.js'));
        document.head.appendChild(createScript('UserEvents.js'));
        document.head.appendChild(createScript('CommentEvents.js'));
        document.head.appendChild(createScript('UpdateEvents.js'));

        document.head.appendChild(createScript('Extra.js'));

        // Communication des sources des images de grande taille
        var A7Init = createScript('A7Init.js');
        A7Init.onload = function()
        {
            // Injection des images de grandes tailles
            var sources = {
                userInfo :   chrome.extension.getURL('data/IMG/UserInfo.png'),
                userPM :     chrome.extension.getURL('data/IMG/UserPM.png'),
                userReport : chrome.extension.getURL('data/IMG/UserReport.png'),
            };

            // Création et envoi de l'évènement
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("A7SettingsImageInjection", true, true, sources);
            document.dispatchEvent(event);
        };

        document.head.appendChild(A7Init);
    }
}, 25);
