/**
* @file Settings.js
* @brief Script des réglages
*/


var MAJOR_VERSION_INFO = 'A7++ 1.4',
    MINOR_VERSION_INFO = '1.4.0 bêta';

var RSR = [];

// (reading speed, 'rating', 'short rating')
RSR[-1] = [-Infinity, '* EMPTY SEQUENCE *', 'empty'];
RSR[0]  = [ 0,        '* UNDEFINED *',      'undef'];
RSR[1]  = [ 5,        'TOO SLOW',           'tslow'];
RSR[2]  = [10,        'Slow, acceptable',   'aslow'];
RSR[3]  = [13,        'A bit slow',         'bslow'];
RSR[4]  = [15,        'Good',               'sgood'];
RSR[5]  = [23,        'Perfect',            'perfe'];
RSR[6]  = [27,        'Good',               'fgood'];
RSR[7]  = [31,        'A bit fast',         'bfast'];
RSR[8]  = [35,        'Fast, acceptable',   'afast'];
RSR[9]  = [Infinity,  'TOO FAST',           'tfast'];

// Temps en secondes et longueur en caractères
var maxPerLineOneLineSETTING = 37,
    maxPerLineSETTING        = 40,
    strictMaxPerLineSETTING  = 43,
    strictMinDurationSETTING = 0.792,
    minDurationSETTING       = 1.001;

// Temps en secondes
var stateUpdateInterval   = 60,
    commentUpdateInterval = 30,
    updateTimeout         = 10;
