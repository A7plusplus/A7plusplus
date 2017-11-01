/**
* @file CommentEvents.js
* @brief Script des évenements de la chatbox
*/


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

    // Construit et lance la requête
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
    page.refreshCommentsTimeoutId = setTimeout(refreshComments, A7Settings.commentUpdateInterval * 1000);

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

    if(commentsSection.className && commentsSection.classList.contains('comment-pined'))
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
* @fn lockCommentAsClosed Empêche les commentaires de s'ouvrir
*/
function lockComment()
{
    var commentsSection = document.getElementById('commentsSection');

    if(commentsSection.className && commentsSection.classList.contains('lockdown'))
    {
        commentsSection.classList.remove('lockdown');
        if(localStorage)
        {
            localStorage.setItem('A7ppCommentWindowLockedDown', false);
        }
    }
    else
    {
        commentsSection.classList.add('lockdown');
        if(localStorage)
        {
            localStorage.setItem('A7ppCommentWindowLockedDown', true);
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
    document.getElementById('lista').style.marginBottom = height + 10 + 'px';

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
