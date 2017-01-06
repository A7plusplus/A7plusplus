/**
* @file Settings.js
* @brief Script des réglages
*/


// Déclaration de l'objet contenant tous les réglages
var A7Settings = {

    MAJOR_VERSION_INFO : 'A7++ 1.4',
    MINOR_VERSION_INFO : '1.4.0 bêta',

    // Longueur en caractères
    maxPerLineOneLineSETTING : 37,
    maxPerLineSETTING        : 40,
    strictMaxPerLineSETTING  : 43,

    // Temps en secondes
    strictMinDurationSETTING : 0.792,
    minDurationSETTING       : 1.001,

    // Temps en secondes
    stateUpdateInterval   : 60,
    commentUpdateInterval : 30,
    updateTimeout         : 10,

    RSR : {
        // Reading speed, Rating, Short rating
        '-1' : [-Infinity, '* EMPTY SEQUENCE *', 'empty'],
         '0' : [ 0,        '* UNDEFINED *',      'undef'],
         '1' : [ 5,        'TOO SLOW',           'tslow'],
         '2' : [10,        'Slow, acceptable',   'aslow'],
         '3' : [13,        'A bit slow',         'bslow'],
         '4' : [15,        'Good',               'sgood'],
         '5' : [23,        'Perfect',            'perfe'],
         '6' : [27,        'Good',               'fgood'],
         '7' : [31,        'A bit fast',         'bfast'],
         '8' : [35,        'Fast, acceptable',   'afast'],
         '9' : [Infinity,  'TOO FAST',           'tfast']
    }
};
