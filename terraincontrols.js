/* TODO:
    City name change at each show/hide cities
    City name change at each sho/hide regions
    Export file is not correct
*/
var markovInput = "adrien agnès alain albert alexandra alexandre alexis alice aline amandine amélie andré andrée angélique anne annemarie annick annie antoine arlette arnaud arthur audrey aurore aurélie aurélien baptiste benjamin benoît bernadette bernard bertrand brigitte bruno béatrice camille carole caroline catherine chantal charles chloé christelle christian christiane christine christophe claire clara claude claudine clémence clément colette coralie corinne cyril cécile cédric céline damien daniel danielle danièle david delphine denis denise didier dominique dominique dylan emma emmanuel emmanuelle enzo estelle fabien fabienne fabrice fanny florence florent florian francine francis franck françois françoise frédéric gabriel gaétan gaëlle geneviève georges georgette germaine ghislaine gilbert gilles ginette gisèle grégory guillaume guy gérard henri henriette hervé hugo huguette hélène inès irène isabelle jacqueline jacques janine jean jeanclaude jeanfrançois jeanlouis jeanluc jeanmarc jeanmarie jeanmichel jeanne jeannine jeanpaul jeanpierre jennifer jessica jocelyne jonathan joseph josette josé joël joëlle julie julien juliette justine jérôme karine kevin laetitia laura laure laurence laurent liliane lionel louis louise loïc luc lucas lucie lucien lucienne ludovic lydie léa madeleine magali manon marc marcel marcelle marguerite maria marie mariechristine marieclaude mariethérèse marine marion martine mathieu mathilde matthieu maurice maxime michaël michel micheline michelle michèle mickaël mireille mohamed monique morgane muriel myriam mélanie mélissa nadia nadine nathalie nicolas nicole noémie océane odette odile olivier pascal pascale patrice patricia patrick paul paulette pauline philippe pierre pierrette quentin raphaël raymond raymonde rené renée richard robert roger roland romain régine régis rémi rémy sabine sabrina samuel sandra sandrine sarah serge simon simone solange sonia sophie stéphane stéphanie suzanne sylvain sylvie sébastien séverine thierry thomas théo thérèse valentin valérie vanessa victor vincent virginie véronique william xavier yann yannick yves yvette yvonne éliane élisabeth élise élodie émilie éric étienne évelyne";
var t_markov = new Markov(markovInput, 2, 0.01);
function markovUpdate() {
    document.getElementById("ioMarkov").innerHTML = t_markov.generate(25);
}

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
    cities: true
};

function TerrainDraw() {
    if (terrainRender==null) terrainRender = doTerrain(TerrainSVG, TerrainParams);

    // clear renderer
    TerrainSVG.selectAll('path').remove();
    TerrainSVG.selectAll('line.slope').remove();
    TerrainSVG.selectAll('circle.city').remove();
    TerrainSVG.selectAll('text').remove();

    // render
    var selected_view = d3.select('select').property('value');
    if      (selected_view == 'Heightmap')  {visualizeVoronoi(TerrainSVG, terrainRender.h, 0);}
    else if (selected_view == 'Slope')  {visualizeVoronoi(TerrainSVG, terrainRender.slope, 0, 10);}
    else if (selected_view == 'Erosion')    {visualizeVoronoi(TerrainSVG, erosionRate(terrainRender.h));}
    else if (selected_view == 'City Score') {visualizeVoronoi(TerrainSVG, terrainRender.score, d3.max(terrainRender.score) - 0.5);}
    else if (selected_view == 'Regions')    {visualizeVoronoi(TerrainSVG, terrainRender.terr);}
    else if (selected_view == 'Coloring')   {visualizeTerrain(TerrainSVG, terrainRender);}

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

var ViewCombobox = TerrainDiv.append("select")
.on('change',TerrainDraw)
.selectAll('option')
    .data(["No coloring", "Heightmap", "Slope", "Erosion", "Regions", "City Score", "Coloring"]).enter()
    .append('option')
        .text(function (d) { return d; });

TerrainDiv.append("button")
    .text("Generate new Map")
    .on("click", function () {
        terrainRender = doTerrain(TerrainSVG, TerrainParams);
        TerrainDraw();
    });

var TerrainBut = TerrainDiv.append("button")
    .text(terrainOptions.mapViewer ? "Hide Terrain" : "Show Terrain")
    .on("click", function () {
        terrainOptions.mapViewer = !terrainOptions.mapViewer;
        TerrainBut.text(terrainOptions.mapViewer ? "Hide Terrain" : "Show Terrain");
        TerrainDraw();
    });

var CitiesBut = TerrainDiv.append("button")
    .text(terrainOptions.cities ? "Hide Cities" : "Show Cities")
    .on("click", function () {
        terrainOptions.cities = !terrainOptions.cities;
        CitiesBut.text(terrainOptions.cities ? "Hide Cities" : "Show Cities");
        TerrainDraw();
    });

TerrainDiv.append("button")
    .text("Export Map")
    .on("click", function () {
        //TerrainSVG.selectAll("path.field").remove();
        saveSvg(TerrainSVG.node(), 'test.svg')
    });