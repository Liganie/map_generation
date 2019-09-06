include('names/language.js');
include('names/markov.js', startMarkovGUI);
include('names/display.js');

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