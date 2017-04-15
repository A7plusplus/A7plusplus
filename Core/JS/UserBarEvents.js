/**
* @file UserBarEvents.js
* @brief Script des fonctions liées à la bar utilisateur
*/


/**
* @fn loadUserBarUsers Charge la liste des utilisateurs dans la userBar
*/
function loadUserBarUsers()
{
    // Récupère les utilisateurs
    var selects = document.getElementsByTagName('select'),
        requestedSelect;
    for (var i = 0; i < selects.length; i++)
    {
        if (selects[i].name === 'user')
        {
            // Récupère les données
            requestedSelect = selects[i];
            break;
        }
    }

    // Clone les utilisateurs
    var clone = requestedSelect.cloneNode(true);
    clone.removeChild(clone.firstElementChild);
    clone.setAttribute('id', 'selectUser');

    // Les injecte dans la barre utilisateur
    var userBar  = document.getElementById('userBar');
    var userSpan = userBar.firstElementChild.firstElementChild;
    if(userSpan.lastElementChild.tagName === 'SELECT')
    {
        userSpan.lastElementChild.remove();
    }
    userSpan.appendChild(clone);

    // Ajoute l'event
    clone.addEventListener('change', function()
    {
        // Ferme les fenêtres
        triggerPM(true);
        triggerReport(true);
        triggerProfile(true);

        // Vide le cache
        page.userBarData = {};
    });

    // Ajoute le drag and drop
    userBar.addEventListener('dragstart', userBarDragStart, false);
    document.body.addEventListener('dragover', userBarDragOver, false);
    document.body.addEventListener('drop', userBarDragDrop, false);
}


/**
* @fn setUserBarSize Déplace la barre utilisateur
* @param {Integer} left Position X
* @param {Integer} top Position Y
*/
function setUserBarSize(left, top)
{
    var userBar  = document.getElementById('userBar');

    // Ne dépasse pas
    left = left < 0 ? 0 : left + userBar.offsetWidth  > window.innerWidth  ? window.innerWidth  - userBar.offsetWidth  : left;
    top  = top < 0  ? 0 : top  + userBar.offsetHeight > window.innerHeight ? window.innerHeight - userBar.offsetHeight : top;


    // Applique la position
    userBar.style.left = left + 'px';
    userBar.style.top = top + 'px';

    // Enregistre
    if(localStorage)
    {
        localStorage.setItem('A7ppUserBarPosition', left + ',' + top);
    }
}


/**
* @fn openUserBar Ouvre la barre utilisateur
* @param bar {Object} Objet HTML de la barre
*/
function triggerUserBar(bar)
{
    // Ouvre ou ferme
    if(bar.classList.contains('userBarOpened'))
    {
        triggerPM(true);
        triggerReport(true);
        triggerProfile(true);
        bar.classList.remove('userBarOpened');
    }
    else
    {
        bar.classList.add('userBarOpened');
    }
}


/**
* @fn closeUserBarData Ferme la barre de données utilisateur
*/
function closeUserBarData()
{
    var userBarData = document.getElementById('userBarData');
    userBarData.classList.remove('userBarDataMinimized');
    userBarData.classList.remove('pageLoaded');
}


/**
* @fn openPM Ouvre les messages privés
* @param close {boolean} Force la fermeture
*/
function triggerPM(close)
{
    // Récupère le bouton
    var button = document.getElementById('userBar').firstElementChild.children[1];

    // Ouvre ou ferme
    var isOpened = button.classList.contains('userBarButtonClicked');
    if(close || isOpened)
    {
        if(isOpened)
        {
            // Sauvegarde l'état
            page.userBarData.PM = document.getElementById('userBarData').firstElementChild;
        }
        button.classList.remove('userBarButtonClicked');
        closeUserBarData();
    }
    else
    {
        // Ferme les autres boutons
        triggerReport(true);
        triggerProfile(true);
        button.classList.add('userBarButtonClicked');

        var dataContainer = document.getElementById('userBarData');
        dataContainer.classList.add('pageLoaded');

        // Ne recharge pas s'il n'y a pas besoin
        if(page.userBarData.PM)
        {
            dataContainer.innerHTML = '';
            dataContainer.appendChild(page.userBarData.PM);
        }
        else
        {
            // Affiche le logo de chargement
            resetToLoadingImage(dataContainer);

            // Récupère l'id utilisateur
            var id = document.getElementById('selectUser'),
                value = id.options[id.selectedIndex].value;

            ajax('GET', '/msgcreate.php?to=' + value, '', post_triggerPM, null, null, null);
        }
    }
}


