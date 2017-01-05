/**
* @file Addic7ed.js
* @author Accent - HitOrRun - Retrojex - Mmoi
* @version 1.3.0 dev
* @brief Script de l'extension du site Addic7ed.com
* @detail Ajoute des fonctionnalités au mode édition du site Addic7ed.com
*/

var MAJOR_VERSION_INFO = 'A7++ 1.3',
    MINOR_VERSION_INFO = '1.3.0b4';

//========================================== SETTINGS ============================================//


var RSR = [];

// (reading speed, 'rating', 'short rating')
RSR[-1] = [-Infinity, '* EMPTY SEQUENCE *', 'empty'];
RSR[0]  = [ 0,        '* UNDEFINED *',      'undef'];
RSR[1]  = [ 5,        'TOO SLOW',           'tslow'];
RSR[2]  = [10,        'Slow, acceptable',   'aslow'];
RSR[3]  = [13,        'A bit slow',         'bslow'];
RSR[4]  = [15,        'Good',               'sgood'];
RSR[5]  = [23,        'Perfect',            'perfe'];
RSR[6]  = [27,        'Good',               'fgood'];
RSR[7]  = [31,        'A bit fast',         'bfast'];
RSR[8]  = [35,        'Fast, acceptable',   'afast'];
RSR[9]  = [Infinity,  'TOO FAST',           'tfast'];

var maxPerLineOneLineSETTING = 37,
    maxPerLineSETTING        = 40,
    strictMaxPerLineSETTING  = 43,
    strictMinDurationSETTING = 0.792,
    minDurationSETTING       = 1.001;

// Temps en secondes
var stateUpdateInterval   = 60,
    commentUpdateInterval = 30,
    updateTimeout         = 10;


//======================================== END SETTINGS ==========================================//

//======================================== LOCALIZATION ==========================================//


var loc =
{
    fr : {
        noAvailableLine   : 'Pas de lignes disponibles',
        loadingLines      : 'Chargement des lignes',
        charNumber        : 'Nombre de caractères',
        charNumberTiny    : 'NC',
        sequence          : 'Séquence',
        version           : 'Version',
        duration          : 'Durée',
        badTempCodes      : 'Les codes temporels ne sont pas bons, merci de corriger.',
        negativeTime      : 'Une durée ne peut pas être négative.',
        selectedTextTo    : 'Passer le texte selectionné en',
        bold              : 'gras',
        italic            : 'italique',
        removeTags        : 'Enlever les balises',
        restoreText       : "Restaurer le texte d'origine",
        cancel            : 'Annuler',
        save              : 'Sauvegarder',
        restoreTime       : 'Remettre le temps initial',
        update            : 'Mettre à jour',
        clickToRefresh    : 'Cliquer pour rafraichir',
        from              : 'De : ',
        to                : 'À : ',
        secondLangLoad    : 'Activation de la langue secondaire',
        RSLegend          : '(Vitesse de lecture)',
        ajaxErrorOccurred : "Une erreur lors de l'envoi ou de la réception des données s'est produite. Veuillez réessayer.",
        comments          : 'Commentaires',
        refreshComment    : 'Actualiser les commentaires',
        pinComment        : 'Verrouiller la fenêtre de commentaires',
        scrollComments    : 'Cliquer pour afficher les derniers',
        sendComment       : 'Envoyer le commentaire',
        commTextareaHint  : 'Écrire un commentaire ici.',
        reloadPageQuestion: 'CHANGEMENT DE LA LANGUE DU SITE :\n\n' +
                            'Pour recharger la page maintenant avec la nouvelle langue, cliquer sur OK.\nSinon cliquer sur Annuler.'

    },

    en : {
        noAvailableLine   : 'No sequences available',
        loadingLines      : 'Loading sequences',
        charNumber        : 'Characters number',
        charNumberTiny    : 'Char',
        sequence          : 'Sequence',
        version           : 'Version',
        duration          : 'Duration',
        badTempCodes      : 'Bad timing format',
        negativeTime      : 'Timing cannot be negative',
        selectedTextTo    : 'Selected text to',
        bold              : 'bold',
        italic            : 'italic',
        removeTags        : 'Remove tags',
        restoreText       : "Restore original text",
        cancel            : 'Cancel',
        save              : 'Save',
        restoreTime       : 'Restore original times',
        update            : 'Update',
        clickToRefresh    : 'Click to refresh',
        from              : 'From: ',
        to                : 'To: ',
        secondLangLoad    : 'Loading secondary language',
        RSLegend          : '(Reading speed)',
        ajaxErrorOccurred : 'Server error, please try again.',
        comments          : 'Comments',
        refreshComment    : 'Refresh comments',
        pinComment        : 'Pin chatbox',
        scrollComments    : 'Show latest comments',
        sendComment       : 'Send comment',
        commTextareaHint  : 'Write a comment here',
        reloadPageQuestion: 'SITE LANGUAGE CHANGE:\n\n' +
                            'In order to reload the page now with new language, click on OK.\nElse click on Cancel.'

    }
};

// Ne garde que le nescessaire
if(loc[navigator.language || navigator.userLanguage || "en"])
{
    loc = loc[navigator.language || navigator.userLanguage || "en"];
}
else
{
    loc = loc.en;
}


//====================================== END LOCALIZATION ========================================//

//======================================= MAIN FUNCTIONS =========================================//


// Déclare l'objet page et la liste des lignes
var page;

// Si la page est déjà chargée
if (document.readyState === 'interactive' || document.readyState === 'complete')
{
    init();
}
// Sinon, attend la fin du chargement de la page
else
{
    document.addEventListener('DOMContentLoaded', function() { init(); }, false);
}


/**
 * @fn init Initialise les différents composants
 */
function init()
{
    // Récupère l'élément contenant la liste
    var list = document.getElementById('lista');

    // Attend le chargement des séquences
    if (list.innerHTML === '<img src="/images/loader.gif">' || list.innerHTML === '&nbsp;')
    {
        setTimeout(init, 250);
        return;
    }

    // La page ne contient pas de lignes de traduction
    if (!document.getElementById('trseqtop'))
    {
        console.log('[A7++] ' + loc.noAvailableLine);
        return;
    }

    // Récupère les infos de la page
    var pageInfos = {};
    location.search.substr(1).split('&').forEach(function(item)
    {
        pageInfos[item.split('=')[0]] = item.split('=')[1];
    });

    // Initialise l'objet page
    page = {lock: (document.getElementById('locktop') !== null) ? 1 : 0,
            stateIntervalId: null,
            refreshCommentsTimeoutId: null,
            queryInfos: pageInfos,
            commentNumber: -1,
            tempDisablePopupRemoval: false};

    // Démarre l'actualisation de l'avancement (toutes les minutes)
    page.stateIntervalId = setInterval(updateStateOfTranslation, stateUpdateInterval * 1000);

    // Change la langue secondaire si possible
    changeLangIfEnglish();

    // Ajoute la structure d'accueil des commentaires
    var listaParent = list.parentElement;

    listaParent.insertBefore(createCommentStruct(), listaParent.lastElementChild);

    // Récupère la taille enregistrée et l'état d'épinglement
    if(localStorage)
    {
        updateCommentHeightFromSaved(listaParent.lastElementChild.previousElementSibling, 'A7ppCommentWindowSize', 180, 0.8);
        if(localStorage.getItem('A7ppCommentWindowPined') === "true")
        {
            pinComments();
        }
    }

    // Actualisation des commentaires (ce qui active aussi l'actualisation à intervalles réguliers)
    refreshComments();

    linesChanged();
    
    // Permet le changement de la langue d'affichage du site (bugfix du site)
    changeAppLang();
}


