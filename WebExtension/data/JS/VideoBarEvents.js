/**
* @file VideoBarEvents.js
* @brief Script des fonctions liées à la barre vidéo
*/


/**
* @fn videoBarInit Initialise la berre vidéo
*/
function videoBarInit()
{
    var videoBar = getVideoBar();

    // Ajoute le drag and drop
    videoBar.addEventListener('dragstart', videoBarDragStart, false);
    //videoBar.addEventListener('mousedown', videoBarMousedown, false);
    document.body.addEventListener('dragover', videoBarDragOver, false);
    document.body.addEventListener('drop', videoBarDragDrop, false);
    document.body.addEventListener('dragstart', function(event)
    {
        // Stocke une référence sur l'objet glissable
        page.draggedNode = event.target;
    }, false);
}


/**
* @fn updateVideoBarSize Met à jour la position de la barre vidéo
* @param {Object} videoBar Nœud HTML de la videoBar
*/
function updateVideoBarSize(videoBar)
{
    var offsets = videoBar.getBoundingClientRect();
    setVideoBarPosition(offsets.left, offsets.top);
}


/**
* @fn setVideoBarPosition Déplace la barre vidéo
* @param {Integer} left Position X
* @param {Integer} top Position Y
*/
function setVideoBarPosition(left, top)
{
    var videoBar     = getVideoBar(),
        stickyFactor = window.innerHeight * A7Settings.stickyFactor,
        height       = videoBar.offsetHeight,
        width        = videoBar.offsetWidth;

    // Ne dépasse pas
    left = left < 0 + stickyFactor ? 0 : left + width  + stickyFactor > document.body.clientWidth  ? document.body.clientWidth  - width  : left;
    top  = top  < 0 + stickyFactor ? 0 : top  + height + stickyFactor > window.innerHeight         ? window.innerHeight         - height : top;


    // Ajoute les classes
    if (left === 0) videoBar.classList.add('videoBarLeft');
    else            videoBar.classList.remove('videoBarLeft');

    if (top === 0) videoBar.classList.add('videoBarTop');
    else videoBar.classList.remove('videoBarTop');


    // Applique la position
    videoBar.style.left = left + 'px';
    videoBar.style.top  = top  + 'px';

    // Enregistre
    if (localStorage)
    {
        localStorage.setItem('A7ppVideoBarPosition', left + ',' + top);
    }
}


/**
* @fn setVideoBarSize Applique une taille à la barre vidéo
* @param {Integer} height Hauteur
* @param {Integer} width Largeur
* @warning Doit être appelé avec updateVideoBarSize afin de ne pas dépasser le bord de la fenêtre
*/
function setVideoBarSize(height, width)
{
    var videoBar     = getVideoBar(),
        videoBarData = videoBar.lastElementChild,
        videoRatio   = videoBarData.dataset.ratio ? videoBarData.dataset.ratio : 1.777777,
        ignoreWidth  = false;

    // Vérification de la hauteur
    if (height < 180)
    {
        height = 180;
        width  = height * videoRatio;

        ignoreWidth = true;
    }
    else if (height > window.innerHeight / 1.25)
    {
        height = window.innerHeight / 1.25;
        width  = height * videoRatio;

        ignoreWidth = true;
    }

    // Vérification de la largeur
    if (!ignoreWidth && width > window.innerWidth / 1.25)
    {
        width  = window.innerWidth / 1.25;
        height = width / videoRatio;
    }

    //  (80 => barre de selection de vidéo, 4 => pour les border)
    videoBar.style.height = height + 84 + 'px';
    videoBar.style.width  = width  + 'px';

    // Sauvegarde pour la personnalisation
    if (localStorage)
    {
        localStorage.setItem('A7ppVideoBarSize', JSON.stringify(
            {
                heigth: videoBar.style.height,
                width:  videoBar.style.width
            }
        ));
    }
}


