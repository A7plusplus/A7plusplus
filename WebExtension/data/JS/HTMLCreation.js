/**
* @file HTMLCreation.js
* @brief Script de la gestion de structure HTML
*/


/**
* @fn createA7button Crée un bouton custom de l'extension
*/
function createA7button()
{
    var button = document.createElement('a7button');

    // Simule un bouton avec les touches Entrée et Espace
    button.addEventListener('keypress', function(e)
    {
        if (e.key === " " || e.key === "Enter")
        {
            e.preventDefault();
            button.click();
        }
    });

    return button;
}


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

    var videoSeparator    = document.createElement('separator');

    var videoButton       = createA7button();
    var boldButton        = createA7button();
    var italicButton      = createA7button();
    var underlineButton   = createA7button();
    var removeTagsButton  = createA7button();
    var restoreTextButton = createA7button();
    var cancelTextButton  = createA7button();
    var saveButton        = createA7button();


    // Zone de texte
    textArea.setAttribute('name', 'ttext');
    textArea.setAttribute('tabIndex', seqNumber);
    textArea.setAttribute('oninput', 'updateRsRatingAndCharCount(' + seqNumber + ');');

    // Contrôles
    videoButton.title            = loc.getToVideoLoc;
    videoButton.setAttribute('tabIndex', seqNumber);
    videoButton.classList.add('videoBarButton');
    videoButton.addEventListener('click', function()
    {
        videoBarSetTime(getTimeFromTimeCell(getTimeCell(seqNumber)));
    });

    videoSeparator.classList.add('videoBarButton');

    boldButton.title            = loc.selectedTextTo + ' ' + loc.bold;
    boldButton.setAttribute('tabIndex', seqNumber);
    boldButton.addEventListener('click', function()
    {
        addTagToSequence(seqNumber, 'b');
    });

    italicButton.title          = loc.selectedTextTo + ' ' + loc.italic;
    italicButton.setAttribute('tabIndex', seqNumber);
    italicButton.addEventListener('click', function()
    {
        addTagToSequence(seqNumber, 'i');
    });

    underlineButton.title       = loc.selectedTextTo + ' ' + loc.underline;
    underlineButton.setAttribute('tabIndex', seqNumber);
    underlineButton.addEventListener('click', function()
    {
        addTagToSequence(seqNumber, 'u');
    });

    removeTagsButton.title      = loc.removeTags;
    removeTagsButton.setAttribute('tabIndex', seqNumber);
    removeTagsButton.addEventListener('click', function()
    {
        removeTagsFromSequence(seqNumber);
    });


    restoreTextButton.title     = loc.restoreText;
    restoreTextButton.setAttribute('tabIndex', seqNumber);
    restoreTextButton.addEventListener('click', function()
    {
        textRestore(seqNumber);
    });

    cancelTextButton.title = loc.cancel;
    cancelTextButton.setAttribute('tabIndex', seqNumber);
    cancelTextButton.addEventListener('click', function()
    {
        textCancel(seqNumber);
    });


    saveButton.title = loc.save;
    saveButton.setAttribute('tabIndex', seqNumber);
    saveButton.addEventListener('click', function()
    {
        pre_update('o', seqNumber);
    });


    // Création du span
    textButtons.appendChild(videoButton);
    textButtons.appendChild(videoSeparator);
    textButtons.appendChild(boldButton);
    textButtons.appendChild(italicButton);
    textButtons.appendChild(underlineButton);
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

    var restoreTimeButton       = createA7button();
    var cancelTimeButton        = createA7button();
    var saveTimeButton          = createA7button();

    var toText                  = document.createElement('t');
    var endInput                = document.createElement('input');

    var bigIndicator            = createRsIndicators();


    fromText.textContent = loc.from;

    startInput.defaultValue = timeCodes[0];
    startInput.setAttribute('oninput', 'updateRsRatingAndCharCount(' + seqNumber + ');');

    restoreTimeButton.title = loc.restoreTime;
    restoreTimeButton.setAttribute('onclick', 'timeRestore(' + seqNumber + ');');

    cancelTimeButton.title = loc.cancel;
    cancelTimeButton.setAttribute('onclick', 'timeCancel(' + seqNumber + ');');

    saveTimeButton.title = loc.save;
    saveTimeButton.setAttribute('onclick', 'pre_updatetime(' + seqNumber + ');');

    toText.textContent = loc.to;

    endInput.defaultValue = timeCodes[1];
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
    for (var i = bigIndicator.childElementCount; i !== 0; i--)
    {
        editionContainer.appendChild(bigIndicator.children[0]);
    }


    return editionContainer;
}


