/*
 * Partie communication lecteurs
 */
function customAjax(url, action, params)
{
    // Crée la requête
    var xhr = new XMLHttpRequest();

    // L'initialise
    xhr.responseType = 'document';
    xhr.open(action, url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    // Envoie
    xhr.send(params);
}

window.addEventListener("A7pp_player_request", function(data)
{
    var options = JSON.parse(data.detail);

    // Si des options sont présentes
    if (options !== null &&
        typeof(options.url) !== 'undefined' &&
        typeof(options.action) !== 'undefined'
    )
    {
        // Envoi la requête
        customAjax(
            'http://localhost:8080' + options.url,
            options.action,
            (typeof(options.params) !== 'undefined' ? options.params : '')
        );
    }
}, false);


/*
 * Partie injection
 */
function createScript(fileToLoad)
{
    var script  = document.createElement('script');

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('data/JS/' + fileToLoad));

    return script;
}

// Non conforme aux normes... Mais c'est le seul fix pour le moment
document.documentElement.appendChild(document.createElement('head'));

// Injecte les différents scripts
document.head.appendChild(createScript('Settings.js'));
document.head.appendChild(createScript('Localization.js'));

document.head.appendChild(createScript('InitFunctions.js'));
document.head.appendChild(createScript('UtilsFunctions.js'));
document.head.appendChild(createScript('HTMLCreation.js'));
document.head.appendChild(createScript('Accessors.js'));

document.head.appendChild(createScript('TextEvents.js'));
document.head.appendChild(createScript('TimeEvents.js'));
document.head.appendChild(createScript('UserBarEvents.js'));
document.head.appendChild(createScript('VideoBarEvents.js'));
document.head.appendChild(createScript('CommentEvents.js'));
document.head.appendChild(createScript('UpdateEvents.js'));

document.head.appendChild(createScript('Extra.js'));
document.head.appendChild(createScript('A7Init.js'));


/*
 * Partie options
 */
window.addEventListener("A7pp_option_request", function()
{
    chrome.storage.local.get(
        [
            'lang',
            'lock',
            'updates',
            'userBar',
            'videoBar',
            'extVideo'
        ],
        function(item)
        {
            var message = null;

            // Objet présent
            if
            (
                typeof item.lang !== 'undefined' &&
                typeof item.lock !== 'undefined' &&
                typeof item.updates !== 'undefined'
            )
            {
                message = item;
            }

            window.dispatchEvent(new CustomEvent("A7pp_options", {detail: JSON.stringify(message)}));
        }
    );
}, false);
