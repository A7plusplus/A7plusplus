/**
* @file options.js
* @brief Script de la page des réglages d'A7++
*/


// Si la page est déjà là
if (document.readyState === 'interactive' || document.readyState === 'complete')
{
    // Crée le contenu de la page
    populate();
    getData();
}
// Sinon, attend la fin du chargement de la page
else
{
    document.addEventListener('DOMContentLoaded', function()
    {
        // Crée le contenu de la page
        populate();
        getData();
    }, false);
}


/*
* @fn populate Remplit la page des réglages avec les différentes chaînes traduites
*/
function populate()
{
    // Titre
    document.getElementById("title").innerText = chrome.i18n.getMessage('A7pp_optionPageTitle');

    // Langue
    document.getElementById("forcedLangCB").innerText  = chrome.i18n.getMessage('A7pp_optionPageForcedLangCheckBoxLabel');
    document.getElementById("availableLang").innerText = chrome.i18n.getMessage('A7pp_optionPageSelectedLangLabel');
    var select = document.getElementById("availableLangData");
    for (var property in loc)
    {
        if (loc.hasOwnProperty(property))
        {
            var option = document.createElement('option');
            option.innerText = property;
            option.value = property;
            select.appendChild(option);
        }
    }

    // Position du cadenas
    document.getElementById("lockPosition").innerText                = chrome.i18n.getMessage('A7pp_optionPageLockPositionLabel');
    document.getElementById("lockPositionData").options[0].innerText = chrome.i18n.getMessage('A7pp_optionPageLockPositionOpt1Label');
    document.getElementById("lockPositionData").options[1].innerText = chrome.i18n.getMessage('A7pp_optionPageLockPositionOpt2Label');

    // Temps entre les mises à jour
    document.getElementById("stateUpdate").innerText   = chrome.i18n.getMessage('A7pp_optionPagestateUpdateLabel',   A7Settings.stateUpdateInterval.toString());
    document.getElementById("commentUpdate").innerText = chrome.i18n.getMessage('A7pp_optionPageCommentUpdateLabel', A7Settings.commentUpdateInterval.toString());
    document.getElementById("popupTimeout").innerText  = chrome.i18n.getMessage('A7pp_optionPagePopupTimeoutLabel',  A7Settings.popupTimeout.toString());

    // UserBar
    document.getElementById("userBarCB").innerText = chrome.i18n.getMessage('A7pp_optionPageDisableUserBarLabel');

    // Sauvegarde
    document.getElementById("save").innerText = chrome.i18n.getMessage('A7pp_optionPageSaveLabel');
}

/*
* @fn getData Récupère les données et les affiche
*/
function getData()
{
    chrome.storage.local.get(
        [
            'lang',
            'lock',
            'updates',
            'userBar'
        ],
        function(item)
        {
            // Objet présent
            if (typeof item.lang !== 'undefined')
            {
                // Langue
                document.getElementById("forcedLangCBData").checked = item.lang.forced;
                var availableLang = document.getElementById("availableLangData");
                availableLang.value  = item.lang.data;
                if (availableLang.value === '') availableLang.value = 'en';

                // Cadenas
                document.getElementById("lockPositionData").options[item.lock === "top" ? 1 : 0].selected = 'selected';

                // Durées
                document.getElementById("stateUpdateData").value   = item.updates.state;
                document.getElementById("commentUpdateData").value = item.updates.comment;
                document.getElementById("popupTimeoutData").value  = item.updates.popup || A7Settings.popupTimeout;

                // UserBar
                document.getElementById("userBarCBData").checked = item.userBar.disable;
            }
            else
            {
                // Langue
                document.getElementById("forcedLangCBData").checked = false;
                document.getElementById("availableLangData").value  = 'en';

                // Cadenas
                document.getElementById("lockPositionData").options[0].selected = 'selected';

                // Durées
                document.getElementById("stateUpdateData").value   = A7Settings.stateUpdateInterval;
                document.getElementById("commentUpdateData").value = A7Settings.commentUpdateInterval;
                document.getElementById("popupTimeoutData").value  = A7Settings.popupTimeout;

                // UserBar
                document.getElementById("userBarCBData").checked = A7Settings.disableUserBar;
            }
        }
    );

    // Prépare la sauvegarde
    document.querySelector("form").addEventListener("submit", setData);
}

/*
* @fn setData Enregistre les données
*/
function setData(event)
{
    // Empêche le rechargement
    event.preventDefault();

    // Pour les futures vérifications
    var stateUpdate   = document.getElementById("stateUpdateData").value,
        commentUpdate = document.getElementById("commentUpdateData").value;
        popupTimeout  = document.getElementById("popupTimeoutData").value;

    chrome.storage.local.set(
        {
            'lang': {
                forced: document.getElementById("forcedLangCBData").checked,
                data:   document.getElementById("availableLangData").value
            },
            'lock':     document.getElementById("lockPositionData").value,
            'updates': {
                'state':    (stateUpdate < 60 ? 60 : stateUpdate),
                'comment':  (commentUpdate < 20 ? 20 : commentUpdate),
                'popup':    (popupTimeout < 1 ? 1 : popupTimeout)
            },
            'userBar': {
                'disable': document.getElementById("userBarCBData").checked
            }
        },
        function()
        {
            document.getElementById("messages").innerText = chrome.i18n.getMessage('A7pp_optionPageSavedMessage');

            setTimeout(function()
            {
                document.getElementById("messages").innerText = '';
            }, 3000);
        }
    );

    // Actualise les données
    getData();
}
