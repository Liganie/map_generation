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