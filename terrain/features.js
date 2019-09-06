function contour(h, level) {
    level = level || 0;
    var edges = [];
    for (var i = 0; i < h.mesh.edges.length; i++) {
        var e = h.mesh.edges[i];
        if (e[3] == undefined) continue;
        //if (isnearedge(h.mesh, e[0]) || isnearedge(h.mesh, e[1])) continue; // Small modification: we want closed borders here
        if ((h[e[0]] > level && h[e[1]] <= level) ||
            (h[e[1]] > level && h[e[0]] <= level)) {
            edges.push([e[2], e[3]]);
        }
    }
    return mergeSegments(edges);
}

function contourRange(h, level1, level2) {
    level1 = level1 || 0;
    if(typeof level2 == "undefined") level2 = level1;
    if(level1>level2) {
        var temp = level1;
        level1 = level2;
        level2 = temp;
    }

    var edges = [];
    for (var i = 0; i < h.mesh.edges.length; i++) {
        var e = h.mesh.edges[i];
        if (e[3] == undefined) continue;
        //if (isnearedge(h.mesh, e[0]) || isnearedge(h.mesh, e[1])) continue; // Small modification: we want closed borders here
        if ((h[e[0]] > level2 && h[e[1]] <= level2 && h[e[1]] >= level1 ) ||
            (h[e[1]] > level2 && h[e[0]] <= level2 && h[e[0]] >= level1 ) ||
            (h[e[0]] < level1 && h[e[1]] <= level2 && h[e[1]] >= level1 ) ||
            (h[e[1]] < level1 && h[e[0]] <= level2 && h[e[0]] >= level1 )) {
            edges.push([e[2], e[3]]);
        }
    }
    return mergeSegments(edges);
}

function getRivers(h, limit) {
    var dh = downhill(h);
    var flux = getFlux(h);
    var links = [];
    var above = 0;
    for (var i = 0; i < h.length; i++) {
        if (h[i] > 0) above++;
    }
    limit *= above / h.length;
    for (var i = 0; i < dh.length; i++) {
        if (isnearedge(h.mesh, i)) continue;
        if (flux[i] > limit && h[i] > 0 && dh[i] >= 0) {
            var up = h.mesh.vxs[i];
            var down = h.mesh.vxs[dh[i]];
            var link;
            if (h[dh[i]] > 0) {
                link = [up, down];
            } else {
                link = [up, [(up[0] + down[0])/2, (up[1] + down[1])/2]];
            }
            link.flux = flux[i];
            links.push(link);
        }
    }
    // We have the links for easy handling.
    // We are now going to map the flux unto the proper path

    var flux_links = links; // a backup that will then be mached on the sorted array
    links = mergeSegments(links);

    for(var f=0; f<flux_links.length; f++) { // looking for the correspondance
        for(var i=0; i<links.length; i++) {
            for(var j=0; j<links[i].length; j++) {
                if(flux_links[f][0][0] == links[i][j][0] && flux_links[f][0][1] == links[i][j][1]) {
                    flux_links[f].i0 = i;
                    flux_links[f].j0 = j;
                }
                if(flux_links[f][1][0] == links[i][j][0] && flux_links[f][1][1] == links[i][j][1]) {
                    flux_links[f].i1 = i;
                    flux_links[f].j1 = j;
                }
            }
        }
    }

    links = links.map(relaxPath);
    for(var f=0; f<flux_links.length; f++) {
        links[flux_links[f].i1][flux_links[f].j1].flux = flux_links[f].flux;
    }

    // Getting all the termination of the paths, as they end in sea
    // This is used to clean the rendering
    // Also ensuring that the flux is always increasing
    var deltas = [];
    for(var p1=0; p1<links.length; p1++) {
        deltas[p1] = true;
        for(var i=1; i<links[p1].length; i++) {
            if(links[p1][i-1].flux > links[p1][i].flux) links[p1][i].flux = links[p1][i-1].flux;
        }
        for(var p2=0; p2<links.length; p2++) {
            if(p1 == p2) continue;
            for(var i=0; i<links[p2].length; i++) { // We check if we can find a point in the second path where the first path ends
                if(    links[p1][links[p1].length-1][0] == links[p2][i][0]
                    && links[p1][links[p1].length-1][1] == links[p2][i][1]) {
                    deltas[p1] = false;
                    break;
                }
            }
            if(deltas[p1] == false) break;
        }
    }
    links.deltas = deltas;

    return links;
}

function cleanBiome(biomes, nb_pass, base_biome, default_biome, min_neighbours, max_neighbours) {
    if(typeof(default_biome)=='number') default_biome = [default_biome];

    for(var pass=0; pass<nb_pass; pass++) {
        for(var i=0; i<biomes.length; i++) {
            var neigh = neighbours(biomes.mesh, i);
            var count = 0;
            for(var n=0; n<neigh.length; n++) {
                if(biomes[neigh[n]] == base_biome) count++;
            }
            if(biomes[i] == base_biome && count <= min_neighbours) {
                biomes[i] = default_biome[0];
            }
            else if(default_biome.includes(biomes[i]) && count >= max_neighbours) {
                biomes[i] = base_biome;
            }
        }
    }
    return biomes;
}

var biomeEnum = Object.freeze({"sea":0, "grassland":1, "forest":2, "hill":3, "mountain":4})

