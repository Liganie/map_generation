////////////////////////////////////////////////////////////////////////////////////
//////////                     DETECT DEV CONFIG                     ///////////////
////////////////////////////////////////////////////////////////////////////////////
// This function can detect if the script is run locally or on a server
// This is used to simplify debug and porting

function initialize() {
    // initialize the seed
    switch(window.location.protocol) {
       case 'file:': 
         //local file
        seededRand = seededRandom(12345678);
        if (typeof terrainParams !== 'undefined') {
            terrainParams.engine.baseGrid.numberPoints = 2048;
            terrainParams.features.mountains.density = 100;
            terrainParams.features.forests.density = 2000;
        }
         break;
       default: 
         // we are on a server
         seededRand = seededRandom();
    }
    try {
        terrainParams.engine.seed.currentSeed = currentSeed;
    } catch (e) {}
}

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

////////////////////////////////////////////////////////////////////////////////////
//////////                       STRING HANDLING                     ///////////////
////////////////////////////////////////////////////////////////////////////////////
// This is used to check if a string is in a given array


function strListExclude(strs, strList) {
    // any string in the second are removed from the first
    var result = [];
    for(var i in strs) {
        if(!strListIncludes(strs[i], strList)) result.push(strs[i])
    }
    return result;
}

function strListIncludes(str, strList) {
    // the string is in the list
    for(var i=0; i<strList.length; i++) {
        if(strList[i].includes(str)) return true;
    }
    return false;
}

function strListIncludesAny(strs, strList) {
    // any string of the first list are in the second
    for(var i=0; i<strs.length; i++) {
        if(strListIncludes(strs[i], strList)) return true;
    }
    return false;
}

function strListIncludesAll(strs, strList) {
    // all strings of the first list are in the second
    for(var i=0; i<strs.length; i++) {
        if(!strListIncludes(strs[i], strList)) return false;
    }
    return true;
}

function strListInList(strList, substrList) {
    if(substrList=="string") substrList = [substrList];
    for(var key in strList) {
        var result = true;
        for(var substr in substrList) {
            if(!strList[key].includes(substrList[substr])) result = false;
        }
        if(result) return true;
    }
    return false;
}

function structureValuesDiff(struct1, struct2, prefix) {
    //only compare the values of a given structure
    if(typeof prefix == 'undefined') prefix =  "";
    if(prefix.length!=0) prefix = prefix+".";

    var diff = [];
    for(var key in struct1) {
        if(typeof(struct1[key])=="object") {
            var child =  structureValuesDiff(struct1[key], struct2[key], prefix+key)
            for (var e in child) {
                diff.push(child[e])
            }
        }
        else if(struct1[key]!=struct2[key]) {
            //console.log(prefix+key+": "+struct1[key], struct2[key]); // For Debug purpose
            diff.push(prefix+key);
        }
    }
    return diff;
}

function toHexString(color) {
    color = d3.color(color);
    return '#'+('0'+color.r.toString(16)).slice(-2)+('0'+color.g.toString(16)).slice(-2)+('0'+color.b.toString(16)).slice(-2);
}

////////////////////////////////////////////////////////////////////////////////////
//////////                   RANDOM NUMBER HANDLING                  ///////////////
////////////////////////////////////////////////////////////////////////////////////
// Javascript does not natively support seeding in Math.random()
// This solution implements such seeding (as taken from https://gist.github.com/blixt/f17b47c62508be59987b)
// The speed is on par with Marth.random
// Robustness could be improved by returning mb32( hash(seed++) )() each time instead of the mb32 object. It would then take twice as long to excecute

var currentSeed = 0;
function seededRandom(seed = (new Date()).getTime()) {
    console.log('Current seed is: '+seed);

    // Mulberry32, a fast high quality PRNG: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
    var mb32=s=>t=>(s=s+1831565813|0,t=Math.imul(s^s>>>15,1|s),t=t+Math.imul(t^t>>>7,61|t)^t,(t^t>>>14)>>>0)/2**32;
    // Better 32-bit integer hash function: https://burtleburtle.net/bob/hash/integer.html
    var hash=n=>(n=61^n^n>>>16,n+=n<<3,n=Math.imul(n,668265261),n^=n>>>15)>>>0;

    // could be make more robust by varying the seed each time
    currentSeed = seed;
    return mb32( hash(seed) );
}