/**
* @fn triggerVideoBar Ouvre ou ferme la barre vidéo
* @param {Object} bar Objet HTML de la barre
*/
function triggerVideoBar(bar)
{
    if (A7Settings.useExtSoft)
    {
        // Ouvre ou ferme
        if (bar.classList.contains('videoBarPlay'))
        {
            videoBarResume();
            bar.classList.remove('videoBarPlay');
        }
        else
        {
            videoBarPause();
            bar.classList.add('videoBarPlay');
        }
    }
    else
    {
        // Ouvre ou ferme
        if (bar.classList.contains('videoBarOpened'))
        {
            videoBarPause();
            bar.classList.remove('videoBarOpened');

            bar.dataset.height = bar.style.height;
            bar.dataset.width  = bar.style.width;
            bar.style.height   = null;
            bar.style.width    = null;
        }
        else
        {
            bar.classList.add('videoBarOpened');

            bar.style.height = bar.dataset.height;
            bar.style.width  = bar.dataset.width;
        }

        // Replace la barre
        updateVideoBarSize(bar);
    }
}

function videoBarPlay(file)
{
    var videoBar  = getVideoBar(),
        videoNode = videoBar.lastElementChild.firstElementChild;

    // Vérification de la jouabilité
    var isPlayable = videoNode.canPlayType(file.type);
    if (isPlayable === '')
    {
        videoBar.classList.remove('videoLoaded');
        videoBar.title = loc.unsupportedFormat;

        displayAjaxError(loc.unsupportedFormat, {textOnly: true});
    }
    else
    {
        videoBar.title = loc.videoBar;

        // C'est (à priori) jouable
        var fileURL = URL.createObjectURL(file);
        videoNode.src  = fileURL;
        videoNode.type = file.type;
        videoNode.setAttribute('controls', true);
        videoBar.classList.add('videoLoaded');
    }
}


/**
* @fn videoBarPause Mets en pause la vidéo
*/
function videoBarPause()
{
    if (A7Settings.useExtSoft)
    {
        switch (A7Settings.extSoft)
        {
            case 'VLC':
                ajax({
                    action:        'GET',
                    responseType:  'document',
                    url:           A7Settings.extSoftAddress + '/requests/status.xml?command=pl_forcepause'
                });
                break;

            case 'MPC-HC':
                ajax({
                    action:        'POST',
                    responseType:  'document',
                    url:           A7Settings.extSoftAddress + '/command.html',
                    params:        'wm_command=888'
                });
                break;

            default:
                // Impossible sans bidouiller, donc pas de warning utilisateur
                break;
        }
    }
    else
    {
        var video = getVideoBar().lastElementChild.firstElementChild;
        video.pause();
    }
}


/**
* @fn videoBarResume Reprend la vidéo
*/
function videoBarResume()
{
    switch (A7Settings.extSoft)
    {
        case 'VLC':
            ajax({
                action:        'GET',
                responseType:  'document',
                url:           A7Settings.extSoftAddress + '/requests/status.xml?command=pl_play'
            });
            break;

        case 'MPC-HC':
            ajax({
                action:        'POST',
                responseType:  'document',
                url:           A7Settings.extSoftAddress + '/command.html',
                params:        'wm_command=887'
            });
            break;

        default:
            // Impossible sans bidouiller, donc pas de warning utilisateur
            break;
    }
}


/**
* @fn videoBarSetTime Mets la vidéo à un timing
* @param {Integer} time Temps en secondes depuis le début de la vidéo (<0 : relatif au temps actuel)
*/
function videoBarSetTime(time)
{
    if (A7Settings.useExtSoft)
    {
        // En relatif on force à arrondir à l'entier inférieur
        if (time < 0)
        {
            // Temps relatif
            time--;
        }
        else
        {
            // Temps absolu
            time -= A7Settings.videoDelay;
            if (time < 0) time = 0;
        }

        switch (A7Settings.extSoft)
        {
            case 'VLC':
                ajax({
                    action:        'GET',
                    responseType:  'document',
                    url:           A7Settings.extSoftAddress + '/requests/status.xml?command=seek&val=' + parseInt(time, 10) + 's'
                });
                break;

            case 'MPC-HC':
                // Commande MPC (car on n'a pas de seek relatif avec MPC-HC)
                var command;

                if (time < 0)
                {
                    // 901 => arrière 5s, 899 => arrière 1s
                    command = time <= -2.5 ? 901 : 899;
                }
                else
                {
                    // Calcul le temps en format humain pour MPC
                    var date = new Date(null);
                    date.setSeconds(time);

                    command = '-1&position=' + date.toISOString().substr(11, 8);
                }

                ajax({
                    action:        'POST',
                    responseType:  'document',
                    url:           A7Settings.extSoftAddress + '/command.html',
                    params:        'wm_command=' + command
                });
                break;

            default:
                // Impossible sans bidouiller, donc pas de warning utilisateur
                break;
        }
    }
    else
    {
        var video = getVideoBar().lastElementChild.firstElementChild;

        if (time < 0)
        {
            // Temps relatif
            video.currentTime += time;
        }
        else
        {
            // Temps absolu
            video.currentTime = time - A7Settings.videoDelay;
        }
    }
}