/**
* @fn linesChanged Met en cache les lignes et ajoute un évènement sur les liens
*/
function linesChanged()
{
    // Attend le chargement des séquences
    if ($('lista').innerHTML === '<img src="/images/loader.gif">')
    {
        setTimeout(linesChanged, 250);
        return;
    }

    console.log('[A7++] ' + loc.loadingLines);

    // Détourne les fonctions de base
    addFunctionToLinks('linesChanged');
    changeButtonEvents();

    // Si l'avancement n'est pas encore là
    if (document.getElementById('spanState') === null)
    {
        // Récupère la div parent des éléments à insérer
        var parentDiv = document.getElementsByClassName('tabel')[0].firstElementChild.children[1].children[1].firstElementChild;

        // Crée le span d'avancement
        parentDiv.insertBefore(createStateUtil(), parentDiv.firstElementChild);

        // Créé le span contenant les informations de l'extension
        parentDiv.appendChild(createA7Info());
    }

    // Actualise directement l'avancement
    updateStateOfTranslation();

    var headerRow = document.getElementById('trseqtop');

    // Création de la colonne compteur
    var counterCol    = document.createElement('td');
    var counterColDiv = document.createElement('div');
    counterCol.className      = 'NewsTitle';
    counterColDiv.title       = loc.charNumber;
    counterColDiv.textContent = loc.charNumberTiny;
    counterCol.appendChild(counterColDiv);

    // Ajoute avant la colonne Text la nouvelle colonne
    headerRow.insertBefore(counterCol, headerRow.lastElementChild);

    // Renomme les colonnes ou leur ajoute un titre
    headerRow.children[page.lock    ].firstElementChild.title = loc.sequence;
    headerRow.children[page.lock + 1].firstElementChild.title = loc.version;
    headerRow.children[page.lock + 4].firstElementChild.textContent += ' & ' + loc.duration + ' + RS Rating';

    // Récupère le nombre de lignes
    var tableOfLine = headerRow.parentElement;
    var lineNumbers = tableOfLine.childElementCount;

    var currentLine;

    for (var i = 1; i < lineNumbers; i++)
    {
        currentLine = tableOfLine.children[i];

        // Création de la cellule pour le nombre de caractères
        var cellTextCount = document.createElement('div');
        var cell          = document.createElement('td');
        cell.appendChild(cellTextCount);
        cell.setAttribute('class', 'counter');

        // Cellules utiles
        var timeCell = currentLine.children[page.lock + 4];
        var textCell = currentLine.lastElementChild;


        // Si la ligne a un texte modifiable
        if (currentLine.className === 'originalText')
        {
            var seqNumber = parseInt(currentLine.id.substr(5), 10);


            // Activation et mise en forme de la cellule
            if (timeCell.getAttribute('onclick') !== null)
            {
                // timeclick(...) => pre_timeclick(...)
                timeCell.setAttribute('onclick', 'pre_' + timeCell.getAttribute('onclick'));
            }

            timeCell.removeAttribute('onmouseout');
            timeCell.removeAttribute('onmouseover');


            // Activation et mise en forme de la cellule
            if (textCell.getAttribute('onclick') !== null)
            {
                textCell.setAttribute('onclick', 'pre_' + textCell.getAttribute('onclick'));
            }

            textCell.removeAttribute('onmouseout');
            textCell.removeAttribute('onmouseover');

            // Mise en forme
            timeCell.className = 'timeInitial ';
        }

        // Si le texte est non éditable
        else if (currentLine.className === 'quotedText')
        {
            timeCell.className = 'quotedTime ';
        }

        // S'il est bloqué
        else if (currentLine.className === 'lockedText')
        {
            timeCell.className = 'lockedTime ';
        }

        // Ajout de la classe norsr
        timeCell.className += 'timeWithoutIndicator norsr';

        // Remplace les sauts de ligne + <br> par uniquement <br>
        textCell.innerHTML = textCell.innerHTML.replace(/\n/g, '');

        // Longueur des lignes
        var charPerLine = charCount(textCell.innerHTML.split('<br>'), false);

        // Ajoute les compteurs de caractères des différentes lignes
        updateCharCountCell(cellTextCount, charPerLine);

        // Ajoute la cellule des compteurs dans la ligne
        currentLine.insertBefore(cell, textCell);

        // Récupère la durée
        var duration = getDurationFromTime(timeCell.innerHTML.split(' --&gt; '));

        // Récupère le RS Rating de la séquence
        var index = getRSRatingIndex(charPerLine, duration);

        // Change la classe de la cellule de temps en fonction du RS Rating
        updateTimeCellClass(timeCell, index, duration);
    }

    // On ajoute les informations dans la légende
    var lista = document.getElementById('lista');

    if (lista)
    {
        var charNum = document.createElement('b');
        var rs      = document.createElement('b');

        var charNumText = document.createTextNode(loc.charNumber);
        var rsText      = document.createTextNode('Reading Speed ' + loc.rSLegend);

        charNum.textContent = '(' + loc.charNumberTiny + ') ';
        rs.textContent      = ' (RS) ';

        lista.appendChild(charNum);
        lista.appendChild(charNumText);
        lista.appendChild(rs);
        lista.appendChild(rsText);
    
    // Rend visible le tableau des séquences maintenant que le chargement est terminé
    lista.children[0].style.setProperty('visibility', 'visible');
    lista.children[1].style.setProperty('visibility', 'visible');
    }
}


//=========================================== END MAIN ===========================================//

//====================================== ENVENT FUNCTIONS ========================================//

                                            // Texte //
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
    textCell.innerHTML = '';
    var img = document.createElement('img');
    img.src = '/images/loader.gif';
    textCell.appendChild(img);

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


                                            // Temps //
/**
* @fn pre_timeclick Active les différents éléments graphiques liés au clic
* @param {number} seqNumber Numéro de la séquence
*/
function pre_timeclick(seqNumber)
{
    // Récupération des éléments utiles
    var line     = getTextCell(seqNumber).parentElement;
    var timeCell = line.children[page.lock + 4];
    var textCell = line.lastElementChild;

    // Récupération de l'état des cellules
    var timeState = getStateOfTimeCell(timeCell);

    // Si la cellule possède un grand indicateur
    if (timeState === 'opened')
    {
        // Lui retire
        removeBigIndicator(timeCell);
    }

    // Récupère les durées
    var timeCodes = timeCell.getText().split(' --> ');

    // Retire les durées
    timeCell.childNodes[0].remove();


    // Crée et ajoute les utilitaires d'édition
    addTimeUtils(timeCell, seqNumber, timeCodes);


    // Actualise le RS Rating et le compte des caractères
    updateRsRatingAndCharCount(seqNumber);
}


