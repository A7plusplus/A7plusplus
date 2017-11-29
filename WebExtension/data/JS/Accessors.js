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