/**
* @fn createRsIndicators Crée un nœud contenant la structure RS Rating
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
* @fn createCommentStruct Crée la structure qui accueillera les commentaires
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
    var headerRefreshButton = createA7button();
    var headerPinButton     = createA7button();

    var centerTextArea      = document.createElement('textarea');
    var centerButton        = createA7button();


    // Mise en place
    centerButton.addEventListener('click', sendComment, false);
    centerButton.setAttribute('tabIndex', 32767);
    centerButton.title         = loc.sendComment;
    centerButton.onfocus       = function() { pinCommentsTemp(); };
    centerButton.onblur        = function() { pinCommentsTemp(); };

    centerTextArea.setAttribute('tabIndex', 32767);
    centerTextArea.placeholder = loc.commTextareaHint;
    centerTextArea.oninput     = updateCommentTextArea;
    centerTextArea.onfocus     = function() { pinCommentsTemp(); };
    centerTextArea.onblur      = function() { pinCommentsTemp(); };

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
    lockSpan.id    = 'lockComment';
    lockSpan.title = loc.lockComment;
    lockSpan.addEventListener('click', lockComment, false);

    // Ajout de la classe pour modifier la position du cadenas
    if (A7Settings.lockPosition === "top")
    {
        lockSpan.classList.add('lockCommentTop');
    }

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
* @fn createHIImg Crée un nœud contenant la structure de l'indicateur de version pour malentendant
* @return {!Object} Nœud HTML de la structure
*/
function createHIImg()
{
    var img = document.createElement('span');

    // Mise en place
    img.id          = 'hearingImpaired';
    img.title       = loc.hearingImpaired;

    return img;
}


/**
* @fn createUntranslatedOption Crée un nœud pour l'option "n'afficher que les séquences non traduites"
* @return {!Object} Nœud HTML de la structure
*/
function createUntranslatedOption()
{
    var option = document.createElement('span');
    var input  = document.createElement('input');

    // Mise en place
    option.id    = 'A7Untranslated';
    option.title = loc.untranlsatedOnly;

    option.addEventListener('click', function()
    {
        // On n'envoie pas 50 requêtes
        if (document.getElementById('lista').innerHTML === '<img src="/images/loader.gif">')
            return;

        // Change l'état de l'input
        input.checked = !input.checked;
        option.title = input.checked ? loc.showAll : loc.untranlsatedOnly;

        // Appel à la fonction de base
        untraslated();

        linesChanged();
    });

    input.id   = 'unt';
    input.name = 'unt';
    input.type = 'checkbox';
    input.checked = false;

    option.appendChild(input);

    return option;
}


/**
* @fn createReloadPageOption Crée un nœud pour l'option "recharger les séquences de la page"
* @return {!Object} Nœud HTML de la structure
*/
function createReloadPageOption()
{
    var option = document.createElement('span');

    // Mise en place
    option.id    = 'A7ReloadPage';
    option.title = loc.reloadPage;

    option.addEventListener('click', function()
    {
        // On n'envoie pas 50 requêtes
        if (document.getElementById('lista').innerHTML === '<img src="/images/loader.gif">')
            return;

        // Vérifie si on affiche toutes les lignes ou uniquement les lignes les plus à jour
        var updatedCheckbox = document.getElementsByName('updated')[0];
        var updated         = updatedCheckbox.checked;

        // Récupère le nombre de lignes à partir duquel afficher le sous-titre
        var i = 0;
        var firstLine = document.getElementsByClassName('originalText')[0];

        // Si on affiche uniquement les lignes les plus à jour
        // et que des séquences sont diponibles
        if (updated && firstLine)
        {
            i = parseInt(firstLine.getAttribute('id').replace('trseq', '')) - 1;
        }
        // Si on affiche toutes les lignes
        else
        {
            // Récupère le numéro de page
            var links = document.getElementById('lista').querySelectorAll('a[href="#"]');
            for (; i < links.length; i++)
                // Si on saute un numéro, on est à la page du numéro sauté
                if (parseInt(links[i].text, 10) !== i + 1) break;
            i = i * 30;
        }

        // Appel à la fonction de base
        var secondaryLanguage = document.getElementById('slang') ? document.getElementById('slang').value : '';
        apply_filter(
            secondaryLanguage,
            updated,
            i
        );

        linesChanged();
    });

    return option;
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
    versionInfo.title       = A7Settings.MINOR_VERSION_INFO + ' ' + loc.clickToShowHelp;

    // Affichage de la page d'aide au clic
    versionInfo.addEventListener('click', openHelpPage, false);

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
    timeCell.classList.remove('timeWithoutIndicator');
    timeCell.classList.remove('timeInitial');

    timeCell.classList.add('timeWithIndicator');
    timeCell.classList.add('timeClicked');

    // Désactivation de onclick
    timeCell.removeAttribute('onclick');
}


