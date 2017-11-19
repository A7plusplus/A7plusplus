/**
* @file options.js
* @brief Script de la page des réglages d'A7++
*/


// Si la page est déjà là
if (document.readyState === 'interactive' || document.readyState === 'complete')
{
    // Créé le contenu de la page
    populate();
    getData();
}
// Sinon, attend la fin du chargement de la page
else
{
    document.addEventListener('DOMContentLoaded', function()
    {
        // Créé le contenu de la page
        populate();
        getData();
    }, false);
}


/*
* @fn populate Rempli la page des réglages avec les différentes chaines traduites
*/
function populate()
{
    // Titre
    document.getElementById("title").innerText = chrome.i18n.getMessage('A7pp_optionPageTitle');

    // Langue
    document.getElementById("forcedLangCB").innerText = chrome.i18n.getMessage('A7pp_optionPageForcedLangCheckBoxLabel');
    document.getElementById("forcedLang").innerText   = chrome.i18n.getMessage('A7pp_optionPageForcedLangLabel');

    // Position du cadenas
    document.getElementById("lockPosition").innerText                = chrome.i18n.getMessage('A7pp_optionPageLockPositionLabel');
    document.getElementById("lockPositionData").options[0].innerText = chrome.i18n.getMessage('A7pp_optionPageLockPositionOpt1Label');
    document.getElementById("lockPositionData").options[1].innerText = chrome.i18n.getMessage('A7pp_optionPageLockPositionOpt2Label');

    // Temps entre les mises à jour
    document.getElementById("stateUpdate").innerText   = chrome.i18n.getMessage('A7pp_optionPagestateUpdateLabel');
    document.getElementById("commentUpdate").innerText = chrome.i18n.getMessage('A7pp_optionPageCommentUpdateLabel');

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
            'updates'
        ],
        function(item)
        {
            // Objet present
            if(typeof item.lang !== 'undefined')
            {
                // Langue
                document.getElementById("forcedLangCBData").checked = item.lang.forced;
                document.getElementById("forcedLangData").value     = item.lang.data;

                // Cadenas
                document.getElementById("lockPositionData").options[item.lock === "top" ? 1 : 0].selected = 'selected';

                // Durées
                document.getElementById("stateUpdateData").value = item.updates.state;
                document.getElementById("commentUpdateData").value = item.updates.comment;
            }
            else
            {
                // Langue
                document.getElementById("forcedLangCBData").checked = false;
                document.getElementById("forcedLangData").value     = '';

                // Cadenas
                document.getElementById("lockPositionData").options[0].selected = 'selected';

                // Durées
                document.getElementById("stateUpdateData").value = 120;
                document.getElementById("commentUpdateData").value = 30;
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

    chrome.storage.local.set(
        {
            'lang': {
                forced: document.getElementById("forcedLangCBData").checked,
                data:   document.getElementById("forcedLangData").value
            },
            'lock':     document.getElementById("lockPositionData").value,
            'updates': {
                'state':    (stateUpdate < 10 ? 10 : stateUpdate),
                'comment':  (commentUpdate < 5 ? 5 : commentUpdate)
            }
        },
        function()
        {
            document.getElementById("messages").innerText = chrome.i18n.getMessage('A7pp_optionPageSavedMessage');
        }
    );

    // Actualise les données
    getData();
}
