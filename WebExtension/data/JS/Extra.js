/**
* @file Extra.js
* @brief Script avec de tout en vrac
*/


/**
* @fn changeAppLang Ajoute la fonction manquante pour permettre le changement de la langue d'affichage du site
* @detail Fonction absente du mode view & edit
*/
function changeAppLang()
{
    var comboLang = document.getElementById('comboLang');

    comboLang.removeAttribute('onchange');
    comboLang.addEventListener('change', function(event)
    {
        var lang = event.target.value;
        fetch('/changeapplang.php?applang=' + lang, {credentials: 'include'});
        if(confirm(loc.reloadPageQuestion))
        {
            location.reload();
        }
    }, false);
}
