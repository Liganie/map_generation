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
    default: { water: "#00b6dd", dirt: "#c9ae7b", mountains: "#ffffff" },
    desert:  { water: "#3399ff", dirt: "#ffe066", mountains: "#b37700" },
    forest:  { water: "#000066", dirt: "#009900", mountains: "#003300" },
    plains:  { water: "#6699ff", dirt: "#99e699", mountains: "#663300" },
    rocks:   { water: "#9999ff", dirt: "#595959", mountains: "#d9d9d9" },
    tundra:  { water: "#6699ff", dirt: "#e6f2ff", mountains: "#ffffff" },
    vulcano: { water: "#ff8000", dirt: "#8d8d8d", mountains: "#1a001a" }
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
    var tris = svg.selectAll('path.field').data(field.mesh.tris)
    tris.enter()
        .append('path')
        .classed('field', true);
    
    tris.exit()
        .remove();

    svg.selectAll('path.field')
        .attr('d', makeD3Path)
        .style("stroke", "none")    // set the stroke color
        //.style("stroke-width", 5)    // set the stroke width
        /*.style('stroke', function (d, i) { // dynamic color range
            return field[i] >= 0 ? params.colors.dirt: params.colors.water;
        })*/
        .style("fill-opacity", 1.0)
        .style('fill', function (d, i) {
            return d3.interpolateViridis(mappedvals[i]);
        });
}

function visualizeTerrain(svg, render, params) {

    var polygons = contour(render.h,0);
    var terrainData = [[[-1,-1],[-1,1],[1,1],[1,-1]]];
    for (var i = 0; i < polygons.length; i++) {
        terrainData[i+1] = polygons[i];
    }

    var tris = svg.selectAll('path.field').data(terrainData)
    tris.enter()
        .append('path')
        .classed('field', true);
    
    tris.exit()
        .remove();

    svg.selectAll('path.field')
        .attr('d', makeD3Path)
        .style('fill', function (d, i) {
            return i > 0 ? params.colors.dirt: params.colors.water;
        });


    var lo = 0;
    var hi = d3.max(render.h);
    var mappedvals = render.h.map(function (x) {return x > hi ? 1 : x > lo ? (x - lo) / (- hi + lo) : (x - lo) / (hi - lo)});
    var color = d3.scaleLinear()
      .domain([0, 0.5])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb(params.colors.dirt), d3.rgb(params.colors.mountains)]);
    var tris_shading = svg.selectAll('path.field_shading').data(render.h.mesh.tris)
    tris_shading.enter()
        .append('path')
        .classed('field_shading', true);
    
    tris_shading.exit()
        .remove();

    svg.selectAll('path.field_shading')
        .attr('d', makeD3Path)
        .style("stroke-width", 2)
        .style("stroke", function (d, i) {
            return render.h[i] > 0 ? color(render.h[i]) : 'none';
        })
        .style('fill', function (d, i) {
            return render.h[i] > 0 ? color(render.h[i]) : 'none';
        });

}

function drawPaths(svg, cls, paths, stroke_color, strokeSize) {
    stroke_color = stroke_color || 'none';

    var paths = svg.selectAll('path.' + cls).data(paths)
    paths.enter()
            .append('path')
            .classed(cls, true)
    paths.exit()
            .remove();
    svg.selectAll('path.' + cls)
        .attr('d', makeD3Path)
        .style("stroke-width", strokeSize)
        .style('stroke', stroke_color)
        .style('fill', 'none')
        .style('stroke-linecap', 'round');

    // Dirty fix for border
    if(cls == 'border') {
        svg.selectAll('path.' + cls)
            .style("stroke-dasharray", [4,4])
            .style('stroke-linecap', 'butt')
            .style('stroke-alignment', 'inner')
            .style('stroke-position', 'inner')
            .style('stroke-location', 'inner');
    }
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
    var lines = svg.selectAll('line.slope').data(strokes)
    lines.enter()
            .append('line')
            .classed('slope', true);
    lines.exit()
            .remove();
    svg.selectAll('line.slope')
        .style('stroke-width', 1)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-linecap', 'round')
        .attr('x1', function (d) {return 1000*d[0][0]})
        .attr('y1', function (d) {return 1000*d[0][1]})
        .attr('x2', function (d) {return 1000*d[1][0]})
        .attr('y2', function (d) {return 1000*d[1][1]});
}


