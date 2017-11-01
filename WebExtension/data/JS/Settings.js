/**
* @file Settings.js
* @brief Script des réglages
*/


// Déclaration de l'objet contenant tous les réglages
var A7Settings = {

    NUMERIC_VERSION_INFO : 200,
    MAJOR_VERSION_INFO   : 'A7++ 2.0',
    MINOR_VERSION_INFO   : '2.0 bêta',

    // Longueur en caractères
    maxPerLineOneLineSETTING : 37,
    maxPerLineSETTING        : 40,
    strictMaxPerLineSETTING  : 43,

    // Temps en secondes
    strictMinDurationSETTING : 0.792,
    minDurationSETTING       : 1.001,

    // Temps en secondes
    stateUpdateInterval   : 120,
    commentUpdateInterval : 30,
    updateTimeout         : 30,

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
    },

    // Facteur de collage de la userBar (0 - 0.1 => 0 - 10%)
    stickyFactor : 0.02
};
