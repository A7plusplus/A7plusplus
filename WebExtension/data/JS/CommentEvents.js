/**
* @file CommentEvents.js
* @brief Script des événements de la chatbox
*/


/**
* @fn refreshComments Actualise les commentaires
*/
function refreshComments()
{
    // Récupération du bouton d'actualisation
    var updateButton = getCommentCell().children[1].lastElementChild;

    // Si on est en cours d'actualisation, ne fait rien
    if (updateButton.getAttribute('loading') !== null)
        return;

    // Désactivation du bouton de rafraîchissement
    updateButton.setAttribute('loading', true);

    // Récupération des infos
    var subInfo = page.queryInfos;

    // Construit et envoi la requête
    ajax({
        action:        'POST',
        responseType:  'document',
        url:           '/translate_comments.php?id=' + subInfo.id,
        params:        '&fversion=' + subInfo.fversion + '&langto=' + subInfo.lang,
        readyFunction: post_commentRefresh
    });
}


/**
* @fn post_commentRefresh Traite les données reçues par AJAX
* @param {boolean} isError Si une erreur s'est produite
* @param {string} htmlData Objet HTML de la réponse
*/
function post_commentRefresh(isError, htmlData)
{
    // Récupère les informations utiles
    var commentsSection = getCommentCell();
    var updateButton    = commentsSection.children[1].lastElementChild;
    var commentList     = commentsSection.lastElementChild.firstElementChild;

    // Réactive le bouton (délai pour laisser à l'indicateur le temps de faire au moins un tour)
    setTimeout(function()
    {
        updateButton.removeAttribute('loading');
    }, 750);

    // Enclenche un compte à rebours pour réactualiser les commentaires après un temps donné
    page.refreshCommentsTimeoutId = setTimeout(refreshComments, A7Settings.commentUpdateInterval * 1000);

    if (isError)
    {
        // Indique une erreur
        displayAjaxError(loc.comments);
        commentList.setAttribute('class', 'ajaxError');
        commentList.setAttribute('title', loc.ajaxErrorOccurred);
        return;
    }

    // S'il y a eu une erreur, l'enlève
    if (commentList.getAttribute('class') === 'ajaxError')
    {
        commentList.removeAttribute('class');
        commentList.removeAttribute('title');
    }

    // Récupère de body de la réponse
    var responseBody = htmlData.body;

    // Récupère la liste
    var listOfNewComments   = responseBody.firstElementChild.firstElementChild.firstElementChild.children;
    var listOfNewCommLength = (listOfNewComments.length - 5) / 2;

    // Si ce n'est pas l'initialisation
    if (page.commentNumber !== -1)
    {
        // Et qu'il y a de nouveaux commentaires
        if ((listOfNewCommLength - page.commentNumber) > 0)
        {
            // Récupère le nombre de commantaires
            var commentCounter = updateButton.previousElementSibling.lastElementChild;
            var oldCommentNumber = isNaN(parseInt(commentCounter.textContent, 10)) ? 0 : parseInt(commentCounter.textContent, 10);

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
    resetHTMLObject(commentList);

    // Variable temporaire
    var temp;

    // Repeuple les commentaires du tableau
    for (var i = 2, j = 1; i < listOfNewCommLength + 2; i++, j++)
    {
        // Retire l'image
        listOfNewComments[i].firstElementChild.firstElementChild.remove();

        // Ajoute l'utilisateur à la barre (sur base des nouveaux commentaires)
        if (!A7Settings.disableUserBar && j > page.commentNumber)
        {
            temp = listOfNewComments[i].firstElementChild.firstElementChild;

            addUserToUserBar(
                temp.innerText,
                temp.href.substr(temp.href.lastIndexOf('/') + 1)
            );
        }

        // Ajoute le commentaire
        commentList.appendChild(listOfNewComments[i]);
    }

    // Met à jour les informations de la page
    page.commentNumber = listOfNewCommLength;

    // Réadapte la vue utilisateur
    if (isUserOnCommentBottom)
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
* @fn post_sendComment Traite les données reçues par AJAX
* @param {boolean} isError Si une erreur s'est produite
* @param {string} htmlData Objet HTML des commentaires
*/
function post_sendComment(isError, htmlData)
{
    // Récupère la textArea
    var textArea = getCommentCell().lastElementChild.lastElementChild.firstElementChild;

    // Réactive la textArea
    textArea.removeAttribute('disabled');

    // Si le commentaire a bien été envoyé
    if (!isError)
    {
        // Efface le contenu de la textArea
        textArea.value = '';
        page.commentNumber += 1;
    }

    post_commentRefresh(isError, htmlData);
}


/**
* @fn sendComment Envoie le commentaire présent en textArea
*/
function sendComment()
{
    // Récupère les informations de la page
    var subInfo = page.queryInfos;

    // Récupération de la textArea
    var textArea = getCommentCell().lastElementChild.lastElementChild.firstElementChild;

    // Si vide, n'envoie pas
    if (textArea.value === '') return;

    // Désactive la textArea le temps de l'envoi
    textArea.setAttribute('disabled', true);

    // Construit et lance la requête
    var params = 'id='          + subInfo.id +
                 '&fversion='   + subInfo.fversion +
                 '&langto='     + subInfo.lang +
                 '&newcomment=' + encodeURIComponent(textArea.value);

    // Envoie la requête
    ajax({
        action:        'POST',
        responseType:  'document',
        url:           '/translate_comments.php',
        params:        params,
        readyFunction: post_sendComment
    });
}


/**
* @fn goToComments Descend dans la liste de commentaires pour afficher les derniers
*/
function goToComments()
{
    // Récupère la popup et le tableau
    var popup = getCommentCell().children[1].children[1].lastElementChild,
        table = getCommentCell().lastElementChild.firstElementChild;

    // Enlève le contenu de la popup
    removeCommentPopup();

    // Descend aux derniers commentaires du tableau
    table.scrollTop = table.scrollHeight;
}


/**
* @fn pinComments Ajoute ou enlève la classe du pin
*/
function pinComments()
{
    var commentsSection = getCommentCell();

    if (commentsSection.className && commentsSection.classList.contains('comment-pined'))
    {
        commentsSection.classList.remove('comment-pined');
        if (localStorage)
        {
            localStorage.setItem('A7ppCommentWindowPined', false);
        }
    }
    else
    {
        commentsSection.classList.add('comment-pined');
        if (localStorage)
        {
            localStorage.setItem('A7ppCommentWindowPined', true);
        }
    }
}


/**
* @fn pinCommentsTemp Ajoute ou enlève la classe du pin (en ne bypassant pas le choix utilisateur)
*/
function pinCommentsTemp()
{
    var commentsSection = getCommentCell();

    // Si pinné
    if (commentsSection.className && commentsSection.classList.contains('comment-pined'))
    {
        // Si c'est temporaire
        if (commentsSection.classList.contains('comment-pined-tmp'))
        {
            commentsSection.classList.remove('comment-pined-tmp');
            commentsSection.classList.remove('comment-pined');
        }
    }
    // Non pinné
    else
    {
        commentsSection.classList.add('comment-pined-tmp');
        commentsSection.classList.add('comment-pined');
    }
}


/**
* @fn lockCommentAsClosed Empêche les commentaires de s'ouvrir
*/
function lockComment()
{
    var commentsSection = getCommentCell();

    if (commentsSection.className && commentsSection.classList.contains('lockdown'))
    {
        commentsSection.classList.remove('lockdown');
        if (localStorage)
        {
            localStorage.setItem('A7ppCommentWindowLockedDown', false);
        }
    }
    else
    {
        commentsSection.classList.add('lockdown');
        if (localStorage)
        {
            localStorage.setItem('A7ppCommentWindowLockedDown', true);
        }
    }
}


/**
* @fn resizeBarMouseDown Initialise le redimensionnement des commentaires
* @param {Object} e Objet d'événement
*/
function resizeBarMouseDown(e)
{
    e.preventDefault();
    window.addEventListener('mousemove', windowMouseMove, false);
    window.addEventListener('mouseup', windowMouseUp, false);
    getCommentCell().classList.add('resizing');
}


/**
* @fn windowMouseMove Ajuste le redimensionnement des commentaires
* @param {Object} e Objet d'événement
*/
function windowMouseMove(e)
{
    var height = window.innerHeight - e.clientY,
        commentsSection = getCommentCell();

    if (height < 180)
    {
        height = 180;
    }
    else if (height > window.innerHeight / 1.25)
    {
        height = window.innerHeight / 1.25;
    }

    commentsSection.style.height =  height + 'px';
    commentsSection.style.bottom = -height + 'px';
    document.getElementById('lista').style.marginBottom = height + 10 + 'px';

    // Sauvegarde pour la personnalisation
    if (localStorage)
    {
        localStorage.setItem('A7ppCommentWindowSize', height / window.innerHeight);
    }

}


/**
* @fn windowMouseUp Finalise le redimensionnement des commentaires
* @param {Object} e Objet d'événement
*/
function windowMouseUp(e)
{
    window.removeEventListener('mousemove', windowMouseMove, false);
    window.removeEventListener('mouseup', windowMouseUp, false);
    getCommentCell().classList.remove("resizing");
}


/**
* @fn commentsTableScroll Teste si on est tout en bas du tableau des commentaires
* @param {Object} e Objet d'événement
*/
function commentsTableScroll(e)
{
    var commentsSection = getCommentCell();

    var table = commentsSection.lastElementChild.firstElementChild;

    if (!page.tempDisablePopupRemoval && table.scrollHeight === table.scrollTop + table.clientHeight)
    {
        commentsSection.children[1].children[1].lastElementChild.textContent = '';
    }

    // Réactive la suppression
    page.tempDisablePopupRemoval = false;
}