function getBiomes(render) {
    var params = render.params;
    var biomes = [];
    
    for(var i=0; i<render.h.length; i++) {
        biomes[i] = biomeEnum.hill; // default value
        if(render.h[i] < 0) {
            biomes[i] = biomeEnum.sea;
        }
        else if( (render.slope[i] < 2.5 || render.flux[i] > 0.0025) // Rivers and area with low slope all contains grasslands
              || (render.slope[i] < 10 && render.h[i] < 0.1) ) { // special rule for the coasts, as the generator tends to make them steep
            biomes[i] = biomeEnum.grassland;
        }
        else if(render.h[i] > params.engine.biomes.mountainSlopeThreeshold) {
            biomes[i] = biomeEnum.mountain;
        }
    }
    biomes.mesh = render.h.mesh;
    
    // Cleanup
    biomes = cleanBiome(biomes, 2, biomeEnum.mountain,  [biomeEnum.hill, biomeEnum.grassland], 0, 2);
    biomes = cleanBiome(biomes, 2, biomeEnum.grassland, [biomeEnum.hill, biomeEnum.mountain],  0, 2);

    // Forests
    var grassIndex = [];
    var forestType = new Map();
    var types = ['Pine', 'Oak'];
    for(var i=0; i<render.h.length; i++) {
        if(biomes[i] == 1 && render.flux[i] < 0.0025) { // Forests only appear in Grasslands, were there is no rivers
            if(seededRand()< params.engine.biomes.treeSeedProbability) { // % chance per valid grassland to seed a forest
                biomes[i] = biomeEnum.forest;
                grassIndex[grassIndex.length] = i;
                forestType.set(i, new Set([ types[randRangeInt(1,types.length)-1] ]) );
            }
        }
    }

    // Spreading the forests
    var index;
    for(var pass=0; pass<params.engine.biomes.treeSpreadingLevel; pass++) {
        index = Array.from(new Set(grassIndex)); // we avoid duplicated
        for(var i=0; i<index.length; i++) {
            var neigh = neighbours(biomes.mesh, index[i]);
            for(var n=0; n<neigh.length; n++) {
                if( (biomes[neigh[n]] == biomeEnum.grassland || biomes[neigh[n]] == biomeEnum.hill // we can spread on both hills and grasslands
                    || biomes[neigh[n]] == biomeEnum.forest) //forests are use to differentiate tree type
                 && render.flux[neigh[n]] < 0.0025) { // We still exlude the rivers here to have clean rivers and cities
                    if(biomes[neigh[n]] == biomeEnum.forest) {
                        forestType.set(neigh[n], new Set([...forestType.get(neigh[n]), ...forestType.get(index[i])]) );
                    }
                    else {
                        forestType.set(neigh[n], new Set(forestType.get(index[i])) );
                    }
                    biomes[neigh[n]] = biomeEnum.forest;
                    grassIndex.push(neigh[n]);
                }
            }
        }
    }
    biomes.forestType = forestType;
    return biomes;
}

function mergeSegments(segs) {
    var adj = {};
    for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        var a0 = adj[seg[0]] || [];
        var a1 = adj[seg[1]] || [];
        a0.push(seg[1]);
        a1.push(seg[0]);
        adj[seg[0]] = a0;
        adj[seg[1]] = a1;
    }
    var done = [];
    var paths = [];
    var path = null;
    while (true) {
        if (path == null) {
            for (var i = 0; i < segs.length; i++) {
                if (done[i]) continue;
                done[i] = true;
                path = [segs[i][0], segs[i][1]];
                break;
            }
            if (path == null) break;
        }
        var changed = false;
        for (var i = 0; i < segs.length; i++) {
            if (done[i]) continue;
            if (adj[path[0]].length == 2 && segs[i][0] == path[0]) {
                path.unshift(segs[i][1]);
            } else if (adj[path[0]].length == 2 && segs[i][1] == path[0]) {
                path.unshift(segs[i][0]);
            } else if (adj[path[path.length - 1]].length == 2 && segs[i][0] == path[path.length - 1]) {
                path.push(segs[i][1]);
            } else if (adj[path[path.length - 1]].length == 2 && segs[i][1] == path[path.length - 1]) {
                path.push(segs[i][0]);
            } else {
                continue;
            }
            done[i] = true;
            changed = true;
            break;
        }
        if (!changed) {
            paths.push(path);
            path = null;
        }
    }
    return paths;
}

function relaxPath(path) {
    var newpath = [path[0]];
    for (var i = 1; i < path.length - 1; i++) {
        var newpt = [0.25 * path[i-1][0] + 0.5 * path[i][0] + 0.25 * path[i+1][0],
                     0.25 * path[i-1][1] + 0.5 * path[i][1] + 0.25 * path[i+1][1]];
        newpath.push(newpt);
    }
    newpath.push(path[path.length - 1]);
    return newpath;
}

function dropEdge(h, p) {
    p = p || 4
    var newh = zero(h.mesh);
    for (var i = 0; i < h.length; i++) {
        var v = h.mesh.vxs[i];
        var x = 2.4*v[0] / h.mesh.extent.width;
        var y = 2.4*v[1] / h.mesh.extent.height;
        newh[i] = h[i] - Math.exp(10*(Math.pow(Math.pow(x, p) + Math.pow(y, p), 1/p) - 1));
    }
    return newh;
}