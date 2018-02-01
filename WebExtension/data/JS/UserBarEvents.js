/**
* @file UserBarEvents.js
* @brief Script des fonctions liées à la barre utilisateur
*/


/**
* @fn loadUserBarUsersFromTranslate Charge la liste des utilisateurs
*     dans la userBar depuis le mode Join translation
* @param {Boolean} isError Si la requête a échoué
* @param {String} data Données retournées par AJAX
*/
function loadUserBarUsersFromTranslate(isError, data)
{
    // Envoie la requête AJAX si ce n'est pas déjà fait
    if (typeof data === 'undefined' && typeof isError === 'undefined')
    {
        // Vérification du timeout
        var notAfter = new Date();
        notAfter.setSeconds(notAfter.getSeconds() - A7Settings.userBarUpdateIntervalMin);

        // Si le timeout minimum est respecté
        if (page.lastUserBarUpdate < notAfter)
        {
            page.lastUserBarUpdate = new Date();

            // Récupère les informations relatives aux sous-titres
            var subInfo = page.queryInfos;

            // Construit et lance la requête
            var url = '/ajax_list.php?id=' + subInfo.id +
                      '&fversion=' + subInfo.fversion   +
                      '&lang='     + subInfo.lang       +
                      '&start=0&updated=false&slang=';

            // Envoie la requête
            ajax({
                action:               'GET',
                url:                  url,
                responseType:         'document',
                readyFunction:        loadUserBarUsersFromTranslate
            });
        }
    }
    else
    {
        if (isError)
        {
            setTimeout(function()
            {
                loadUserBarUsersFromTranslate();
            }, 200);

            return;
        }

        // Cède la main au loader du mode view & edit
        loadUserBarUsers(data.body.querySelector('select[name="user"]'));
    }
}


/**
* @fn loadUserBarUsers Charge la liste des utilisateurs dans la userBar
* @param {Object} forcedSelectNode Nœud HTML de la sélection des utilisateurs (optionnel -> pour le mode Join translation)
*/
function loadUserBarUsers(forcedSelectNode)
{
    var select = null;

    // Récupère les utilisateurs
    if (typeof forcedSelectNode === 'undefined')
        // Mode view & edit
        select = document.querySelector('select[name="user"]');
    else
        select = forcedSelectNode;


    // Les injecte dans la barre utilisateur
    var userBar   = getUserBar(),
        userSpan  = userBar.firstElementChild.children[1],
        oldSelect = userSpan.lastElementChild;


    // Si le sélecteur est déjà là, ne recrée pas mais ajoute la différence
    if (oldSelect && oldSelect.tagName === 'SELECT')
    {
        var alreadyHere = false;
        for (i = select.length - 1; i > 0; i--) // > 0 car options[0] === 0 (TOUT)
        {
            alreadyHere = false;
            for (j = oldSelect.length - 1; j >= 0; j--)
            {
                if (select.options[i].value === oldSelect.options[j].value)
                {
                    alreadyHere = true;
                    break;
                }
            }

            if (!alreadyHere)
            {
                oldSelect.appendChild(select.options[i]);
            }
        }
    }
    else
    {
        // Clone les utilisateurs
        var clone = select.cloneNode(true);
        clone.removeChild(clone.firstElementChild);
        clone.setAttribute('id', 'selectUser');

        // Ajoute le sélecteur à la userBar
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
        document.body.addEventListener('dragstart', function(event)
        {
            // Stocke une référence sur l'objet glissable
            page.draggedNode = event.target;
        }, false);
    }

    // Affiche la barre
    userBar.classList.remove('userBarNotReady');
}


/**
* @fn addUserToUserBar Ajoute un utilisateur à la barre
* @param {String} name Nom de l'utilisateur
* @param {Number} id ID de l'utilisateur
*/
function addUserToUserBar(name, id)
{
    var userSelect = getUserBar().firstElementChild.children[1].firstElementChild;

    // Attend, en mode traduction, que la liste des utilisateurs soit chargée
    if (userSelect === null)
    {
        setTimeout(function()
        {
            addUserToUserBar(name, id);
        }, 50);

        return;
    }

    // Vérifie la présence de l'utilisateur
    for (var i = 0; i < userSelect.length; i++)
        if (parseInt(userSelect.options[i].value, 10) === parseInt(id, 10))
            return;

    // Ajoute l'utilisateur car non présent
    var option = document.createElement('option');
    option.value = id;
    option.innerText = name;
    userSelect.appendChild(option);
}


