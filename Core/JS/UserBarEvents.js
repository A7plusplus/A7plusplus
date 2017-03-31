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
    document.getElementById('userBar').firstElementChild.firstElementChild.appendChild(clone);

    // Ajoute l'event
    clone.addEventListener('change', function()
    {
        // Ferme les fenêtres
        triggerPM(true);
        triggerReport(true);
        triggerProfile(true);
    });
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
* @fn openPM Ouvre les messages privés
* @param close {boolean} Force la fermeture
*/
function triggerPM(close)
{
    // Récupère le bouton
    var button = document.getElementById('userBar').firstElementChild;

    // Ouvre ou ferme
    if(close || button.classList.contains('userBarButtonClicked'))
    {
        button.classList.remove('userBarButtonClicked');
        document.getElementById('userBarData').classList.remove('pageLoaded');
    }
    else
    {console.log('pm open')
        triggerReport(true);
        triggerProfile(true);
        button.classList.add('userBarButtonClicked');
    }
}


/**
* @fn openReport Ouvre la page de report
* @param close {boolean} Force la fermeture
*/
function triggerReport(close)
{
    // Récupère le bouton
    var button = document.getElementById('userBar').children[1];

    // Ouvre ou ferme
    if(close || button.classList.contains('userBarButtonClicked'))
    {
        button.classList.remove('userBarButtonClicked');
        document.getElementById('userBarData').classList.remove('pageLoaded');
    }
    else
    {console.log('report open')
        triggerPM(true);
        triggerProfile(true);
        button.classList.add('userBarButtonClicked');
    }
}


/**
* @fn openProfile Ouvre la page de l'utilisateur
* @param close {boolean} Force la fermeture
*/
function triggerProfile(close)
{
    // Récupère le bouton
    var button = document.getElementById('userBar').lastElementChild;

    // Ouvre ou ferme
    if(close || button.classList.contains('userBarButtonClicked'))
    {
        button.classList.remove('userBarButtonClicked');
        document.getElementById('userBarData').classList.remove('pageLoaded');
    }
    else
    {
        triggerPM(true);
        triggerReport(true);
        button.classList.add('userBarButtonClicked');

        var id = document.getElementById('selectUser'),
            value = id.options[id.selectedIndex].value;

        ajax('GET', '/user/' + value, '', post_triggerProfile, null, null, null);
    }
}


/**
* @fn post_triggerProfile Traite l'AJAX du profile
*/
function post_triggerProfile(HTMLString, isError)
{
    // Créé le DOM virtuel
    var profHTML = document.createElement('html');
    profHTML.innerHTML = HTMLString;

    // Récupé le tableau des données
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
    dataContainer.classList.add('pageLoaded');
    dataContainer.appendChild(dataTable);
}
