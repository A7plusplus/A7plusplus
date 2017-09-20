/**
* @file Accessors.js
* @brief Script des fonctions d'accès
*/


/**
* @fn getTextCell Retourne la cellule de texte de la séquence
* @param {number} seqNumber Numéro de la séquence
* @return {!Object} Cellule de texte de la séquence
*/
function getTextCell(seqNumber)
{
    return document.getElementById('text' + seqNumber);
}


/**
* @fn getTimeCell Retourne la cellule de temps de la séquence
* @param {number} seqNumber Numéro de la séquence
* @return {!Object} Cellule de temps de la séquence
*/
function getTimeCell(seqNumber)
{
    return document.getElementById('time' + seqNumber);
}


/**
* @fn Vérifie l'état de la cellule temps
* @param {!Object} timeCell cellule du temps
* @return {string} État de la cellule
*/
function getStateOfTimeCell(timeCell)
{
    // On détermine l'état de la cellule du temps
    if (timeCell.childElementCount === 0)
        return 'initial';

    else if (timeCell.firstElementChild.tagName === 'DIV')
        return 'opened';

    else
        return 'clicked';
}


/**
* @fn Vérifie l'état de la cellule texte
* @param {!Object} textCell cellule du texte
* @return {string} État de la cellule
*/
function getStateOfTextCell(textCell)
{
    // On determine l'état du texte
    if (!textCell.firstElementChild || textCell.firstElementChild.tagName !== 'SPAN')
        return 'initial';

    else
        return 'clicked';
}
