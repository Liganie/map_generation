"use strict";


////////////////////////////////////////////////////////////////////////////////////
//////////                    TERAIN GENERATOR TOOLS                 ///////////////
////////////////////////////////////////////////////////////////////////////////////

function zero(mesh) {
    var z = [];
    for (var i = 0; i < mesh.vxs.length; i++) {
        z[i] = 0;
    }
    z.mesh = mesh;
    return z;
}

function slope(mesh, direction) {
    return mesh.map(function (x) {
        return x[0] * direction[0] + x[1] * direction[1];
    });
}

function cone(mesh, slope) {
    return mesh.map(function (x) {
        return Math.pow(x[0] * x[0] + x[1] * x[1], 0.5) * slope;
    });
}

function pike(mesh, slope) {
    var center = [randRangeFloat(-0.15, 0.15), randRangeFloat(-0.15, 0.15)];
    return mesh.map(function (x) {
        return (1 - Math.pow(Math.pow(center[0] - x[0], 2) + Math.pow(center[1] - x[1], 2), 0.5)) * slope;
    });
}

function forceBorders(mesh, slope) {
    var boundary = 0.40;
    return mesh.map(function (x) {
        return  Math.abs(x[0]) > boundary || Math.abs(x[1]) || Math.pow(Math.pow(x[0], 2) + Math.pow(x[1], 2), 0.5) > boundary*math.sqrt(2) ? 0 : slope;
    });
}

function relaxOnBorder(h) {
    var threshold = 0.45;
    var newh = zero(h.mesh);
    for (var i = 0; i < h.length; i++) {
        if(    Math.abs(h.mesh.pts[i][0]) > threshold
            || Math.abs(h.mesh.pts[i][1]) > threshold)
        newh[i] = 0;
    }
    return newh;
}

function map(h, f) {
    var newh = h.map(f);
    newh.mesh = h.mesh;
    return newh;
}

function normalize(h) {
    var lo = d3.min(h);
    var hi = d3.max(h);
    return map(h, function (x) {return (x - lo) / (hi - lo)});
}

function peaky(h) {
    return map(normalize(h), Math.sqrt);
}

function add() {
    var n = arguments[0].length;
    var newvals = zero(arguments[0].mesh);
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < arguments.length; j++) {
            newvals[i] += arguments[j][i];
        }
    }
    return newvals;
}

function mountains(mesh, n, r) {
    r = r || 0.05;
    var mounts = [];
    for (var i = 0; i < n; i++) {
        mounts.push([mesh.extent.width * (seededRand() - 0.5), mesh.extent.height * (seededRand() - 0.5)]);
    }
    var newvals = zero(mesh);
    for (var i = 0; i < mesh.vxs.length; i++) {
        var p = mesh.vxs[i];
        for (var j = 0; j < n; j++) {
            var m = mounts[j];
            newvals[i] += Math.pow(Math.exp(-((p[0] - m[0]) * (p[0] - m[0]) + (p[1] - m[1]) * (p[1] - m[1])) / (2 * r * r)), 2);
        }
    }
    return newvals;
}

function mountainsCentered(mesh, n, d, r) {
    r = r || 0.05;
    var mounts = [];
    for (var i = 0; i < n; i++) {
        mounts.push([mesh.extent.width * (seededRand() - 0.5) * d, mesh.extent.height * (seededRand() - 0.5) * d]);
    }
    var newvals = zero(mesh);
    for (var i = 0; i < mesh.vxs.length; i++) {
        var p = mesh.vxs[i];
        for (var j = 0; j < n; j++) {
            var m = mounts[j];
            newvals[i] += Math.pow(Math.exp(-((p[0] - m[0]) * (p[0] - m[0]) + (p[1] - m[1]) * (p[1] - m[1])) / (2 * r * r)), 2);
        }
    }
    return newvals;
}

function relax(h) {
    var newh = zero(h.mesh);
    for (var i = 0; i < h.length; i++) {
        var nbs = neighbours(h.mesh, i);
        if (nbs.length < 3) {
            newh[i] = 0;
            continue;
        }
        newh[i] = d3.mean(nbs.map(function (j) {return h[j]}));
    }
    return newh;
}

function downhill(h) {
    if (h.downhill) return h.downhill;
    function downfrom(i) {
        if (isedge(h.mesh, i)) return -2;
        var best = -1;
        var besth = h[i];
        var nbs = neighbours(h.mesh, i);
        for (var j = 0; j < nbs.length; j++) {
            if (h[nbs[j]] < besth) {
                besth = h[nbs[j]];
                best = nbs[j];
            }
        }
        return best;
    }
    var downs = [];
    for (var i = 0; i < h.length; i++) {
        downs[i] = downfrom(i);
    }
    h.downhill = downs;
    return downs;
}

