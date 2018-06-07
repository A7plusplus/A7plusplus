/**
* @file VideoBarEvents.js
* @brief Script des fonctions liées à la barre vidéo
*/


/**
* @fn videoBarInit Initialise la berre vidéo
*/
function videoBarInit()
{
    var videoBar = document.getElementById("videoBar");

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
    setVideoBarSize(offsets.left, offsets.top);
}


/**
* @fn setVideoBarSize Déplace la barre vidéo
* @param {Integer} left Position X
* @param {Integer} top Position Y
*/
function setVideoBarSize(left, top)
{
    var videoBar = document.getElementById("videoBar");

    // Calcule les proportions
    var stickyFactor  = window.innerHeight * A7Settings.stickyFactor,
        width  = videoBar.offsetWidth  < videoBar.children[1].offsetWidth  ? videoBar.children[1].offsetWidth  : videoBar.offsetWidth,
        height = videoBar.offsetHeight < videoBar.children[1].offsetHeight ? videoBar.children[1].offsetHeight : videoBar.offsetHeight;

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
* @fn triggerVideoBar Ouvre ou ferme la barre vidéo
* @param {Object} bar Objet HTML de la barre
*/
function triggerVideoBar(bar)
{
    if (A7Settings.useVLC)
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
        }
        else
        {
            bar.classList.add('videoBarOpened');
        }

        // Replace la barre
        var offsets = bar.getBoundingClientRect();
        setVideoBarSize(offsets.left, offsets.top);
    }
}

function videoBarPlay(file)
{
    var videoBar  = document.getElementById("videoBar"),
        videoNode = videoBar.lastElementChild.firstElementChild;

    // Vérification de la jouabilité
    var isPlayable = videoNode.canPlayType(file.type);
    if (isPlayable === '')
    {
        videoBar.classList.remove('videoLoaded');
        videoBar.classList.add('unsupportedFormat');
        videoBar.lastElementChild.title = loc.unsupportedFormat;

        displayAjaxError(loc.unsupportedFormat, {textOnly: true});
    }
    else
    {
        videoBar.classList.remove('unsupportedFormat');
        videoBar.lastElementChild.title = '';

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
    if (A7Settings.useVLC)
    {
        ajax({
            action:        'GET',
            responseType:  'document',
            url:           A7Settings.VLCaddress + '/requests/status.xml?command=pl_forcepause',
        });
    }
    else
    {
        var video = document.getElementById("videoBar").lastElementChild.firstElementChild;
        video.pause();
    }
}


/**
* @fn videoBarResume Reprend la vidéo
*/
function videoBarResume()
{
    ajax({
        action:        'GET',
        responseType:  'document',
        url:           A7Settings.VLCaddress + '/requests/status.xml?command=pl_play',
    });
}


/**
* @fn videoBarSetTime Mets la vidéo à un timing
* @param {Integer} time Temps en secondes depuis le début de la vidéo (<0 : relatif au temps actuel)
*/
function videoBarSetTime(time)
{
    if (A7Settings.useVLC)
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

        ajax({
            action:        'GET',
            responseType:  'document',
            url:           A7Settings.VLCaddress + '/requests/status.xml?command=seek&val=' + parseInt(time, 10) + 's',
        });
    }
    else
    {
        var video = document.getElementById("videoBar").lastElementChild.firstElementChild;

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
    var videoBar     = document.getElementById("videoBar"),
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
    var videoBar     = document.getElementById("videoBar"),
        videoBarData = videoBar.lastElementChild;

    if (!videoBar.contains(page.draggedNode) || videoBarData.contains(page.draggedNode)) return false;

    // Récupère les positions
    var offset  = event.dataTransfer.getData('text/plain').split(',');

    setVideoBarSize(
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
    var videoBar     = document.getElementById("videoBar"),
        videoBarData = videoBar.lastElementChild;

    if (!videoBar.contains(page.draggedNode) || videoBarData.contains(page.draggedNode)) return false;
    page.draggedNode = null;

    // Récupère les positions
    var offset  = event.dataTransfer.getData('text/plain').split(',');

    setVideoBarSize(
        event.clientX + parseInt(offset[0], 10),
        event.clientY + parseInt(offset[1], 10)
    );

    // Empêche l'action par défaut
    event.preventDefault();
    return false;
}
