initialize(); //to ensure debug is possible

////////////////////////////////////////////////////////////////////////////////////
//////////                   PARAMETER HANDLING                      ///////////////
////////////////////////////////////////////////////////////////////////////////////
// The following functions are all realted to the parameter view
function enableCollapsible() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
}

paramsEditor = null;
function initializeJsoneditor() {
    var container = document.getElementById('jsoneditor');
    var options = {
      mode: 'form',
      modes: ['code', 'form'], // allowed modes
      onError: function (err) {
        //alert(err.toString());
      }
    };
    paramsEditor = new JSONEditor(container, options, terrainParams);
    paramsEditor.expandAll();
}

function updateJsoneditor() {
    terrainParams.engine.seed.currentSeed = currentSeed;
    paramsEditor.setText(JSON.stringify(terrainParams, null, 2));
    paramsEditor.expandAll();
}

var changedParams = [];
function parseJsonAndUpdate() {
    var editorParams = JSON.parse(paramsEditor.getText());
    changedParams = structureValuesDiff(terrainParams, editorParams );
    terrainParams = editorParams;

    if(terrainRender!==null) {
        terrainRender.params = terrainParams;
        terrainOptions.drawTrigger = 'None';
        TerrainDraw();
    }

    // special case to regenerate the names if the name generator changes
    if(strListInList(changedParams,"engine.nameGenerator")) {
        terrainRender.dictionnary = getNameGenerator(terrainParams);
        currentDictionnary = terrainParams.engine.nameGenerator.markovParameters.dictionnary;
        currentDictionnaryGenerator = terrainParams.engine.nameGenerator.type;
        generateNames(terrainRender);
        updateJsoneditor();
        if(terrainOptions.cities) {
            terrainOptions.drawTrigger = 'Cities';
            TerrainDraw();
        }
    }

    // Calculation and rendering only done when needed
    if(strListInList(changedParams,["generated.territories","influence"])) {
        var selected_view = d3.select('select').property('value'); // background coloring
        generateTerritories(terrainRender);
        if(selected_view=='Regions' || terrainOptions.cities) {
            if(terrainOptions.cities) terrainOptions.drawTrigger = 'Cities';
            if(selected_view=='Regions') terrainOptions.drawTrigger = 'Coloring';
            TerrainDraw();
        }
    }
}

