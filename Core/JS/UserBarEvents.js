/**
* @file UserBarEvents.js
* @brief Script des fonctions liées à la bar utilisateur
*/


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
    {console.log('pm close')
        button.classList.remove('userBarButtonClicked');
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
    {console.log('report close')
        button.classList.remove('userBarButtonClicked');
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
    {console.log('profil close')
        button.classList.remove('userBarButtonClicked');
    }
    else
    {console.log('profil open')
        triggerPM(true);
        triggerReport(true);
        button.classList.add('userBarButtonClicked');
    }
}
