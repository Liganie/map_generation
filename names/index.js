include('names/language.js');
include('names/markov.js', startMarkovGUI);

////////////////////////////////////////////////////////////////////////////////////
//////////                       TEST GUI INPUTS                     ///////////////
////////////////////////////////////////////////////////////////////////////////////

function mewoUpdate() {
    var language = makeRandomLanguage();
    var res = "";
    for(var i=0;i<25;i++) {
        res += " " + makeName(language, 'city');
    }
    document.getElementById("oMarkov").innerHTML = res;
}

var markovOrder;
var markovPrior;
var markovInput;

function markovParamUpdate() {
    var selectedValue = d3.selectAll('select').filter(function(d,i) {return i==0;}).property('value');
    if (selectedOrder = "order") {markovrder = 2;}
    else {markovOrder = parseInt(selectedValue);}
    selectedValue = d3.selectAll('select').filter(function(d,i) {return i==1;}).property('value');
    if (markovPrior = "prior") {markovPrior = 0.01;}
    else {markovPrior = parseFlat(selectedValue);}
    var selectedValue = d3.selectAll('select').filter(function(d,i) {return i==2;}).property('value');
    markovInput = markovData[selectedValue];
}

function markovUpdate() {
    markovParamUpdate();
    var t_markov = new Markov(markovInput, markovOrder, markovPrior);
    document.getElementById("oMarkov").innerHTML = t_markov.generate(25);
}

function startMarkovGUI() {
	var markovDiv = d3.select("div#nameGeneratorView"); // Use to identify the script in the HTML document

	var markovOrderCombobox = markovDiv.append("select")
	.selectAll('option')
	    .data(["order", "1", "2", "3", "4", "5"]).enter()
	    .append('option')
	        .text(function (d) { return d; });

	var markovPriorCombobox = markovDiv.append("select")
	.selectAll('option')
	    .data(["prior", "0", "0.01", "0.02", "0.05", "0.1"]).enter()
	    .append('option')
	        .text(function (d) { return d; });

	var markovDataCombobox = markovDiv.append("select")
	.selectAll('option')
	    .data(Object.keys(markovData)).enter()
	    .append('option')
	        .text(function (d) { return d; });
}

////////////////////////////////////////////////////////////////////////////////////
//////////                   NAME GENERATOR SELECTION                ///////////////
////////////////////////////////////////////////////////////////////////////////////

function getNameGenerator(params) {
    var generator = makeRandomLanguage();
    switch (params.engine.nameGenerator.type) {
        case "Markov":
            generator = new Markov(params.engine.nameGenerator.markovParameters.dictionnary,
                                   params.engine.nameGenerator.markovParameters.order,
                                   params.engine.nameGenerator.markovParameters.prior);
            break;
        case "Mewo":
            generator = makeRandomLanguage();
            break;
    }
    // reinitialize the structure to generate new names
    terrainParams.features.cities.cityNames = [];
    terrainParams.features.cities.regionNames = [];
    return generator;
}

function getName(params, lang, key) {
    var generator = params.engine.nameGenerator.type;

    if (generator == "Markov") {
        return lang.generate(1, params.engine.nameGenerator.markovParameters.numberLetters[0], params.engine.nameGenerator.markovParameters.numberLetters[1]);
    }
    else{
        return makeName(lang, 'city');
    }
}


////////////////////////////////////////////////////////////////////////////////////
//////////                         NAME DISPLAY                      ///////////////
////////////////////////////////////////////////////////////////////////////////////

