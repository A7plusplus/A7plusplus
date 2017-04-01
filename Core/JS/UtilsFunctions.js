/**
* @file Utils.js
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

    // Convertit en entier
    for (var i = start.length; i--;)
    {
        start[i] = parseInt(start[i], 10);
        end[i]   = parseInt(end[i]  , 10);
    }

    // Calcule et renvoie le temmps
    return (end[0] - start[0]) * 3600 + (end[1] - start[1]) * 60 + (end[2] - start[2]) + ((end[3] - start[3]) / 1000);
}


/**
* @fn charCount Compte le nombre de caractères dans chaque ligne d'array
* @param {Array.<string>} array Tableau de string
* @param {boolean} countTag Vrai s'il faut compter les balises
* @return {Array.<number>} Un tableau de longeur de chaine de même taille qu'array
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
            // On ne compte tout
            lengths.push(array[i].length);
        }
        else
        {
            // On ne compte ni les balises html, ni les tags de position
            lengths.push(array[i].replace(/(<[^>]*>|\{[^\}]*\})/g, '').length);
        }
    }

    return lengths;
}


/**
* @fn removeTrailingSpaces Enlève les espaces avant et après chaque ligne
* @param {Array.<string>} array Tableau de lignes
* @return {Array.<string>} Un tableau sans espace inutiles
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
* @fn addStringBetween Ajoute une chaine entre les deux bornes
* @param {string} string Chaine de base
* @param {string} toBeInserted Chaine à ajouter
* @param {number} index Position de l'insertion
* @return {string} Chaine finale avec insertion
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
* @param {Object} object Objet HTML a réinitialiser
*/
function resetToLoadingImage(object)
{
    // Supprime le contenu
    object.innerHTML = '';

    // Créé et ajoute l'image
    var img = document.createElement('img');
    img.src = '/images/loader.gif';
    object.appendChild(img);
}


/**
* @fn ajax Effectue une requête ajax
* @param {string} action POST / GET / UPDATE etc
* @param {string} url Adresse
* @param {string} params Paramètres de la requête
* @param {function(number, Object, boolean, [Object])} readyFunction Fonction à appeler en cas de succès
* @warning Le premier paramètre n'est pas envoyé si seqNumber est null
* @param {number} seqNumber Numéro de la séquence ou null
* @param {Object} backupInfos Informations à envoyer en cas d'erreur
* @param {Object=} secondaryBackupInfos Deuxième information à envoyer en cas d'erreur (optionnel)
*/
function ajax(action, url, params, readyFunction, seqNumber, backupInfos, secondaryBackupInfos)
{
    // Crée la requête
    var xhr = new XMLHttpRequest();

    // L'initialise
    xhr.open(action, url, true);
    xhr.timeout = A7Settings.updateTimeout * 1000;
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4)
        {
            if (xhr.status === 200)
            {
                if(seqNumber === null)
                {
                    readyFunction(xhr.responseText, false);
                }
                else
                {
                    readyFunction(seqNumber, xhr.responseText, false);
                }
            }
            else
            {
                if(seqNumber === null)
                {
                    readyFunction(backupInfos, true, secondaryBackupInfos);
                }
                else
                {
                    readyFunction(seqNumber, backupInfos, true, secondaryBackupInfos);
                }
            }
        }
    };

    xhr.send(params);
}
