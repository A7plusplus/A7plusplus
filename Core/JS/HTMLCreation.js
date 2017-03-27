/**
* @file HTMLCreation.js
* @brief Script de la gestion de structure HTML
*/


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
    textArea.setAttribute('tabIndex', seqNumber);
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
* @fn createCommentLockUtil Crée un nœud contenant la structure de l'utilitaire d'état de lock des commentaires
* @param {!Object} parentDiv Nœud HTML dans lequel doit être ajouté l'utilitaire d'état
* @return {!Object} Nœud HTML de la structure
*/
function createCommentLockUtil(parentDiv)
{
    var lockSpan = document.createElement('span');

    // Mise en place
    lockSpan.id          = 'lockComment';
    lockSpan.title       = loc.lockComment;
    lockSpan.addEventListener('click', lockComment, false);

    return lockSpan;
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
* @return {!Object} Nœud HTML de la structure
*/
function createA7Info()
{
    var versionInfo = document.createElement('span');

    // Mise en place
    versionInfo.id          = 'A7Info';
    versionInfo.textContent = A7Settings.MAJOR_VERSION_INFO;
    versionInfo.title       = A7Settings.MINOR_VERSION_INFO;

    return versionInfo;
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
