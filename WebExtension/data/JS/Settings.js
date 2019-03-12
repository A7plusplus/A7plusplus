/**
* @file Settings.js
* @brief Script des réglages
*/


// Déclaration de l'objet contenant tous les réglages
var A7Settings = {

    MAJOR_VERSION_INFO   : 'A7++ 2.3.3',
    MINOR_VERSION_INFO   : '2.3.3 stable',

    // Longueur en caractères
    maxPerLineOneLineSETTING : 37,
    maxPerLineSETTING        : 40,
    strictMaxPerLineSETTING  : 43,

    // Temps en secondes
    strictMinDurationSETTING : 0.792,
    minDurationSETTING       : 1.001,

    // Temps en secondes
    stateUpdateInterval      : 240,
    commentUpdateInterval    : 45,
    userBarUpdateIntervalMin : 300,
    updateTimeout            : 30,
    popupTimeout             : 15,
    videoDelay               : 1.75,

    RSR: {
        // Reading speed, Rating, Short rating
        '-1': {ratio: -Infinity, description: '* EMPTY SEQUENCE *', class: 'empty'},
         '0': {ratio:  0,        description: '* UNDEFINED *',      class: 'undef'},
         '1': {ratio:  5,        description: 'TOO SLOW',           class: 'tslow'},
         '2': {ratio: 10,        description: 'Slow, acceptable',   class: 'aslow'},
         '3': {ratio: 13,        description: 'A bit slow',         class: 'bslow'},
         '4': {ratio: 15,        description: 'Good',               class: 'sgood'},
         '5': {ratio: 23,        description: 'Perfect',            class: 'perfe'},
         '6': {ratio: 27,        description: 'Good',               class: 'fgood'},
         '7': {ratio: 31,        description: 'A bit fast',         class: 'bfast'},
         '8': {ratio: 35,        description: 'Fast, acceptable',   class: 'afast'},
         '9': {ratio: Infinity,  description: 'TOO FAST',           class: 'tfast'}
    },

    // Facteur de collage de la userBar (0 - 0.1 => 0 - 10%)
    stickyFactor: 0.02,

    // Position du cadenas (top/bottom)
    lockPosition: "bottom",

    // Désactivation de la barre utilisateur / de vidéo
    disableUserBar:  false,
    disableVideoBar: false,

    // Barre vidéo
    useExtSoft: false,
    extSoft:    'VLC',
    extSoftAddress: 'http://localhost:8080',

    // Nombre maximal de tentative de récupération de l'indicateur HI
    maxHICheck: 4
};
