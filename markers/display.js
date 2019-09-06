////////////////////////////////////////////////////////////////////////////////////
//////////                       MARKERS DISPLAY                     ///////////////
////////////////////////////////////////////////////////////////////////////////////

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
    if(params.features.forests.doForests) {
        var num_tree = Math.floor(params.features.forests.density / params.engine.baseGrid.numberPoints*mesh[biomeEnum.forest].length);
        for(var t=0; t<num_tree; t++) {
            var n = randRangeInt(0, mesh[biomeEnum.forest].length-1);
            var box = boundingBox(render.biomes.mesh.tris[mesh[biomeEnum.forest][n]]);
            if(box[1]>box[2]/2) box[1] = box[2]/2;
            box[1] = box[1] * Math.sqrt(params.engine.baseGrid.numberPoints)/150 * params.features.forests.widthScaling;
            box[2] = box[2] * Math.sqrt(params.engine.baseGrid.numberPoints)/150 * params.features.forests.heightScaling;

            objects.push( getTree( randRangeTris(render.biomes.mesh.tris[mesh[biomeEnum.forest][n]]) , box[1], box[2], params, Array.from(render.biomes.forestType.get(mesh[biomeEnum.forest][n])) ) );
        }
    }//*/

    //* Mountain handling
    if(params.features.mountains.doMountains) {
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
        }
    }//*/

    //* City handling
    if(params.features.cities.doCities) {
        // the cities position will be modified to ensure the markes stay inland
        for(var c=0; c<render.cities.length; c++) {
            var city_type = c >= params.engine.population.numberTerritories;
            var base = render.cities[c].position.slice(); // we need to copy the table as it will be modified
            var width = 0.05/(1+city_type)
            var margin = [9001, 9001];
            for(var coast=0; coast<render.coasts.length; coast++) {
                for(var seg = 0; seg < render.coasts[coast].length; seg++) {
                    if( (base[1]-render.coasts[coast][seg][1])*(base[1]-render.coasts[coast][(seg+1)%render.coasts[coast].length][1]) < 0 ) { // this assumes that all coasts are closed
                        var intersect = [ render.coasts[coast][seg][0]
                                         +(render.coasts[coast][(seg+1)%render.coasts[coast].length][0] - render.coasts[coast][seg][0])
                                         *(base[1] - render.coasts[coast][seg][1])
                                         /(render.coasts[coast][(seg+1)%render.coasts[coast].length][1] - render.coasts[coast][seg][1])
                                         , base[1]];
                        if(base[0] >= intersect[0]) margin[0] = Math.min(margin[0], base[0]-intersect[0]);
                        if(base[0] <= intersect[0]) margin[1] = Math.min(margin[1], intersect[0]-base[0]);
                    }
                }
            }

            /* For debug purpose
            console.log("City "+c
                       +", margin: "+ margin[0] + "|" + margin[1] )
            drawCurvedPaths(TerrainSVG, 'cities', [[ [base[0]-0.5*width, base[1]], [base[0]+0.5*width, base[1]] ]], 'red', 5, 1);
            drawCurvedPaths(TerrainSVG, 'cities', [[ [base[0]-width, base[1]], [base[0], base[1]] ]], 'yellow', 3, 1); 
            drawCurvedPaths(TerrainSVG, 'cities', [[ [base[0], base[1]], [base[0]+width, base[1]] ]], 'green', 3, 1); //*/

            if(margin[0]>=width/2 && margin[1]>=width/2) {
                base[0] = base[0]-width/2;
            }
            else if(margin[0]<width/2 && margin[1]>=width-margin[0]) {
                base[0] = base[0]-margin[0];
            }
            else if(margin[1]<width/2 && margin[0]>=width-margin[1]) {
                base[0] = base[0]-(width-margin[1]);
            }
            else {
                console.log("city "+c+" has issue")
                base[0] = base[0]-width/2+(margin[1]-margin[0])/2;
            }
            render.cities[c].displayPosition = [base[0]+width/2, base[1]-0.015]; // The label is relative to the center of the first floor of the city marker

            /* for debug purpose
            drawCurvedPaths(TerrainSVG, 'cities', [[ [base[0], base[1]], [base[0]+width, base[1]] ]], 'cyan', 2, 1); //*/

            var city = getCity( base, 0.05/(1+city_type), 0.05, city_type==0? "city": "town", render.params.generated.territories[render.cities[c].territory]);
            objects.push(city);

        }
    }

    //* Overall rendering
    objects.sort((a,b) => (a.bounding_box[0][1] > b.bounding_box[0][1] ) ? 1 : ((b.bounding_box[0][1]  > a.bounding_box[0][1] ) ? -1 : 0)); 
    drawObjects(svg, 'field', objects);
}