function randRangeInt(lo, hi) {
    if (hi == undefined) {
        hi = lo;
        lo = 0;
    }
    return Math.floor(seededRand() * (hi - lo + 1)) + lo;
}

function randRangeFloat(lo, hi) {
    if (hi == undefined) {
        hi = lo;
        lo = 0;
    }
    return lo + seededRand() * (hi - lo);
}

function randRangeTris(tris) {
    var v1 = [tris[1][0] - tris[0][0], tris[1][1] - tris[0][1]];
    var v2 = [tris[2][0] - tris[0][0], tris[2][1] - tris[0][1]];
    var range = seededRand();
    var x = seededRand();
    return [tris[0][0] + range*x*v1[0] + range*(1-x)*v2[0],
            tris[0][1] + range*x*v1[1] + range*(1-x)*v2[1] ];
}

function randMap(map) {
    var sum = 0;
    for(key in map) {
        sum += map[key];
    }
    if(sum<=0) return null;
    var r = seededRand();
    for(key in map) {
        r -= map[key]/sum;
        if(r<0) return key;
    }
    return key; // This shall never happen
}

function randTable(table, keywords, filter) {
    //Table is assumed to be [key, descriptors, weight]

    // items that do not have any of the keywords are left out
    if(keywords) {
        if(typeof(keywords)=="string") {
            keywords = keywords.split(' ');
        }
        table = table.slice(); //we need to copy the table to splice
        for(var i=table.length-1; i>=0; i--) {
            if(!strListIncludesAny(keywords, table[i][1].split(" "))) table.splice(i,1);
        }
    }

    // items that do not have all of the filter parameters are left out
    if(filter) {
        if(typeof(filter)=="string") {
            filter = filter.split(' ');
        }
        table = table.slice(); //we need to copy the table to splice
        for(var i=table.length-1; i>=0; i--) {
            if(!strListIncludesAll(filter, table[i][1].split(" "))) table.splice(i,1);
        }
    }

    // Random selection
    var sum = 0;
    for(key in table) {
        sum += table[key][2];
    }
    if(sum<=0) return '';
    var r = seededRand();
    for(key in table) {
        r -= table[key][2]/sum;
        if(r<0) return table[key][0];
    }
    return table[key][0]; // This shall never happen
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

function colorVariation(color, level) {
    var scolor = randomColor({hue: color, count: 1});
    var gradient = d3.scaleLinear()
      .domain([0, level])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(color), d3.rgb(scolor)]);
    return toHexString(gradient(1));
}

var seededRand;

////////////////////////////////////////////////////////////////////////////////////
//////////                    RANDOM COLOR HANDLING                  ///////////////
////////////////////////////////////////////////////////////////////////////////////
// taken from: https://randomcolor.lllllllllllllllll.com/
// slighting modified to use seeded random

