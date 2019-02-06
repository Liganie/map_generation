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
    switch (params.terrainGenerator) {
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
    var mesh = generateGoodMesh(params.npts, params.extent);
    var h = add(
            //slope(mesh, randomVector(4)),
            cone(mesh, -1),
            //pike(mesh, 2),
            mountainsCentered(mesh, 50, 0.80),
            //mountains(mesh, 50),
            //forceBorders(mesh, 10),
            //sinks(mesh, 50),
            );

    for (var i = 0; i < 10; i++) {
        h = relax(h);
    }
    h = peaky(h);
    h = doErosion(h, randRangeFloat(0, 0.1), 5);
    h = setSeaLevel(h, randRangeFloat(0.4, 0.6));
    h = fillSinks(h);
    h = cleanCoast(h, 3);
    return h;
}

function generateCoast(params) {
    var mesh = generateGoodMesh(params.npts, params.extent);
    var h = add(
            slope(mesh, randomVector(4)),
            cone(mesh, randRangeFloat(-1, -1)),
            mountains(mesh, 50)
            );
    for (var i = 0; i < 10; i++) {
        h = relax(h);
    }
    h = peaky(h);
    h = doErosion(h, randRangeFloat(0, 0.1), 5);
    h = setSeaLevel(h, randRangeFloat(0.2, 0.6));
    h = fillSinks(h);
    h = cleanCoast(h, 3);
    return h;
}

////////////////////////////////////////////////////////////////////////////////////
//////////                       TERRAIN DISPLAY                     ///////////////
////////////////////////////////////////////////////////////////////////////////////

var colorSchemes = {
    default: { sea: "#00b6dd", coasts: "#00d0ff", dirt: "#c9ae7b", mountains: "#ffffff" },
    desert:  { sea: "#3399ff", coasts: "#66b3ff", dirt: "#ffe066", mountains: "#b37700" },
    forest:  { sea: "#000066", coasts: "#0000cc", dirt: "#009900", mountains: "#003300" },
    plains:  { sea: "#6699ff", coasts: "#99bbff", dirt: "#99e699", mountains: "#663300" },
    rocks:   { sea: "#9999ff", coasts: "#ccccff", dirt: "#595959", mountains: "#d9d9d9" },
    tundra:  { sea: "#6699ff", coasts: "#99bbff", dirt: "#e6f2ff", mountains: "#ffffff" },
    vulcano: { sea: "#ff8000", coasts: "#ff9922", dirt: "#8d8d8d", mountains: "#1a001a" }
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

function boundingBox(tris) {
    //for debug purposed
    //drawCurvedPaths(TerrainSVG, 'field', [tris], 'green', 2)

    // sorting on y coordinates
    var min=0;
    var max=0;
    for(var i=1; i<3; i++) {
        if(tris[min][1] > tris[i][1]) min = i;
        if(tris[max][1] < tris[i][1]) max = i;
    }
    var mid = (min+max==1)? 2 : ( (min+max==2) ? 1 : 0);

    // The base is the point in the middle on the y axis as it allow for maximum width
    var base = [tris[min][0] + (tris[max][0]-tris[min][0])/(tris[max][1]-tris[min][1])*(tris[mid][1]-tris[min][1]), tris[mid][1]];
    var width = tris[mid][0] - base[0];
    if(width<0) {
        base[0] = base[0] + width;
        width = -width;
    }
    var height = tris[max][1] - tris[min][1];
    return [base, width, height];
}

function visualizeTerrain(svg, render, params) {
    var lo = 0;
    var hi = d3.max(render.h);
    var mappedvals = render.h.map(function (x) {return x > hi ? 1 : x > lo ? (x - lo) / (- hi + lo) : (x - lo) / (hi - lo)});

    drawArea(svg, 'field', [[[-1,-1],[-1,1],[1,1],[1,-1]]], params.colors.sea); // draw the background

    var color = d3.scaleLinear()
      .domain([0, 3])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(params.colors.sea), d3.rgb(params.colors.coasts)]);

    drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(3), 51); // Draw the outline of the coasts
    drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(1), 50); // Draw the coasts
    drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(2), 35); // Draw the coasts
    drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(3), 20); // Draw the coasts
    drawArea(svg, 'field', contour(render.h,0), params.colors.dirt); // draw the islands

    color = d3.scaleLinear()
      .domain([0, 0.5])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(params.colors.dirt), d3.rgb(params.colors.mountains)]);
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
    var lo = 0;
    var hi = d3.max(render.h);
    var mappedvals = render.h.map(function (x) {return x > hi ? 1 : x > lo ? (x - lo) / (- hi + lo) : (x - lo) / (hi - lo)});

    drawArea(svg, 'field', [[[-1,-1],[-1,1],[1,1],[1,-1]]], params.colors.sea); // draw the background

    var color = d3.scaleLinear()
      .domain([0, 3])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(params.colors.sea), d3.rgb(params.colors.coasts)]);

    drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(3), 51); // Draw the outline of the coasts
    drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(1), 50); // Draw the coasts
    drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(2), 35); // Draw the coasts
    drawCurvedPathsExtras(svg, 'field', contour(render.h,0), color(3), 20); // Draw the coasts
    drawArea(svg, 'field', contour(render.h,0), params.colors.dirt); // draw the islands

    //drawArea(TerrainSVG, 'test', contour(render.biomes, biomeEnum.mountain-0.1), params.colors.dirt, 20);

    var objects = [];
    for(var b=0; b<render.biomes.length; b++) {
        if(render.biomes[b]==biomeEnum.mountain && seededRand()<0.25){//<0.25){
            var neigh = neighbours(render.h.mesh, b);
            var count = 0;
            for(var n=0; n<neigh.length; n++) {
                if(render.biomes[neigh[n]] == biomeEnum.mountain) count++;
            }
            var box = boundingBox(render.h.mesh.tris[b]);
            var mountain = getMountain(box[0], box[1]/2*count, box[2]/2*count );
            mountain.area.colors = [d3.rgb(params.colors.dirt).darker(1), params.colors.dirt];
            objects.push(mountain);
        }
    }
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
    drawCurvedPaths(svg, 'river', elongated, render.params.colors.coasts, flux, 0);
}