/**
* @fn pre_updatetime Traite le texte avant l'envoi et change la classe de la cellule
* @param {number} seqNumber Numéro de la séquence
*/
function pre_updatetime(seqNumber)
{
    // Regex pour matcher HH:MM:SS,mmm où H,M,S et m sont des chiffres (exemple : 00:23:43,214)
    var pattern = /^\d{2}:\d{2}:\d{2},\d{3}$/;

    // Récupère les information utiles
    var timeCell  = getTimeCell(seqNumber);
    var timeStart = timeCell.firstElementChild.children[1];
    var timeEnd   = timeCell.firstElementChild.children[6];

    // Remplace les points par des virgules dans les champs de temps
    timeStart.value = timeStart.value.replace(/\./, ',');
    timeEnd.value   =   timeEnd.value.replace(/\./, ',');

    // Vérification de la syntaxe des timings
    if (!pattern.test(timeStart.value) || !pattern.test(timeEnd.value))
    {
        alert(loc.badTempCodes);
        return;
    }

    // Vérification de la continuité des temps
    if (getDurationFromTime([timeStart.value, timeEnd.value]) < 0)
    {
        alert(loc.negativeTime);
        return;
    }

    // Les temps n'ont pas changé
    if (timeStart.value === timeStart.defaultValue && timeEnd.value === timeEnd.defaultValue)
    {
        timeCancel(seqNumber);
        return;
    }

    // Récupère es informations de la page
    var subInfo = page.queryInfos;

    // Prépare les données
    var params = 'id='         + subInfo.id +
                 '&fversion='  + subInfo.fversion +
                 '&lang='      + subInfo.lang +
                 '&seqnumber=' + seqNumber +
                 '&stime='     + encodeURIComponent(timeStart.value) +
                 '&etime='     + encodeURIComponent(timeEnd.value),
        url    = '/ajax_editTime.php',
        action = 'POST';

    // Indique que c'est en envoi
    timeCell.firstElementChild.outerHTML = '<img src="/images/loader.gif">';

    // Effectue l'envoi des données
    ajax(action, url, params, post_updateTime, seqNumber, [timeStart.value, timeEnd.value], [timeStart.defaultValue, timeEnd.defaultValue]);
}


/**
* @fn post_updateTime Place le temps dans sa cellule ou réouvre l'édition
* @param {number} seqNumber Numéro de la séquence
* @param {Array.<string>} confirmedTime Temps confirmé par le serveur ou temps à envoyer en cas d'erreur
* @param {boolean} isError Si la requête a échoué
* @param {Array.<string>} defaultValue Optionnel : valeur par defaut du temps en cas d'erreur
*/
function post_updateTime(seqNumber, confirmedTime, isError, defaultValue)
{
    // Récupération de la cellule
    var timeCell = getTimeCell(seqNumber);

    // Si la page a été changée
    if (timeCell === null)
        return;


    if (!isError)
    {
        // Récupération de la deuxième cellule
        var textCell = getTextCell(seqNumber);

        // Récupération de l'état
        var textState = getStateOfTextCell(textCell);

        // Mise en forme
        timeCell.className = timeCell.className.replace(/timeClicked /, 'timeInitial ');

        // Si le texte est ouvert
        if (textState === 'clicked')
        {
            // Ajoute le grand indicateur
            addBigIndicator(timeCell);
        }
        else
        {
            // Sinon, il n'y a plus d'indicateur
            timeCell.className = timeCell.className.replace(/timeWithIndicator /, 'timeWithoutIndicator ');
        }

        // Remplace tout simplement par le temps
        timeCell.firstElementChild.outerHTML = confirmedTime.substr(19, confirmedTime.length - 7);

        // Actualise les compteurs
        updateRsRatingAndCharCount(seqNumber);

        // Activation de onclick après 10 ms pour laisser passer le clic courant
        setTimeout(function(){
            timeCell.setAttribute('onclick', 'pre_timeclick(' + seqNumber + ')');
        }, 10);
    }
    else
    {
        // Change le temps de la cellule
        timeCell.setText(confirmedTime[0] + ' --> ' + confirmedTime[1]);

        // Réouvre l'édition
        pre_timeclick(seqNumber);

        // Récupération des entrées
        var timeStart = timeCell.firstElementChild.children[1];
        var timeEnd   = timeCell.firstElementChild.children[6];

        // Remet les valeurs par défaut
        timeStart.defaultValue = defaultValue[0];
        timeEnd.defaultValue   = defaultValue[1];
        timeStart.value        = confirmedTime[0];
        timeEnd.value          = confirmedTime[1];

        // Mise en forme
        timeCell.firstElementChild.setAttribute('class', 'ajaxError');
        timeCell.firstElementChild.setAttribute('title', loc.ajaxErrorOccurred);
    }
}


/**
* @fn timeRestore Restaure le temps de la séquence
* @param {number} seqNumber Numéro de la séquence
*/
function timeRestore(seqNumber)
{
    // Récupère les information utiles
    var timeCell  = getTimeCell(seqNumber);
    var timeStart = timeCell.firstElementChild.children[1];
    var timeEnd   = timeCell.firstElementChild.children[6];

    // On restaure les valeurs
    timeStart.value = timeStart.defaultValue;
    timeEnd.value   = timeEnd.defaultValue;

    // On se place sur l'entrée du début
    timeStart.focus();

    // Rafraichissement du RS Rating
    updateRsRatingAndCharCount(seqNumber);
}


/**
* @fn timeCancel Annule les modifications et referme la cellule
* @param {number} seqNumber Numéro de la séquence
*/
function timeCancel(seqNumber)
{
    // Récupère les information utiles
    var textCell = getTextCell(seqNumber);
    var timeCell = getTimeCell(seqNumber);

    // Récupération de l'état des cellules
    var textState = getStateOfTextCell(textCell);

    // Récupère le span
    var timeSpan = timeCell.firstElementChild;

    // Récupère les valeurs temporelles de base
    var begin = timeSpan.children[1].defaultValue;
    var end   = timeSpan.children[6].defaultValue;

    // On supprime les utilitaires
    removeTimeUtils(timeCell);

    // Si c'est ouvert
    if (textState === 'clicked')
    {
        // Ajoute le grand indicateur
        addBigIndicator(timeCell);
    }

    // On réécrit les valeurs dans la cellule
    timeCell.insertBefore(document.createTextNode(begin + ' --> ' + end), timeCell.firstElementChild);

    // Actualise le RS Rating
    updateRsRatingAndCharCount(seqNumber);

    // Activation de onclick après 10 ms pour laisser passer le clic courant
    setTimeout(function(){
        timeCell.setAttribute('onclick', 'pre_timeclick(' + seqNumber + ')');
    }, 10);
}


                                        // Fonction globale //
