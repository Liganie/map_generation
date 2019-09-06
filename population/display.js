////////////////////////////////////////////////////////////////////////////////////
//////////                       MARKERS DISPLAY                     ///////////////
////////////////////////////////////////////////////////////////////////////////////

function visualizeCities(svg, render) {
    var points = [];
    var radius = [];
    for(var i=0; i<render.cities.length; i++) {
        render.cities[i].displayPosition = render.cities[i].position;
        points[i] = render.cities[i].position;
        radius[i] = i >= render.params.engine.population.numberTerritories ? 4 : 10;
    }
    drawPoints(svg, 'city', points, radius, 'black', 5, 'white');
}