function findSinks(h) {
    var dh = downhill(h);
    var sinks = [];
    for (var i = 0; i < dh.length; i++) {
        var node = i;
        while (true) {
            if (isedge(h.mesh, node)) {
                sinks[i] = -2;
                break;
            }
            if (dh[node] == -1) {
                sinks[i] = node;
                break;
            }
            node = dh[node];
        }
    }
}

function fillSinks(h, epsilon) {
    epsilon = epsilon || 1e-5;
    var infinity = 999999;
    var newh = zero(h.mesh);
    for (var i = 0; i < h.length; i++) {
        if (isnearedge(h.mesh, i)) {
            newh[i] = h[i];
        } else {
            newh[i] = infinity;
        }
    }
    while (true) {
        var changed = false;
        for (var i = 0; i < h.length; i++) {
            if (newh[i] == h[i]) continue;
            var nbs = neighbours(h.mesh, i);
            for (var j = 0; j < nbs.length; j++) {
                if (h[i] >= newh[nbs[j]] + epsilon) {
                    newh[i] = h[i];
                    changed = true;
                    break;
                }
                var oh = newh[nbs[j]] + epsilon;
                if ((newh[i] > oh) && (oh > h[i])) {
                    newh[i] = oh;
                    changed = true;
                }
            }
        }
        if (!changed) return newh;
    }
}

function getFlux(h) {
    var dh = downhill(h);
    var idxs = [];
    var flux = zero(h.mesh); 
    for (var i = 0; i < h.length; i++) {
        idxs[i] = i;
        flux[i] = 1/h.length;
    }
    idxs.sort(function (a, b) {
        return h[b] - h[a];
    });
    for (var i = 0; i < h.length; i++) {
        var j = idxs[i];
        if (dh[j] >= 0) {
            flux[dh[j]] += flux[j];
        }
    }
    return flux;
}

function erosionRate(h) {
    var flux = getFlux(h);
    var slope = getSlope(h);
    var newh = zero(h.mesh);
    for (var i = 0; i < h.length; i++) {
        var river = Math.sqrt(flux[i]) * slope[i];
        var creep = slope[i] * slope[i];
        var total = 1000 * river + creep;
        total = total > 200 ? 200 : total;
        newh[i] = total;
    }
    return newh;
}

function erode(h, amount) {
    var er = erosionRate(h);
    var newh = zero(h.mesh);
    var maxr = d3.max(er);
    for (var i = 0; i < h.length; i++) {
        newh[i] = h[i] - amount * (er[i] / maxr);
    }
    return newh;
}

function doErosion(h, amount, n) {
    n = n || 1;
    h = fillSinks(h);
    for (var i = 0; i < n; i++) {
        h = erode(h, amount);
        h = fillSinks(h);
    }
    return h;
}

function setSeaLevel(h, q) {
    var newh = zero(h.mesh);
    var delta = quantile(h, q);
    for (var i = 0; i < h.length; i++) {
        newh[i] = h[i] - delta;
    }
    return newh;
}

function cleanCoast(h, iters) {
    for (var iter = 0; iter < iters; iter++) {
        var changed = 0;
        var newh = zero(h.mesh);
        for (var i = 0; i < h.length; i++) {
            newh[i] = h[i];
            var nbs = neighbours(h.mesh, i);
            if (h[i] <= 0 || nbs.length != 3) continue;
            var count = 0;
            var best = -999999;
            for (var j = 0; j < nbs.length; j++) {
                if (h[nbs[j]] > 0) {
                    count++;
                } else if (h[nbs[j]] > best) {
                    best = h[nbs[j]];    
                }
            }
            if (count > 1) continue;
            newh[i] = best / 2;
            changed++;
        }
        h = newh;
        newh = zero(h.mesh);
        for (var i = 0; i < h.length; i++) {
            newh[i] = h[i];
            var nbs = neighbours(h.mesh, i);
            if (h[i] > 0 || nbs.length != 3) continue;
            var count = 0;
            var best = 999999;
            for (var j = 0; j < nbs.length; j++) {
                if (h[nbs[j]] <= 0) {
                    count++;
                } else if (h[nbs[j]] < best) {
                    best = h[nbs[j]];
                }
            }
            if (count > 1) continue;
            newh[i] = best / 2;
            changed++;
        }
        h = newh;
    }
    return h;
}


////////////////////////////////////////////////////////////////////////////////////
//////////                      TERAIN GENERATORS                    ///////////////
////////////////////////////////////////////////////////////////////////////////////


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