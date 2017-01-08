/**
* @file UserEvents.js
* @brief Script des évenements liés aux fonctions utilisateur
*/


/**
* @fn userModal Affiche une popup avec les différents choix d'action utilisateur
* @param {number} id Id de l'utilisateur
* @param {string} userName Nom de l'utilisateur
*/
function userModal(id, userName)
{
    // Créer la popup
    var popup = createUserOptionsModal(id, userName);

    Modal.open({
        content: popup.outerHTML,
        draggable: true
    });
}


/**
* @fn userModalOption Remplace la popup de choix par l'option choisie
* @param {string} link Lien de la page à charger
* @param {string} userName Nom de l'utilisateur
*/
function userModalOption(link, userName)
{
    // Créer la popup
    var popup = createIFrameModal(link);

    Modal.open({
        content: popup.outerHTML,
        draggable: true,
        width: '90vw',
        height: '90vh'
    });
}