function visualizeCities(svg, render) {
    var points = [];
    var radius = [];
    for(var i=0; i<render.cities.length; i++) {
        points[i] = [render.h.mesh.vxs[render.cities[i]][0], render.h.mesh.vxs[render.cities[i]][1]];
        radius[i] = i >= render.params.nterrs ? 4 : 10;
    }
    drawPoints(svg, 'city', points, radius, 'black', 5, 'white');
}

var defaultParams = {
    extent: {
        width: 1,
        height: 1
    },
    generator: generateCoast,
    npts: 16384,
    ncities: 15,
    nterrs: 5,
    fontsizes: {
        region: 40,
        city: 25,
        town: 20
    }
}

var TerrainParams = {
    extent: {
        width: 1,
        height: 1
    },
    terrainGenerator: "Island",
    nameGenerator: "Markov",
    npts: 16384,
    //npts: 32768,
    //npts: 65536,
    ncities: 15,
    nterrs: 5,
    fontsizes: {
        region: 40,
        city: 25,
        town: 20
    },
    colors: {
        template: 'random',
        sea: '#00b6dd',
        coasts: '#00d0ff',
        dirt: '#c9ae7b',
        mountains: '#ffffff'
    }
}

function getColors(params) {
    if(params.colors.template in colorSchemes) {
        params.colors.sea = colorSchemes[params.colors.template].sea;
        params.colors.coasts = colorSchemes[params.colors.template].coasts;
        params.colors.dirt = colorSchemes[params.colors.template].dirt;
        params.colors.mountains = colorSchemes[params.colors.template].mountains;
    } else if (params.colors.template == 'random') {
        var key = Object.keys(colorSchemes)[~~(seededRand() * Object.keys(colorSchemes).length)];
        params.colors.sea = colorSchemes[key].sea;
        params.colors.coasts = colorSchemes[key].coasts;
        params.colors.dirt = colorSchemes[key].dirt;
        params.colors.mountains = colorSchemes[key].mountains;
    }
    return params;
}

function doTerrain(svg, params) {
    var render = {
        params: params
    };
    var width = svg.attr('width');
    svg.attr('height', width * params.extent.height / params.extent.width);
    svg.attr('viewBox', -1000 * params.extent.width/2 + ' ' + 
                        -1000 * params.extent.height/2 + ' ' + 
                        1000 * params.extent.width + ' ' + 
                        1000 * params.extent.height);
    svg.selectAll().remove();
    render.h = getTerrainGenerator(params)(params);
    placeCities(render);
    renderTerrain(render);

    params = getColors(params);

    return render;
}