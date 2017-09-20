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
    var userSpan = userBar.firstElementChild.children[1];
    if(userSpan.lastElementChild && userSpan.lastElementChild.tagName === 'SELECT')
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
    userBar.addEventListener('mousedown', userBarMousedown, false);
    document.body.addEventListener('dragover', userBarDragOver, false);
    document.body.addEventListener('drop', userBarDragDrop, false);
    document.body.addEventListener('dragstart', function(event) {
        // Stocke une référence sur l'objet glissable
        page.draggedNode = event.target;
    }, false);
}


/**
* @fn updateUserBarSize Mets à jour la position de la barre utilisateur
* @param {Object} userBar Noeud HTML de la userBar
*/
function updateUserBarSize(userBar)
{
    var offsets = userBar.getBoundingClientRect();
    setUserBarSize(offsets.left, offsets.top);
}


/**
* @fn setUserBarSize Déplace la barre utilisateur
* @param {Integer} left Position X
* @param {Integer} top Position Y
*/
function setUserBarSize(left, top)
{
    var userBar  = document.getElementById('userBar');

    // Calcule les proportions
    var stickyFactor  = window.innerHeight * A7Settings.stickyFactor,
        width  = userBar.offsetWidth  < userBar.children[1].offsetWidth  ? userBar.children[1].offsetWidth  : userBar.offsetWidth,
        height = userBar.offsetHeight < userBar.children[1].offsetHeight ? userBar.children[1].offsetHeight : userBar.offsetHeight;

    // Ne dépasse pas
    left = left < 0 + stickyFactor ? 0 : left + width  + stickyFactor > document.body.clientWidth  ? document.body.clientWidth  - width  : left;
    top  = top  < 0 + stickyFactor ? 0 : top  + height + stickyFactor > window.innerHeight         ? window.innerHeight         - height : top;


    // Ajoute les classes
    if(left === 0)
    {
        userBar.classList.add('userBarLeft');

        // recalcule la hauteur
        height = userBar.offsetHeight < userBar.children[1].offsetHeight ? userBar.children[1].offsetHeight : userBar.offsetHeight;
        top  = top  < 0 + stickyFactor ? 0 : top  + height + stickyFactor > window.innerHeight         ? window.innerHeight         - height : top;
    }
    else userBar.classList.remove('userBarLeft');

    if(top === 0) userBar.classList.add('userBarTop');
    else userBar.classList.remove('userBarTop');


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

    // Replace la barre
    var offsets = bar.getBoundingClientRect();
    setUserBarSize(offsets.left, offsets.top + (bar.classList.contains('userBarBottom') ? window.innerHeight : 0));
}


/**
* @fn closeUserBarData Ferme la barre de données utilisateur
*/
function closeUserBarData()
{
    var userBarData = document.getElementById('userBarData');
    userBarData.classList.remove('pageLoaded');
}