/**
* @fn updateRsRatingAndCharCount Actualise le RS Rating et le compteur de caractères
* @param {number} seqNumber Numéro de la ligne à modifier
*/
function updateRsRatingAndCharCount(seqNumber)
{
    // Récupération des éléments utiles
    var line     = getTimeCell(seqNumber).parentElement;
    var timeCell = line.children[page.lock + 4];
    var textCell = line.lastElementChild;

    // Initialisation des variables de temps et de longueur de lignes
    var unitedTime = [0, 0];
    var lineCount  = [];

    // Récupération de l'état
    var timeState = getStateOfTimeCell(timeCell);
    var textState = getStateOfTextCell(textCell);


    // Récupération de la longueur des lignes
    switch(textState)
    {
        case 'clicked':

            // S'il est en édition
            lineCount = charCount(textCell.firstElementChild.firstElementChild.value.split('\n'), false);

            break;

        default:

            // S'il n'est ni ouvert, ni enregistré
            lineCount = charCount(textCell.innerHTML.split('<br>'), false);

            break;
    }


    // Récupération du temps
    switch(timeState)
    {
        case 'clicked':

            // Si l'édition de temps est ouverte

            // Récupère les entrées
            var startTime = timeCell.firstElementChild.children[1];
            var endTime   = timeCell.firstElementChild.children[6];

            // Log la position et l'élément de focus
            var focus          = document.activeElement;
            var selectionStart = focus.selectionStart;
            var selectionEnd   = focus.selectionEnd;

            // Remplace les points par des virgules dans les champs de temps
            startTime.value = startTime.value.replace(/\./, ',');
            endTime.value   =   endTime.value.replace(/\./, ',');

            // Remet la position
            focus.selectionStart = selectionStart;
            focus.selectionEnd   = selectionEnd;

            unitedTime[0] = startTime.value;
            unitedTime[1] = endTime.value;

            break;

        case 'opened':

            // Si l'édition de temps n'est pas ouverte mais la cellule oui
            // Retire la légende de l'indicateur
            unitedTime = timeCell.getText().substr(0, timeCell.getText().length - timeCell.firstElementChild.getText().length).split(' --> ');

            break;

        default:

            // Si c'est fermé
            unitedTime = timeCell.getText().split(' --> ');

            break;
    }


    // Met à jour les compteurs de caractères des différentes lignes et demande si on est hors limites
    var criticity = updateCharCountCell(line.children[line.childElementCount - 2], lineCount);

    // Récupère la durée
    var duration = getDurationFromTime(unitedTime);

    // Récupère le RS Rating de la séquence
    var index = getRSRatingIndex(lineCount, duration);


    // Change la classe de la cellule de temps en fonction du RS Rating
    updateTimeCellClass(timeCell, index, duration);


    // On actualise le texte du grand indicateur et sa légende
    if (timeState !== 'initial')
    {
        // Récupère le span ou le big indicator
        var bigIndicator = timeCell.lastElementChild;

        // Actualise son texte
        bigIndicator.children[bigIndicator.childElementCount - 2].value = RSR[index][1];

        // Met l'indicateur de temps en couleur et affiche sa valeur
        updateBigIndicatorLegend(timeCell, duration);
    }


    // Dynamisme de la textArea pour être user friendly
    if (textState === 'clicked')
    {
        // Récupération de celle-ci
        var textArea = textCell.firstElementChild.firstElementChild;

        // Mise en forme en cas de dépassement
        textArea.setAttribute('borderGlowing', criticity);

        updateTextAreaSize(textArea);
    }
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


                                        // Commentaires //
/**
* @fn refreshComments Actualise les commentaires
*/
function refreshComments()
{
    // Récupération du bouton d'actualisation
    var updateButton = document.getElementById('commentsSection').children[1].lastElementChild;

    // Si on est en cours d'actualisation, ne fait rien
    if(updateButton.getAttribute('loading') !== null)
        return;

    // Désactivation du bouton de rafraichissement
    updateButton.setAttribute('loading', true);

    // Récupération des infos
    var subInfo = page.queryInfos;

    // Construit et lance la requête (oui... semi GET, semi POST)
    var params = '&fversion=' + subInfo.fversion +
                 '&langto='   + subInfo.lang,
        url = '/translate_comments.php?id=' + subInfo.id,
        action = 'POST';

    // Envoie la requête
    ajax(action, url, params, post_commentRefresh, null, null);
}


/**
* @fn post_commentRefresh Traite les données reçues par ajax
* @param {string} Chaine HTML des commentaires
* @param {boolean} Si une erreur s'est produite
*/
function post_commentRefresh(newCommentsString, isError)
{
    // Récupère les informations utiles
    var commentsSection = document.getElementById('commentsSection');
    var updateButton   = commentsSection.children[1].lastElementChild;
    var commentList    = commentsSection.lastElementChild.firstElementChild;

    // Réactive le bouton (délai pour laisser à l'indicateur le temps de faire au moins un tour)
    setTimeout(function()
    {
        updateButton.removeAttribute('loading');
    }, 750);

    // Enclenche un compte à rebours pour réactualiser les commentaires dans x secondes
    page.refreshCommentsTimeoutId = setTimeout(refreshComments, commentUpdateInterval * 1000);

    if(isError)
    {
        // Indique une erreur
        commentList.setAttribute('class', 'ajaxError');
        commentList.setAttribute('title', loc.ajaxErrorOccurred);
        return;
    }

    // S'il y a eu une erreur, l'enlève
    if(commentList.getAttribute('class') === 'ajaxError')
    {
        commentList.setAttribute('class', '');
        commentList.setAttribute('title', '');
    }

    // Parse la string en HTML
    var newCommentsHTML = document.createElement('span');
    newCommentsHTML.innerHTML = newCommentsString;

    // Récupère la liste
    var listOfNewComments   = newCommentsHTML.firstElementChild.firstElementChild.firstElementChild.children;
    var listOfNewCommLength = (listOfNewComments.length - 5) / 2;

    // Si ce n'est pas l'initialisation
    if(page.commentNumber !== -1)
    {
        // Et qu'il y a de nouveaux commentaires
        if((listOfNewCommLength - page.commentNumber) > 0)
        {
            // Récupère le nombre de commantaires
            var commentCounter = updateButton.previousElementSibling.lastElementChild;
            var oldCommentNumber = isNaN(parseInt(commentCounter.textContent)) ? 0 : parseInt(commentCounter.textContent);

            // Affiche le nombre dans le span et cumule le nombre si possible
            commentCounter.textContent = listOfNewCommLength - page.commentNumber + oldCommentNumber;
        }
    }
    else
    {
        page.commentNumber = 0;
    }

    // Récupère la position
    var oldUserCommentViewHeight = commentList.scrollTop;
    var isUserOnCommentBottom = (commentList.scrollTop + commentList.clientHeight === commentList.scrollHeight);

    // Réinitialise la liste des commentaires
    commentList.innerHTML = '';

    // Re peuple les commentaires du tableau
    for(var i = 2; i < listOfNewCommLength + 2; i++)
    {
        // Retire l'image
        listOfNewComments[i].firstElementChild.firstElementChild.remove();

        // Ajoute le commentaire
        commentList.appendChild(listOfNewComments[i]);
    }

    // Met à jour les informations de la page
    page.commentNumber = listOfNewCommLength;

    // Réadapte la vue utilisateur
    if(isUserOnCommentBottom)
    {
        page.tempDisablePopupRemoval = true;
        commentList.scrollTop = commentList.scrollHeight;
    }
    else
    {
        commentList.scrollTop = oldUserCommentViewHeight;
    }

}


/**
* @fn post_sendComment Traite les données reçues par ajax
* @param {string} Chaine HTML des commentaires
* @param {boolean} Si une erreur s'est produite
*/
function post_sendComment(newCommentsString, isError)
{
    // Récupère la textArea
    var textArea = document.getElementById('commentsSection').lastElementChild.lastElementChild.firstElementChild;

    // Réactive la textArea
    textArea.removeAttribute('disabled');

    // Si le commentaire a bien été envoyé
    if(!isError)
    {
        // Efface le contenu de la textArea
        textArea.value = '';
        page.commentNumber += 1;
    }

    post_commentRefresh(newCommentsString, isError);
}


/**
* @fn sendComment Enoie le commentaire présent en textArea
*/
function sendComment()
{
    // Récupère les informations de la page
    var subInfo = page.queryInfos;

    // Récupération de la textArea
    var textArea = document.getElementById('commentsSection').lastElementChild.lastElementChild.firstElementChild;

    // Desactive la textArea le temps de l'envoi
    textArea.setAttribute('disabled', true);

    // Construit et lance la requête
    var params = 'id='          + subInfo.id +
                 '&fversion='   + subInfo.fversion +
                 '&langto='     + subInfo.lang +
                 '&newcomment=' + encodeURIComponent(textArea.value),
        url = '/translate_comments.php',
        action = 'POST';

    // Envoie la requête
    ajax(action, url, params, post_sendComment, null, null);
}


/**
* @fn goToComments Descend dans la liste de commentaires pour afficher les derniers
*/
function goToComments()
{
    // Récupère la popup et le tableau
    var popup = document.getElementById('commentsSection').children[1].children[1].lastElementChild,
        table = document.getElementById('commentsSection').lastElementChild.firstElementChild;

    // Enlève le contenu de la popup
    removeCommentPopup();

    // Descend aux derniers commentaires du tableau
    table.scrollTop = table.scrollHeight;
}


/**
* @fn Ajoute ou enlève la classe du pin
*/
function pinComments()
{
    var commentsSection = document.getElementById('commentsSection');

    if(commentsSection.className && commentsSection.className === 'comment-pined')
    {
        commentsSection.classList.remove('comment-pined');
        if(localStorage)
        {
            localStorage.setItem('A7ppCommentWindowPined', false);
        }
    }
    else
    {
        commentsSection.classList.add('comment-pined');
        if(localStorage)
        {
            localStorage.setItem('A7ppCommentWindowPined', true);
        }
    }
}


/**
* @fn resizeBarMouseDown Initialise le redimensionnement des commentaires
* @param e Objet d'évènement
*/
function resizeBarMouseDown(e)
{
    e.preventDefault();
    window.addEventListener('mousemove', windowMouseMove, false);
    window.addEventListener('mouseup', windowMouseUp, false);
    document.getElementById('commentsSection').classList.add('resizing');
}


/**
* @fn windowMouseMove Ajuste le redimensionnement des commentaires
* @param e Objet d'évènement
*/
function windowMouseMove(e)
{
    var height = window.innerHeight - e.clientY,
        commentsSection = document.getElementById('commentsSection');

    if(height < 180)
    {
        height = 180;
    }
    else if(height > window.innerHeight / 1.25)
    {
        height = window.innerHeight / 1.25;
    }

    commentsSection.style.height =  height + 'px';
    commentsSection.style.bottom = -height + 'px';
    document.getElementById('lista').style.marginBottom = height - 10 + 'px';

    // Sauvegarde pour la personnalisation
    if(localStorage)
    {
        localStorage.setItem('A7ppCommentWindowSize', height / window.innerHeight);
    }
    
}


/**
* @fn windowMouseUp Finalise le redimensionnement des commentaires
* @param e Objet d'évènement
*/
function windowMouseUp(e)
{
    window.removeEventListener('mousemove', windowMouseMove, false);
    window.removeEventListener('mouseup', windowMouseUp, false);
    document.getElementById('commentsSection').classList.remove("resizing");
}


/**
* @fn commentsTableScroll Teste si on est tout en bas du tableau des commentaires
* @param e Objet d'évènement
*/
function commentsTableScroll(e)
{
    var commentsSection = document.getElementById('commentsSection');

    var table = commentsSection.lastElementChild.firstElementChild;

    if(!page.tempDisablePopupRemoval && table.scrollHeight === table.scrollTop + table.clientHeight)
    {
        commentsSection.children[1].children[1].lastElementChild.textContent = '';
    }

    // Réactive la suppression
    page.tempDisablePopupRemoval = false;
}


//========================================== END EVENT ===========================================//

//======================================= UTILS FUNCTIONS ========================================//


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
        if (rsr > RSR[i-1][0] && rsr <= RSR[i][0])
            return i;

    return 0;
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
    xhr.timeout = updateTimeout * 1000;
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


//========================================= END UTILS ============================================//

//==================================INTERFACES UTILS FUNCTIONS ===================================//

                                    // Création de nœuds //
/**
* @fn createTextUtils Crée un nœud contenant la structure des utilitaires textuels
* @param {number} seqNumber Numéro de séquence
* @return {!Object} Nœud HTML contenant les utilitaires
*/
function createTextUtils(seqNumber)
{
    var editionContainer  = document.createElement('span');

    var textArea          = document.createElement('textarea');

    var textButtons       = document.createElement('span');

    var boldButton        = document.createElement('a7button');
    var italicButton      = document.createElement('a7button');
    var removeTagsButton  = document.createElement('a7button');
    var restoreTextButton = document.createElement('a7button');
    var cancelTextButton  = document.createElement('a7button');
    var saveButton        = document.createElement('a7button');


    // Zone de texte
    textArea.setAttribute('name', 'ttext');
    textArea.setAttribute('oninput', 'updateRsRatingAndCharCount(' + seqNumber + ');');

    // Contrôles
    boldButton.title            = loc.selectedTextTo + ' ' + loc.bold;
    boldButton.setAttribute('onclick', 'addTagToSequence(' + seqNumber + ", 'b');");

    italicButton.title          = loc.selectedTextTo + ' ' + loc.italic;
    italicButton.setAttribute('onclick', 'addTagToSequence(' + seqNumber + ", 'i');");

    removeTagsButton.title      = loc.removeTags;
    removeTagsButton.setAttribute('onclick', 'removeTagsFromSequence(' + seqNumber + ');');


    restoreTextButton.title     = loc.restoreText;
    restoreTextButton.setAttribute('onclick', 'textRestore(' + seqNumber + ');');

    cancelTextButton.title = loc.cancel;
    cancelTextButton.setAttribute('onclick', 'textCancel(' + seqNumber + ');');


    saveButton.title = loc.save;
    saveButton.setAttribute('onclick', "pre_update('o', " + seqNumber + ');');


    // Création du span
    textButtons.appendChild(boldButton);
    textButtons.appendChild(italicButton);
    textButtons.appendChild(removeTagsButton);
    textButtons.appendChild(document.createElement('separator'));
    textButtons.appendChild(restoreTextButton);
    textButtons.appendChild(cancelTextButton);
    textButtons.appendChild(document.createElement('separator'));
    textButtons.appendChild(saveButton);

    // Ajout des composants au conteneur
    editionContainer.appendChild(textArea);
    editionContainer.appendChild(textButtons);

    return editionContainer;
}


/**
* @fn createTimeUtils Crée un nœud contenant la structure des utilitaires temporels
* @param {number} seqNumber Numéro de séquence
* @param {Array.<string>} Tableau de deux codes temporels
* @return {!Object} Nœud HTML contenant la structure des utilitaires temporels
*/
function createTimeUtils(seqNumber, timeCodes)
{
    var editionContainer        = document.createElement('span');

    var fromText                = document.createElement('t');
    var startInput              = document.createElement('input');

    var restoreTimeButton       = document.createElement('a7button');
    var cancelTimeButton        = document.createElement('a7button');
    var saveTimeButton          = document.createElement('a7button');

    var toText                  = document.createElement('t');
    var endInput                = document.createElement('input');

    var bigIndicator            = createRsIndicators();


    fromText.textContent = loc.from;

    startInput.defaultValue     = timeCodes[0];
    startInput.setAttribute('oninput', 'updateRsRatingAndCharCount(' + seqNumber + ');');

    restoreTimeButton.title     = loc.restoreTime;
    restoreTimeButton.setAttribute('onclick', 'timeRestore(' + seqNumber + ');');

    cancelTimeButton.title      = loc.cancel;
    cancelTimeButton.setAttribute('onclick', 'timeCancel(' + seqNumber + ');');

    saveTimeButton.title        = loc.save;
    saveTimeButton.setAttribute('onclick', 'pre_updatetime(' + seqNumber + ');');

    toText.textContent = loc.to;

    endInput.defaultValue       = timeCodes[1];
    endInput.setAttribute('oninput', 'updateRsRatingAndCharCount(' + seqNumber + ');');


    // Partie temporelle de début
    editionContainer.appendChild(fromText);
    editionContainer.appendChild(startInput);

    // Utilitaires
    editionContainer.appendChild(restoreTimeButton);
    editionContainer.appendChild(cancelTimeButton);
    editionContainer.appendChild(saveTimeButton);

    // Partie temporelle de fin
    editionContainer.appendChild(toText);
    editionContainer.appendChild(endInput);

    // Ajoute le grand indicateur en lui retirant son conteneur
    for(var i = bigIndicator.childElementCount; i !== 0; i--)
    {
        editionContainer.appendChild(bigIndicator.children[0]);
    }


    return editionContainer;
}


/**
* @fn createRsControls Crée un nœud contenant la structure RS Rating
* @return {!Object} Nœud HTML structuré
*/
function createRsIndicators()
{
    var indicatorContainer       = document.createElement('div');

    var indicator                = document.createElement('input');
    var indicatorLegend          = document.createElement('div');

    indicator.cols               = 20;
    indicator.value              = ' ';
    indicator.readOnly           = true;
    indicator.setAttribute('onfocus', 'this.blur()');

    indicatorContainer.appendChild(indicator);
    indicatorContainer.appendChild(indicatorLegend);

    return indicatorContainer;
}


/**
* @fn createCommentStruct Créer la structure qui accueuillera les commentaires
* @return {!Object} Nœud HTML de la structure
*/
function createCommentStruct()
{
    // Création des éléments
    var commentsContainer   = document.createElement('div');

    var containerResizeBar  = document.createElement('div');
    var containerHeader     = document.createElement('div');
    var containerList       = document.createElement('div');

    var listTable           = document.createElement('table');
    var listCenter          = document.createElement('center');

    var headerText          = document.createElement('p');
    var headerTextContent   = document.createTextNode(loc.comments);
    var headerTextPopup     = document.createElement('span');
    var headerRefreshButton = document.createElement('a7button');
    var headerPinButton     = document.createElement('a7button');

    var centerTextArea      = document.createElement('textarea');
    var centerButton        = document.createElement('a7button');


    // Mise en place
    centerButton.addEventListener('click', sendComment, false);
    centerButton.title         = loc.sendComment;
    centerTextArea.placeholder = loc.commTextareaHint;
    centerTextArea.oninput     = updateCommentTextArea;

    headerRefreshButton.addEventListener('click', function()
    {
        // Empêche la duplication du timeout
        clearTimeout(page.refreshCommentsTimeoutId);

        refreshComments();
    }, false);
    headerRefreshButton.title = loc.refreshComment;

    listTable.addEventListener('scroll', commentsTableScroll, false);

    headerPinButton.addEventListener('click', pinComments, false);
    headerPinButton.title = loc.pinComment;

    headerText.title = loc.scrollComments;
    headerText.addEventListener('click', goToComments, false);

    containerResizeBar.addEventListener('mousedown', resizeBarMouseDown, false);

    commentsContainer.setAttribute('id', 'commentsSection');
    commentsContainer.onclick = removeCommentPopup;


    // Ajout des nœuds
    headerText.appendChild(headerTextContent);
    headerText.appendChild(headerTextPopup);

    listCenter.appendChild(centerTextArea);
    listCenter.appendChild(centerButton);

    containerHeader.appendChild(headerPinButton);
    containerHeader.appendChild(headerText);
    containerHeader.appendChild(headerRefreshButton);

    containerList.appendChild(listTable);
    containerList.appendChild(listCenter);

    commentsContainer.appendChild(containerResizeBar);
    commentsContainer.appendChild(containerHeader);
    commentsContainer.appendChild(containerList);

    return commentsContainer;
}


/**
* @fn createStateUtil Crée un nœud contenant la structure de l'utilitaire d'état
* @param {!Object} parentDiv Nœud HTML dans lequel doit être ajouté l'utilitaire d'état
* @return {!Object} Nœud HTML de la structure
*/
function createStateUtil(parentDiv)
{
    var spanState = document.createElement('span');

    // Mise en place
    spanState.id          = 'spanState';
    spanState.textContent = loc.update;
    spanState.title       = loc.clickToRefresh;
    spanState.addEventListener('click', updateStateOfTranslation, false);

    return spanState;
}


/**
* @fn createA7Info Crée un nœud contenant la structure de l'affichage des info de l'extension
* @param {!Object} parentDiv Nœud HTML dans lequel doit être ajouté l'utilitaire d'état
* @return {!Object} Nœud HTML de la structure
*/
function createA7Info(parentDiv)
{
    var versionInfo = document.createElement('span');

    // Mise en place
    versionInfo.id          = 'A7Info';
    versionInfo.textContent = MAJOR_VERSION_INFO;
    versionInfo.title       = MINOR_VERSION_INFO;

    return versionInfo;
}


                                // Détournement des fonctions //
/**
* @fn addFunctionToLinks Ajoute la fonction nameOfFunction aux liens présents sur la page
* @param {string} nameOfFunction Nom de la fonction devant être appelée
* @warning La fonction passée ne doit pas prendre d'arguments
* @TODO Ajouter des arguments à la fonction
*/
function addFunctionToLinks(nameOfFunction)
{
    // Recherche les liens faisant changer de page, et leur ajoute la recharge des lignes
    var allElements = document.getElementsByTagName('a');
    for (var i = allElements.length; i--;)
        if (allElements[i].getAttribute('href') === 'noscript.php' && typeof allElements[i].onclick === 'function')
        {
            allElements[i].setAttribute('onclick', allElements[i].getAttribute('onclick').substr(0, allElements[i].getAttribute('onclick').length - 13) + nameOfFunction + '(); return false;');
            allElements[i].setAttribute('href', '#');
        }

    // Recherche la checkBox faisant changer de page, et lui ajoute la recharge des lignes
    var checkBoxUpdate = document.getElementsByName('updated');
    for (i = checkBoxUpdate.length; i--;)
        if (typeof checkBoxUpdate[i].onchange === 'function')
        {
            checkBoxUpdate[i].setAttribute('onchange', checkBoxUpdate[i].getAttribute('onchange') + nameOfFunction + '();');
        }

    // Recherche la comboBox faisant changer de page, et lui ajoute la recharge des lignes et le changement d'état du langage
    var comboBox = document.getElementById('slang');
    if (comboBox && typeof comboBox.onchange === 'function')
    {
        comboBox.setAttribute('onchange', comboBox.getAttribute('onchange') + nameOfFunction + '();');
    }

    // Recherche la form de recherche et lui ajoute aussi la recharge de lignes
    var recherche = document.getElementById('filter');
    if (recherche && typeof recherche.onsubmit === 'function')
    {
        recherche.setAttribute('onsubmit', recherche.getAttribute('onsubmit').substr(0, recherche.getAttribute('onsubmit').length - 13) + nameOfFunction + '(); return false;');
    }
}


/**
* @fn changeButtonEvents Préfixe une fonction aux évènements des bouttons
*/
function changeButtonEvents()
{
    var listOfButton = document.getElementsByName('button');

    // Remplace pour chaque bouton
    for (var i = listOfButton.length; i--;)
        listOfButton[i].setAttribute('onclick', addStringBetween(listOfButton[i].getAttribute('onclick'), 'pre_', 11));

    // De même pour le bouton replace (après une recherche)
    var replaceButton = document.getElementById('replaceb');
    if (replaceButton !== null)
    {
        replaceButton.setAttribute('onclick', addStringBetween(replaceButton.getAttribute('onclick'), 'pre_', 12));
    }
}


                        // Gestion graphique des indicateurs du RS Rating //
/**
* @fn addTimeUtils Ajoute les utilitaires d'édition à la cellule
* @param {!Object} timeCell Cellule sur laquelle les utilitares doivent être ajoutés
* @param {number} seqNumber Numéro de la séquence
* @param {Array.<string>} Tableau des durées de départ et de fin de séquence
*/
function addTimeUtils(timeCell, seqNumber, timeCodes)
{
    // Crée et ajoute les utilitaires d'édition
    timeCell.insertBefore(createTimeUtils(seqNumber, timeCodes), timeCell.firstElementChild);

    // Change le style pour afficher le grand indicateur
    timeCell.className = timeCell.className.replace(/timeWithoutIndicator /, 'timeWithIndicator ');
    timeCell.className = timeCell.className.replace(/timeInitial /, 'timeClicked ');

    // Désactivation de onclick
    timeCell.setAttribute('onclick', '');
}


/**
* @fn removeTimeUtils Enlève les utilitaires d'édition
* @param {!Object} timeCell Cellule sur laquelle les utilitares doivent être retirés
*/
function removeTimeUtils(timeCell)
{
    // On enlève le grand indicateur
    timeCell.firstElementChild.remove();

    // On remet le style du petit indicateur
    timeCell.className = timeCell.className.replace(/timeWithIndicator /, 'timeWithoutIndicator ');
    timeCell.className = timeCell.className.replace(/timeClicked /, 'timeInitial ');
}


/**
* @fn addBigIndicator Ajoute le grand indicateur et change le style de la cellule
* @param {!Object} timeCell Cellule sur laquelle l'indicateur doit être ajouté
*/
function addBigIndicator(timeCell)
{
    // Crée la structure du grand indicateur et l'ajoute
    timeCell.appendChild(createRsIndicators());

    // Change le style pour afficher le grand indicateur
    timeCell.className = timeCell.className.replace(/timeWithoutIndicator /, 'timeWithIndicator ');
}


/**
* @fn removeBigIndicator Enlève le grand indicateur de RS Rating
* @param {!Object} timeCell Cellule de temps
*/
function removeBigIndicator(timeCell)
{
    // On enlève le grand indicateur
    timeCell.lastElementChild.remove();

    // On remet le style du petit indicateur
    timeCell.className = timeCell.className.replace(/timeWithIndicator /, 'timeWithoutIndicator ');
}


                                    // Fonctions de mise à jour //
/**
* @fn updateTimeCellClass Met à jour la classe de la cellule de temps
* @param {!Object} timeCell Cellule sur laquelle la classe doit être changée
* @param {number} rsIndex Index voulu du tableau RSR
* @param {number} duration Durée de la séquence
*/
function updateTimeCellClass(timeCell, rsIndex, duration)
{
    timeCell.className = timeCell.className.substr(0, timeCell.className.length - 5) + RSR[rsIndex][2];

    timeCell.title = loc.duration + ' : ' + duration.toFixed(3) + " s\nRS Rating : " + RSR[rsIndex][1];
}


/**
* @fn updateCharCountCell Inscrit les longueurs du tableau dans la cellule
* @param {!Object} countCell Cellule du compteur de lignes
* @param {Array.<number>} counts Tableau de longueurs de ligne
* @return {string} Criticité du dépassement
*/
function updateCharCountCell(countCell, counts)
{
    // Sauvegarde la longueur
    var length = counts.length;

    // On regarde si l'unique ligne est vide
    switch((length === 1 && counts[0] === 0) ? 0 : length)
    {
        // Pas de lignes
        case 0:

            countCell.setText('_');
            return 'ok';

        // Ligne unique
        case 1:

            // Créé les éléments
            var span = document.createElement('span');
            span.textContent = counts[0];
            countCell.innerHTML = '';
            countCell.appendChild(span);

            if (counts[0] <= maxPerLineOneLineSETTING)
            {
                span.className = 'ccc_green';
                return 'ok';
            }
            else
            {
                span.className = 'ccc_red';
                return 'bad';
            }


        // Multi-lignes
        default:

            var color;
            var criticity = 'ok';
            countCell.innerHTML = '';

            // On vérifie le nombre de lignes
            if (length === 3)
                criticity = 'pass';

            else if (length > 3)
                criticity = 'bad';


            // Pour chaque ligne
            for (var i = 0; i < length; i++)
            {
                // On saute de ligne sauf pour la première ligne
                if (i !== 0)
                    countCell.appendChild(document.createElement('br'));

                // On determine la couleur
                if (counts[i] <= maxPerLineSETTING)
                {
                    color = 'ccc_green';
                }
                else if (counts[i] <= strictMaxPerLineSETTING)
                {
                    color = 'ccc_orange';

                    // N'écrase pas la valeur si elle est plus critique
                    if (criticity !== 'bad')
                        criticity = 'pass';
                }
                else
                {
                    color = 'ccc_red';
                    criticity = 'bad';
                }

                // On l'ajoute à la cellule
                var span = document.createElement('span');
                span.textContent = counts[i];
                span.className = color;
                countCell.appendChild(span);
            }

            return criticity;
    }
}


/**
* @fn updateBigIndicatorLegend Met l'indicateur de temps en couleur et actualise sa valeur (temps)
* @param {!Object} timeCell Cellule de temps
* @param {number} duration Durée de la séquence
*/
function updateBigIndicatorLegend(timeCell, duration)
{
    var indicatorLegend = timeCell.lastElementChild.lastElementChild;


    if (duration < strictMinDurationSETTING)
        indicatorLegend.style.color = 'red';

    else if (duration < minDurationSETTING)
        indicatorLegend.style.color = '#e70';

    else
        indicatorLegend.style.color = 'black';

    indicatorLegend.textContent = duration.toFixed(3).replace('.',',') + ' s';
}


/**
* @fn updateTextAreaSize Adapte la taille de la zone de texte en fonction de son contenu
* @param {!Object} textArea Zone à modifier
*/
function updateTextAreaSize(textArea)
{
    // Calcul des tailles
    var count = charCount(textArea.value.split('\n'), true);

    // Calcul de la ligne la plus longue
    var longerLineLength = 0;

    // Récupértion de la longueur
    var length = count.length;

    for (var i = 0; i < length; i++)
    {
        if (longerLineLength < count[i])
            longerLineLength = count[i];
    }

    // Actualisation

    // Hauteur
    if (length > 3)
        textArea.rows = length;
    else
        textArea.rows = 3;

    // Largeur
    if (longerLineLength > 43)
        textArea.cols = longerLineLength + 1;
    else
        textArea.cols = 44;
}


/**
* @fn updateStateOfTranslation Actualise l'état d'avancement de la traduction
*/
function updateStateOfTranslation()
{
    // Récupère le span d'affichage
    var spanState = document.getElementById('spanState');

    // Si on n'est pas prêt
    if (spanState === null)
        return;

    // Prépare la requête
    var xhr = new XMLHttpRequest();

    // Mise en forme
    spanState.setAttribute('class', 'stateRefreshing');

    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            var response = xhr.responseText;

            // Affiche l'avancement
            spanState.textContent = response;

            // Récupère l'id du setInterval
            var timeIntervalId = page.stateIntervalId;

            if (response.indexOf('%') === -1)
            {
                // Si le setInterval est toujours actif
                if (timeIntervalId !== null)
                {
                    // Arrête d'essayer d'actualiser
                    clearInterval(timeIntervalId);

                    // Indique qu'il est arrêté
                    page.stateIntervalId = null;
                }

                spanState.setAttribute('class', 'stateCompleted');
            }
            else
            {
                // Si l'intervalle est désactivé, le réactive
                if (timeIntervalId === null)
                {
                    page.stateIntervalId = setInterval(updateStateOfTranslation, stateUpdateInterval * 1000);
                }

                spanState.setAttribute('class', 'stateNotCompleted');
            }
        }
    };

    // Récupère les informations
    var subInfo = page.queryInfos;

    // Prépare et envoie la requête
    xhr.timeout = 30000;
    xhr.open('GET', 'translate_getstate.php?id=' + subInfo.id + '&fversion=' + subInfo.fversion + '&langto=' + subInfo.lang, true);
    xhr.send();
}


