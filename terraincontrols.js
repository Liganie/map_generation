/* TODO:
    City name change at each show/hide cities
    City name change at each sho/hide regions
    Export file is not correct
*/
parseJsonAndUpdate();
function parseJsonAndUpdate() {
    var ioParamsStr = document.getElementById("ioParameters").value;
    if (ioParamsStr.length > 0) TerrainParams = JSON.parse(ioParamsStr);
    document.getElementById("ioParameters").innerHTML = JSON.stringify(TerrainParams, null, 2);
}

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
    heightmap: false,
    erosion: false,
    regions: false,
    score: false,
    colored: false,
};

function TerrainDraw() {

    // clear renderer
    TerrainSVG.selectAll('path').remove();
    TerrainSVG.selectAll('line.slope').remove();
    TerrainSVG.selectAll('circle.city').remove();
    TerrainSVG.selectAll('text').remove();

    // render
    if      (terrainOptions.heightmap) {visualizeVoronoi(TerrainSVG, terrainRender.h, 0);}
    else if (terrainOptions.erosion)   {visualizeVoronoi(TerrainSVG, erosionRate(terrainRender.h));}
    else if (terrainOptions.score)     {visualizeVoronoi(TerrainSVG, terrainRender.score, d3.max(terrainRender.score) - 0.5);}
    else if (terrainOptions.regions)   {visualizeVoronoi(TerrainSVG, terrainRender.terr);}
    else if (terrainOptions.colored)   {visualizeTerrain(TerrainSVG, terrainRender);}

    if (terrainOptions.mapViewer) {
        drawPaths(TerrainSVG, 'coast', terrainRender.coasts);
        visualizeSlopes(TerrainSVG, terrainRender);
        if (terrainOptions.colored) drawPaths(TerrainSVG, 'riverBackground',  terrainRender.rivers, '#000000', 3);
        drawPaths(TerrainSVG, 'river', terrainRender.rivers, terrainOptions.colored ? '#00b6dd': '#000000');
    }

    if (terrainOptions.cities) {
        drawPaths(TerrainSVG, 'border', terrainRender.borders);
        visualizeCities(TerrainSVG, terrainRender);
        drawLabels(TerrainSVG, terrainRender);
    }
}

var HeightmapBut = TerrainDiv.append("button")
    .text(terrainOptions.heightmap ? "Hide Heightmap" : "Show Heightmap")
    .on("click", function () {
        if (terrainRender==null) terrainRender = doTerrain(TerrainSVG, TerrainParams);
        if (terrainOptions.erosion || terrainOptions.regions || terrainOptions.score || terrainOptions.colored) return;
        terrainOptions.heightmap = !terrainOptions.heightmap;
        HeightmapBut.text(terrainOptions.heightmap ? "Hide Heightmap" : "Show Heightmap");
        TerrainDraw();
    });

var ErosionBut = TerrainDiv.append("button")
    .text(terrainOptions.erosion ? "Hide Erosion" : "Show Erosion")
    .on("click", function () {
        if (terrainRender==null) terrainRender = doTerrain(TerrainSVG, TerrainParams);
        if (terrainOptions.heightmap || terrainOptions.regions || terrainOptions.score || terrainOptions.colored) return;
        terrainOptions.erosion = !terrainOptions.erosion;
        ErosionBut.text(terrainOptions.erosion ? "Hide Erosion" : "Show Erosion");
        TerrainDraw();
    });


var RegionsBut = TerrainDiv.append("button")
    .text(terrainOptions.regions ? "Hide Regions" : "Show Regions")
    .on("click", function () {
        if (terrainRender==null) terrainRender = doTerrain(TerrainSVG, TerrainParams);
        if (terrainOptions.heightmap || terrainOptions.erosion || terrainOptions.score || terrainOptions.colored) return;
        terrainOptions.regions = !terrainOptions.regions;
        RegionsBut.text(terrainOptions.regions ? "Hide Regions" : "Show Regions");
        TerrainDraw();
    });

var ScoreBut = TerrainDiv.append("button")
    .text(terrainOptions.score ? "Hide City Score" : "Show City Score")
    .on("click", function () {
        if (terrainRender==null) terrainRender = doTerrain(TerrainSVG, TerrainParams);
        if (terrainOptions.heightmap || terrainOptions.erosion || terrainOptions.regions || terrainOptions.colored) return;
        terrainOptions.score = !terrainOptions.score;
        ScoreBut.text(terrainOptions.score ? "Hide City Score" : "Show City Score");
        TerrainDraw();
    });

var ColoredBut = TerrainDiv.append("button")
    .text(terrainOptions.score ? "Hide Coloring" : "Show Coloring")
    .on("click", function () {
        if (terrainRender==null) terrainRender = doTerrain(TerrainSVG, TerrainParams);
        if (terrainOptions.heightmap || terrainOptions.erosion || terrainOptions.regions || terrainOptions.score) return;
        terrainOptions.colored = !terrainOptions.colored;
        ColoredBut.text(terrainOptions.colored ? "Hide Coloring" : "Show Coloring");
        TerrainDraw();
    });

TerrainDiv.append("button")
    .text("Generate new Map")
    .on("click", function () {
        terrainRender = doTerrain(TerrainSVG, TerrainParams);
        TerrainDraw();
    });

var TerrainBut = TerrainDiv.append("button")
    .text(terrainOptions.mapViewer ? "Hide Terrain" : "Show Terrain")
    .on("click", function () {
        if (terrainRender==null) terrainRender = doTerrain(TerrainSVG, TerrainParams);
        terrainOptions.mapViewer = !terrainOptions.mapViewer;
        TerrainBut.text(terrainOptions.mapViewer ? "Hide Terrain" : "Show Terrain");
        TerrainDraw();
    });

var CitiesBut = TerrainDiv.append("button")
    .text(terrainOptions.cities ? "Hide Cities" : "Show Cities")
    .on("click", function () {
        if (terrainRender==null) terrainRender = doTerrain(TerrainSVG, TerrainParams);
        terrainOptions.cities = !terrainOptions.cities;
        CitiesBut.text(terrainOptions.cities ? "Hide Cities" : "Show Cities");
        TerrainDraw();
    });

TerrainDiv.append("button")
    .text("Export Map")
    .on("click", function () {
        if (terrainRender==null) terrainRender = doTerrain(TerrainSVG, TerrainParams);
        //TerrainSVG.selectAll("path.field").remove();
        saveSvg(TerrainSVG.node(), 'test.svg')
    });