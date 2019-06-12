include('terrain/mesh.js');
include('terrain/landGeneration.js');
include('terrain/features.js');

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

function generateIsland(params) {
    var mesh = generateGoodMesh(params.engine.baseGrid.numberPoints, params.engine.baseGrid.extent);
    var h = add(
            //slope(mesh, randomVector(4)),
            cone(mesh, -1),
            //pike(mesh, 2),
            mountainsCentered(mesh, params.engine.terrainGenerator.islandParameters.baseLandmassNumber, 0.80),
            //mountains(mesh, 50),
            //forceBorders(mesh, 10),
            //sinks(mesh, 50),
            );

    for (var i = 0; i < params.engine.terrainGenerator.islandParameters.relaxLevel; i++) {
        h = relax(h);
    }
    h = peaky(h);
    h = doErosion(h, randRangeFloat(0, 0.1), params.engine.terrainGenerator.islandParameters.erosionLevel);
    h = setSeaLevel(h, randRangeFloat(params.engine.terrainGenerator.islandParameters.seaLevelRange[0], params.engine.terrainGenerator.islandParameters.seaLevelRange[1]));
    if(params.engine.terrainGenerator.islandParameters.fillSinks) h = fillSinks(h);
    h = cleanCoast(h, params.engine.terrainGenerator.islandParameters.coastSmoothingLevel);
    return h;
}

function generateCoast(params) {
    var mesh = generateGoodMesh(params.engine.baseGrid.numberPoints, params.engine.baseGrid.extent);
    var h = add(
            slope(mesh, randomVector(4)),
            cone(mesh, randRangeFloat(-1, -1)),
            mountains(mesh, params.engine.terrainGenerator.coastParameters.baseLandmassNumber)
            );
    for (var i = 0; i < params.engine.terrainGenerator.coastParameters.relaxLevel; i++) {
        h = relax(h);
    }
    h = peaky(h);
    h = doErosion(h, randRangeFloat(0, 0.1), params.engine.terrainGenerator.coastParameters.erosionLevel);
    h = setSeaLevel(h, randRangeFloat(params.engine.terrainGenerator.coastParameters.seaLevelRange[0], params.engine.terrainGenerator.coastParameters.seaLevelRange[1]));
    if(params.engine.terrainGenerator.coastParameters.fillSinks) h = fillSinks(h);
    h = cleanCoast(h, params.engine.terrainGenerator.coastParameters.coastSmoothingLevel);
    return h;
}

////////////////////////////////////////////////////////////////////////////////////
//////////                       TERRAIN DISPLAY                     ///////////////
////////////////////////////////////////////////////////////////////////////////////

var colorSchemes = {
    default: { sea: "#00b6dd", rivers: "#00d0ff", dirt: "#c9ae7b", mountainTop: "#ffffff" },
    desert:  { sea: "#3399ff", rivers: "#66b3ff", dirt: "#ffe066", mountainTop: "#b37700" },
    forest:  { sea: "#000066", rivers: "#0000cc", dirt: "#009900", mountainTop: "#003300" },
    plains:  { sea: "#6699ff", rivers: "#99bbff", dirt: "#99e699", mountainTop: "#663300" },
    rocks:   { sea: "#9999ff", rivers: "#ccccff", dirt: "#595959", mountainTop: "#d9d9d9" },
    tundra:  { sea: "#6699ff", rivers: "#99bbff", dirt: "#e6f2ff", mountainTop: "#ffffff" },
    vulcano: { sea: "#ff8000", rivers: "#ff9922", dirt: "#8d8d8d", mountainTop: "#1a001a" }
}

function visualizePoints(svg, pts) {
    var circle = svg.selectAll('circle').data(pts);
    circle.enter()
        .append('circle');
    circle.exit().remove();
    d3.selectAll('circle')
        .attr('cx', function (d) {return 1000*d[0]})
        .attr('cy', function (d) {return 1000*d[1]})
        .attr('r', 100 / Math.sqrt(pts.length));
}