/**
* @fn updateCommentTextArea Met à jour la taille du la textarea afin de voir tout le commentaire
*/
function updateCommentTextArea()
{
    // Récupère la taille de ta textarea
    var lines = this.value.split('\n').length;
    var center = this.parentElement;

    // Calcule la hauteur
    var wantedHeight = (lines < 3 ? 50 : 5 + (lines + 0.5) * 14);

    // Empêche l'overflow
    center.style.minHeight = wantedHeight > center.parentElement.clientHeight - 100 ? center.parentElement.height : wantedHeight + 'px';
}


/**
* @fn updateCommentHeightFromSaved Met à jour, si possible, la taille de l'élément Elem avec la taille stockée dans Storage
* @param {Object} elem Objet HTML devant prendre la taille
* @param {String} storage Nom de la variable contenant la taille (en pourcentage par rapport à window.innerHeight)
* @param {int} lowLimit Limite basse acceptable (en pixels)
* @param {int} highLimit Limite haute acceptable (en pourcentage, 0 à 1)
*/
function updateCommentHeightFromSaved(elem, storage, lowLimit, highLimit)
{
    // Récupère la valeur
    var savedValue = parseFloat(localStorage.getItem(storage));

    // La valeur est valide
    if(!isNaN(savedValue) && savedValue * window.innerHeight >= lowLimit && savedValue <= highLimit)
    {
        var size = Math.round(savedValue * window.innerHeight);

        elem.style.height = size + 'px';
        elem.style.bottom = -size + 'px';
        document.getElementById('lista').style.marginBottom = size - 10 + 'px';
    }
}