/**
* @fn openReport Ouvre la page de report
* @param close {boolean} Force la fermeture
*/
function triggerReport(close)
{
    // Récupère le bouton
    var button = document.getElementById('userBar').firstElementChild.children[2];

    // Ouvre ou ferme
    var isOpened = button.classList.contains('userBarButtonClicked');
    if(close || isOpened)
    {
        if(isOpened)
        {
            // Sauvegarde l'état
            page.userBarData.Report = document.getElementById('userBarData').firstElementChild;
        }
        button.classList.remove('userBarButtonClicked');
        closeUserBarData();
    }
    else
    {
        triggerPM(true);
        triggerProfile(true);
        button.classList.add('userBarButtonClicked');

        var dataContainer = document.getElementById('userBarData');
        dataContainer.classList.add('pageLoaded');

        // Ne recharge pas s'il n'y a pas besoin
        if(page.userBarData.Report)
        {
            dataContainer.innerHTML = '';
            dataContainer.appendChild(page.userBarData.Report);
        }
        else
        {
            // Affiche le logo de chargement
            resetToLoadingImage(dataContainer);

            ajax('GET', '/badsub.php' + location.search, '', post_triggerReport, null, null, null);
        }
    }
}


/**
* @fn openProfile Ouvre la page de l'utilisateur
* @param close {boolean} Force la fermeture
*/
function triggerProfile(close)
{
    // Récupère le bouton
    var button = document.getElementById('userBar').firstElementChild.lastElementChild;

    // Ouvre ou ferme
    var isOpened = button.classList.contains('userBarButtonClicked');
    if(close || isOpened)
    {
        if(isOpened)
        {
            // Sauvegarde l'état
            page.userBarData.Prof = document.getElementById('userBarData').firstElementChild;
        }
        button.classList.remove('userBarButtonClicked');
        closeUserBarData();
    }
    else
    {
        // Ferme le reste
        triggerPM(true);
        triggerReport(true);
        button.classList.add('userBarButtonClicked');

        var dataContainer = document.getElementById('userBarData');
        dataContainer.classList.add('pageLoaded');

        // Ne recharge pas s'il n'y a pas besoin
        if(page.userBarData.Prof)
        {
            dataContainer.innerHTML = '';
            dataContainer.appendChild(page.userBarData.Prof);
        }
        else
        {
            // Affiche le logo de chargement
            resetToLoadingImage(dataContainer);

            // Récupère l'id utilisateur
            var id = document.getElementById('selectUser'),
                value = id.options[id.selectedIndex].value;

            ajax('GET', '/user/' + value, '', post_triggerProfile, null, null, null);
        }
    }
}


/**
* @fn post_triggerPM Traite l'AJAX du message privé
* @param {String} HTMLString Réponse de la requête AJAX
* @param {Boolean} isError Status de réussite de la requête AJAX
*/
function post_triggerPM(HTMLString, isError)
{
    // Créé le DOM virtuel
    var PMHTML = document.createElement('html');
    PMHTML.innerHTML = HTMLString;

    // Récupère le formulaire
    var form = PMHTML.getElementsByTagName('form')[0];

    // Place le sujet
    var inputs =  form.getElementsByTagName('input');
    inputs[0].setAttribute('onkeyup', '');
    inputs[1].value = '[' + document.getElementsByTagName('i')[0].innerText + ']';

    // Pas de lien en hat de page
    form.firstElementChild.firstElementChild.firstElementChild.remove();

    // Réécrit la fonction d'envoi
    form.setAttribute('action', '#');
    form.setAttribute('onsubmit', 'return userBarSendPM(this)');

    // L'affiche
    var dataContainer = document.getElementById('userBarData');
    dataContainer.innerHTML = '';
    dataContainer.appendChild(form);
}


