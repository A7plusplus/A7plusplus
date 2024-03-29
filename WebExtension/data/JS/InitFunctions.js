/**
* @file InitFunctions.js
* @brief Script des fonctions utilisées lors de l'initialisation
*/


/**
* @fn addFunctionToLinks Ajoute la fonction nameOfFunction aux liens présents sur la page (dans le cas où changePage ne peut pas être appelé)
* @param {string} nameOfFunction Nom de la fonction devant être appelée
* @warning La fonction passée ne doit pas prendre d'arguments
* @TODO Ajouter des arguments à la fonction
*/
function addFunctionToLinks(nameOfFunction)
{
    // Recherche les liens faisant changer de page, et leur ajoute la recharge des lignes
    var allElements = document.getElementsByTagName('a');
    for (var i = allElements.length; i--;)
    {
        // Liens du mode view & edit
        if (allElements[i].getAttribute('href') === 'noscript.php' && typeof allElements[i].onclick === 'function')
        {
            let pageFirstSequence = (allElements[i].innerText - 1) * 30 + 1;

            allElements[i].setAttribute('href', page.pageUrl.toString().replace(/&sequence=\d+/, ("&sequence=" + pageFirstSequence)));
            allElements[i].setAttribute('tabIndex', 32766);
            allElements[i].setAttribute('onclick', null);
            allElements[i].addEventListener('click', function(event)
            {
                event.preventDefault();
                changePage(event.target.href);
            });
        }

        // Liens du mode translate
        else if (allElements[i].getAttribute('href').indexOf('javascript:list(') !== -1)
        {
            let pageFirstSequence = (allElements[i].innerText - 1) * 30 + 1;

            allElements[i].setAttribute('href', page.pageUrl.toString().replace(/&sequence=\d+/, ("&sequence=" + pageFirstSequence)));
            allElements[i].setAttribute('tabIndex', 32766);
            allElements[i].setAttribute('onclick', null);
            allElements[i].addEventListener('click', function(event)
            {
                event.preventDefault();
                changePage(event.target.href);
            });
        }

        // Liens des séquences
        else
        {
            // Ne prends que les liens de cet épisode -- Traduction
            var raw = allElements[i].getAttribute('href').match(/translate\.php\?id=(\d+)&fversion=(\d+)&langto=(\d+)&langfrom=(\d+)&sequence=(\d+)/);
            if (raw !== null && raw.length >= 6 &&
                page.queryInfos.id       === raw[1] &&
                page.queryInfos.fversion === raw[2] &&
                page.queryInfos.lang     === raw[3] &&
                page.queryInfos.langfrom === raw[4])
            {
                // Remplace aussi le mode untranslated, car on ne veut pas le garder sur le clic d'une séquence
                allElements[i].setAttribute('href', page.pageUrl.toString().replace(/&sequence=\d+/, ("&sequence=" + (parseInt(raw[5]) + 1 ))).replace(/&untranslated=\d/, "&untranslated=0"));
                allElements[i].addEventListener('click', function(event)
                {
                    event.preventDefault();
                    changePage(event.target.href);
                });
            }

            // Ne prends que les liens de cet épisode -- View & edt list.php?id=170534&amp;fversion=0&amp;lang=8&amp;sequence=8
            var raw = allElements[i].getAttribute('href').match(/list\.php\?id=(\d+)&fversion=(\d+)&lang=(\d+)&sequence=(\d+)/);
            if (raw !== null && raw.length >= 5 &&
                page.queryInfos.id       === raw[1] &&
                page.queryInfos.fversion === raw[2] &&
                page.queryInfos.lang     === raw[3])
            {
                // Remplace aussi le mode untranslated, car on ne veut pas le garder sur le clic d'une séquence
                allElements[i].setAttribute('href', page.pageUrl.toString().replace(/&sequence=\d+/, ("&sequence=" + raw[4])));
                allElements[i].addEventListener('click', function(event)
                {
                    event.preventDefault();
                    changePage(event.target.href);
                });
            }
        }
    }

    // Recherche la checkBox faisant changer de page, et lui ajoute la recharge des lignes
    var checkBoxUpdate = getMostUpdatedInput();
    if (checkBoxUpdate !== null && typeof checkBoxUpdate.onchange === 'function')
    {
        checkBoxUpdate.setAttribute('onchange', null);
        checkBoxUpdate.addEventListener('change', function (event)
        {
            changePage(location.href.replace(/mostupdated=\d/, 'mostupdated=' + (event.target.checked ? '1' : '0')));
        });
    }

    // Recherche la comboBox faisant changer de page, et lui ajoute la recharge des lignes et le changement d'état de la langue
    var comboBox = getSlangInput();
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
* @fn changeButtonEvents Préfixe une fonction aux événements des boutons
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


/**
 * @fn removeTitleIndicator Enlève l'indicateur de l'état d'avancement existant à droite du titre
 */
function removeTitleIndicator()
{
    // Récupère le titre
    var title = document.getElementsByClassName('titulo')[0];

    // Enlève l'indicateur et rend le titre visible
    title.lastChild.remove();
    title.parentElement.parentElement.style.setProperty('visibility', 'visible');
}
 
/**
* @fn linesChanged Met en cache les lignes et ajoute un événement sur les liens
*/
function linesChanged()
{
    // Attend le chargement des séquences
    if (document.getElementById('lista').innerHTML === '<img src="/images/loader.gif">')
    {
        setTimeout(linesChanged, 100);
        return;
    }

    console.log('[A7++] ' + loc.loadingLines);

    // Arrivée initiale sur la page - ajout des infos
    if (page.translatePage && Array.from(page.pageUrl.searchParams).length === 0)
    {
        changePage(window.location.href + `?id=${page.queryInfos.id}&fversion=${page.queryInfos.fversion}&langto=${page.queryInfos.lang}&langfrom=${page.queryInfos.langfrom}&untranslated=0&sequence=1`, 'initial');
    }
    else if (!page.translatePage && !page.pageUrl.searchParams.has('mostupdated'))
    {
        changePage(window.location.href + '&sequence=1&mostupdated=0', 'initial');
    }

    // Détourne les fonctions de base
    addFunctionToLinks('linesChanged');
    changeButtonEvents();

    // Retire l'état d'avancement de base du mode Join translation
    if (page.translatePage)
    {
        var listaa = document.getElementById('lista');

        while (listaa.firstElementChild.tagName !== 'TABLE')
            listaa.firstElementChild.remove();
    }

    // Si l'avancement n'est pas encore là
    if (document.getElementById('spanState') === null)
    {
        // Récupère la div parent des éléments à insérer
        var parentDiv = null;
        if (page.translatePage)
        {
            parentDiv = document.getElementsByClassName('titulo')[0];

            // Ajoute un nœud HTML - mise en forme
            parentDiv.previousElementSibling.remove();
            addParentHTMLNode(parentDiv.parentElement, parentDiv, 'tituloParent');
            parentDiv = parentDiv.parentElement;
        }
        else
        {
            parentDiv = document.getElementsByClassName('tabel')[0].firstElementChild.children[1].children[1].firstElementChild;
        }

        // Si le lock des commentaires est placé en haut, le crée
        if (A7Settings.lockPosition === "top")
        {
            parentDiv.insertBefore(createCommentLockUtil(), parentDiv.firstElementChild);
        }

        // Crée le span d'avancement
        parentDiv.insertBefore(createStateUtil(), parentDiv.firstElementChild);

        // Ajoute l'option de ne voir que les séquences non traduites
        if (page.translatePage)
        {
            parentDiv.appendChild(createUntranslatedOption());
        }
        // Ajoute le bouton pour actualiser la page de sous-titres
        else
        {
            parentDiv.appendChild(createReloadPageOption());
        }
    }

    // Actualise directement l'avancement
    updateStateOfTranslation();

    var headerRow = null;
    if (page.translatePage)
    {
        headerRow = document.getElementById('lista').firstElementChild.firstElementChild.firstElementChild;
    }
    else
    {
        headerRow = document.getElementById('trseqtop');
    }
    headerRow.parentElement.setAttribute('id', 'seqsTbody');

    // Vérifie si la langue secondaire est bien présente (en mode edition)
    var slangMissing = (!page.translatePage) && document.getElementById('slang') === null && headerRow.children.length > page.lock + 6;

    // Création de la colonne lecture
    var playCol    = document.createElement('td');
    var playColDiv = document.createElement('div');
    playCol.className      = 'NewsTitle';
    playColDiv.title       = loc.getToVideoLoc;
    playColDiv.textContent = loc.getToVideoLocTiny;
    playCol.appendChild(playColDiv);
    // Ajoute la nouvelle colonne avant la colonne Text
    headerRow.insertBefore(playCol, headerRow.lastElementChild);

    // Création de la colonne compteur
    var counterCol    = document.createElement('td');
    var counterColDiv = document.createElement('div');
    counterCol.className      = 'NewsTitle';
    counterColDiv.title       = loc.charNumber;
    counterColDiv.textContent = loc.charNumberTiny;
    counterCol.appendChild(counterColDiv);

    // Ajoute la nouvelle colonne avant la colonne Text
    headerRow.insertBefore(counterCol, headerRow.lastElementChild);

    // Renomme les colonnes ou leur ajoute un titre
    headerRow.children[page.lock    ].firstElementChild.title = loc.sequence;
    headerRow.children[page.lock + 1].firstElementChild.title = loc.version;
    headerRow.children[page.lock + 4].firstElementChild.textContent = loc.duration + ' + RS Rating';

    // Retire la colonne langue secondaire si non présente
    if(slangMissing) headerRow.children[page.lock + 5].remove();

    // Récupère le nombre de lignes
    var tableOfLine = headerRow.parentElement;
    var lineNumbers = tableOfLine.childElementCount;

    var currentLine,
        firstEditableLine = null;

    for (var i = 1; i < lineNumbers; i++)
    {
        currentLine = tableOfLine.children[i];

        // Retire la colonne langue secondaire si non présente
        if(slangMissing) currentLine.children[page.lock + 5].remove();

        // Cellules utiles
        var timeCell = currentLine.children[page.lock + 4];
        var textCell = currentLine.lastElementChild;
        
        // on récupère la séquence
        var aLink = currentLine.children[0].querySelector('a');
        var seqNumber = (aLink ? aLink.innerHTML : "");

        // Création de la cellule pour la lecture
        var cellPlay = document.createElement('td');
        cellPlay.setAttribute('class', 'videoPlayButton');
        // on ajoute le bouton/icone
        var videoButton = createA7button();
        videoButton.title = loc.getToVideoLoc;
        videoButton.dataset.seqnumber = seqNumber;
        videoButton.classList.add('videoBarButton');
        videoButton.addEventListener('click', function()
        {
            // on cherche le bon timing
            let timeCell = document.querySelector("#time" + this.dataset.seqnumber);
            if (timeCell) videoBarSetTime(getTimeFromTimeCell(timeCell));
        });
        cellPlay.appendChild(videoButton);
        // Ajoute la cellule dans la ligne
        currentLine.insertBefore(cellPlay, textCell);

        // Création de la cellule pour le nombre de caractères
        var cell = document.createElement('td');
        cell.setAttribute('class', 'counter');

        // Déplace la vidéo, si activé
        if (i == 1 && !A7Settings.disableVideoBar)
        {
            videoBarSetTime(getTimeFromTimeCell(timeCell));
        }

        // Ajoute un tabindex à la cellule et permet le clic
        if (page.translatePage || currentLine.classList.contains('originalText'))
        {
            textCell.setAttribute(
                'tabIndex',
                parseInt(currentLine.children[page.lock].firstElementChild.firstElementChild.innerHTML, 10)
            );

            textCell.addEventListener('keypress', function(e)
            {
                if (e.target.classList.contains('cursorEdit'))
                {
                    if (e.key === " " || e.key === "Enter")
                    {
                        e.preventDefault();
                        e.target.onclick();
                    }
                }
            });

            // Place le focus sur la première ligne cliquable pour la navigation au clavier
            if (firstEditableLine === null) firstEditableLine = textCell;
        }

        // Retire le texte de base indiquant une séquence non traduite
        if (page.translatePage && currentLine.className === 'originalText')
        {
            textCell.firstElementChild.remove();
        }

        // Si la ligne a un texte modifiable
        if (
            currentLine.className === 'originalText' ||
            (page.translatePage && currentLine.className !== 'lockedText')
        )
        {
            // Activation et mise en forme de la cellule
            if (timeCell.getAttribute('onclick') !== null)
            {
                if (!page.translatePage)
                {
                    // timeclick(...) => pre_timeclick(...)
                    timeCell.setAttribute('onclick', 'pre_' + timeCell.getAttribute('onclick'));
                }
                else
                {
                    timeCell.removeAttribute('onclick');
                }
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
        updateCharCountCell(cell, charPerLine);

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
        var rsText      = document.createTextNode('Reading Speed ' + loc.RSLegend + ' ');

        charNum.textContent = '(' + loc.charNumberTiny + ') ';
        rs.textContent      = ' (RS) ';

        if (page.translatePage)
        {
            var multiEdit = lista.children[lista.children.length - 6];
            lista.insertBefore(charNum, multiEdit);
            lista.insertBefore(charNumText, multiEdit);
            lista.insertBefore(rs, multiEdit);
            lista.insertBefore(rsText, multiEdit);
        }
        else
        {
            lista.appendChild(charNum);
            lista.appendChild(charNumText);
            lista.appendChild(rs);
            lista.appendChild(rsText);
        }

        // Rend visible le tableau des séquences maintenant que le chargement est terminé
        var tables = lista.getElementsByTagName('table');
        tables[0].style.setProperty('visibility', 'visible');
        tables[1].style.setProperty('visibility', 'visible');
    }

    // Si la barre utilisateur est activée
    if (!A7Settings.disableUserBar)
    {
        // Charge la liste des utilisateurs dans la userBar
        if (page.translatePage) loadUserBarUsersFromTranslate();
        else                    loadUserBarUsers();
    }

    // Focus sur la première ligne
    if (firstEditableLine) firstEditableLine.focus();
}


/**
* @fn changePage Change de page en fonction de l'url (seul "sequence" est lu pour déterminer la page)
* @param url La nouvelle URL
* @param fromState Origine de la requête (initial [réécriture de l'historique sans rechargement], popstate [pas de changement d'historique], normal)
*/
function changePage(url, fromState = 'normal')
{
    // Garde l'objet page à jour
    page.pageUrl = new URL(url);

    // Mets à jour la checkbox untranslated / most updated
    if (page.translatePage && page.pageUrl.searchParams.has("untranslated"))
    {
        getUntranslatedInput().checked = page.pageUrl.searchParams.get("untranslated") === "1";
    }
    else if (!page.translatePage && page.pageUrl.searchParams.has("mostupdated"))
    {
        getMostUpdatedInput().checked = page.pageUrl.searchParams.get("mostupdated") === "1";
    }

    // Réécrit l'historique au besoin
    if (fromState === 'initial')
    {
        window.history.replaceState(null, null, url);
    }
    else
    {
        // Gère l'historique | nécessaire pour ne pas effacer l'historique en cas de retour
        if (fromState !== 'popstate')
        {
            window.history.pushState(null, null, url);
        }

        // Charge la nouvelle page
        if (page.translatePage)
        {
            // Changement de numéro de séquence ou de mode (untrnslated)
            list('' + (page.pageUrl.searchParams.get('sequence') - 1));
            linesChanged();
        }
        else
        {
            var sourceLangInput = getSlangInput();
            var sourceLang = sourceLangInput === null ? '' :sourceLangInput.value;
            apply_filter(sourceLang === '0' ? '' : sourceLang, getMostUpdatedInput().checked, page.pageUrl.searchParams.get('sequence') - 1);
            linesChanged();
        }
    }
}


/**
* @fn requestHICheck Engage la requête AJAX pour la vérification de version pour malentendant
*/
function requestHICheck()
{
    // Créé la variable de maximum de vérifications
    if (typeof window.A7CurrentHICheck === 'undefined')
    {
        window.A7CurrentHICheck = 0;
    }

    // Récupère les infos
    var episodeUrl = document.getElementById('spanState').parentElement.querySelector('.titulo,big').firstElementChild.href;

    // Envoie la requête
    ajax({
        action:        'GET',
        responseType:  'document',
        url:           episodeUrl,
        readyFunction: post_requestHICheck
    });
}


/**
* @fn post_requestHICheck Récupère les données de l'épisode et vérifie s'il est en HI
* @param {boolean} isError Si une erreur s'est produite
* @param {string} htmlData Objet HTML de l'episode
*/
function post_requestHICheck(isError, episodeHTMLDocument)
{
    // Variable pour ne pas faire des reqêtes à l'infini
    window.A7CurrentHICheck++;

    // Renvoie la requête : en cas d'échec ou de vérification sommaire du contenu de la page reçue infructueuse
    if (isError || !episodeHTMLDocument.getElementById('container95m'))
    {
        if (window.A7CurrentHICheck > A7Settings.maxHICheck)
        {
            displayAjaxError(loc.ajaxErrorOnHI);
            return;
        }

        setTimeout(function()
        {
            requestHICheck();
        }, 250);
        return;
    }

    var img = null;

    // Repère le lien de l'épisode
    var links = episodeHTMLDocument.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++)
    {
        if (page.translatePage)
        {
            if (links[i].href.indexOf(
                '/jointranslation.php?id=' + page.queryInfos.id +
                '&fversion=' + page.queryInfos.fversion +
                '&lang=' + page.queryInfos.lang) !== -1
            )
            {
                // Récupère l'indicateur
                img = links[i].parentElement.previousElementSibling.children[1];
                break;
            }
        }
        else
        {
            // https://www.addic7ed.com/173989&fversion=1&lang=8
            if (links[i].href.indexOf(
                'list.php?id=' + page.queryInfos.id +
                '&fversion=' + page.queryInfos.fversion +
                '&lang=' + page.queryInfos.lang) !== -1
            )
            {
                // Récupère l'indicateur
                img = links[i].parentElement.previousElementSibling.children[1];
                break;
            }
        }
    }

    // Vérifie la présence du hearingImpaired
    if (
        img &&
        img.tagName === 'IMG' &&
        (img.src === 'https://www.addic7ed.com/images/hi.jpg' || img.src === 'http://www.addic7ed.com/images/hi.jpg')
    )
    {
        // Ajoute le logo
        var parentDiv = document.getElementById('spanState').parentElement;

        if (parentDiv.lastElementChild.id !== 'hearingImpaired')
        {
            parentDiv.appendChild(createHIImg());
        }
    }

    console.log('[A7++] ' + loc.HIStatusLoaded);
}