! function(r, e) {
    if ("object" == typeof exports) {
        var n = e();
        "object" == typeof module && module && module.exports && (exports = module.exports = n), exports.randomColor = n
    } else "function" == typeof define && define.amd ? define([], e) : r.randomColor = e()
}(this, function() {
    var o = null,
        s = {};
    r("monochrome", null, [
        [0, 0],
        [100, 0]
    ]), r("red", [-26, 18], [
        [20, 100],
        [30, 92],
        [40, 89],
        [50, 85],
        [60, 78],
        [70, 70],
        [80, 60],
        [90, 55],
        [100, 50]
    ]), r("orange", [19, 46], [
        [20, 100],
        [30, 93],
        [40, 88],
        [50, 86],
        [60, 85],
        [70, 70],
        [100, 70]
    ]), r("yellow", [47, 62], [
        [25, 100],
        [40, 94],
        [50, 89],
        [60, 86],
        [70, 84],
        [80, 82],
        [90, 80],
        [100, 75]
    ]), r("green", [63, 178], [
        [30, 100],
        [40, 90],
        [50, 85],
        [60, 81],
        [70, 74],
        [80, 64],
        [90, 50],
        [100, 40]
    ]), r("blue", [179, 257], [
        [20, 100],
        [30, 86],
        [40, 80],
        [50, 74],
        [60, 60],
        [70, 52],
        [80, 44],
        [90, 39],
        [100, 35]
    ]), r("purple", [258, 282], [
        [20, 100],
        [30, 87],
        [40, 79],
        [50, 70],
        [60, 65],
        [70, 59],
        [80, 52],
        [90, 45],
        [100, 42]
    ]), r("pink", [283, 334], [
        [20, 100],
        [30, 90],
        [40, 86],
        [60, 84],
        [80, 80],
        [90, 75],
        [100, 73]
    ]);
    var i = [],
        f = function(r) {
            if (void 0 !== (r = r || {}).seed && null !== r.seed && r.seed === parseInt(r.seed, 10)) o = r.seed;
            else if ("string" == typeof r.seed) o = function(r) {
                for (var e = 0, n = 0; n !== r.length && !(e >= Number.MAX_SAFE_INTEGER); n++) e += r.charCodeAt(n);
                return e
            }(r.seed);
            else {
                if (void 0 !== r.seed && null !== r.seed) throw new TypeError("The seed value must be an integer or string");
                o = null
            }
            var e, n;
            if (null === r.count || void 0 === r.count) return function(r, e) {
                switch (e.format) {
                    case "hsvArray":
                        return r;
                    case "hslArray":
                        return v(r);
                    case "hsl":
                        var n = v(r);
                        return "hsl(" + n[0] + ", " + n[1] + "%, " + n[2] + "%)";
                    case "hsla":
                        var t = v(r),
                            a = e.alpha || randRangeFloat(0,1);
                        return "hsla(" + t[0] + ", " + t[1] + "%, " + t[2] + "%, " + a + ")";
                    case "rgbArray":
                        return h(r);
                    case "rgb":
                        var u = h(r);
                        return "rgb(" + u.join(", ") + ")";
                    case "rgba":
                        var o = h(r),
                            a = e.alpha || randRangeFloat(0,1);
                        return "rgba(" + o.join(", ") + ", " + a + ")";
                    default:
                        return function(r) {
                            var e = h(r);

                            function n(r) {
                                var e = r.toString(16);
                                return 1 == e.length ? "0" + e : e
                            }
                            return "#" + n(e[0]) + n(e[1]) + n(e[2])
                        }(r)
                }
            }([e = function(r) {
                {
                    if (0 < i.length) {
                        var e = function(r) {
                                if (isNaN(r)) {
                                    if ("string" == typeof r)
                                        if (s[r]) {
                                            var e = s[r];
                                            if (e.hueRange) return e.hueRange
                                        } else if (r.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
                                        var n = g(r)[0];
                                        return l(n).hueRange
                                    }
                                } else {
                                    var t = parseInt(r);
                                    if (t < 360 && 0 < t) return l(r).hueRange
                                }
                                return [0, 360]
                            }(r.hue),
                            n = c(e),
                            t = (e[1] - e[0]) / i.length,
                            a = parseInt((n - e[0]) / t);
                        !0 === i[a] ? a = (a + 2) % i.length : i[a] = !0;
                        var u = (e[0] + a * t) % 359,
                            o = (e[0] + (a + 1) * t) % 359;
                        return (n = c(e = [u, o])) < 0 && (n = 360 + n), n
                    }
                    var e = function(r) {
                        if ("number" == typeof parseInt(r)) {
                            var e = parseInt(r);
                            if (e < 360 && 0 < e) return [e, e]
                        }
                        if ("string" == typeof r)
                            if (s[r]) {
                                var n = s[r];
                                if (n.hueRange) return n.hueRange
                            } else if (r.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
                            var t = g(r)[0];
                            return [t, t]
                        }
                        return [0, 360]
                    }(r.hue);
                    return (n = c(e)) < 0 && (n = 360 + n), n
                }
            }(r), n = function(r, e) {
                if ("monochrome" === e.hue) return 0;
                if ("random" === e.luminosity) return c([0, 100]);
                var n = (u = r, l(u).saturationRange),
                    t = n[0],
                    a = n[1];
                var u;
                switch (e.luminosity) {
                    case "bright":
                        t = 55;
                        break;
                    case "dark":
                        t = a - 10;
                        break;
                    case "light":
                        a = 55
                }
                return c([t, a])
            }(e, r), function(r, e, n) {
                var t = function(r, e) {
                        for (var n = l(r).lowerBounds, t = 0; t < n.length - 1; t++) {
                            var a = n[t][0],
                                u = n[t][1],
                                o = n[t + 1][0],
                                s = n[t + 1][1];
                            if (a <= e && e <= o) {
                                var i = (s - u) / (o - a),
                                    f = u - i * a;
                                return i * e + f
                            }
                        }
                        return 0
                    }(r, e),
                    a = 100;
                switch (n.luminosity) {
                    case "dark":
                        a = t + 20;
                        break;
                    case "light":
                        t = (a + t) / 2;
                        break;
                    case "random":
                        t = 0, a = 100
                }
                return c([t, a])
            }(e, n, r)], r);
            for (var t = r.count, a = [], u = 0; u < r.count; u++) i.push(!1);
            for (r.count = null; t > a.length;) o && r.seed && (r.seed += 1), a.push(f(r));
            return r.count = t, a
        };

    function l(r) {
        for (var e in 334 <= r && r <= 360 && (r -= 360), s) {
            var n = s[e];
            if (n.hueRange && r >= n.hueRange[0] && r <= n.hueRange[1]) return s[e]
        }
        return "Color not found"
    }

    function c(r) {
        if (null === o) {
            var e = randRangeFloat(0,1);
            return e += .618033988749895, e %= 1, Math.floor(r[0] + e * (r[1] + 1 - r[0]))
        }
        var n = r[1] || 1,
            t = r[0] || 0,
            a = (o = (9301 * o + 49297) % 233280) / 233280;
        return Math.floor(t + a * (n - t))
    }

    function r(r, e, n) {
        var t = n[0][0],
            a = n[n.length - 1][0],
            u = n[n.length - 1][1],
            o = n[0][1];
        s[r] = {
            hueRange: e,
            lowerBounds: n,
            saturationRange: [t, a],
            brightnessRange: [u, o]
        }
    }

    function h(r) {
        var e = r[0];
        0 === e && (e = 1), 360 === e && (e = 359), e /= 360;
        var n = r[1] / 100,
            t = r[2] / 100,
            a = Math.floor(6 * e),
            u = 6 * e - a,
            o = t * (1 - n),
            s = t * (1 - u * n),
            i = t * (1 - (1 - u) * n),
            f = 256,
            l = 256,
            c = 256;
        switch (a) {
            case 0:
                f = t, l = i, c = o;
                break;
            case 1:
                f = s, l = t, c = o;
                break;
            case 2:
                f = o, l = t, c = i;
                break;
            case 3:
                f = o, l = s, c = t;
                break;
            case 4:
                f = i, l = o, c = t;
                break;
            case 5:
                f = t, l = o, c = s
        }
        return [Math.floor(255 * f), Math.floor(255 * l), Math.floor(255 * c)]
    }

    function g(r) {
        r = 3 === (r = r.replace(/^#/, "")).length ? r.replace(/(.)/g, "$1$1") : r;
        var e = parseInt(r.substr(0, 2), 16) / 255,
            n = parseInt(r.substr(2, 2), 16) / 255,
            t = parseInt(r.substr(4, 2), 16) / 255,
            a = Math.max(e, n, t),
            u = a - Math.min(e, n, t),
            o = a ? u / a : 0;
        switch (a) {
            case e:
                return [(n - t) / u % 6 * 60 || 0, o, a];
            case n:
                return [60 * ((t - e) / u + 2) || 0, o, a];
            case t:
                return [60 * ((e - n) / u + 4) || 0, o, a]
        }
    }

    function v(r) {
        var e = r[0],
            n = r[1] / 100,
            t = r[2] / 100,
            a = (2 - n) * t;
        return [e, Math.round(n * t / (a < 1 ? a : 2 - a) * 1e4) / 100, a / 2 * 100]
    }
    return f
});
