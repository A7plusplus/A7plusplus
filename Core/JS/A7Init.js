/**
* @file A7Init.js
* @brief Script d'initialisation de l'extension
*/


// On est en translate
var translatePage = location.href.search(new RegExp('translate.php')) !== -1;

// Si la langue n'est pas anglais et qu'on est en edit
if(!translatePage && location.search.search(new RegExp('&lang=1$')) === -1)
{
    // Remplacement des AJAX
    var xhrProto = XMLHttpRequest.prototype,
        sendOrig = xhrProto.send,
        origOpen = xhrProto.open;

    xhrProto.send = function()
    {
        try
        {
            // Envoi une exception si l'objet n'est pas ouvert
            sendOrig.apply(this, arguments);
        }
        catch(err)
        {
            // Remet en place jes AJAX de base
            XMLHttpRequest.prototype.send = sendOrig;
            XMLHttpRequest.prototype.open = origOpen;
            XMLHttpRequest.prototype = xhrProto;

            // Demande la page avec complément anglais
            list(0, false, 1);
        }
    };

    // Empêche l'ouverture de l'objet si c'est la requête de base
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
    // Initie l'extension
    init();
}
// Sinon, attend la fin du chargement de la page
else
{
    document.addEventListener('DOMContentLoaded', function()
    {
        init();
    }, false);
}


/**
 * @fn init Initialise les différents composants
 */
function init()
{
    // Récupère l'élément contenant la liste
    var list = document.getElementById('lista');

    // Attend le chargement des séquences
    if (list === null || list.innerHTML === '<img src="/images/loader.gif">' || list.innerHTML === '&nbsp;')
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
    if (
        (!document.getElementById('trseqtop') && !translatePage) ||
        (!document.getElementById('unt') && translatePage)
    )
    {
        console.log('[A7++] ' + loc.noAvailableLine);
        return;
    }

    // Récupère les infos de la page
    var pageInfos = {};
    if(!translatePage)
    {
        location.search.substr(1).split('&').forEach(function(item)
        {
            pageInfos[item.split('=')[0]] = item.split('=')[1];
        });
    }
    else
    {
        var raw = mouseclick.toString().match(/translate_ajaxselect\.php\?id=(\d+)&fversion=(\d+)&langto=(\d+)&langfrom=(\d+)&/);
        pageInfos.id       = raw[1];
        pageInfos.fversion = raw[2];
        pageInfos.lang     = raw[3];
        pageInfos.langfrom = raw[4];
    }

    // Initialise l'objet page
    page = {
        translatePage: translatePage,
        lock: (document.getElementById('locktop') !== null) ? 1 : 0,
        stateIntervalId: null,
        refreshCommentsTimeoutId: null,
        queryInfos: pageInfos,
        commentNumber: -1,
        tempDisablePopupRemoval: false,
        userBarData: {},
        tempTranslateBackup: [],
        draggedNode: null
        };

    // Démarre l'actualisation de l'avancement (toutes les minutes)
    page.stateIntervalId = setInterval(updateStateOfTranslation, A7Settings.stateUpdateInterval * 1000);

    // Ajoute la structure d'accueil, des commentaires et de la barre utilisateur
    var listaParent = list.parentElement;

    if(!page.translatePage)
    {
        listaParent.insertBefore(createUserBarStruct(), listaParent.lastElementChild);
    }
    listaParent.insertBefore(createCommentStruct(), listaParent.lastElementChild);

    // Crée le lock des commentaires
    listaParent.insertBefore(createCommentLockUtil(), listaParent.lastElementChild);

    // Récupère la taille enregistrée, l'état de lock, l'état d'épinglement et la position de la barre utilisateur
    if(localStorage)
    {
        var commentsSection = document.getElementById('commentsSection');
        updateCommentHeightFromSaved(commentsSection, 'A7ppCommentWindowSize', 180, 0.8);
        if(localStorage.getItem('A7ppCommentWindowPined') === "true")
        {
            pinComments();
        }
        if(localStorage.getItem('A7ppCommentWindowLockedDown') === "true")
        {
            lockComment();
        }

        // Barre utilisateur
        var userBarPos = localStorage.getItem('A7ppUserBarPosition');
        if(userBarPos && !page.translatePage)
        {
            var data = userBarPos.split(',');
            var left = data[0],
                top  = data[1];

            setUserBarSize(parseInt(left, 10), parseInt(top, 10));
        }
    }

    // Initie la requête pour savoir si on est en HI
    setTimeout(requestHICheck, 100);

    // Actualisation des commentaires (ce qui active aussi l'actualisation à intervalles réguliers)
    refreshComments();

    linesChanged();

    // Permet le changement de la langue d'affichage du site (bugfix du site)
    changeAppLang();

    // Vérifie les mises à jour
    searchForUpdate();
}
