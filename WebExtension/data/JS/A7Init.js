/**
* @file A7Init.js
* @brief Script d'initialisation de l'extension
*/


// Url de la page via l'API
var pageUrl = new URL(location.href);

// On est en mode Join translation
var translatePage = (pageUrl.pathname === '/translate.php');

// Si la langue n'est pas anglais et qu'on est en mode view & edit
if (!translatePage && pageUrl.searchParams.get('lang') !== '1')
{
    // Remplacement des AJAX
    var xhrProto = XMLHttpRequest.prototype,
        sendOrig = xhrProto.send,
        origOpen = xhrProto.open;

    xhrProto.send = function()
    {
        try
        {
            // Envoie une exception si l'objet n'est pas ouvert
            sendOrig.apply(this, arguments);
        }
        catch(err)
        {
            // Remet en place les AJAX de base
            XMLHttpRequest.prototype.send = sendOrig;
            XMLHttpRequest.prototype.open = origOpen;
            XMLHttpRequest.prototype = xhrProto;

            // Demande la page avec anglais en langue secondaire
            var askedFirstSeq = pageUrl.searchParams.get('sequence') ? pageUrl.searchParams.get('sequence') - 1 : 0;
            var updated       = pageUrl.searchParams.has('sequence');

            list(askedFirstSeq, updated, 1);
        }
    };

    // Empêche l'ouverture de l'objet si c'est la requête de base
    xhrProto.open = function (method, url)
    {
        // Parse l'url
        var parsedUrl = new URL(url, pageUrl.origin);

        // Fait échouer la première requête
        if (parsedUrl.pathname === '/ajax_list.php' &&
            parsedUrl.searchParams.get('id') === pageUrl.searchParams.get('id') &&
            parsedUrl.searchParams.get('lang') === pageUrl.searchParams.get('lang') &&
            parsedUrl.searchParams.get('fversion') === pageUrl.searchParams.get('fversion') &&
            parsedUrl.searchParams.get('slang') === ''
        )
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
    // Préinitialise l'extension
    preInit();
}
// Sinon, attend la fin du chargement de la page
else
{
    document.addEventListener('DOMContentLoaded', function()
    {
        // Préinitialise l'extension
        preInit();
    }, false);
}


/**
 * @fn preInit Préparatifs avant l'initialisation
 */
function preInit()
{
    // Vérification sommaire de l'intégrité de la page
    if (!document.getElementById('lista'))
    {
        console.error('[A7++] Document Error');
        return;
    }

    // Enlève l'indicateur d'avancement existant puis initialise l'extension
    if (translatePage) removeTitleIndicator();

    // Met à jour les réglages en fonction des options de l'utilisateur
    window.addEventListener("A7pp_options", function(data)
    {
        var options = JSON.parse(data.detail);

        // Si des options sont présentes, remplace celles par défaut
        if (options !== null)
        {
            A7Settings.stateUpdateInterval   = options.updates.state;
            A7Settings.commentUpdateInterval = options.updates.comment;
            A7Settings.lockPosition          = options.lock;
            A7Settings.disableUserBar        = options.userBar.disable;

            // Conditions nescessaires pour les versions migrées
            if(options.updates.popup)
                A7Settings.popupTimeout = options.updates.popup;

            if(options.videoBar)
                A7Settings.disableVideoBar = options.videoBar.disable;

            if(options.vlc)
            {
                A7Settings.useVLC     = options.vlc.enabled;
                A7Settings.VLCaddress = options.vlc.address;
            }
        }

        // Récupère la langue du site ou celle forcée
        if (options !== null && options.lang.forced === true)
        {
            // Fallback en anglais si la langue n'est pas trouvée
            loc = loc[options.lang.data] ? loc[options.lang.data] : loc.en;
        }
        else
        {
            var lang = document.getElementById('comboLang'),
                choosen = lang ? lang.options[lang.selectedIndex].value : (navigator.language || navigator.userLanguage || 'en');
            // Ne garde que le nescessaire
            loc = loc[choosen] ? loc[choosen] : loc.en;
        }

        // Lance l'initialisation
        init();
    });

    // Effectue la requête des options
    window.dispatchEvent(new CustomEvent("A7pp_option_request", {}));
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

    // La page ne contient pas de lignes de traduction
    if (
        (!document.getElementById('trseqtop') && !translatePage) ||
        (!document.getElementById('unt') && translatePage)
    )
    {
        console.error('[A7++] ' + loc.noAvailableLine);
        return;
    }

    // Récupère les infos de la page
    var pageInfos = {};
    if (!translatePage)
    {
        pageInfos.id       = pageUrl.searchParams.get('id');
        pageInfos.fversion = pageUrl.searchParams.get('fversion');
        pageInfos.lang     = pageUrl.searchParams.get('lang');
        pageInfos.langfrom = pageUrl.searchParams.get('langfrom');
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
        pageUrl: pageUrl,
        translatePage: translatePage,
        lock: (document.getElementById('locktop') !== null) ? 1 : 0,
        stateIntervalId: null,
        refreshCommentsTimeoutId: null,
        queryInfos: pageInfos,
        commentNumber: -1,
        tempDisablePopupRemoval: false,
        userBarData: {},
        lastUserBarUpdate: new Date('1970'),
        tempTranslateBackup: [],
        draggedNode: null
    };

    // Affiche l'indicateur de version sous le logo du site
    var tbody = document.body.firstElementChild.lastElementChild.firstElementChild,
        logoLink = tbody.firstElementChild.firstElementChild.firstElementChild;
    logoLink.insertBefore(createA7Info(), logoLink.lastElementChild);
    logoLink.setAttribute('id', 'A7Logo');

    // Place la popup d'erreur
    document.body.appendChild(createWarningPopup());

    // Démarre l'actualisation de l'état d'avancement
    page.stateIntervalId = setInterval(updateStateOfTranslation, A7Settings.stateUpdateInterval * 1000);

    // Ajoute la structure d'accueil des commentaires et de la barre utilisateur
    var listaParent = list.parentElement;

    // Ajoute la barre utilisateur si non désactivée
    if (!A7Settings.disableUserBar)
    {
        listaParent.insertBefore(createUserBarStruct(), listaParent.lastElementChild);
    }
    // Ajoute la barre vidéo si non désactivée
    if (!A7Settings.disableVideoBar)
    {
        document.body.classList.add('videoBarEnabled');
        listaParent.insertBefore(createVideoStruct(), listaParent.lastElementChild);
        videoBarInit();
    }
    listaParent.insertBefore(createCommentStruct(), listaParent.lastElementChild);

    // Si le lock des commentaires est placé en bas, le crée
    if (A7Settings.lockPosition === "bottom")
    {
        listaParent.insertBefore(createCommentLockUtil(), listaParent.lastElementChild);
    }

    // Récupère les valeurs enregistrées pour :
    // la taille de la fenêtre de commentaires, l'état de lock, l'état d'épinglement et la position de la barre utilisateur
    if (localStorage)
    {
        var commentsSection = getCommentCell();
        updateCommentHeightFromSaved(commentsSection, 'A7ppCommentWindowSize', 180, 0.8);
        if (localStorage.getItem('A7ppCommentWindowPined') === "true")
        {
            pinComments();
        }
        if (localStorage.getItem('A7ppCommentWindowLockedDown') === "true")
        {
            lockComment();
        }

        var data, left, top;

        // Barre utilisateur
        var userBarPos = localStorage.getItem('A7ppUserBarPosition');
        if (userBarPos && !A7Settings.disableUserBar)
        {
            data = userBarPos.split(',');
            left = data[0];
            top  = data[1];

            setUserBarSize(parseInt(left, 10), parseInt(top, 10));
        }

        // Barre vidéo
        var videoBarPos = localStorage.getItem('A7ppVideoBarPosition');
        if (videoBarPos && !A7Settings.disableVideoBar)
        {
            data = videoBarPos.split(',');
            left = data[0];
            top  = data[1];

            setVideoBarSize(parseInt(left, 10), parseInt(top, 10));
        }
    }

    // Initialise la requête pour savoir si on est en HI
    setTimeout(requestHICheck, 100);

    // Actualisation des commentaires (ce qui active aussi l'actualisation à intervalles réguliers)
    refreshComments();

    linesChanged();

    // Permet le changement de la langue d'affichage du site (bugfix du site)
    changeAppLang();
}