/**
* @fn openPM Ouvre les messages privés
* @param close {boolean} Force la fermeture
*/
function triggerPM(close)
{
    // Récupère le bouton
    var userBar = document.getElementById('userBar'),
        button  = userBar.firstElementChild.children[2];

    // Ouvre ou ferme
    var isOpened = button.classList.contains('userBarButtonClicked');
    if(close || isOpened)
    {
        // Ouvert avec du contenu
        if(isOpened && userBar.lastElementChild.firstElementChild.tagName !== "P")
        {
            // Sauvegarde l'état
            page.userBarData.PM = userBar.lastElementChild.firstElementChild;
        }
        button.classList.remove('userBarButtonClicked');
        userBar.classList.remove('userBarDataOpened');
        closeUserBarData();
    }
    else
    {
        // Ferme les autres boutons
        triggerReport(true);
        triggerProfile(true);
        userBar.classList.add('userBarDataOpened');
        button.classList.add('userBarButtonClicked');

        var dataContainer = userBar.lastElementChild;
        dataContainer.classList.add('pageLoaded');

        // Ne recharge pas s'il n'y a pas besoin
        if(page.userBarData.PM && page.userBarData.PM.tagName !== 'IMG')
        {
            dataContainer.innerHTML = '';
            dataContainer.appendChild(page.userBarData.PM);
            updateUserBarSize(userBar);
        }
        else
        {
            // Affiche le logo de chargement
            resetToLoadingImage(dataContainer);

            // Récupère l'id utilisateur
            var user = userBarGetCurrentUser();

            ajax('GET', '/msgcreate.php?to=' + user, '', post_triggerPM, user, null, null);
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
    var userBar = document.getElementById('userBar'),
        button  = userBar.firstElementChild.children[3];

    // Ouvre ou ferme
    var isOpened = button.classList.contains('userBarButtonClicked');
    if(close || isOpened)
    {
        if(isOpened)
        {
            // Sauvegarde l'état
            page.userBarData.Prof = userBar.lastElementChild.firstElementChild;
        }
        userBar.lastElementChild.classList.remove('isUserPage');
        button.classList.remove('userBarButtonClicked');
        userBar.classList.remove('userBarDataOpened');
        closeUserBarData();
    }
    else
    {
        // Ferme le reste
        triggerPM(true);
        triggerReport(true);
        userBar.classList.add('userBarDataOpened');
        button.classList.add('userBarButtonClicked');

        var dataContainer = userBar.lastElementChild;
        dataContainer.classList.add('pageLoaded');

        // Ne recharge pas s'il n'y a pas besoin
        if(page.userBarData.Prof && page.userBarData.Prof.tagName !== 'IMG')
        {
            dataContainer.innerHTML = '';
            dataContainer.classList.add('isUserPage');
            dataContainer.appendChild(page.userBarData.Prof);
            updateUserBarSize(userBar);
        }
        else
        {
            // Affiche le logo de chargement
            resetToLoadingImage(dataContainer);

            // Récupère l'id utilisateur
            var user = userBarGetCurrentUser();

            ajax('GET', '/user/' + user, '', post_triggerProfile, user, null, null);
        }
    }
}


/**
* @fn openReport Ouvre la page de signalement
* @param close {boolean} Force la fermeture
*/
function triggerReport(close)
{
    // Récupère le bouton
    var userBar = document.getElementById('userBar'),
        button  = userBar.firstElementChild.lastElementChild;

    // Ouvre ou ferme
    var isOpened = button.classList.contains('userBarButtonClicked');
    if(close || isOpened)
    {
        // Ouvert avec du contenu
        if(isOpened && userBar.lastElementChild.firstElementChild.tagName !== "P")
        {
            // Sauvegarde l'état
            page.userBarData.Report = userBar.lastElementChild.firstElementChild;
        }
        button.classList.remove('userBarButtonClicked');
        userBar.classList.remove('userBarDataOpened');
        closeUserBarData();
    }
    else
    {
        triggerPM(true);
        triggerProfile(true);
        userBar.classList.add('userBarDataOpened');
        button.classList.add('userBarButtonClicked');

        var dataContainer = userBar.lastElementChild;
        dataContainer.classList.add('pageLoaded');

        // Ne recharge pas s'il n'y a pas besoin
        if(page.userBarData.Report && page.userBarData.Report.tagName !== 'IMG')
        {
            dataContainer.innerHTML = '';
            dataContainer.appendChild(page.userBarData.Report);
            updateUserBarSize(userBar);
        }
        else
        {
            // Affiche le logo de chargement
            resetToLoadingImage(dataContainer);

            ajax('GET', '/badsub.php' + location.search, '', post_triggerReport, userBarGetCurrentUser(), null, null);
        }
    }
}


/**
* @fn post_triggerPM Traite l'AJAX du message privé
* @param {Integer} userId Id utilisateur
* @param {String} HTMLString Réponse de la requête AJAX
* @param {Boolean} isError Status de réussite de la requête AJAX
*/
function post_triggerPM(userId, HTMLString, isError)
{
    // L'utilisateur n'est plus le bon
    if(!userBarIsCurrentUser(userId))
    {
        return;
    }

    // Si on a changé d'onglet
    var isBackgroundTask = !document.getElementById('userBar').firstElementChild.children[2].classList.contains('userBarButtonClicked');
        dataContainer    = document.getElementById('userBarData');

    // Affichage de l'erreur
    if(isError)
    {
        if(!isBackgroundTask)
        {
            dataContainer.innerText = loc.ajaxErrorOccurred;
        }
        return;
    }

    // Crée le DOM virtuel
    var PMHTML = document.createElement('html');
    PMHTML.innerHTML = HTMLString;

    // Récupère le formulaire
    var form = PMHTML.getElementsByTagName('form')[0];

    // Place le sujet
    var inputs =  form.getElementsByTagName('input');
    inputs[0].setAttribute('onkeyup', '');
    inputs[1].value = '[' + document.getElementsByTagName('i')[0].innerText + ']';

    // Pas de lien en haut de page
    form.firstElementChild.firstElementChild.firstElementChild.remove();

    // Réécrit la fonction d'envoi
    form.setAttribute('action', '#');
    form.setAttribute('onsubmit', 'return userBarSendPM(this)');

    // Sauvegarde ou affiche
    if(isBackgroundTask)
    {
        // Sauvegarde
        page.userBarData.PM = form;
    }
    else
    {
        // L'affiche
        dataContainer.innerHTML = '';
        dataContainer.appendChild(form);
        updateUserBarSize(document.getElementById('userBar'));
    }
}


/**
* @fn post_triggerReport Traite l'AJAX du signalement
* @param {Integer} userId Id utilisateur
* @param {String} HTMLString Réponse de la requête AJAX
* @param {Boolean} isError Status de réussite de la requête AJAX
*/
function post_triggerReport(userId, HTMLString, isError)
{
    // L'utilisateur n'est plus le bon
    if(!userBarIsCurrentUser(userId))
    {
        return;
    }

    // Si on a changé d'onglet
    var isBackgroundTask = !document.getElementById('userBar').firstElementChild.children[4].classList.contains('userBarButtonClicked');
        dataContainer    = document.getElementById('userBarData');

    // Affichage de l'erreur
    if(isError)
    {
        if(!isBackgroundTask)
        {
            dataContainer.innerText = loc.ajaxErrorOccurred;
        }
        return;
    }

    // Crée le DOM virtuel
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

    // Sauvegarde ou affiche
    if(isBackgroundTask)
    {
        // Sauvegarde
        page.userBarData.Report = form;
    }
    else
    {
        // L'affiche
        dataContainer.innerHTML = '';
        dataContainer.appendChild(form);
        updateUserBarSize(document.getElementById('userBar'));
    }
}


/**
* @fn post_triggerProfile Traite l'AJAX du profile
* @param {Integer} userId Id utilisateur
* @param {String} HTMLString Réponse de la requête AJAX
* @param {Boolean} isError Status de réussite de la requête AJAX
*/
function post_triggerProfile(userId, HTMLString, isError)
{
    // L'utilisateur n'est plus le bon
    if(!userBarIsCurrentUser(userId))
    {
        return;
    }

    // Si on a changé d'onglet
    var isBackgroundTask = !document.getElementById('userBar').firstElementChild.children[3].classList.contains('userBarButtonClicked');
        dataContainer    = document.getElementById('userBarData');

    // Affichage de l'erreur
    if(isError)
    {
        if(!isBackgroundTask)
        {
            dataContainer.innerText = loc.ajaxErrorOccurred;
        }
        return;
    }

    // Crée le DOM virtuel
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

    // Sauvegarde ou affiche
    if(isBackgroundTask)
    {
        // Sauvegarde
        page.userBarData.Prof = dataTable;
    }
    else
    {
        // L'affiche
        dataContainer.innerHTML = '';
        dataContainer.appendChild(dataTable);
        dataContainer.classList.add('isUserPage');
        updateUserBarSize(document.getElementById('userBar'));
    }
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
    if(!form || form.onsubmit.toString().search('userBarSendPM') === -1 || !form.classList.contains('messageSent'))
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
* @fn userBarSendReport Envoi un signalement
* @param {Object} form Noeud HTML du formulaire de signalement
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
    if(!form || form.onsubmit.toString().search('userBarSendReport') === -1 || !form.classList.contains('messageSent'))
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
* @fn userBarIsCurrentUser Indique si l'utilisateur est actuellement séléctionné
* @param {Integer} userId ID de l'utilisateur
*/
function userBarIsCurrentUser(userId)
{
    // Récupère l'id utilisateur actuel
    var id = document.getElementById('selectUser'),
        value = id.options[id.selectedIndex].value;

    return value === userId;
}


/**
* @fn userBarGetCurrentUser Récupère l'ID de l'utilisateur actuellement séléctionné
*/
function userBarGetCurrentUser()
{
    var id = document.getElementById('selectUser');
    return id.options[id.selectedIndex].value;
}


/**
* @fn userBarDragStart Récupère et enregistre la position initiale
* @param {object} event Objet evenement
*/
function userBarDragStart(event)
{
    page.draggedNode = event.target;

    // Désactive le glisser-déposer si l'origine n'est pas le haut de la barre
    var userBarData = document.getElementById("userBarData"),
            userBar = document.getElementById("userBar");
    if (!userBar.contains(page.draggedNode) || userBarData.contains(page.draggedNode)) return false;

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
    // Désactive le glisser-déposer si l'origine n'est pas le haut de la barre
    var userBarData = document.getElementById("userBarData"),
            userBar = document.getElementById("userBar");
    if (!userBar.contains(page.draggedNode) || userBarData.contains(page.draggedNode)) return false;

    // Récupère les positions
    var offset  = event.dataTransfer.getData('text/plain').split(',');

    setUserBarSize(
        event.clientX + parseInt(offset[0], 10),
        event.clientY + parseInt(offset[1], 10)
    );

    event.preventDefault();
    return false;
}


/**
* @fn userBarDragDrop Déplace la barre utilisateur
* @param {object} event Objet evenement
*/
function userBarDragDrop(event)
{
    // Désactive le glisser-déposer si l'origine n'est pas le haut de la barre
    var userBarData = document.getElementById("userBarData"),
            userBar = document.getElementById("userBar");
    if (!userBar.contains(page.draggedNode) || userBarData.contains(page.draggedNode)) return false;
    page.draggedNode = null;

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


/**
* @fn userBarMousedown Désactive l'attribut draggable si clic dans la partie basse
* @param {object} event Objet evenement
*/
function userBarMousedown(event)
{
    var userBarData = document.getElementById("userBarData"),
            userBar = document.getElementById("userBar");
    if (userBarData.contains(event.target)) userBar.setAttribute('draggable', 'false');
    else userBar.setAttribute('draggable', 'true');
}