/**
* @fn post_triggerReport Traite l'AJAX du report
* @param {String} HTMLString Réponse de la requête AJAX
* @param {Boolean} isError Status de réussite de la requête AJAX
*/
function post_triggerReport(HTMLString, isError)
{
    // Créé le DOM virtuel
    var reportHTML = document.createElement('html');
    reportHTML.innerHTML = HTMLString;

    // Récupère le formulaire et le nettoye
    var form = reportHTML.getElementsByTagName('form')[0];

    // Récupère l'id utilisateur incriminé
    var id = document.getElementById('selectUser'),
        user = id.options[id.selectedIndex].innerText,
        textarea = form.getElementsByTagName('textarea')[0];
    textarea.value = '[A7++] Report user: ' + user + '\n';

    // Réécrit la fonction d'envoi
    form.setAttribute('action', '#');
    form.setAttribute('onsubmit', 'return userBarSendReport(this)');

    // L'affiche
    var dataContainer = document.getElementById('userBarData');
    dataContainer.innerHTML = '';
    dataContainer.appendChild(form);
}


/**
* @fn post_triggerProfile Traite l'AJAX du profile
* @param {String} HTMLString Réponse de la requête AJAX
* @param {Boolean} isError Status de réussite de la requête AJAX
*/
function post_triggerProfile(HTMLString, isError)
{
    // Créé le DOM virtuel
    var profHTML = document.createElement('html');
    profHTML.innerHTML = HTMLString;

    // Récupère le tableau des données
    var tables = profHTML.getElementsByTagName('table'),
        dataTable;
    for (var i = 0; i < tables.length; i++)
    {
        if (tables[i].classList.contains('tabel') && tables[i].width === '90%' && tables[i].border === '0')
        {
            // Récupère les données
            dataTable = tables[i];
            break;
        }
    }

    var dataContainer = document.getElementById('userBarData');
    dataContainer.innerHTML = '';
    dataContainer.appendChild(dataTable);
}


/**
* @fn userBarSendPM Envoi un message privé
* @param {Object} form Noeud HTML du formulaire de mesage privé
*/
function userBarSendPM(form)
{
    // Déjà en cours d'envoi
    if(form.classList.contains('messageSent'))
    {
        return false;
    }

    // Récupère les données
    var inputs   = form.getElementsByTagName('input');
    var textarea = form.getElementsByTagName('textarea')[0];

    // Prépare les données
    var params = 'to='         + encodeURIComponent(inputs[0].value) +
                 '&subject='   + encodeURIComponent(inputs[1].value) +
                 '&msgtext='   + encodeURIComponent('<p>' + textarea.value + '</p>'),
        url    = '/msgsend.php',
        action = 'POST';

    // Indique que c'est en envoi
    var parent = form.classList.add('messageSent');

    // Effectue l'envoi des données
    ajax(action, url, params, post_userBarSendPM, null, null, null);

    return false;
}


/**
* @fn post_userBarSendPM Traite le retour du l'envoi du message
* @param {String} HTMLString Réponse de la requête AJAX
* @param {Boolean} isError Status de réussite de la requête AJAX
*/
function post_userBarSendPM(HTMLstring, isError)
{
    // On est toujours sur la page
    var form = document.getElementById('userBarData').firstElementChild;
    if(!form || form.onsubmit.toString().substr(36, 19) !== 'userBarSendPM(this)' || !form.classList.contains('messageSent'))
    {
        return;
    }

    if(isError)
    {
        form.classList.add('ajaxError');
        form.title = loc.messageSendError;
        form.classList.remove('messageSent');
        return;
    }

    // Tout va bien
    var p = document.createElement('p');
    p.classList.add('messageSentSuccess');
    p.title = loc.messageSent;

    var parent = form.parentElement;
    parent.innerHTML = '';
    parent.appendChild(p);

    // Vide le cache
    page.userBarData.PM = null;
}


