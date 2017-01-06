/**
* @file InitFunctions.js
* @brief Script des fonctions utilisées lors de l'initialisation
*/


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


/**
* @fn linesChanged Met en cache les lignes et ajoute un évènement sur les liens
*/
function linesChanged()
{
    // Attend le chargement des séquences
    if (document.getElementById('lista').innerHTML === '<img src="/images/loader.gif">')
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