/**
* @file Accessors.js
* @brief Script des fonctions d'accès
*/


/**
* @fn getTextCell Retourne la cellule du texte de la séquence
* @param {number} seqNumber Numéro de la séquence
* @return {!Object} Cellule du texte de la séquence
*/
function getTextCell(seqNumber)
{
    return document.getElementById('text' + seqNumber);
}


/**
* @fn getTimeCell Retourne la cellule des timings de la séquence
* @param {number} seqNumber Numéro de la séquence
* @return {!Object} Cellule des timings de la séquence
*/
function getTimeCell(seqNumber)
{
    return document.getElementById('time' + seqNumber);
}


/**
* @fn getStateOfTimeCell Vérifie l'état de la cellule des timings
* @param {!Object} timeCell Cellule des timings
* @return {string} État de la cellule
*/
function getStateOfTimeCell(timeCell)
{
    // On détermine l'état de la cellule des timings
    if (timeCell.childElementCount === 0)
        return 'initial';

    else if (timeCell.firstElementChild.tagName === 'DIV')
        return 'opened';

    else
        return 'clicked';
}


/**
* @fn getStateOfTextCell Vérifie l'état de la cellule du texte
* @param {!Object} textCell Cellule du texte
* @return {string} État de la cellule
*/
function getStateOfTextCell(textCell)
{
    // On determine l'état de la cellule du texte
    if (!textCell.firstElementChild || textCell.firstElementChild.tagName !== 'SPAN')
        return 'initial';

    else
        return 'clicked';
}


/**
* @fn getTimeFromTimeCell Récupère le timestamp du début (ou fin, si end est true) de séquence
* @param {!Object} timeCell Cellule des timings
* @param {!Boolean} end Si on doit récupérer la fin de séquence
* @return {int} timestamp
*/
function getTimeFromTimeCell(timeCell, end)
{
    var time = 0,
        index = typeof end === 'undefined' || end === false ? 0 : 1;

    // On détermine l'état de la cellule des timings
    if (timeCell.childElementCount === 0 || timeCell.firstElementChild.tagName === 'DIV')
            time = timeCell.textContent.split(" --> ")[index].substr(0, 12);

    else
        time = timeCell.firstElementChild.children[1 + index * 5].value;

    // Calcul du timestamp
    var tmp  = time.split(':'),
        tmp2 = tmp[2].split(',');

    return parseInt(tmp2[0], 10) +
           parseInt(tmp[1], 10)  * 60 +
           parseInt(tmp[0], 10)  * 3600 +
           parseInt(tmp2[1], 10) * 0.001;
}


/**
* @fn getUserBar Retourne la cellule de la barre utilisateur
* @return {!Object} Cellule de la barre utilisateur
*/
function getUserBar()
{
    return document.getElementById('userBar');
}


/**
* @fn getUserBarUsers Retourne la cellule contenant la liste des utilisateurs de la barre utilisateur
* @return {!Object} Cellule contenant la liste des utilisateurs de la barre utilisateur
*/
function getUserBarUsers()
{
    return document.getElementById('selectUser');
}


/**
* @fn getUserBarData Retourne la cellule de donnée de la barre utilisateur
* @return {!Object} Cellule de donnée de la barre utilisateur
*/
function getUserBarData()
{
    return getUserBar().lastElementChild;
}


/**
* @fn getCommentCell Retourne la cellule des commentaires
* @return {!Object} Cellule de la cellule des commentaires
*/
function getCommentCell()
{
    return document.getElementById('commentsSection');
}

/**
* @fn getVideoBar Retourne la cellule de la barre vidéo
* @return {!Object} Cellule de la barre vidéo
*/
function getVideoBar()
{
    return document.getElementById('videoBar');
}