function makeD3Path(path) {
    var p = d3.path();
    p.moveTo(1000*path[0][0], 1000*path[0][1]);
    for (var i = 1; i < path.length; i++) {
        p.lineTo(1000*path[i][0], 1000*path[i][1]);
    }
    return p.toString();
}

function visualizeVoronoi(svg, field, lo, hi) {
    if (hi == undefined) hi = d3.max(field) + 1e-9;
    if (lo == undefined) lo = d3.min(field) - 1e-9;

    var mappedvals = field.map(function (x) {return x > hi ? 1 : x < lo ? 0 : (x - lo) / (hi - lo)});
    var colors = [];
    for(var i=0; i<field.mesh.tris.length; i++) {
        colors[i] = d3.interpolateViridis(mappedvals[i]);
    }
    drawArea(svg, 'field', field.mesh.tris, colors);
}

function visualizeTerrain(svg, render, params) {
    var lo = 0;
    var hi = d3.max(render.h);
    var mappedvals = render.h.map(function (x) {return x > hi ? 1 : x > lo ? (x - lo) / (- hi + lo) : (x - lo) / (hi - lo)});

    drawArea(svg, 'field', [[[-1,-1],[-1,1],[1,1],[1,-1]]], params.renderer.colors.sea); // draw the background

    var color = d3.scaleLinear()
      .domain([0, 3])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(params.renderer.colors.sea), d3.rgb(params.renderer.colors.rivers)]);

    if(params.features.coasts.colorGradient) {
        drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(3), 51); // Draw the outline of the coasts
        drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(1), 50); // Draw the coasts
        drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(2), 35); // Draw the coasts
        drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(3), 20); // Draw the coasts
    }
    drawArea(svg, 'field', contour(render.h,0), params.renderer.colors.dirt); // draw the islands

    color = d3.scaleLinear()
      .domain([0, 0.5])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(params.renderer.colors.dirt), d3.rgb(params.renderer.colors.mountainTop)]);
    var colors = []; // initial values are for the background
    var mesh = [];
    for(var i=0; i<render.h.mesh.tris.length; i++) {
        if(render.h[i] > 0) {
            colors[colors.length] = color(render.h[i]);
            mesh[mesh.length] = render.h.mesh.tris[i];
        }
    }
    drawArea(svg, 'field', mesh, colors, 2);
}

function visualizeAsMap(svg, render, params) {
    drawArea(svg, 'field', [[[-1,-1],[-1,1],[1,1],[1,-1]]], params.renderer.colors.sea); // draw the background

    var color = d3.scaleLinear()
      .domain([0, 3])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(params.renderer.colors.sea), d3.rgb(params.renderer.colors.rivers)]);

    if(params.features.coasts.colorGradient) {
        drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(3), 51); // Draw the outline of the coasts
        drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(1), 50); // Draw the coasts
        drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(2), 35); // Draw the coasts
        drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(3), 20); // Draw the coasts
    }
    drawArea(svg, 'field', contour(render.h,0), params.renderer.colors.dirt); // draw the islands

    if(params.features.mountains.markBiome) {
        var moutain_color = d3.rgb(params.renderer.colors.dirt).darker( params.features.mountains.biomeShadeLevel );
        color = d3.scaleLinear()
          .domain([0, 20])
          .interpolate(d3.interpolateHcl)
          .range([moutain_color, d3.rgb(params.renderer.colors.dirt)]);
        for(var i=20;i>0;i--) {
            drawArea(TerrainSVG, 'field', contour(render.biomes, biomeEnum.mountain-0.1), color(i), i, 0);
        }
    }
}

