include('terrain/mesh.js');
include('terrain/landGeneration.js');
include('terrain/features.js');
include('terrain/display.js');

////////////////////////////////////////////////////////////////////////////////////
//////////                       TEST GUI INPUTS                     ///////////////
////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////
//////////                  TERAIN GENERATOR SELECTION               ///////////////
////////////////////////////////////////////////////////////////////////////////////


function getTerrainGenerator(params) {
    var generator = generateCoast;
    switch (params.engine.terrainGenerator.type) {
        case "Coast":
            generator = generateCoast;
            break;
        case "Island":
            generator = generateIsland;
            break;
    }
    return generator;
}

function generateTerrain(render) {
    render.h = getTerrainGenerator(render.params)(render.params);
    render.slope = getSlope(render.h);
    render.flux = getFlux(render.h);
    render.rivers = getRivers(render.h, 0.01);
    render.coasts = contour(render.h, 0);
    render.biomes = getBiomes(render);
}