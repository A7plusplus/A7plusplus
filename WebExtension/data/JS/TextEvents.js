/**
* @file TextEvents.js
* @brief Script des événements des zones de texte
*/


/**
* @fn pre_mouseclick Active les différents éléments graphiques liés au clic
* @param {string} tipo Un "o", sinon on ignore... (mais pourquoi ?)
* @param {number} seqNumber Numéro de la séquence
*/
function pre_mouseclick(tipo, seqNumber)
{
    var textCell = getTextCell(seqNumber);

    // Enlève le tabindex à la cellule de texte
    textCell.removeAttribute('tabIndex');

    // Si on est en mode Join translation, recherche d'abord le text
    if (!page.translatePage || getTextCell(seqNumber).innerHTML.contains('loader.gif'))
    {
        // Bypass le chargement car inutile si on est en view & edit ou qu'il y a erreur d'envoi
        post_select(false, null, seqNumber);
    }
    else
    {
        // Sauvegarde le texte
        page.tempTranslateBackup[seqNumber] = textCell.innerHTML;

        // Affiche le chargement
        resetToLoadingImage(textCell);

        // Récupère les informations de la page
        var subInfo = page.queryInfos;

        var params = 'id='         + subInfo.id +
                     '&fversion='  + subInfo.fversion +
                     '&langto='    + subInfo.lang +
                     '&langfrom='  + subInfo.langfrom +
                     '&seq=' + seqNumber;

        // Effectue l'envoi des données
        ajax({
            action:        'GET',
            url:           '/translate_ajaxselect.php' + '?' + params,
            forwardData:   seqNumber,
            readyFunction: post_select
        });
    }
}


/**
* @fn pre_update Traite le texte avant l'envoi et change la classe de la cellule
* @param {string} tipo Un "o", sinon on ignore... (mais pourquoi ?)
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

    // Remet le tabindex à la cellule de texte
    textCell.setAttribute('tabIndex', seqNumber);

    // Si le texte est inchangé et qu'il ne s'agit pas d'une séquence encore non traduite (donc vide en Join translation),
    // on ne sauvegarde pas
    if (textArea.value === textArea.defaultValue && !(page.translatePage && line.className === 'originalText'))
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
    var params = null,
        url = null;

    if (page.translatePage)
    {
        params = 'id='         + subInfo.id +
                 '&fversion='  + subInfo.fversion +
                 '&langto='    + subInfo.lang +
                 '&langfrom='  + subInfo.langfrom +
                 '&seq='       + seqNumber +
                 '&ttext='     + encodeURIComponent(textArea.value);
        url = '/translate_ajaxedit.php';
    }
    else
    {
        params = 'id='         + subInfo.id +
                 '&fversion='  + subInfo.fversion +
                 '&lang='      + subInfo.lang +
                 '&seqnumber=' + seqNumber +
                 '&ttext='     + encodeURIComponent(textArea.value);
        url = '/ajax_editText.php';
    }

    // Indique que c'est en envoi
    resetToLoadingImage(textCell);

    // Focus à la cellule de texte éditable ou à la textarea de la ligne suivante (si existante)
    moveFocusToNextLine(seqNumber);

    // Effectue l'envoi des données
    ajax({
        action:               'POST',
        url:                  url,
        params:               params,
        forwardData:          seqNumber,
        backupInfos:          {value: textArea.value, default: textArea.defaultValue},
        readyFunction:        post_update
    });
}


/**
* @fn post_update Place le texte dans sa cellule ou rouvre l'édition
* @param {boolean} isError Si la requête a échoué
* @param {string} confirmedText Texte confirmé par le serveur ou infos de backup (text à envoyer - text original)
* @param {number} seqNumber Numéro de la séquence
*/
function post_update(isError, confirmedText, seqNumber)
{
    // Récupération de la cellule
    var textCell = getTextCell(seqNumber);

    // Si la page a été changée
    if (textCell === null)
        return;

    if (!isError)
    {
        // Change le texte de la cellule
        if (confirmedText.indexOf('<font color="black">') === -1)
        {
            // <font color="blue">
            textCell.innerHTML = confirmedText.substr(19, confirmedText.length - 26).replace(/\n/g, '');
        }
        else
        {
            textCell.innerHTML = confirmedText.substr(20, confirmedText.length - 27).replace(/\n/g, '');
        }

        // Actualise les compteurs
        updateRsRatingAndCharCount(seqNumber);

        // Marque la séquence comme déjà traduite
        if (page.translatePage)
        {
            textCell.parentElement.classList.remove('originalText');
            textCell.parentElement.classList.add('quotedText');
        }

        // Activation de onclick après 10 ms pour laisser passer le clic courant
        setTimeout(function(){
            textCell.setAttribute('onclick', "pre_mouseclick('o', " + seqNumber + ');');
        }, 10);
    }
    else
    {
        // Rouvre l'édition
        pre_mouseclick('o', seqNumber);

        // Récupération de la textArea
        var textArea = textCell.firstElementChild.firstElementChild;

        // Remet les valeurs par défaut
        textArea.defaultValue = confirmedText.default;
        textArea.value        = confirmedText.value;

        // Mise en forme
        displayAjaxError(loc.sequence);
        updateRsRatingAndCharCount(seqNumber);
        textCell.firstElementChild.setAttribute('class', 'ajaxError');
        textCell.firstElementChild.setAttribute('title', loc.ajaxErrorOccurred);
    }
}

