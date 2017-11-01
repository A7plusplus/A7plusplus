/**
* @file UpdateEvents.js
* @brief Script des évenements des mises à jour en tout genre
*/


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
        bigIndicator.children[bigIndicator.childElementCount - 2].value = A7Settings.RSR[index][1];

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


/**
* @fn updateTimeCellClass Met à jour la classe de la cellule de temps
* @param {!Object} timeCell Cellule sur laquelle la classe doit être changée
* @param {number} rsIndex Index voulu du tableau RSR
* @param {number} duration Durée de la séquence
*/
function updateTimeCellClass(timeCell, rsIndex, duration)
{
    timeCell.className = timeCell.className.substr(0, timeCell.className.length - 5) + A7Settings.RSR[rsIndex][2];

    timeCell.title = loc.duration + ' : ' + duration.toFixed(3) + " s\nRS Rating : " + A7Settings.RSR[rsIndex][1];
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

            if (counts[0] <= A7Settings.maxPerLineOneLineSETTING)
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
                if (counts[i] <= A7Settings.maxPerLineSETTING)
                {
                    color = 'ccc_green';
                }
                else if (counts[i] <= A7Settings.strictMaxPerLineSETTING)
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


    if (duration < A7Settings.strictMinDurationSETTING)
        indicatorLegend.style.color = 'red';

    else if (duration < A7Settings.minDurationSETTING)
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

    // Mise en forme
    spanState.setAttribute('class', 'stateRefreshing');

    // Récupère les informations
    var subInfo = page.queryInfos,
        url = '/translate_getstate.php?id=' + subInfo.id +
              '&fversion='                  + subInfo.fversion +
              '&langto='                    + subInfo.lang;

    // Envoie la requête
    ajax('GET', url, '', post_updateStateOfTranslation, null, null, null);
}


/**
* @fn post_updateStateOfTranslation Traite l'AJAX de l'état d'avancement
* @param {String} HTMLString Réponse de la requête AJAX
* @param {Boolean} isError Status de réussite de la requête AJAX
*/
function post_updateStateOfTranslation(HTMLString, isError)
{
    // On attend le prochain rapatriement des données
    if(isError) return;

    // Actualise l'avancement
    var spanState = document.getElementById('spanState');
    spanState.textContent = HTMLString;

    // Récupère l'id du setInterval
    var timeIntervalId = page.stateIntervalId;

    if (HTMLString.indexOf('%') === -1)
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
            page.stateIntervalId = setInterval(updateStateOfTranslation, A7Settings.stateUpdateInterval * 1000);
        }

        spanState.setAttribute('class', 'stateNotCompleted');
    }
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
    var savedValue = 0;
    if(localStorage)
    {
        savedValue = parseFloat(localStorage.getItem(storage));
    }
    

    // La valeur est valide
    if(!isNaN(savedValue) && savedValue * window.innerHeight >= lowLimit && savedValue <= highLimit)
    {
        var size = Math.round(savedValue * window.innerHeight);

        elem.style.height = size + 'px';
        elem.style.bottom = -size + 'px';
        document.getElementById('lista').style.marginBottom = size + 10 + 'px';
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