/**
* @fn removeTimeUtils Enlève les utilitaires d'édition
* @param {!Object} timeCell Cellule sur laquelle les utilitaires doivent être retirés
*/
function removeTimeUtils(timeCell)
{
    // On enlève le grand indicateur
    timeCell.firstElementChild.remove();

    // On remet le style du petit indicateur
    timeCell.classList.remove('timeWithIndicator');
    timeCell.classList.remove('timeClicked');

    timeCell.classList.add('timeWithoutIndicator');
    timeCell.classList.add('timeInitial');
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
    timeCell.classList.remove('timeWithoutIndicator');
    timeCell.classList.add('timeWithIndicator');
}


/**
* @fn removeBigIndicator Enlève le grand indicateur du RS Rating
* @param {!Object} timeCell Cellule de temps
*/
function removeBigIndicator(timeCell)
{
    // On enlève le grand indicateur
    timeCell.lastElementChild.remove();

    // On remet le style du petit indicateur
    timeCell.classList.remove('timeWithIndicator');
    timeCell.classList.add('timeWithoutIndicator');
}

                     // Gestion de la barre utilisateur //

/**
* @fn createUserBarStruct Crée la structure qui accueillera les fonctions de l'utilisateur
* @return {!Object} Nœud HTML de la structure
*/
function createUserBarStruct()
{
    // Création des éléments
    var useBarContainer  = document.createElement('div');

    var buttonContainer  = document.createElement('div');
    var dataContainer    = document.createElement('div');

    var containerBar     = document.createElement('span');
    var containerUser    = document.createElement('span');
    var containerPM      = document.createElement('span');
    var containerReport  = document.createElement('span');
    var containerProfil  = document.createElement('span');


    // Mise en place des infos
    containerBar.title     = loc.userBar;
    containerUser.title    = loc.SelectUserTitle;
    containerPM.title      = loc.PMTitle;
    containerReport.title  = loc.ReportTitle;
    containerProfil.title  = loc.ProfilTitle;


    // Ajout des events
    containerPM.addEventListener('click', function(event)
    {
        triggerPM(false);
        event.stopImmediatePropagation();
    }, false);
    containerReport.addEventListener('click', function(event)
    {
        triggerReport(false);
        event.stopImmediatePropagation();
    }, false);
    containerProfil.addEventListener('click', function(event)
    {
        triggerProfile(false);
        event.stopImmediatePropagation();
    }, false);

    containerUser.addEventListener('click', function(event)
    {
        event.stopImmediatePropagation();
    }, false);

    dataContainer.classList.add('hasCustomScroll');
    dataContainer.setAttribute('id', 'userBarData');
    dataContainer.addEventListener('click', function(event)
    {
        event.stopImmediatePropagation();
    }, false);


    useBarContainer.setAttribute('id', 'userBar');
    useBarContainer.classList.add('userBarNotReady');
    useBarContainer.setAttribute('draggable', 'true');
    useBarContainer.addEventListener('click', function()
    {
        triggerUserBar(useBarContainer);
    }, false);


    // Ajout des nœuds
    buttonContainer.appendChild(containerBar);
    buttonContainer.appendChild(containerUser);
    buttonContainer.appendChild(containerPM);
    buttonContainer.appendChild(containerProfil);
    buttonContainer.appendChild(containerReport);

    useBarContainer.appendChild(buttonContainer);
    useBarContainer.appendChild(dataContainer);

    return useBarContainer;
}

                                  // Video //