/**
* @fn updateUserBarSize Met à jour la position de la barre utilisateur
* @param {Object} userBar Nœud HTML de la userBar
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
    var userBar  = getUserBar();

    // Calcule les proportions
    var stickyFactor  = window.innerHeight * A7Settings.stickyFactor,
        width  = userBar.offsetWidth  < userBar.children[1].offsetWidth  ? userBar.children[1].offsetWidth  : userBar.offsetWidth,
        height = userBar.offsetHeight < userBar.children[1].offsetHeight ? userBar.children[1].offsetHeight : userBar.offsetHeight;

    // Ne dépasse pas
    left = left < 0 + stickyFactor ? 0 : left + width  + stickyFactor > document.body.clientWidth  ? document.body.clientWidth  - width  : left;
    top  = top  < 0 + stickyFactor ? 0 : top  + height + stickyFactor > window.innerHeight         ? window.innerHeight         - height : top;


    // Ajoute les classes
    if (left === 0)
    {
        userBar.classList.add('userBarLeft');

        // Recalcule la hauteur
        height = userBar.offsetHeight < userBar.children[1].offsetHeight ? userBar.children[1].offsetHeight : userBar.offsetHeight;
        top  = top  < 0 + stickyFactor ? 0 : top  + height + stickyFactor > window.innerHeight ? window.innerHeight - height : top;
    }
    else userBar.classList.remove('userBarLeft');

    if (top === 0) userBar.classList.add('userBarTop');
    else userBar.classList.remove('userBarTop');


    // Applique la position
    userBar.style.left = left + 'px';
    userBar.style.top = top + 'px';

    // Enregistre
    if (localStorage)
    {
        localStorage.setItem('A7ppUserBarPosition', left + ',' + top);
    }
}


/**
* @fn triggerUserBar Ouvre la barre utilisateur
* @param bar {Object} Objet HTML de la barre
*/
function triggerUserBar(bar)
{
    // Ouvre ou ferme
    if (bar.classList.contains('userBarOpened'))
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
* @fn closeUserBarData Ferme la fenêtre de données de la barre utilisateur
*/
function closeUserBarData()
{
    var userBarData = getUserBarData();
    userBarData.classList.remove('pageLoaded');
}


/**
* @fn triggerPM Ouvre les messages privés
* @param close {boolean} Force la fermeture
*/
function triggerPM(close)
{
    // Récupère le bouton
    var userBar = getUserBar(),
        button  = userBar.firstElementChild.children[2];

    // Ouvre ou ferme
    var isOpened = button.classList.contains('userBarButtonClicked');
    if (close || isOpened)
    {
        // Ouvert avec du contenu
        if (isOpened &&
            userBar.lastElementChild.firstElementChild &&
            userBar.lastElementChild.firstElementChild.tagName !== "P")
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
        if (page.userBarData.PM && page.userBarData.PM.tagName !== 'IMG')
        {
            resetHTMLObject(dataContainer);
            dataContainer.appendChild(page.userBarData.PM);
            updateUserBarSize(userBar);
        }
        else
        {
            // Affiche le logo de chargement
            resetToLoadingImage(dataContainer);

            // Récupère l'ID utilisateur
            var user = userBarGetCurrentUser();

            ajax({
                action:               'GET',
                responseType:         'document',
                url:                  '/msgcreate.php?to=' + user,
                readyFunction:        post_triggerPM,
                forwardData:          user
            });
        }
    }
}


/**
* @fn triggerProfile Ouvre la page de l'utilisateur
* @param close {boolean} Force la fermeture
*/
function triggerProfile(close)
{
    // Récupère le bouton
    var userBar = getUserBar(),
        button  = userBar.firstElementChild.children[3];

    // Ouvre ou ferme
    var isOpened = button.classList.contains('userBarButtonClicked');
    if (close || isOpened)
    {
        if (isOpened)
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
        if (page.userBarData.Prof && page.userBarData.Prof.tagName !== 'IMG')
        {
            resetHTMLObject(dataContainer);
            dataContainer.classList.add('isUserPage');
            dataContainer.appendChild(page.userBarData.Prof);
            updateUserBarSize(userBar);
        }
        else
        {
            // Affiche le logo de chargement
            resetToLoadingImage(dataContainer);

            // Récupère l'ID utilisateur
            var user = userBarGetCurrentUser();

            ajax({
                action:               'GET',
                responseType:         'document',
                url:                  '/user/' + user,
                readyFunction:        post_triggerProfile,
                forwardData:          user
            });
        }
    }
}


/**
* @fn triggerReport Ouvre la page de signalement
* @param close {boolean} Force la fermeture
*/
function triggerReport(close)
{
    // Récupère le bouton
    var userBar = getUserBar(),
        button  = userBar.firstElementChild.lastElementChild;

    // Ouvre ou ferme
    var isOpened = button.classList.contains('userBarButtonClicked');
    if (close || isOpened)
    {
        // Ouvert avec du contenu
        if (isOpened &&
            userBar.lastElementChild.firstElementChild &&
            userBar.lastElementChild.firstElementChild.tagName !== "P")
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
        if (page.userBarData.Report && page.userBarData.Report.tagName !== 'IMG')
        {
            resetHTMLObject(dataContainer);
            dataContainer.appendChild(page.userBarData.Report);
            updateUserBarSize(userBar);
        }
        else
        {
            // Affiche le logo de chargement
            resetToLoadingImage(dataContainer);

            ajax({
                action:               'GET',
                responseType:         'document',
                url:                  '/badsub.php' + location.search,
                readyFunction:        post_triggerReport,
                forwardData:          userBarGetCurrentUser()
            });
        }
    }
}


/**
* @fn post_triggerPM Traite l'AJAX du message privé
* @param {Boolean} isError Statut de réussite de la requête AJAX
* @param {String}  htmlData Réponse de la requête AJAX
* @param {Integer} userId ID utilisateur
*/
function post_triggerPM(isError, htmlData, userId)
{
    // L'utilisateur n'est plus le bon
    if (!userBarIsCurrentUser(userId))
    {
        return;
    }

    // Si on a changé d'onglet
    var isBackgroundTask = !getUserBar().firstElementChild.children[2].classList.contains('userBarButtonClicked');
        dataContainer    =  getUserBarData();

    // Affichage de l'erreur
    if (isError)
    {
        if (!isBackgroundTask)
        {
            displayAjaxError(loc.ajaxErrorOnUserBar);
            dataContainer.innerText = loc.ajaxErrorOccurred;
        }
        return;
    }

    // Récupère le formulaire
    var form = htmlData.body.getElementsByTagName('form')[0];

    // Place le sujet
    var inputs =  form.getElementsByTagName('input');
    inputs[0].removeAttribute('onkeyup');
    if(page.translatePage)
        inputs[1].value = '[' + document.querySelector('.titulo').firstElementChild.text + ']';
    else
        inputs[1].value = '[' + document.getElementsByTagName('i')[0].innerText + ']';

    // Pas de lien en haut de page
    form.firstElementChild.firstElementChild.firstElementChild.remove();

    // Réécrit la fonction d'envoi
    form.setAttribute('action', '#');
    form.setAttribute('onsubmit', 'return userBarSendPM(this)');

    // Sauvegarde ou affiche
    if (isBackgroundTask)
    {
        // Sauvegarde
        page.userBarData.PM = form;
    }
    else
    {
        // L'affiche
        resetHTMLObject(dataContainer);
        dataContainer.appendChild(form);
        updateUserBarSize(getUserBar());
    }
}


/**
* @fn post_triggerReport Traite l'AJAX du signalement
* @param {Boolean} isError Statut de réussite de la requête AJAX
* @param {String}  htmlData Réponse de la requête AJAX
* @param {Integer} userId ID utilisateur
*/
function post_triggerReport(isError, htmlData, userId)
{
    // L'utilisateur n'est plus le bon
    if (!userBarIsCurrentUser(userId))
    {
        return;
    }

    // Si on a changé d'onglet
    var isBackgroundTask = !getUserBar().firstElementChild.children[4].classList.contains('userBarButtonClicked');
        dataContainer    =  getUserBarData();

    // Affichage de l'erreur
    if (isError)
    {
        if (!isBackgroundTask)
        {
            displayAjaxError(loc.ajaxErrorOnUserBar);
            dataContainer.innerText = loc.ajaxErrorOccurred;
        }
        return;
    }

    // Récupère le formulaire et le nettoie
    var form = htmlData.body.getElementsByTagName('form')[0];

    // Récupère l'ID de l'utilisateur incriminé
    var id = getUserBarUsers(),
        user = id.options[id.selectedIndex].innerText,
        textarea = form.getElementsByTagName('textarea')[0];
    textarea.value = '[A7++] Report user: ' + user + '\n';

    // Réécrit la fonction d'envoi
    form.setAttribute('action', '#');
    form.setAttribute('onsubmit', 'return userBarSendReport(this)');

    // Sauvegarde ou affiche
    if (isBackgroundTask)
    {
        // Sauvegarde
        page.userBarData.Report = form;
    }
    else
    {
        // L'affiche
        resetHTMLObject(dataContainer);
        dataContainer.appendChild(form);
        updateUserBarSize(getUserBar());
    }
}


/**
* @fn post_triggerProfile Traite l'AJAX du profil
* @param {Boolean} isError Statut de réussite de la requête AJAX
* @param {String}  htmlData Réponse de la requête AJAX
* @param {Integer} userId ID utilisateur
*/
function post_triggerProfile(isError, htmlData, userId)
{
    // L'utilisateur n'est plus le bon
    if (!userBarIsCurrentUser(userId))
    {
        return;
    }

    // Si on a changé d'onglet
    var isBackgroundTask = !getUserBar().firstElementChild.children[3].classList.contains('userBarButtonClicked');
        dataContainer    =  getUserBarData();

    // Affichage de l'erreur
    if (isError)
    {
        if (!isBackgroundTask)
        {
            displayAjaxError(loc.ajaxErrorOnUserBar);
            dataContainer.innerText = loc.ajaxErrorOccurred;
        }
        return;
    }

    // Récupère le tableau des données
    var tables = htmlData.body.getElementsByTagName('table'),
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
    if (isBackgroundTask)
    {
        // Sauvegarde
        page.userBarData.Prof = dataTable;
    }
    else
    {
        // L'affiche
        resetHTMLObject(dataContainer);
        dataContainer.appendChild(dataTable);
        dataContainer.classList.add('isUserPage');
        updateUserBarSize(getUserBar());
    }
}


/**
* @fn userBarSendPM Envoi un message privé
* @param {Object} form Nœud HTML du formulaire de mesage privé
*/
function userBarSendPM(form)
{
    // Déjà en cours d'envoi
    if (form.classList.contains('messageSent'))
    {
        return false;
    }

    // Récupère les données
    var inputs   = form.getElementsByTagName('input');
    var textarea = form.getElementsByTagName('textarea')[0];

    // Prépare les données
    var params = 'to='         + encodeURIComponent(inputs[0].value) +
                 '&subject='   + encodeURIComponent(inputs[1].value) +
                 '&msgtext='   + encodeURIComponent('<p>' + textarea.value + '</p>');

    // Indique que c'est en envoi
    var parent = form.classList.add('messageSent');

    // Effectue l'envoi des données
    ajax({
        action:               'POST',
        params:               params,
        url:                  '/msgsend.php',
        readyFunction:        post_userBarSendPM
    });

    return false;
}


/**
* @fn post_userBarSendPM Traite le retour de l'envoi du message
* @param {Boolean} isError Statut de réussite de la requête AJAX
* @param {String}  HTMLString Réponse de la requête AJAX
*/
function post_userBarSendPM(isError, HTMLstring)
{
    // On est toujours sur la page
    var form = getUserBarData().firstElementChild;
    if (!form || form.onsubmit.toString().search('userBarSendPM') === -1 || !form.classList.contains('messageSent'))
    {
        return;
    }

    if (isError)
    {
        displayAjaxError(loc.messageSendError);

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
    resetHTMLObject(parent);
    parent.appendChild(p);

    // Vide le cache
    page.userBarData.PM = null;
}


/**
* @fn userBarSendReport Envoie un signalement
* @param {Object} form Nœud HTML du formulaire de signalement
*/
function userBarSendReport(form)
{
    // Déjà en cours d'envoi
    if (form.classList.contains('messageSent'))
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
                 '&lang='     + subInfo.lang;

    // Traite les checkbox
    var inputs = form.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++)
    {
        if (inputs[i].type === 'checkbox')
        {
            if (inputs[i].checked)
            {
                params += '&' + inputs[i].name + '=true';
            }
        }
    }

    // Indique que c'est en envoi
    var parent = form.classList.add('messageSent');

    // Effectue l'envoi des données
    ajax({
        action:               'POST',
        params:               params,
        url:                  'badsub_do.php',
        readyFunction:        post_userBarSendReport
    });

    return false;
}


/**
* @fn post_userBarSendReport Traite le retour du l'envoi du signalement
* @param {Boolean} isError Statut de réussite de la requête AJAX
* @param {String}  HTMLString Réponse de la requête AJAX
*/
function post_userBarSendReport(isError, HTMLstring)
{
    // On est toujours sur la page
    var form = getUserBarData().firstElementChild;
    if (!form || form.onsubmit.toString().search('userBarSendReport') === -1 || !form.classList.contains('messageSent'))
    {
        return;
    }

    if (isError)
    {
        displayAjaxError(loc.messageSendError);

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
    resetHTMLObject(parent);
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
    // Récupère l'ID de l'utilisateur actuel
    var id = getUserBarUsers(),
        value = id.options[id.selectedIndex].value;

    return value === userId;
}


/**
* @fn userBarGetCurrentUser Récupère l'ID de l'utilisateur actuellement séléctionné
*/
function userBarGetCurrentUser()
{
    var id = getUserBarUsers();
    return id.options[id.selectedIndex].value;
}


/**
* @fn userBarDragStart Récupère et enregistre la position initiale
* @param {object} event Objet événement
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
* @param {object} event Objet événement
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
* @param {object} event Objet événement
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
* @param {object} event Objet événement
*/
function userBarMousedown(event)
{
    var userBarData = document.getElementById("userBarData"),
            userBar = document.getElementById("userBar");
    if (userBarData.contains(event.target)) userBar.setAttribute('draggable', 'false');
    else userBar.setAttribute('draggable', 'true');
}
