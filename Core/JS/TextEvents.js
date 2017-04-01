/**
* @file TextEvents.js
* @brief Script des évenements des zones de texte
*/


/**
* @fn pre_mouseclick Active les différents éléments graphiques liés au clic
* @param {string} tipo Un 'o', sinon on ignore... (mais pourquoi ?)
* @param {number} seqNumber Numéro de la séquence
*/
function pre_mouseclick(tipo, seqNumber)
{
    // Récupération des éléments utiles
    var line     = getTextCell(seqNumber).parentElement;
    var timeCell = line.children[page.lock + 4];
    var textCell = line.lastElementChild;


    // Récupération de l'état des cellules
    var timeState = getStateOfTimeCell(timeCell);


    // On s'occupe de l'état du temps : si le grand indicateur n'est pas là, on le crée
    if (timeState === 'initial')
    {
        // Ajoute le grand indicateur du RS Rating
        addBigIndicator(timeCell);

        // Actualise le RS Rating et le compte des caractères
        updateRsRatingAndCharCount(seqNumber);
    }


    // Enregistre le texte
    var text = textCell.innerHTML.replace(/<br>/g, "\n");

    // Vide la cellule
    textCell.innerHTML = '';

    // Crée et ajoute les utilitaires
    textCell.appendChild(createTextUtils(seqNumber));

    // Ajoute le texte
    textCell.firstElementChild.firstElementChild.defaultValue = text;


    // Change la classe de la cellule des tailles
    line.children[line.childElementCount - 2].setAttribute('class', 'openedCounter');

    // Mise en forme
    textCell.setAttribute('class', 'textClicked');
    textCell.setAttribute('disabled', true);

    // Désactivation de onclick
    textCell.setAttribute('onclick', '');

    // Remet la textArea à la bonne taille
    updateTextAreaSize(textCell.firstElementChild.firstElementChild);

    // Actualise les compteurs (permet d'afficher l'avertissement en cas de dépassement nombre de lignes / nombre de caractères)
    updateRsRatingAndCharCount(seqNumber);
}


/**
* @fn pre_update Traite le texte avant l'envoi et change la classe de la cellule
* @param {string} tipo Un 'o', sinon on ignore... (mais pourquoi ?)
* @param {number} seqNumber Numéro de la séquence
*/
function pre_update(tipo, seqNumber)
{
    // Récupération des éléments utiles
    var line     = getTextCell(seqNumber).parentElement;
    var timeCell = line.children[page.lock + 4];
    var textCell = line.lastElementChild;
    var textArea = textCell.firstElementChild.firstElementChild;

    // Récupération de l'état des cellules
    var timeState = getStateOfTimeCell(timeCell);

    // Si le texte est inchangé, on ne le sauvegarde pas
    if (textArea.value === textArea.defaultValue)
    {
        textCancel(seqNumber);
        return;
    }


    // On enlève les espaces inutiles
    textArea.value = removeTrailingSpaces(textArea.value.split('\n')).join('\n');

    // Affecte le style
    textCell.className = 'cursorEdit';
    textCell.setAttribute('disabled', false);

    // Change la classe de la cellule des tailles
    line.children[line.childElementCount - 2].setAttribute('class', 'counter');

    // Si le temps n'est pas en train d'être édité
    if (timeState !== 'clicked')
    {
        removeBigIndicator(timeCell);
    }

    // Récupère es informations de la page
    var subInfo = page.queryInfos;

    // Prépare les données
    var params = 'id='         + subInfo.id +
                 '&fversion='  + subInfo.fversion +
                 '&lang='      + subInfo.lang +
                 '&seqnumber=' + seqNumber +
                 '&ttext='     + encodeURIComponent(textArea.value),
        url    = '/ajax_editText.php',
        action = 'POST';

    // Indique que c'est en envoi
    resetToLoadingImage(textCell);

    // Effectue l'envoi des données
    ajax(action, url, params, post_update, seqNumber, textArea.value, textArea.defaultValue);
}


/**
* @fn post_update Place le texte dans sa cellule ou réouvre l'édition
* @param {number} seqNumber Numéro de la séquence
* @param {string} confirmedText Texte confirmé par le serveur ou texte à envoyer en cas d'erreur
* @param {boolean} isError Si la requête a échoué
* @param {string} defaultValue Optionnel : valeur par defaut du texte en cas d'erreur
*/
function post_update(seqNumber, confirmedText, isError, defaultValue)
{
    // Récupération de la cellule
    var textCell = getTextCell(seqNumber);

    // Si la page a été changée
    if (textCell === null)
        return;

    if (!isError)
    {
        // Change le texte de la cellule
        textCell.innerHTML = confirmedText.substr(19, confirmedText.length - 26).replace(/\n/g, '');

        // Actualise les compteurs
        updateRsRatingAndCharCount(seqNumber);

        // Activation de onclick après 10 ms pour laisser passer le clic courant
        setTimeout(function(){
            textCell.setAttribute('onclick', "pre_mouseclick('o', " + seqNumber + ');');
        }, 10);
    }
    else
    {
        // Change le texte de la cellule
        textCell.innerHTML = confirmedText.substr(19, confirmedText.length - 26).replace(/\n/g, '');

        // Réouvre l'édition
        pre_mouseclick('o', seqNumber);

        // Récupération de la textArea
        var textArea = textCell.firstElementChild.firstElementChild;

        // Remet les valeurs par défaut
        textArea.defaultValue = defaultValue;
        textArea.value        = confirmedText;

        // Mise en forme
        textCell.firstElementChild.setAttribute('class', 'ajaxError');
        textCell.firstElementChild.setAttribute('title', loc.ajaxErrorOccurred);
    }
}

