////////////////////////////////////////////////////////////////////////////////////
//////////                   MARKOV CHAINS HANDLING                  ///////////////
////////////////////////////////////////////////////////////////////////////////////

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

var markovDiv = d3.select("div#markovGeneratorView"); // Use to identify the script in the HTML document

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

////////////////////////////////////////////////////////////////////////////////////
//////////                   PARAMETER HANDLING                      ///////////////
////////////////////////////////////////////////////////////////////////////////////
parseJsonAndUpdate();
function parseJsonAndUpdate() {
    var ioParamsStr = document.getElementById("ioParameters").value;
    if (ioParamsStr.length > 0) TerrainParams = JSON.parse(ioParamsStr);
    document.getElementById("ioParameters").innerHTML = JSON.stringify(TerrainParams, null, 2);
}

////////////////////////////////////////////////////////////////////////////////////
//////////                TERRAIN GENERATION HANDLING                ///////////////
////////////////////////////////////////////////////////////////////////////////////
// Functions for terrain generation handling
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

// START OF THE ACTUAL CODE

var TerrainDiv = d3.select("div#TerrainView"); // Use to identify the script in the HTML document
//This contains all the info on the current map, along with what is needed for rendering
var terrainRender = null;
// The SVG that will be drawn on for visual representation
var TerrainSVG = TerrainDiv.insert("svg")
        .attr("height", 750)
        .attr("width", 750)
        .attr("viewBox", "-500 -500 1000 1000");

// The different rendering terrainOptions
var terrainOptions = {
    mapViewer: true,
    cities: true,
    drawTrigger: 'None'
};

function TerrainDrawColoring() {
    terrainOptions.drawTrigger = 'Coloring';
    TerrainDraw();
}

function TerrainDraw() {
    var selected_view = d3.select('select').property('value'); // background coloring

    if (terrainRender==null) { // Special case for the very first map creation
        terrainRender = doTerrain(TerrainSVG, TerrainParams);
        terrainOptions.drawTrigger = 'None';
    }

    // clear renderer
    if( (terrainOptions.drawTrigger == 'Coloring' && selected_view != 'No coloring') || terrainOptions.drawTrigger == 'None') {// If we change the background, all the rest need to be put again on the foreground
        TerrainSVG.selectAll('path').remove();
        TerrainSVG.selectAll('line.slope').remove();
        TerrainSVG.selectAll('circle.city').remove();
        TerrainSVG.selectAll('text').remove();
    } else if (terrainOptions.drawTrigger == 'Coloring'){
        TerrainSVG.selectAll('path.field').remove();
        TerrainSVG.selectAll('path.field_shading').remove();
    }
    if(terrainOptions.drawTrigger == 'Terrain') {// We need to redraw the terrain, background
        TerrainSVG.selectAll('path.river').remove();
        TerrainSVG.selectAll('path.river_background').remove();
        TerrainSVG.selectAll('path.coast').remove();
        TerrainSVG.selectAll('line.slope').remove();
        if(terrainOptions.mapViewer) { // If we are drawing the terrain then we need to udpate the cities to be on the foreground
            TerrainSVG.selectAll('path.border').remove();
            TerrainSVG.selectAll('circle.city').remove();
            TerrainSVG.selectAll('text').remove();
        }
    }
    if(terrainOptions.drawTrigger == 'Cities') {// We need to redraw the cities only
        TerrainSVG.selectAll('path.border').remove();
        TerrainSVG.selectAll('circle.city').remove();
        TerrainSVG.selectAll('text').remove();
    }

    // render
    if(terrainOptions.drawTrigger == 'Coloring' || terrainOptions.drawTrigger == 'None') {
        if      (selected_view == 'Heightmap')  {visualizeVoronoi(TerrainSVG, terrainRender.h, 0);}
        else if (selected_view == 'Slope')  {visualizeVoronoi(TerrainSVG, terrainRender.slope, 0, 10);}
        else if (selected_view == 'Erosion')    {visualizeVoronoi(TerrainSVG, erosionRate(terrainRender.h));}
        else if (selected_view == 'City Score') {visualizeVoronoi(TerrainSVG, terrainRender.score, d3.max(terrainRender.score) - 0.5);}
        else if (selected_view == 'Regions')    {visualizeVoronoi(TerrainSVG, terrainRender.terr);}
        else if (selected_view == 'Coloring')   {visualizeTerrain(TerrainSVG, terrainRender);}
    }

    if (terrainOptions.mapViewer && terrainOptions.drawTrigger != 'Cities') {
        drawPaths(TerrainSVG, 'coast', terrainRender.coasts);
        visualizeSlopes(TerrainSVG, terrainRender);
        if (selected_view == 'Coloring') drawPaths(TerrainSVG, 'river_background',  terrainRender.rivers, '#000000', 3);
        drawPaths(TerrainSVG, 'river', terrainRender.rivers, selected_view == 'Coloring' ? '#00b6dd': '#000000');
    }

    if (terrainOptions.cities && 
           !( (!terrainOptions.mapViewer && terrainOptions.drawTrigger == 'Terrain') || (terrainOptions.drawTrigger == 'Coloring' && selected_view == 'No coloring') ) ) {
        drawPaths(TerrainSVG, 'border', terrainRender.borders);
        visualizeCities(TerrainSVG, terrainRender);
        drawLabels(TerrainSVG, terrainRender);
    }
}

var ViewCombobox = TerrainDiv.append("select")
.on('change',TerrainDrawColoring)
.selectAll('option')
    .data(["No coloring", "Heightmap", "Slope", "Erosion", "Regions", "City Score", "Coloring"]).enter()
    .append('option')
        .text(function (d) { return d; });

TerrainDiv.append("button")
    .text("Generate new Map")
    .on("click", function () {
        terrainRender = doTerrain(TerrainSVG, TerrainParams);
        terrainOptions.drawTrigger = 'None';
        TerrainDraw();
    });

var TerrainBut = TerrainDiv.append("button")
    .text(terrainOptions.mapViewer ? "Hide Terrain" : "Show Terrain")
    .on("click", function () {
        terrainOptions.mapViewer = !terrainOptions.mapViewer;
        TerrainBut.text(terrainOptions.mapViewer ? "Hide Terrain" : "Show Terrain");
        terrainOptions.drawTrigger = 'Terrain';
        TerrainDraw();
    });

var CitiesBut = TerrainDiv.append("button")
    .text(terrainOptions.cities ? "Hide Cities" : "Show Cities")
    .on("click", function () {
        terrainOptions.cities = !terrainOptions.cities;
        CitiesBut.text(terrainOptions.cities ? "Hide Cities" : "Show Cities");
        terrainOptions.drawTrigger = 'Cities';
        TerrainDraw();
    });

TerrainDiv.append("button")
    .text("Export Map")
    .on("click", function () {
        //TerrainSVG.selectAll("path.field").remove();
        saveSvg(TerrainSVG.node(), 'test.svg')
    });