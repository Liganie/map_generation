initialize(); //to ensure debug is possible

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
        terrainRender = doTerrain(TerrainSVG, TerrainParams);
        terrainOptions.drawTrigger = 'None';
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
        else if (selected_view == 'Regions')    {visualizeVoronoi(TerrainSVG, terrainRender.terr);}
        else if (selected_view == 'Coloring')   {visualizeTerrain(TerrainSVG, terrainRender, TerrainParams);}
    }

    if(terrainOptions.drawTrigger == 'Coloring' && selected_view == 'No coloring') { // Only need to redraw the rivers when we are remving the background to put the black and white map
        drawCurvedPaths(TerrainSVG, 'river', terrainRender.rivers, 'black', 2, 0);
    }
    else if (terrainOptions.mapViewer && terrainOptions.drawTrigger != 'Cities') {
        drawCurvedPaths(TerrainSVG, 'coast', terrainRender.coasts, 'black', 4);
        visualizeSlopes(TerrainSVG, terrainRender);
        if (selected_view == 'Coloring') {visualizeRivers(TerrainSVG, terrainRender);}
        else {drawCurvedPaths(TerrainSVG, 'river', terrainRender.rivers, 'black', 2, 0);}
    }

    if (terrainOptions.cities && 
           !( (!terrainOptions.mapViewer && terrainOptions.drawTrigger == 'Terrain') || (terrainOptions.drawTrigger == 'Coloring' && selected_view == 'No coloring') ) ) {
        drawCurvedPathsExtras(TerrainSVG, 'border', terrainRender.borders, 'black', 5, ['stroke-linecap', 'butt',
                                                                                        'stroke-dasharray', [4,4],
                                                                                        'stroke-alignment', 'inner',
                                                                                        'stroke-position', 'inner',
                                                                                        'stroke-location', 'inner']);
        visualizeCities(TerrainSVG, terrainRender);
        drawLabels(TerrainSVG, terrainRender);
    }
}

var ViewCombobox = TerrainDiv.append("select")
.on('change',TerrainDrawColoring)
.selectAll('option')
    .data(["No coloring", "Heightmap", "Slope", "Flux", "Erosion", "Biomes", "Regions", "City Score", "Coloring"]).enter()
    .append('option')
        .text(function (d) { return d; });

TerrainDiv.append("button")
    .text("Generate new Map")
    .on("click", function () {
        if (terrainRender != null) seededRand = seededRandom();
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