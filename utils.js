////////////////////////////////////////////////////////////////////////////////////
//////////                     DETECT DEV CONFIG                     ///////////////
////////////////////////////////////////////////////////////////////////////////////
// This function can detect if the script is run locally or on a server
// This is used to simplify debug and porting

function initialize () {
    switch(window.location.protocol) {
       case 'file:':
         //local file
        seededRand = seededRandom(1234567);
        if (typeof TerrainParams !== 'undefined') TerrainParams.npts = 2048;
         break;
       default: 
         // we are on a server
         seededRand = seededRandom();
    }
}

////////////////////////////////////////////////////////////////////////////////////
//////////                   RANDOM NUMBER HANDLING                  ///////////////
////////////////////////////////////////////////////////////////////////////////////
// Javascript does not natively support seeding in Math.random()
// This solution implements such seeding (as taken from https://gist.github.com/blixt/f17b47c62508be59987b)
// The speed is on par with Marth.random
// Robustness could be improved by returning mb32( hash(seed++) )() each time instead of the mb32 object. It would then take twice as long to excecute

function seededRandom (seed = (new Date()).getTime()) {
    console.log('Seed is: '+seed);

    // Mulberry32, a fast high quality PRNG: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
    var mb32=s=>t=>(s=s+1831565813|0,t=Math.imul(s^s>>>15,1|s),t=t+Math.imul(t^t>>>7,61|t)^t,(t^t>>>14)>>>0)/2**32;
    // Better 32-bit integer hash function: https://burtleburtle.net/bob/hash/integer.html
    var hash=n=>(n=61^n^n>>>16,n+=n<<3,n=Math.imul(n,668265261),n^=n>>>15)>>>0;

    // could be make more robust by varying the seed each time
    return mb32( hash(seed) );
}

function randRangeInt(lo, hi) {
    if (hi == undefined) {
        hi = lo;
        lo = 0;
    }
    return Math.floor(seededRand() * (hi - lo)) + lo;
}

function randRangeFloat(lo, hi) {
    if (hi == undefined) {
        hi = lo;
        lo = 0;
    }
    return lo + seededRand() * (hi - lo);
}

var rnorm = (function () {
    var z2 = null;
    function rnorm() {
        if (z2 != null) {
            var tmp = z2;
            z2 = null;
            return tmp;
        }

        /* original code. Purpose not understood.
        var x1 = 0;
        var x2 = 0;
        var w = 2.0;
        while (w >= 1) {
            x1 = randRangeFloat(-1, 1);
            x2 = randRangeFloat(-1, 1);
            w = x1 * x1 + x2 * x2;
        }
        w = Math.sqrt(-2 * Math.log(w) / w); //*/
        
        //* new normalization factor.
        var x1 = randRangeFloat(-1, 1);
        var x2 = randRangeFloat(-1, 1);
        var w =  Math.sqrt(x1 * x1 + x2 * x2); //*/

        z2 = x2 * w;
        return x1 * w;
    }
    return rnorm;
})();

function randomVector(scale) {
    return [scale * rnorm(), scale * rnorm()];
}

var seededRand;

////////////////////////////////////////////////////////////////////////////////////
//////////                       DYNAMIC INCLUDE                     ///////////////
////////////////////////////////////////////////////////////////////////////////////
// In order to have cleaner base HTML and clearer JS
// Taken from the internet at http://sametmax.com/include-require-import-en-javascript/

var include = function(url, callback){
 
    /* on crée une balise<script type="text/javascript"></script> */
    var script = document.createElement('script');
    script.type = 'text/javascript';
 
    /* On fait pointer la balise sur le script qu'on veut charger
       avec en prime un timestamp pour éviter les problèmes de cache
    */
 
    script.src = url + '?' + (new Date().getTime());
 
    /* On dit d'exécuter cette fonction une fois que le script est chargé */
    if (callback) {
        script.onreadystatechange = callback;
        script.onload = script.onreadystatechange;
    }
 
    /* On rajoute la balise script dans le head, ce qui démarre le téléchargement */
    document.getElementsByTagName('head')[0].appendChild(script);
}

////////////////////////////////////////////////////////////////////////////////////
//////////                        SVG HANDLING                       ///////////////
////////////////////////////////////////////////////////////////////////////////////
// In order to have cleaner base HTML and clearer JS

function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}