function saveJson() {
    var jsonParams = JSON.parse(paramsEditor.getText());
    var jsonData = JSON.stringify(jsonParams, null, 2);
    var jsonBlob = new Blob([jsonData], {type:"application/json: text/plain"});
    var jsonUrl = URL.createObjectURL(jsonBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = jsonUrl;
    downloadLink.download = "parameters";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function loadJson() {

    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {        
       var file = e.target.files[0]; // getting a hold of the file reference
       // setting up the reader
       var reader = new FileReader();
       reader.readAsText(file,'UTF-8');
       // here we tell the reader what to do when it's done reading...
       reader.onload = readerEvent => {
          var content = readerEvent.target.result; // this is the content!
          paramsEditor.setText(content);
          paramsEditor.expandAll();
       }

    }

    input.click();
}

////////////////////////////////////////////////////////////////////////////////////
//////////                TERRAIN GENERATION HANDLING                ///////////////
////////////////////////////////////////////////////////////////////////////////////
// Functions for terrain generation handling

var TerrainDiv = d3.select("div#TerrainView"); // Use to identify the script in the HTML document
//This contains all the info on the current map, along with what is needed for rendering
var terrainRender = null;
// The SVG that will be drawn on for visual representation
var TerrainSVG = TerrainDiv.insert("svg")
        .attr("height", 750)
        .attr("width", 750)
        .attr("viewBox", "-500 -500 1000 1000")
        .style('float', 'right')
        .style('background-color', 'white');

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
        terrainRender = generate(TerrainSVG, terrainParams);
        terrainOptions.drawTrigger = 'None';
        updateJsoneditor();
    }

    // clear renderer
    if( (terrainOptions.drawTrigger == 'Coloring' && selected_view != 'No coloring') || terrainOptions.drawTrigger == 'None') {// If we change the background, all the rest need to be put again on the foreground
        TerrainSVG.selectAll('path').remove();
        TerrainSVG.selectAll('path.slope').remove();
        TerrainSVG.selectAll('circle.city').remove();
        TerrainSVG.selectAll('text').remove();
    } else if (terrainOptions.drawTrigger == 'Coloring'){
        TerrainSVG.selectAll('path.field').remove();
        TerrainSVG.selectAll('path.river').remove(); // in case we are going from custom rivers back to normal rivers
    }
    if(terrainOptions.drawTrigger == 'Terrain') {// We need to redraw the terrain, background
        TerrainSVG.selectAll('path.river').remove();
        TerrainSVG.selectAll('path.coast').remove();
        TerrainSVG.selectAll('path.slope').remove();
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
        else if (selected_view == 'Slope')      {visualizeVoronoi(TerrainSVG, terrainRender.slope, 0, 10);}
        else if (selected_view == 'Flux')       {visualizeVoronoi(TerrainSVG, terrainRender.flux, 0, 0.01);}
        else if (selected_view == 'Erosion')    {visualizeVoronoi(TerrainSVG, erosionRate(terrainRender.h));}
        else if (selected_view == 'Biomes')     {visualizeVoronoi(TerrainSVG, terrainRender.biomes);}
        else if (selected_view == 'City Score') {visualizeVoronoi(TerrainSVG, terrainRender.score, d3.max(terrainRender.score) - 0.5);}
        else if (selected_view == 'Regions')    {visualizeRegions(TerrainSVG, terrainRender);}
        else if (selected_view == 'Coloring')   {visualizeTerrain(TerrainSVG, terrainRender, terrainParams);}
        else if (selected_view == 'Map')        {visualizeAsMap  (TerrainSVG, terrainRender, terrainParams);}
    }

    if(terrainOptions.drawTrigger == 'Coloring' && selected_view == 'No coloring') { // Only need to redraw the rivers when we are remving the background to put the black and white map
        drawCurvedPaths(TerrainSVG, 'river', terrainRender.rivers, 'black', 2, 0);
    }
    else if (terrainOptions.mapViewer && terrainOptions.drawTrigger != 'Cities') {
        drawCurvedPaths(TerrainSVG, 'coast', terrainRender.coasts, 'black', 4);
        if ( selected_view != 'Map')visualizeSlopes(TerrainSVG, terrainRender);
        if (selected_view == 'Coloring' || selected_view == 'Map') {visualizeRivers(TerrainSVG, terrainRender);}
        else {drawCurvedPaths(TerrainSVG, 'river', terrainRender.rivers, 'black', 2, 0);}
    }

    if( (terrainOptions.drawTrigger == 'Coloring' || terrainOptions.drawTrigger == 'None') && selected_view == 'Map')
        visualizeFeatures(TerrainSVG, terrainRender, terrainParams);

    if (terrainOptions.cities && 
           !( !terrainOptions.mapViewer && terrainOptions.drawTrigger == 'Terrain') ) {
        drawCurvedPathsExtras(TerrainSVG, 'border', terrainRender.borders, 'black', 5, ['stroke-linecap', 'butt',
                                                                                        'stroke-dasharray', [4,4],
                                                                                        'stroke-alignment', 'inner',
                                                                                        'stroke-position', 'inner',
                                                                                        'stroke-location', 'inner']);
        if (!(selected_view == 'Map' && terrainParams.features.cities.doCities)) visualizeCities(TerrainSVG, terrainRender);
        if(!(terrainOptions.drawTrigger == 'Coloring' && selected_view == 'No coloring')) drawLabels(TerrainSVG, terrainRender);
        updateJsoneditor(); // in case a new dictionnary is applied, we save the names
    }
}

var ViewCombobox = TerrainDiv.append("select")
.on('change',TerrainDrawColoring)
.selectAll('option')
    .data(["No coloring", "Heightmap", "Slope", "Flux", "Erosion", "Biomes", "Regions", "City Score", "Coloring", "Map"]).enter()
    .append('option')
        .text(function (d) { return d; });

TerrainDiv.append("button")
    .text("Generate new Map")
    .on("click", function () {
        if (terrainRender != null) seededRand = !terrainParams.engine.seed.changeOnGeneration ? seededRandom(currentSeed): seededRandom();
        terrainRender = generate(TerrainSVG, terrainParams);
        terrainOptions.drawTrigger = 'None';
        TerrainDraw();
        updateJsoneditor();
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


function generate(svg, params) {
    var render = {
        params: params
    };
    var width = svg.attr('width');
    svg.attr('height', width * params.engine.baseGrid.extent.height / params.engine.baseGrid.extent.width);
    svg.attr('viewBox', -1000 * params.engine.baseGrid.extent.width/2 + ' ' + 
                        -1000 * params.engine.baseGrid.extent.height/2 + ' ' + 
                        1000 * params.engine.baseGrid.extent.width + ' ' + 
                        1000 * params.engine.baseGrid.extent.height);
    svg.selectAll().remove();
    render.dictionnary = getNameGenerator(params);
    generateTerrain(render);
    generatePopulation(render);

    params = getColors(params);

    return render;
}