/**
* @fn userBarSendReport Envoi un rapport
* @param {Object} form Noeud HTML du formulaire de rapport
*/
function userBarSendReport(form)
{
    // Déjà en cours d'envoi
    if(form.classList.contains('messageSent'))
    {
        return false;
    }

    // Récupère les données
    var textarea = form.getElementsByTagName('textarea')[0],
        subInfo  = page.queryInfos;

    // Prépare les données
    var params = 'comment='   + encodeURIComponent(textarea.value) +
                 '&fversion=' + subInfo.fversion +
                 '&id='       + subInfo.id +
                 '&lang='     + subInfo.lang,
        url    = 'badsub_do.php',
        action = 'POST';

    // Traite les checkbox
    var inputs = form.getElementsByTagName('input');
    for(var i = 0; i < inputs.length; i++)
    {
        if(inputs[i].type === 'checkbox')
        {
            if(inputs[i].checked)
            {
                params += '&' + inputs[i].name + '=true';
            }
        }
    }

    // Indique que c'est en envoi
    var parent = form.classList.add('messageSent');

    // Effectue l'envoi des données
    ajax(action, url, params, post_userBarSendReport, null, null, null);

    return false;
}


/**
* @fn post_userBarSendReport Traite le retour du l'envoi du rapport
* @param {String} HTMLString Réponse de la requête AJAX
* @param {Boolean} isError Status de réussite de la requête AJAX
*/
function post_userBarSendReport(HTMLstring, isError)
{
    // On est toujours sur la page
    var form = document.getElementById('userBarData').firstElementChild;
    if(!form || form.onsubmit.toString().substr(36, 23) !== 'userBarSendReport(this)' || !form.classList.contains('messageSent'))
    {
        return;
    }

    if(isError)
    {
        form.classList.add('ajaxError');
        form.title = loc.messageSendError;
        form.classList.remove('messageSent');
        return;
    }

    // Tout va bien
    var p = document.createElement('p');
    p.classList.add('messageSentSuccess');
    p.title = loc.messageSent;

    var parent = form.parentElement;
    parent.innerHTML = '';
    parent.appendChild(p);

    // Vide le cache
    page.userBarData.Report = null;
}


/**
* @fn minimizeUserData Réduit la fenêtre de données de la barre utilisateur
*/
function triggerUserData()
{
    var userBarData = document.getElementById('userBarData');

    if(userBarData.classList.contains('userBarDataMinimized'))
    {
        userBarData.classList.remove('userBarDataMinimized');
    }
    else
    {
        userBarData.classList.add('userBarDataMinimized');
    }
}


/**
* @fn userBarDragStart Récupère et enregistre la position initiale
* @param {object} event Objet evenement
*/
function userBarDragStart(event)
{
    var style = window.getComputedStyle(event.target, null);
    event.dataTransfer.setData('text/plain',
        (parseInt(style.getPropertyValue('left'), 10) - event.clientX) +
        ',' +
        (parseInt(style.getPropertyValue('top'), 10) - event.clientY)
    );
}


/**
* @fn userBarDragOver Empêche l'action par défaut
* @param {object} event Objet evenement
*/
function userBarDragOver(event)
{
    event.preventDefault();
    return false;
}


/**
* @fn userBarDragDrop Déplace la barre utilisateur
* @param {object} event Objet evenement
*/
function userBarDragDrop(event)
{
    // Récupère les positions
    var offset  = event.dataTransfer.getData('text/plain').split(',');

    setUserBarSize(
        event.clientX + parseInt(offset[0], 10),
        event.clientY + parseInt(offset[1], 10)
    );

    // Empêche l'action par défaut
    event.preventDefault();
    return false;
}