/**
* @fn removeCommentPopup Retire les popup numériques de la section commentaire
*/
function removeCommentPopup()
{
    var commentSection = document.getElementById('commentsSection');

    if(commentSection)
    {
        commentSection.children[1].children[1].lastElementChild.textContent = '';
    }

}


                                        // Fonction de langue //
/**
* @fn changeLangIfEnglish Change le langue si l'anglais est poposé
*/
function changeLangIfEnglish()
{
    // Récupération de la comboBox
    var comboBox = document.getElementById('slang');

    // S'il n'y a pas de comboBox
    if (comboBox === null)
        return;

    var comboBoxOptions = comboBox.options;

    // Vérifie que l'anglais est présent
    for (var i = comboBoxOptions.length; i--;)
    {
        if (comboBoxOptions[i].value == 1)
        {
            console.log('[A7++] ' + loc.secondLangLoad);
            comboBoxOptions[i].selected = true;
            comboBox.onchange();
        }
    }
}


                                        // Accesseurs //
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


//==================================== END INTERFACES UTILS ======================================//

//==================================== SITE BUGFIX ======================================//

// 
/**
* @fn changeAppLang Ajoute la fonction manquante pour permettre le changement de la langue d'affichage du site
*/
function changeAppLang()
{
    var comboLang = document.getElementById('comboLang');

    comboLang.removeAttribute('onchange');
    comboLang.addEventListener('change', function(event)
    {
        var lang = event.target.value;
        fetch('/changeapplang.php?applang=' + lang, {credentials: 'include'});
        if(confirm(loc.reloadPageQuestion))
        {
            location.reload();
        }
    }, false);
}

//================================== END SITE BUGFIX ====================================//
