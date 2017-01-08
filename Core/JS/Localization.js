/**
* @file Localization.js
* @brief Script des traductions
*/


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
                            'Pour recharger la page maintenant avec la nouvelle langue, cliquer sur OK.\nSinon cliquer sur Annuler.',
        reportUser        : "Signaler l'utilisateur",
        getUserInfo       : "Informations de l'utilisateur",
        sendUserPM        : 'Envoyer un message privé',
        iframeNotSupported: 'Votre navigateur ne supporte pas les iFrame'

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
                            'In order to reload the page now with new language, click on OK.\nElse click on Cancel.',
        reportUser        : 'Report user',
        getUserInfo       : 'User informations',
        sendUserPM        : 'Send a private message',
        iframeNotSupported: 'Your browser does not support iframes'

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