function visualizeRivers(svg, render) {
    var cls = 'river_background'
    var rivers = render.rivers.flux;

    var paths = svg.selectAll('path.' + cls).data(rivers)
    paths.enter()
            .append('path')
            .classed(cls, true)
            .attr('d', makeD3Path)
            //.style("stroke-width", 15)
            .style('stroke-width', function (d, i) {
                return Math.sqrt(d.flux*400)+1; // min flux is 0.01 and shall provide 2px for the border and 1 for the fill. SQRT for volume -> radius convertion
            })
            .style('stroke', 'black')
            .style('fill', 'none')
            .style('stroke-linecap', 'round');

    cls = 'river'
    paths = svg.selectAll('path.' + cls).data(rivers)
    paths.enter()
            .append('path')
            .classed(cls, true)
            .attr('d', makeD3Path)
            //.style("stroke-width", 15)
            .style('stroke-width', function (d, i) {
                return Math.sqrt(d.flux*400); // min flux is 0.01 and shall provide 2px for the border and 1 for the fill. SQRT for volume -> radius convertion
            })
            .style('stroke', render.params.colors.water)
            .style('fill', 'none')
            .style('stroke-linecap', 'round');
}

function visualizeContour(h, level) {
    level = level || 0;
    var links = contour(h, level);
    drawPaths('coast', links);
}

function visualizeBorders(h, cities, n) {
    var links = getBorders(h, getTerritories(h, cities, n));
    drawPaths('border', links);
}


function visualizeCities(svg, render) {
    var cities = render.cities;
    var h = render.h;
    var n = render.params.nterrs;

    var circs = svg.selectAll('circle.city').data(cities);
    circs.enter()
            .append('circle')
            .classed('city', true);
    circs.exit()
            .remove();
    svg.selectAll('circle.city')
        .attr('cx', function (d) {return 1000*h.mesh.vxs[d][0]})
        .attr('cy', function (d) {return 1000*h.mesh.vxs[d][1]})
        .attr('r', function (d, i) {return i >= n ? 4 : 10})
        .style('fill', 'white')
        .style('stroke-width', 5)
        .style('stroke-linecap', 'round')
        .style('stroke', 'black')
        .raise();
}

function drawMap(svg, render) {
    render.rivers = getRivers(render.h, 0.01);
    render.coasts = contour(render.h, 0);
    render.terr = getTerritories(render);
    render.borders = getBorders(render);
    drawPaths(svg, 'river', render.rivers, 'black', 2);
    drawPaths(svg, 'coast', render.coasts, 'black', 4);
    drawPaths(svg, 'border', render.borders, 'black', 5);
    visualizeSlopes(svg, render);
    visualizeCities(svg, render);
    drawLabels(svg, render);
}

function drawTerrain(svg, render) {
    drawPaths(svg, 'river', render.rivers, 'black', 2);
    drawPaths(svg, 'coast', render.coasts, 'black', 4);
    drawPaths(svg, 'border', render.borders, 'black', 5);
    visualizeSlopes(svg, render);
    visualizeCities(svg, render);
    drawLabels(svg, render);
}

function doMap(svg, params) {
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
    render.h = params.generator(params);
    placeCities(render);
    drawMap(svg, render);
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
    npts: 2048,
    //npts: 16384,
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
        water: '#00b6dd',
        dirt: '#c9ae7b',
        mountains: '#ffffff'
    }
}

function getColors(params) {
    if(params.colors.template in colorSchemes) {
        params.colors.water = colorSchemes[params.colors.template].water;
        params.colors.dirt = colorSchemes[params.colors.template].dirt;
        params.colors.mountains = colorSchemes[params.colors.template].mountains;
    } else if (params.colors.template == 'random') {
        var key = Object.keys(colorSchemes)[~~(seededRand() * Object.keys(colorSchemes).length)];
        params.colors.water = colorSchemes[key].water;
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