function visualizeFeatures(svg, render, params) {
    // for debugging purpose
    //drawArea(TerrainSVG, 'test', contourRange(render.biomes, biomeEnum.grassland), 'white');
    //drawArea(TerrainSVG, 'test', contourRange(render.biomes, biomeEnum.forest), 'green');
    //drawArea(TerrainSVG, 'test', contourRange(render.biomes, biomeEnum.hill), 'blue');
    //drawArea(TerrainSVG, 'test', contourRange(render.biomes, biomeEnum.mountain), 'yellow');

    var mesh = [];
    for(var i=0; i<Object.keys(biomeEnum).length; i++) mesh[i] = [];
    for(var i=0; i<render.biomes.length; i++) {
        mesh[render.biomes[i]].push(i);
    }

    var objects = [];

    //* Forest handling
    var num_tree = Math.floor(params.features.forests.density / params.engine.baseGrid.numberPoints*mesh[biomeEnum.forest].length);
    for(var t=0; t<num_tree; t++) {
        var n = randRangeInt(0, mesh[biomeEnum.forest].length-1);
        var box = boundingBox(render.biomes.mesh.tris[mesh[biomeEnum.forest][n]]);
        if(box[1]>box[2]/2) box[1] = box[2]/2;
        box[1] = box[1] * Math.sqrt(params.engine.baseGrid.numberPoints)/150 * params.features.forests.widthScaling;
        box[2] = box[2] * Math.sqrt(params.engine.baseGrid.numberPoints)/150 * params.features.forests.heightScaling;

        objects.push( getTree( randRangeTris(render.biomes.mesh.tris[mesh[biomeEnum.forest][n]]) , box[1], box[2], params, Array.from(render.biomes.forestType.get(mesh[biomeEnum.forest][n])) ) );
    }//*/

    //* Mountain handling
    var zones = contourRange(render.biomes, biomeEnum.mountain);
    var moutainZones = [];
    //initialization: we get the exact coutours of the biome areas.
    for(var z=0; z<zones.length; z++) zones[z].contains = [zones[z]];
    for(var z=0; z<zones.length; z++) {
        var insideOf = [];
        for(var z2=0; z2<zones.length; z2++) {
            for(var p=0; p<zones[z].length; p++) {
                if(z2==z) continue;
                if( inside(zones[z][p], zones[z2]) ) { // This check is require to detect areas with holes
                    insideOf.push(z2);
                    break;
                }
            }
        }
        if(insideOf.length == 0) moutainZones.push(zones[z]);
        else {
            for(var i=0; i<insideOf.length; i++) zones[insideOf[i]].contains.push(zones[z])
        }
    }

    //we apply the same procedure as the trees, but modulate the size using the area boundaries
    var num_moutains = Math.floor(params.features.mountains.density / params.engine.baseGrid.numberPoints*mesh[biomeEnum.mountain].length);
    for(var m=0; m<num_moutains; m++) {
        var n = randRangeInt(0, mesh[biomeEnum.mountain].length-1);
        var point = randRangeTris(render.biomes.mesh.tris[mesh[biomeEnum.mountain][n]]);
        var zone = null;
        //drawPoints(svg, 'test', [point], 5, 'blue', 2, 'red');
        for(var z=0; z<zones.length; z++) {
            if(inside(point, zones[z])) {
                zone = zones[z];
                break;
            }
        }
        if(zone == null) continue; // could use a better way to ensure all mountains are placed
        var boundaries = [];
        for(var c=0; c<zone.contains.length; c++) {
            for(var p=0; p<zone.contains[c].length-1; p++) {
                if( (zone.contains[c][p][1] > point[1] && zone.contains[c][p+1][1] < point[1])
                  ||(zone.contains[c][p][1] < point[1] && zone.contains[c][p+1][1] > point[1]) )
                    boundaries.push([zone.contains[c][p], zone.contains[c][p+1]]);
            }
        }
        var range = [1e9, 1e9];
        for(var b=0; b<boundaries.length; b++) {
            var box = boundingBox([boundaries[b][0], boundaries[b][1], point]); // As the point is always between the two boudary point by construction
            var x = box[1];
            var sign = box[3];
            if(Math.abs(range[0]) > Math.abs(x)) {
                if(Math.abs(range[0])+Math.abs(range[1])<2*0.01) continue;
                range[1] = range[0]; // we keep the second biggest in case the first one is too small -> in that case we will move the central point along
                range[0] = Math.abs(x)*sign
            }
        }
        if(Math.abs(range[0])<0.01) {
            point[0] = 0.01*Math.sign(range[0]) - range[0] + point[0];
            range[0] = 0.01;
        }

        // Applying limits
        range[0] = Math.max(0.01, 0.5*Math.abs(range[0]));
        range[1] = Math.min(0.025, Math.abs(range[0]))
        if(range[0] > range[1]) range[0] = range[1];
        range[0] = randRangeFloat(range[0], range[1]);
        // Correcting the positions
        point[0] = point[0] - range[0];
        range[0] = 2*range[0];

        var mountain = getMountain(point, range[0], randRangeFloat(0.75*range[0], 1.25*range[0]) * params.features.mountains.heightScaling);
        var moutain_color = params.features.mountains.markBiome ? d3.rgb(params.renderer.colors.dirt).darker(0.2) : params.renderer.colors.dirt;
        mountain.base.fill_colors = [d3.rgb(params.renderer.colors.dirt).darker( params.features.mountains.shadeLevel ), moutain_color];
        objects.push(mountain);
    }//*/

    objects.sort((a,b) => (a.bounding_box[0][1] > b.bounding_box[0][1] ) ? 1 : ((b.bounding_box[0][1]  > a.bounding_box[0][1] ) ? -1 : 0)); 
    drawObjects(svg, 'field', objects);
}