/**
* @fn addTagToSequence Met la sélection de la séquence entre balises de type tagType
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

    // Si on a une sélection
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

    // Enlève les balises grâce au regex
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

    // Remet le tabindex à la cellule de texte
    textCell.setAttribute('tabIndex', seqNumber);

    // Focus à la cellule de texte éditable ou à la textarea de la ligne suivante (si existante)
    moveFocusToNextLine(seqNumber);

    // Change la classe de la cellule des tailles
    line.children[line.childElementCount - 2].setAttribute('class', 'counter');

    // Libère la séquence
    if (page.translatePage)
    {
        // Récupère les informations de la page
        var subInfo = page.queryInfos;

        var params = 'id='         + subInfo.id +
                     '&fversion='  + subInfo.fversion +
                     '&langto='      + subInfo.lang +
                     '&seq=' + seqNumber;

        // Effectue l'envoi des données
        ajax({
            action:               'GET',
            url:                  '/translate_release.php' + '?' + params,
            forwardData:          seqNumber,
            readyFunction:        post_release
        });
    }

    // Active onclick après 10 ms pour laisser passer le clic courant
    setTimeout(function(){
        textCell.setAttribute('onclick', "pre_mouseclick('o', " + seqNumber + ');');
    }, 10);
}


/**
* @fn post_select Récupère et place le dernier texte de la séquence
* @param {Boolean} isError Si la requête a échoué (ou false en mode view & edit)
* @param {Object}  data Donnée issue de la requête (ou null si en mode view & edit)
* @param {Integer} seqNumber Numéro de séquence
* @param {Object} translateMode Non utilisé
*/
function post_select(isError, data, seqNumber, translateMode)
{
    // Récupération des éléments utiles
    var line     = getTextCell(seqNumber).parentElement;
    var timeCell = line.children[page.lock + 4];
    var textCell = line.lastElementChild;


    // Enregistre le texte ou traite les données reçues
    var text = null;
    // La requêtre AJAX est revenue
    if (!isError && data !== null)
    {
        var regexMatches = data.match(/onkeypress="translate_userInput[^>]*>((.|\n)*)<\/textarea>/);

        // Le texte est trouvé dans la réponse
        if (regexMatches && regexMatches.length > 2)
        {
            if (regexMatches[1] === '</textarea>')
            {
                text = '';
            }
            else
            {
                text = regexMatches[1];
            }
        }
        else
        {
            // Texte non trouvé, on vérifie que la séquence n'est pas occupée
            var regexUser = data.match(/<a href="\/user\/[0-9]*">.*<\/a>/);

            if (regexUser && regexUser.length == 1)
            {
                // Séquence occupée
                textCell.innerHTML = data;

                // Si le site ne nous fourni toujours pas l'ID utilisateur - Répare le liens vers le profile
                if (!data.match(/<a href="\/user\/[0-9]+">.*<\/a>/))
                {
                    var username = textCell.firstElementChild.text;

                    // Récupère (dans la section du bas), le vrai lien
                    var links = document.getElementById('comments').previousElementSibling.getElementsByTagName('a');
                    for (var i = 0; i < links.length; i++)
                    {
                        if (links[i].text === 'accent' && links[i].href.startsWith('http://www.addic7ed.com/user/'))
                        {
                            textCell.firstElementChild.href = links[i].href;
                            break;
                        }

                        // Si le bon lien n'est pas trouvé, tempis...
                        textCell.firstElementChild.href = '404.html';
                    }
                }

                return;
            }
            else
            {
                text = getTextFromHTML(page.tempTranslateBackup[seqNumber]);
            }
        }
    }
    else if (isError)
    {
        text = getTextFromHTML(page.tempTranslateBackup[seqNumber]);
    }
    // Mode view & edit
    else
    {
        text = getTextFromHTML(textCell.innerHTML);
    }


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


    // Vide la cellule
    resetHTMLObject(textCell);
    page.tempTranslateBackup[seqNumber] = null;

    // Crée et ajoute les utilitaires
    textCell.appendChild(createTextUtils(seqNumber));

    // Ajoute le texte
    var textArea = textCell.firstElementChild.firstElementChild;
    textArea.defaultValue = text;

    // Prend le focus
    textArea.focus();
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);


    // Change la classe de la cellule des tailles
    line.children[line.childElementCount - 2].setAttribute('class', 'openedCounter');

    // Mise en forme
    textCell.setAttribute('class', 'textClicked');
    textCell.setAttribute('disabled', true);

    // Si une erreur de réception arrive en mode Join translation
    if (isError)
    {
        textCell.classList.add('ajaxErrorNotConfirmed');
        textCell.setAttribute('title', loc.seqNotConfirmed);
    }

    // Désactivation de onclick
    textCell.removeAttribute('onclick');

    // Remet la textArea à la bonne taille
    updateTextAreaSize(textCell.firstElementChild.firstElementChild);

    // Actualise les compteurs (permet d'afficher l'avertissement en cas de dépassement nombre de lignes / nombre de caractères)
    updateRsRatingAndCharCount(seqNumber);
}


/**
* @fn post_release Fonction sans but si ce n'est la réception des données des releases
*/
function post_release()
{
    return;
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
        textCell = getTextCell(seqNumber);
        if (textCell && getStateOfTextCell(textCell) === 'initial')
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
        textCell = getTextCell(seqNumber);

        if (textCell && getStateOfTextCell(textCell) === 'clicked')
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
