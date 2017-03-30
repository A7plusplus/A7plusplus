/**
* @file A7Init.js
* @brief Script d'initialisation de l'extension
*/


// Si la langue n'est pas anglais
if(location.search.search(new RegExp('&lang=1$')) === -1)
{
    // Remplacement des AJAX
    var xhrProto = XMLHttpRequest.prototype,
        sendOrig = xhrProto.send,
        origOpen = xhrProto.open;

    xhrProto.send = function()
    {
        try
        {
            sendOrig.apply(this, arguments);
        }
        catch(err)
        {
            // Remet en place jes AJAX de base
            XMLHttpRequest.prototype.send = sendOrig;
            XMLHttpRequest.prototype.open = origOpen;
            XMLHttpRequest.prototype = xhrProto;
        }
    };

    // Ajoute l'url à l'objet AJAX
    xhrProto.open = function (method, url)
    {
        // Fait échouer la première requête
        if(url === '/ajax_list.php' + location.search + '&start=0&updated=false&slang=')
        {
            return;
        }

        return origOpen.apply(this, arguments);
    };
}


// Déclare l'objet page et la liste des lignes
var page;

// Si la page est déjà chargée
if (document.readyState === 'interactive' || document.readyState === 'complete')
{
    // Si la langue n'est pas anglais
    if(location.search.search(new RegExp('&lang=1$')) === -1)
    {
        // Demande la page avec complément anglais
        list(0, false, 1);
    }
    
    // Initie l'extension
    init();
}
// Sinon, attend la fin du chargement de la page
else
{
    document.addEventListener('DOMContentLoaded', function() { init(); }, false);
}


/**
 * @fn init Initialise les différents composants
 */
function init()
{
    // Récupère l'élément contenant la liste
    var list = document.getElementById('lista');

    // Attend le chargement des séquences
    if (list.innerHTML === '<img src="/images/loader.gif">' || list.innerHTML === '&nbsp;')
    {
        setTimeout(init, 250);
        return;
    }

    // Récupère la langue du site
    var lang = document.getElementById('comboLang'),
        choosen = lang ? lang.options[lang.selectedIndex].value : (navigator.language || navigator.userLanguage || 'en');
    // Ne garde que le nescessaire
    loc = loc[choosen] ? loc[choosen] : loc.en;

    // La page ne contient pas de lignes de traduction
    if (!document.getElementById('trseqtop'))
    {
        console.log('[A7++] ' + loc.noAvailableLine);
        return;
    }

    // Récupère les infos de la page
    var pageInfos = {};
    location.search.substr(1).split('&').forEach(function(item)
    {
        pageInfos[item.split('=')[0]] = item.split('=')[1];
    });

    // Initialise l'objet page
    page = {
        lock: (document.getElementById('locktop') !== null) ? 1 : 0,
        stateIntervalId: null,
        refreshCommentsTimeoutId: null,
        queryInfos: pageInfos,
        commentNumber: -1,
        tempDisablePopupRemoval: false
        };

    // Démarre l'actualisation de l'avancement (toutes les minutes)
    page.stateIntervalId = setInterval(updateStateOfTranslation, A7Settings.stateUpdateInterval * 1000);

    // Ajoute la structure d'accueil des commentaires
    var listaParent = list.parentElement;

    listaParent.insertBefore(createCommentStruct(), listaParent.lastElementChild);

    // Récupère la taille enregistrée, l'état de lock et l'état d'épinglement
    if(localStorage)
    {
        updateCommentHeightFromSaved(listaParent.lastElementChild.previousElementSibling, 'A7ppCommentWindowSize', 180, 0.8);
        if(localStorage.getItem('A7ppCommentWindowPined') === "true")
        {
            pinComments();
        }
        if(localStorage.getItem('A7ppCommentWindowLockedDown') === "true")
        {
            lockComment();
        }
    }

    // Initie la requête pour savoir si on est en HI
    requestHICheck();

    // Actualisation des commentaires (ce qui active aussi l'actualisation à intervalles réguliers)
    refreshComments();

    linesChanged();

    // Permet le changement de la langue d'affichage du site (bugfix du site)
    changeAppLang();

    // Vérifie les mises à jour
    searchForUpdate();
}