/**
* @fn addTagToSequence Met la selection de la séquence entre balises de type baliseType
* @param {number} seqNumber Numéro de la séquence
* @param {string} tagType Texte de la balise
*/
function addTagToSequence(seqNumber, tagType)
{
    // Récupère la textArea de la séquence
    var textArea = getTextCell(seqNumber).firstElementChild.firstElementChild;

    // S'il n'y a pas de texte, on ne fait rien
    if (textArea.value === '')
        return;

    // Si rien n'est selectionné, on balise le tout
    if (textArea.selectionStart === textArea.selectionEnd)
    {
        textArea.value = '<' + tagType + '>' + textArea.value + '</' + tagType + '>';
    }

    // Si on a une selection
    else
    {
        // On récupère les morceaux
        var before    = textArea.value.substring(0, textArea.selectionStart);
        var after     = textArea.value.substring(textArea.selectionEnd);
        var selection = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);

        textArea.value = before + '<' + tagType + '>' + selection + '</' + tagType + '>' + after;

        textArea.selectionStart += 2 + tagType.length;
        textArea.selectionEnd += 2 + tagType.length;
    }

    // Actualise la taille de la textArea
    updateTextAreaSize(textArea);

    // Remet le focus sur la textArea
    textArea.focus();
}


/**
* @fn removeTagsFromSequence Enlève les balises dans la séquence
* @param {number} seqNumber Numéro de la séquence
*/
function removeTagsFromSequence(seqNumber)
{
    // Récupère la textArea de la séquence
    var textArea = getTextCell(seqNumber).firstElementChild.firstElementChild;

    // Enlève les balises grâce aux regex
    textArea.value = textArea.value.replace(/(<[^>]*>|\{[^\}]*\})/g, '');

    // Remet à zéro les positions (évite les bugs)
    textArea.selectionStart = textArea.value.length;
    textArea.selectionEnd = textArea.selectionStart;

    // Actualise la taille de la textArea
    updateTextAreaSize(textArea);

    // Remet le focus sur la textArea
    textArea.focus();
}


/**
* @fn textRestore Restaure le texte de la séquence
* @param {number} seqNumber Numéro de la séquence
*/
function textRestore(seqNumber)
{
    // Récupère la textArea de la séquence
    var textArea = getTextCell(seqNumber).firstElementChild.firstElementChild;

    // Remet le texte d'origine
    textArea.value = textArea.defaultValue;

    // Actualise les caractéristiques de la séquence
    updateRsRatingAndCharCount(seqNumber);

    // Remet le focus sur la textArea
    textArea.focus();
}


/**
* @fn textCancel Annule les modifications et referme la cellule
* @param {number} seqNumber Numéro de la séquence
*/
function textCancel(seqNumber)
{
    // Récupère les information utiles
    // Les cellules
    var textCell = getTextCell(seqNumber);
    var timeCell = getTimeCell(seqNumber);
    var line     = timeCell.parentElement;

    // Le texte de la séquence
    var text = getTextCell(seqNumber).firstElementChild.firstElementChild.defaultValue;

    // Remplace le formulaire par le texte
    textCell.setHTML(text.replace(/\n/g, '<br>'));

    // Récupère l'état des cellules
    var timeState = getStateOfTimeCell(timeCell);

    // Si le temps n'est pas en train d'être édité
    if (timeState !== 'clicked')
    {
        // Enlève le grand indicateur
        removeBigIndicator(timeCell);
    }

    // Actualise les caractéristiques de la séquence
    updateRsRatingAndCharCount(seqNumber);

    // Met en forme
    textCell.className = 'cursorEdit';
    textCell.setAttribute('disabled', false);

    // Change la classe de la cellule des tailles
    line.children[line.childElementCount - 2].setAttribute('class', 'counter');

    // Active onclick après 10 ms pour laisser passer le clic courant
    setTimeout(function(){
        textCell.setAttribute('onclick', "pre_mouseclick('o', " + seqNumber + ');');
    }, 10);
}

                          // Actions de masse //

/**
* @fn pre_massedit Ouvre toutes les éditions possibles
* @param {number} low Borne basse
* @param {number} high Borne haute
*/
function pre_massedit(low, high)
{
    for (var seqNumber = low; seqNumber <= high; seqNumber++)
    {
        if (getTextCell(seqNumber) && !document.getElementById('of' + seqNumber))
        {
            pre_mouseclick('o', seqNumber);
        }
    }
}


/**
* @fn pre_massupdate Met à jour tous les textes possibles
* @param {number} low Borne basse
* @param {number} high Borne haute
*/
function pre_massupdate(low, high)
{
    var textCell;

    for (var seqNumber = low; seqNumber <= high; seqNumber++)
    {
        textCell = document.getElementById('text' + seqNumber);

        if (textCell !== null && textCell.childElementCount === 1 && textCell.firstElementChild.tagName === 'SPAN')
        {
            pre_update('o', seqNumber);
        }
    }
}


/**
* @fn pre_massreplace Remplace toutes les occurences de from_this en to_that
* @param {number} low Borne basse
* @param {number} high Borne haute
* @param {string} from_this Texte à modifier (non utilisé)
* @param {string} to_that Nouveau texte (non utilisé)
*/
function pre_massreplace(low, high, from_this, to_that)
{
    var searchRegExp = new RegExp("\\b" + document.getElementById('search').value + "\\b");
    var changeTo     = document.getElementById('replace').value;

    pre_massedit(low, high);

    // Récupère la liste des textArea
    var ttextObjs = document.getElementsByName('ttext');

    for (var i = ttextObjs.length; i--;)
    {
        ttextObjs[i].value = ttextObjs[i].value.replace(searchRegExp, changeTo);

        // Actualise comme si un input avait été fait
        ttextObjs[i].oninput();
    }

}