/**
* @fn videoBarDragStart Récupère et enregistre la position initiale
* @param {object} event Objet événement
*/
function videoBarDragStart(event)
{
    page.draggedNode = event.target;

    // Désactive le glisser-déposer si l'origine n'est pas le haut de la barre
    var videoBar     = getVideoBar(),
        videoBarData = videoBar.lastElementChild;

    if (!videoBar.contains(page.draggedNode) || videoBarData.contains(page.draggedNode)) return false;

    var style = window.getComputedStyle(event.target, null);
    event.dataTransfer.setData('text/plain',
        (parseInt(style.getPropertyValue('left'), 10) - event.clientX) +
        ',' +
        (parseInt(style.getPropertyValue('top'), 10) - event.clientY)
    );
}


/**
* @fn videoBarDragOver Empêche l'action par défaut
* @param {object} event Objet événement
*/
function videoBarDragOver(event)
{
    // Désactive le glisser-déposer si l'origine n'est pas le haut de la barre
    var videoBar     = getVideoBar(),
        videoBarData = videoBar.lastElementChild;

    if (!videoBar.contains(page.draggedNode) || videoBarData.contains(page.draggedNode)) return false;

    // Récupère les positions
    var offset  = event.dataTransfer.getData('text/plain').split(',');

    setVideoBarPosition(
        event.clientX + parseInt(offset[0], 10),
        event.clientY + parseInt(offset[1], 10)
    );

    event.preventDefault();
    return false;
}


/**
* @fn videoBarDragDrop Déplace la barre vidéo
* @param {object} event Objet événement
*/
function videoBarDragDrop(event)
{
    // Désactive le glisser-déposer si l'origine n'est pas le haut de la barre
    var videoBar     = getVideoBar(),
        videoBarData = videoBar.lastElementChild;

    if (!videoBar.contains(page.draggedNode) || videoBarData.contains(page.draggedNode)) return false;
    page.draggedNode = null;

    // Récupère les positions
    var offset  = event.dataTransfer.getData('text/plain').split(',');

    setVideoBarPosition(
        event.clientX + parseInt(offset[0], 10),
        event.clientY + parseInt(offset[1], 10)
    );

    // Empêche l'action par défaut
    event.preventDefault();
    return false;
}


/**
* @fn videoBarMouseDown Initialise le redimensionnement de la vidéo
* @param {Object} e Objet d'événement
*/
function videoBarMouseDown(e)
{
    e.preventDefault();
    window.addEventListener('mousemove', videoBarMouseMove, false);
    window.addEventListener('mouseup',   videoBarMouseUp,   false);
}


/**
* @fn videoBarMouseMove Ajuste le redimensionnement de la vidéo
* @param {Object} event Objet d'événement
*/
function videoBarMouseMove(event)
{
    var videoBar     = getVideoBar(),
        videoBarData = videoBar.lastElementChild;

    // Récupère la taille
    var style  = window.getComputedStyle(videoBar, null),
        height = event.clientY - parseInt(style.getPropertyValue('top'), 10) - 80;

    setVideoBarSize(height, videoBarData.dataset.ratio * height);
}


/**
* @fn videoBarMouseUp Finalise le redimensionnement de la vidéo
* @param {Object} e Objet d'événement
*/
function videoBarMouseUp(e)
{
    // Replace le tout dans la fenêtre
    updateVideoBarSize(getVideoBar());

    window.removeEventListener('mousemove', videoBarMouseMove, false);
    window.removeEventListener('mouseup',   videoBarMouseUp,   false);
}
