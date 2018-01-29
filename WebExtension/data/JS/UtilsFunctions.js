/**
* @file UtilsFunctions.js
* @brief Script des fonctions utilitaires
*/


/**
* @fn getDurationFromTime Retourne une durée en fonction des codes temporels passés
* @param {Array.<string>} tempCodes Tableau de deux codes temporels sous forme HH:MM:SS,mmm
*/
function getDurationFromTime(tempCodes)
{
    // Sépare les différentes parties
    var start = tempCodes[0].replace(/,/, ':').split(':'),
        end   = tempCodes[1].replace(/,/, ':').split(':');

    // Convertit en entiers
    for (var i = start.length; i--;)
    {
        start[i] = parseInt(start[i], 10);
        end[i]   = parseInt(end[i]  , 10);
    }

    // Calcule et renvoie la durée
    return (end[0] - start[0]) * 3600 + (end[1] - start[1]) * 60 + (end[2] - start[2]) + ((end[3] - start[3]) / 1000);
}


/**
* @fn charCount Compte le nombre de caractères dans chaque ligne d'array
* @param {Array.<string>} array Tableau de string
* @param {boolean} countTag Vrai s'il faut compter les balises
* @return {Array.<number>} Un tableau de longeur de chaîne de même taille qu'array
*/
function charCount(array, countTag)
{
    var lengths = [];

    // Récurération de la taille
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        if(countTag)
        {
            // On compte tout
            lengths.push(array[i].length);
        }
        else
        {
            // On ne compte ni les balises HTML, ni les tags de position
            lengths.push(array[i].replace(/(<[^>]*>|\{[^\}]*\})/g, '').length);
        }
    }

    return lengths;
}


/**
* @fn removeTrailingSpaces Enlève les espaces au début et à la fin de chaque ligne
* @param {Array.<string>} array Tableau de lignes
* @return {Array.<string>} Un tableau sans espaces inutiles
*/
function removeTrailingSpaces(array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        array[i] = array[i].trim();
    }

    // Bonus : enlève la dernière ligne si elle est vide
    if (array[length - 1] === '')
    {
        array.splice(length - 1, 1);
    }

    return array;
}


/**
* @fn addStringBetween Ajoute une chaîne entre les deux bornes
* @param {string} string Chaîne de base
* @param {string} toBeInserted Chaîne à ajouter
* @param {number} index Position de l'insertion
* @return {string} Chaîne finale avec insertion
*/
function addStringBetween(string, toBeInserted, index)
{
    return string.substring(0, index) + toBeInserted + string.substr(index);
}


/**
* @fn getRSRatingIndex Renvoie l'indice du tableau RS qui correspond aux arguments représentant la séquence
* @param {Array.<number>} counts Taille de la séquence (entier)
* @param {number} duration Durée de la séquence
* @return {number} Indice du tableau RSR
*/
function getRSRatingIndex(counts, duration)
{
    // On évite la division par 0
    if (duration === 0.5)
        return 0;

    var ms = duration * 1000;
    var totalChars = -2, rsr;

    // Calcul de la taille totale + pénalités
    for (var i = counts.length; i--;)
    {
        totalChars += counts[i] + 2;
    }

    // Séquence vide
    if (totalChars === 0)
        return -1;

    rsr = totalChars * 1000 / (ms - 500);

    for (i = 0; i < 10; i++)
        if (rsr > A7Settings.RSR[i-1][0] && rsr <= A7Settings.RSR[i][0])
            return i;

    return 0;
}


/**
* @fn resetToLoadingImage Réinitialise l'objet HTML en une image de chargement
* @param {Object} object Objet HTML à réinitialiser
*/
function resetToLoadingImage(object)
{
    // Supprime le contenu
    resetHTMLObject(object);

    // Crée et ajoute l'image
    var img = document.createElement('img');
    img.src = '/images/loader.gif';
    object.appendChild(img);
}


/**
* @fn resetHTMLObject Réinitialise l'objet HTML
* @param {Object} object Objet HTML à réinitialiser
*/
function resetHTMLObject(object)
{
    object.innerHTML = '';
}