function drawLabels(svg, render) {
    var params = render.params;
    var h = render.h;
    var terr = render.terr;
    var cities = render.cities;
    var nterrs = render.params.engine.population.numberTerritories;
    var avoids = [render.rivers, render.coasts, render.borders];
    var lang = render.dictionnary;
    var citylabels = [];

    if(params.features.cities.cityNames.length == 0) {
        for (var i = 0; i < cities.length; i++) {
            terrainParams.features.cities.cityNames.push( getName(params, lang, 'city') );
        }
    }
    var cityNames = terrainParams.features.cities.cityNames;
    if(params.features.cities.regionNames.length == 0) {
       for (var i = 0; i < nterrs; i++) {
            terrainParams.features.cities.regionNames.push( getName(params, lang, 'region') );
        }
    }
    var regionNames = terrainParams.features.cities.regionNames;

    function penalty(label) {
        var pen = 0;
        if (label.x0 < -0.45 * h.mesh.extent.width) pen += 100;
        if (label.x1 > 0.45 * h.mesh.extent.width) pen += 100;
        if (label.y0 < -0.45 * h.mesh.extent.height) pen += 100;
        if (label.y1 > 0.45 * h.mesh.extent.height) pen += 100;
        for (var i = 0; i < citylabels.length; i++) {
            var olabel = citylabels[i];
            if (label.x0 < olabel.x1 && label.x1 > olabel.x0 &&
                label.y0 < olabel.y1 && label.y1 > olabel.y0) {
                pen += 100;
            }
        }

        for (var i = 0; i < cities.length; i++) {
            var c = h.mesh.vxs[cities[i]];
            if (label.x0 < c[0] && label.x1 > c[0] && label.y0 < c[1] && label.y1 > c[1]) {
                pen += 100;
            }
        }
        for (var i = 0; i < avoids.length; i++) {
            var avoid = avoids[i];
            for (var j = 0; j < avoid.length; j++) {
                var avpath = avoid[j];
                for (var k = 0; k < avpath.length; k++) {
                    var pt = avpath[k];
                    if (pt[0] > label.x0 && pt[0] < label.x1 && pt[1] > label.y0 && pt[1] < label.y1) {
                        pen++;
                    }
                }
            }
        }
        return pen;
    }
    for (var i = 0; i < cities.length; i++) {
        var x = h.mesh.vxs[cities[i]][0];
        var y = h.mesh.vxs[cities[i]][1];
        var text = cityNames[i];
        var size = i < nterrs ? params.renderer.fontSizes.city : params.renderer.fontSizes.town;
        var sx = 0.65 * size/1000 * text.length;
        var sy = size/1000;
        var posslabels = [
        {
            x: x + 0.8 * sy,
            y: y + 0.3 * sy,
            align: 'start',
            x0: x + 0.7 * sy,
            y0: y - 0.6 * sy,
            x1: x + 0.7 * sy + sx,
            y1: y + 0.6 * sy
        },
        {
            x: x - 0.8 * sy,
            y: y + 0.3 * sy,
            align: 'end',
            x0: x - 0.9 * sy - sx,
            y0: y - 0.7 * sy,
            x1: x - 0.9 * sy,
            y1: y + 0.7 * sy
        },
        {
            x: x,
            y: y - 0.8 * sy,
            align: 'middle',
            x0: x - sx/2,
            y0: y - 1.9*sy,
            x1: x + sx/2,
            y1: y - 0.7 * sy
        },
        {
            x: x,
            y: y + 1.2 * sy,
            align: 'middle',
            x0: x - sx/2,
            y0: y + 0.1*sy,
            x1: x + sx/2,
            y1: y + 1.3*sy
        }
        ];
        var label = posslabels[d3.scan(posslabels, function (a, b) {return penalty(a) - penalty(b)})];
        label.text = text;
        label.size = size;
        citylabels.push(label);
    }

    var points = [];
    var texts = [];
    var font_sizes = [];
    var alignements = [];
    for(var c=0; c<citylabels.length; c++) {
        points[c] = [citylabels[c].x, citylabels[c].y];
        texts[c] = citylabels[c].text;
        font_sizes[c] = citylabels[c].size;
        alignements[c] = citylabels[c].align;
    }
    
    drawText(svg, 'city', points, texts, font_sizes, alignements);

    var reglabels = [];
    for (var i = 0; i < nterrs; i++) {
        var city = cities[i];
        var text = regionNames[i];
        var sy = params.renderer.fontSizes.region / 1000;
        var sx = 0.6 * text.length * sy;
        var lc = terrCenter(h, terr, city, true);
        var oc = terrCenter(h, terr, city, false);
        var best = 0;
        var bestscore = -999999;
        for (var j = 0; j < h.length; j++) {
            var score = 0;
            var v = h.mesh.vxs[j];
            score -= 3000 * Math.sqrt((v[0] - lc[0]) * (v[0] - lc[0]) + (v[1] - lc[1]) * (v[1] - lc[1]));
            score -= 1000 * Math.sqrt((v[0] - oc[0]) * (v[0] - oc[0]) + (v[1] - oc[1]) * (v[1] - oc[1]));
            if (terr[j] != city) score -= 3000;
            for (var k = 0; k < cities.length; k++) {
                var u = h.mesh.vxs[cities[k]];
                if (Math.abs(v[0] - u[0]) < sx && 
                    Math.abs(v[1] - sy/2 - u[1]) < sy) {
                    score -= k < nterrs ? 4000 : 500;
                }
                if (v[0] - sx/2 < citylabels[k].x1 &&
                    v[0] + sx/2 > citylabels[k].x0 &&
                    v[1] - sy < citylabels[k].y1 &&
                    v[1] > citylabels[k].y0) {
                    score -= 5000;
                }
            }
            for (var k = 0; k < reglabels.length; k++) {
                var label = reglabels[k];
                if (v[0] - sx/2 < label.x + label.width/2 &&
                    v[0] + sx/2 > label.x - label.width/2 &&
                    v[1] - sy < label.y &&
                    v[1] > label.y - label.size) {
                    score -= 20000;
                }
            }
            if (h[j] <= 0) score -= 500;
            if (v[0] + sx/2 > 0.5 * h.mesh.extent.width) score -= 50000;
            if (v[0] - sx/2 < -0.5 * h.mesh.extent.width) score -= 50000;
            if (v[1] > 0.5 * h.mesh.extent.height) score -= 50000;
            if (v[1] - sy < -0.5 * h.mesh.extent.height) score -= 50000;
            if (score > bestscore) {
                bestscore = score;
                best = j;
            }
        }
        reglabels.push({
            text: text, 
            x: h.mesh.vxs[best][0], 
            y: h.mesh.vxs[best][1], 
            size:sy, 
            width:sx
        });
    }

    points = [];
    texts = [];
    font_sizes = [];
    for(var c=0; c<reglabels.length; c++) {
        points[c] = [reglabels[c].x, reglabels[c].y];
        texts[c] = reglabels[c].text;
        font_sizes[c] = 1000*reglabels[c].size;
    }
    drawText(svg, 'region', points, texts, font_sizes, 'middle', ['font-variant', 'small-caps', 'stroke-width', 10]);
}