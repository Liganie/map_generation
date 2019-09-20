include('population/display.js');


function cityScore(h, cities) {
    var score = map(getFlux(h), Math.sqrt);
    for (var i = 0; i < h.length; i++) {
        if (h[i] <= 0 || isnearedge(h.mesh, i)) {
            score[i] = -999999;
            continue;
        }
        score[i] += 0.01 / (1e-9 + Math.abs(h.mesh.vxs[i][0]) - h.mesh.extent.width/2)
        score[i] += 0.01 / (1e-9 + Math.abs(h.mesh.vxs[i][1]) - h.mesh.extent.height/2)
        for (var j = 0; j < cities.length; j++) {
            score[i] -= 0.02 / (distance(h.mesh, cities[j].index, i) + 1e-9);
        }
    }
    return score;
}

function placeCities(render) {
    //render.params.generated.cities = render.params.generated.cities || [];
    render.cities = [];
    render.params.generated.cities = [];
    var params = render.params;
    var n = params.engine.population.numberCities;
    for (var i = 0; i < n; i++) {
        var score = cityScore(render.h, render.cities);
        var cityIndex = d3.scan(score, d3.descending);
        var city = { 
            index: cityIndex,
            territory: null,
            position: [],
            displayPosition: []
        };
        if(render.h.mesh.tris[cityIndex].length<3) {
            city.position = [render.h.mesh.vxs[cityIndex][0], render.h.mesh.vxs[cityIndex][1]];
        }
        else {
            city.position = [ (render.h.mesh.tris[cityIndex][0][0] + render.h.mesh.tris[cityIndex][1][0] + render.h.mesh.tris[cityIndex][2][0] )/3,
                              (render.h.mesh.tris[cityIndex][0][1] + render.h.mesh.tris[cityIndex][1][1] + render.h.mesh.tris[cityIndex][2][1] )/3   ];
        }
        render.cities.push(city);
        render.params.generated.cities.push({
            name: ""
        });
    }
}

function placeTerritories(render) {
    //render.params.generated.territories = render.params.generated.territories || [];
    render.params.generated.territories = [];
    for(var n=render.params.generated.territories.length; n<render.params.engine.population.numberTerritories; n++) {
        render.params.generated.territories.push({
            //language: null,
            name: "",
            color: randomColor(),
            influence: randRangeFloat(2, 5),
            building_types: getBuildingTypes()
            });
        render.params.generated.territories[render.params.generated.territories.length-1].colors = getBuildingColors(render.params.generated.territories[render.params.generated.territories.length-1]);
    }
}

function getTerritories(render) {
    var h = render.h;
    var cities = render.cities;
    var n = render.params.engine.population.numberTerritories;
    if (n > render.cities.length) n = render.cities.length;
    var flux = getFlux(h);
    var terr = [];
    var queue = new PriorityQueue({comparator: function (a, b) {return a.score - b.score}});
    function weight(u, v) {
        var horiz = distance(h.mesh, u, v);
        var vert = h[v] - h[u];
        if (vert > 0) vert /= 10;
        var diff = 1 + 0.25 * Math.pow(vert/horiz, 2);
        diff += 100 * Math.sqrt(flux[u]);
        if (h[u] <= 0) diff = Math.max(100, diff);
        //if ((h[u] > 0) != (h[v] > 0)) return 1000;
        return horiz * diff;
    }
    for (var i = 0; i < n; i++) {
        terr[cities[i].index] = i;
        var nbs = neighbours(h.mesh, cities[i].index);
        for (var j = 0; j < nbs.length; j++) {
            queue.queue({
                score: weight(cities[i].index, nbs[j])/render.params.generated.territories[i].influence,
                city: i,
                vx: nbs[j]
            });
        }
    }
    while (queue.length) {
        var u = queue.dequeue();
        if (terr[u.vx] != undefined) continue;
        terr[u.vx] = u.city;
        var nbs = neighbours(h.mesh, u.vx);
        for (var i = 0; i < nbs.length; i++) {
            var v = nbs[i];
            if (terr[v] != undefined) continue;
            var newdist = weight(u.vx, v);
            newdist = newdist/render.params.generated.territories[u.city].influence;
            queue.queue({
                score: u.score + newdist,
                city: u.city,
                vx: v
            });
        }
    }

    terr.mesh = h.mesh;
    return terr;
}

function getBorders(render) {
    var terr = render.terr;
    var h = render.h;
    var edges = [];
    for (var i = 0; i < terr.mesh.edges.length; i++) {
        var e = terr.mesh.edges[i];
        if (e[3] == undefined) continue;
        if (isnearedge(terr.mesh, e[0]) || isnearedge(terr.mesh, e[1])) continue;
        if (h[e[0]] < 0 || h[e[1]] < 0) continue;
        if (terr[e[0]] != terr[e[1]]) {
            edges.push([e[2], e[3]]);
        }
    }
    return mergeSegments(edges).map(relaxPath);
}

function terrCenter(h, terr, city, landOnly) {
    var x = 0;
    var y = 0;
    var n = 0;
    for (var i = 0; i < terr.length; i++) {
        if (terr[i] != city) continue;
        if (landOnly && h[i] <= 0) continue;
        x += terr.mesh.vxs[i][0];
        y += terr.mesh.vxs[i][1];
        n++;
    }
    return [x/n, y/n];
}

function generateTerritories(render) {
    render.terr = getTerritories(render);
    render.borders = getBorders(render);

    //update city territory
    for (var i = 0; i < render.params.generated.cities.length; i++) {
        render.cities[i].territory = render.terr[render.cities[i].index]
    }
}

function generateNames(render) {
    for (var i = 0; i < render.params.generated.cities.length; i++) {
        render.params.generated.cities[i].name = getName(render.params, render.dictionnary, 'city');
    }
    for (var i = 0; i < render.params.generated.territories.length; i++) {
        render.params.generated.territories[i].name = getName(render.params, render.dictionnary, 'region'); 
    }
}

function generatePopulation(render) {
    placeCities(render);
    placeTerritories(render);
    render.score = cityScore(render.h, render.cities);
    generateTerritories(render);
    generateNames(render);
}