function visualizeSlopes(svg, render) {
    var h = render.h;
    var strokes = [];
    var r = 0.25 / Math.sqrt(h.length);
    for (var i = 0; i < h.length; i++) {
        if (h[i] <= 0 || isnearedge(h.mesh, i)) continue;
        var nbs = neighbours(h.mesh, i);
        nbs.push(i);
        var s = 0;
        var s2 = 0;
        for (var j = 0; j < nbs.length; j++) {
            var slopes = trislope(h, nbs[j]);
            s += slopes[0] / 10;
            s2 += slopes[1];
        }
        s /= nbs.length;
        s2 /= nbs.length;
        //if (Math.abs(s) < randRangeFloat(0.1, 0.4)) continue;
        if (Math.abs(s) < randRangeFloat(0.4, 0.8)) continue;
        var l = r * randRangeFloat(1, 2) * (1 - 0.2 * Math.pow(Math.atan(s), 2)) * Math.exp(s2/100);
        var x = h.mesh.vxs[i][0];
        var y = h.mesh.vxs[i][1];
        if (Math.abs(l*s) > 2 * r) {
            var n = Math.floor(Math.abs(l*s/r));
            l /= n;
            if (n > 4) n = 4;
            for (var j = 0; j < n; j++) {
                var u = rnorm() * r;
                var v = rnorm() * r;
                strokes.push([[x+u-l, y+v+l*s], [x+u+l, y+v-l*s]]);
            }
        } else {
            strokes.push([[x-l, y+l*s], [x+l, y-l*s]]);
        }
    }
    drawCurvedPathsExtras(svg, 'slope', strokes, 'black', 1);
}

function visualizeRivers(svg, render) {

    var flux = render.rivers.map( function(d) {return d.map(function(x) {return (x.flux != null)? Math.sqrt(x.flux*400)+2: 3;});});
    drawCurvedPaths(svg, 'river', render.rivers, 'black', flux, 0);

    var elongated = [];
    for(var p=0; p<render.rivers.length; p++) {
        elongated[p] = render.rivers[p].slice(); // Slice needed otherwise it will modify river length in all views
        if(render.rivers.deltas[p] == true) {
            elongated[p][elongated[p].length-1] = elongated[p][elongated[p].length-1].slice(); // Slice needed otherwise it will modify river length in all views
            elongated[p][elongated[p].length-1][0] = elongated[p][elongated[p].length-1][0]
                                                   + (elongated[p][elongated[p].length-1][0] - elongated[p][elongated[p].length-2][0])*1.0;
            elongated[p][elongated[p].length-1][1] = elongated[p][elongated[p].length-1][1]
                                                   + (elongated[p][elongated[p].length-1][1] - elongated[p][elongated[p].length-2][1])*1.0;
        }
    }
    flux = render.rivers.map( function(d) {return d.map(function(x) {return (x.flux != null)? Math.sqrt(x.flux*400): 1;});});
    drawCurvedPaths(svg, 'river', elongated, render.params.renderer.colors.rivers, flux, 0);
}