/**
* @fn createUserBarStruct Crée la structure qui accueillera la vidéo
* @return {!Object} Nœud HTML de la structure
*/
function createVideoStruct()
{
    // Création des éléments
    var videoBar          = document.createElement('div');

    var videoContainer    = document.createElement('div');
    var fileContainer     = document.createElement('div');

    var videoBarButton    = document.createElement('span');
    var backButton        = document.createElement('span');
    var labelFileButton   = document.createElement('label');
    var fileButtonWrapper = document.createElement('div');
    var fileButton        = document.createElement('input');

    var video             = document.createElement('video');


    // Mise en place des infos
    if (A7Settings.useVLC) videoBar.title = loc.playPause;
    else                   videoBar.title = loc.videoBar;

    backButton.title            = loc.backInVideo + ' (' + (2 * A7Settings.videoDelay).toFixed(1) + 's)';
    labelFileButton.textContent = loc.chooseVideo;
    fileButton.type             = "file";
    fileButton.accept           = "video/*";

    if (A7Settings.useVLC)
    {
        videoBar.classList.add('useVLC');
        videoBar.classList.add('videoBarPlay');
    }

    // Ajout des events
    fileButton.setAttribute('id', 'A7VideoInput');
    labelFileButton.setAttribute('for', 'A7VideoInput');

    videoBar.setAttribute('id', 'videoBar');
    videoBar.setAttribute('draggable', 'true');
    videoBar.addEventListener('click', function()
    {
        triggerVideoBar(videoBar);
    }, false);


    // Ajout des events
    backButton.addEventListener('click', function(event)
    {
        // Retourne dans la vidéo de A7Settings.videoDelay secondes
        // (plus A7Settings.videoDelay ajoutés par videoBarSetTime)
        videoBarSetTime(-A7Settings.videoDelay);
        event.stopImmediatePropagation();
    }, false);
    labelFileButton.addEventListener('click', function(event)
    {
        event.stopImmediatePropagation();
    }, false);
    fileButtonWrapper.addEventListener('click', function(event)
    {
        fileButton.click();
        event.stopImmediatePropagation();
    }, false);
    videoContainer.addEventListener('click', function(event)
    {
        event.stopImmediatePropagation();
    }, false);
    videoContainer.addEventListener('mousedown', videoBarMouseDown, false);
    video.addEventListener('mousedown', function(event)
    {
        event.stopImmediatePropagation();
    }, false);
    video.addEventListener('loadedmetadata', function(event)
    {
        var videoRatio = video.videoWidth / video.videoHeight;
        videoContainer.dataset.ratio = videoRatio;
        
        // Application du ratio
        setVideoBarSize(videoBar.offsetWidth / videoRatio, videoBar.offsetWidth);

        // Replace le tout dans la fenêtre
        updateVideoBarSize(getVideoBar());
    }, false);
    fileButton.addEventListener('click', function(event)
    {
        event.stopImmediatePropagation();
    }, false);
    fileButton.addEventListener('change', function(event)
    {
        videoBarPlay(this.files[0]);
    }, false);


    // Ajout des nœuds
    fileButtonWrapper.appendChild(fileButton);

    fileContainer.appendChild(videoBarButton);
    fileContainer.appendChild(backButton);
    fileContainer.appendChild(labelFileButton);
    fileContainer.appendChild(fileButtonWrapper);

    videoContainer.appendChild(video);

    videoBar.appendChild(fileContainer);
    videoBar.appendChild(videoContainer);

    return videoBar;
}

                                   // Misc //

/**
* @fn createWarningPopup Créé le noeud qui servira de popup d'alerte
*/
function createWarningPopup()
{
    // Création des éléments
    var container = document.createElement('div');
    var textSpan  = document.createElement('span');

    // Mise en place des infos
    textSpan.title = loc.ajaxErrorOccurred;
    container.setAttribute('id', 'A7Popup');

    // Ajout des events
    container.addEventListener('click', function(event)
    {
        container.classList.remove('A7PopupVisible');
        event.stopImmediatePropagation();
    }, false);

    // Ajout des nœuds
    container.appendChild(textSpan);

    return container;
}


/**
* @fn addParentHTMLNode Ajoute un nœud HTML entre le père et le fils
* @param {!Object} parentNode Nœud parent
* @param {!Object} childNode Nœud fils
* @param {String} className Classe à ajouter au nouveau nœud
*/
function addParentHTMLNode(parentNode, childNode, className)
{
    // Récupère la position
    var nextNode = childNode.nextSibling;

    // Crée le nouveau nœud
    var newParent = document.createElement('div');
    newParent.appendChild(childNode);

    // Replace
    if (nextNode === null)
    {
        parentNode.appendChild(newParent);
    }
    else
    {
        parentNode.insertBefore(newParent, nextNode);
    }

    // Ajoute la classe
    if (className !== null)
    {
        newParent.classList.add(className);
    }
}