/**
* @fn getTextFromHTML Retourne le texte (avec les balises) d'un bloc HTML
* @param {String} HTMLString Chaîne HTML à traiter
*/
function getTextFromHTML(HTMLString)
{
    HTMLString = HTMLString.replace(/<(\/?[ubi])>/g, "&lt;$1&gt;"); // match : <u><b><i>
    HTMLString = HTMLString.replace(/<font color="(#[0-9a-fA-F]{6})">/g, "&lt;font color=\"$1\"&gt;"); // match : <font color="#XXXXXX">
    HTMLString = HTMLString.replace(/<\/font>/g, "&lt;/font&gt;"); // match : </font>
    HTMLString = HTMLString.replace(/<br>/g, "\n"); // Saut de ligne

    // On dé-échappe la chaîne
    var element = document.createElement('div');
    element.innerHTML = HTMLString;
    return element.innerText;
}


/**
* @fn moveFocusToNextLine Donne le focus à la cellule de texte éditable ou à la textarea de la ligne suivante (si existante)
* @param {number} seqNumber Numéro de la séquence
*/
function moveFocusToNextLine(seqNumber)
{
    // Récupération des éléments utiles
    var textCell = getTextCell(seqNumber);
    var nextLine = textCell.parentElement.nextSibling;
    var textCellNextLine, textAreaNextLine;

    if(nextLine)
    {
        var nextLineSeqNumber = nextLine.children[page.lock].firstElementChild.firstElementChild.innerHTML;
        textCellNextLine = getTextCell(nextLineSeqNumber);
    }

    // S'il y a une ligne suivante éditable avec cellule de texte ouverte, focus sur la textarea
    if(nextLine && textCellNextLine && textCellNextLine.classList.contains('textClicked'))
    {
        textAreaNextLine = textCellNextLine.firstElementChild.firstElementChild;

        textAreaNextLine.focus();
    }
    // S'il y a une ligne suivante éditable avec cellule de texte non ouverte, focus sur la cellule texte
    else if(nextLine && textCellNextLine)
    {
        textCellNextLine.focus();
    }
    // S'il n'y a pas de ligne suivante éditable , focus sur la cellule de texte de la ligne actuelle (nécessaire sur Firefox)
    else
    {
        textCell.focus();
    }
}


/**
* @fn openHelpPage Ouvre la page d'aide du forum
* @param evt Evenement de l'eventListener qui appelle la fonction
*/
function openHelpPage(evt)
{
    // Empêche le clic de changer de page (accueil)
    evt.preventDefault();

    // Ouvre le post du forum
    window.open(loc.helpURL, '_blank');
}


/**
* @fn ajax Effectue une requête AJAX
* @param {Object} params Paramètres globaux de la requête
*
* ====== Dans l'objet params peuvent se trouver : ======
* @param {string}  action POST / GET / UPDATE etc.
* @param {string}  url Adresse
*
* @param {function(<number> seqNumber, <Object> responseOrBackup, <boolean> sucess)} readyFunction Fonction à appeler en cas de réussite
* @warning Le premier paramètre n'est pas envoyé si seqNumber n'est pas présent
*
* @param {string=} responseType Type de réponse demandée (optionnel)
* @param {string=} params Paramètres spécifiques de la requête (optionnel)
*
* @param {number=} seqNumber Numéro de la séquence (optionnel)
* @param {Object=} backupInfos Informations à envoyer en cas d'erreur (optionnel)
*/
function ajax(params)
{
    // Traitement de l'objet paramètre (et de ses champs optionnels)
    if(typeof params.params === 'undefined') params.params = '';
    if(typeof params.seqNumber === 'undefined') params.seqNumber = null;
    if(typeof params.backupInfos === 'undefined') params.backupInfos = null;

    // Crée la requête
    var xhr = new XMLHttpRequest();

    // L'initialise
    if(typeof params.responseType !== 'undefined')
    {
        xhr.responseType = params.responseType;
    }
    xhr.open(params.action, params.url, true);
    xhr.timeout = A7Settings.updateTimeout * 1000;
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4)
        {
            if (xhr.status === 200)
            {
                if(params.seqNumber === null)
                {
                    params.readyFunction(xhr.response, false);
                }
                else
                {
                    params.readyFunction(params.seqNumber, xhr.response, false);
                }
            }
            else
            {
                if(params.seqNumber === null)
                {
                    params.readyFunction(params.backupInfos, true);
                }
                else
                {
                    params.readyFunction(params.seqNumber, params.backupInfos, true);
                }
            }
        }
    };

    // Envoie
    xhr.send(params.params);
}