function visualizeCities(svg, render) {
    var points = [];
    var radius = [];
    for(var i=0; i<render.cities.length; i++) {
        points[i] = [render.h.mesh.vxs[render.cities[i]][0], render.h.mesh.vxs[render.cities[i]][1]];
        radius[i] = i >= render.params.engine.population.numberTerritories ? 4 : 10;
    }
    drawPoints(svg, 'city', points, radius, 'black', 5, 'white');
}

var terrainParams = {
    engine: {
        seed: {
            changeOnGeneration: true,
            currentSeed: 0
        },
        baseGrid: {
            extent: {
                width: 1,
                height: 1
            },
            numberPoints: 16384
        },
        terrainGenerator: {
            type: "Island",
            islandParameters: {
                baseLandmassNumber: 50,
                relaxLevel: 10,
                erosionLevel: 5,
                seaLevelRange: [0.4, 0.6],
                fillSinks: true,
                coastSmoothingLevel: 3
            },
            coastParameters: {
                baseLandmassNumber: 50,
                relaxLevel: 10,
                erosionLevel: 5,
                seaLevelRange: [0.2, 0.6],
                fillSinks: true,
                coastSmoothingLevel: 3
            }
        },
        nameGenerator: {
            type: "Markov",
            markovParameters: {
                dictionnary: "random",
                order: 3,
                prior: 0.01,
                numberLetters: [3, 15]
            },
            mewoParameters: {}
        },
        population: {
            numberCities: 15,
            numberTerritories: 5
        },
        biomes: {
            mountainSlopeThreeshold: 0.35,
            treeSeedProbability: 0.01,
            treeSpreadingLevel: 10
        }
    },
    renderer: {
        fontSizes: {
            region: 40,
            city: 25,
            town: 20
        },
        colors: {
            type: 'random',
            sea: '#00b6dd',
            rivers: '#00d0ff',
            dirt: '#c9ae7b',
            mountainTop: '#ffffff'
        }
    },
    features: {
        coasts: {
            colorGradient: true
        },
        mountains: {
            density: 1000,
            heightScaling: 1, 
            markBiome: true,
            biomeShadeLevel: 0.2,
            shadeLevel: 1
        },
        forests: {
            density: 20000,
            heightScaling: 1,
            widthScaling: 1,
            pine: {
                trunkColor: '#661a00',
                foliageBase: '#32844e',
                foliageShade: '#006622'
            },
            oak: {
                trunkColor: '#661a00',
                foliageBase: '#32844e',
                foliageShade: '#72a604'
            }
        },
        hills: {},
        plains: {},
        cities: {
            cityNames: [],
            regionNames: []
        }
    }
}

function getColors(params) {
    if(params.renderer.colors.type in colorSchemes) {
        params.renderer.colors.sea = colorSchemes[params.renderer.colors.type].sea;
        params.renderer.colors.rivers = colorSchemes[params.renderer.colors.type].rivers;
        params.renderer.colors.dirt = colorSchemes[params.renderer.colors.type].dirt;
        params.renderer.colors.mountainTop = colorSchemes[params.renderer.colors.type].mountainTop;
    } else if (params.renderer.colors.type == 'random') {
        var key = Object.keys(colorSchemes)[~~(seededRand() * Object.keys(colorSchemes).length)];
        params.renderer.colors.sea = colorSchemes[key].sea;
        params.renderer.colors.rivers = colorSchemes[key].rivers;
        params.renderer.colors.dirt = colorSchemes[key].dirt;
        params.renderer.colors.mountainTop = colorSchemes[key].mountainTop;
    }
    return params;
}

function doTerrain(svg, params) {
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
    render.h = getTerrainGenerator(params)(params);
    render.dictionnary = getNameGenerator(params);
    placeCities(render);
    renderTerrain(render);

    params = getColors(params);

    return render;
}