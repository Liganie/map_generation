////////////////////////////////////////////////////////////////////////////////////
//////////                GENERATION PARAMETER HANDLING              ///////////////
////////////////////////////////////////////////////////////////////////////////////


// overall parameters, can be overloaded by territory
var default_map = {
    base: {rect: 0.7, round: 0.3},
    door: {
        big: 1, barn: 1, // bigger doors
        med: 1, frame: 1, fullFrame: 1,// traditionnal
        arc: 1, arcFullFrame: 1, // gothic
        curtain: 1, curtainFrame: 1, curtainFullFrame: 1, // THe door is made of tissue, like in hot countries
        round: 0, roundStep: 0 // Asian insprired
    },
    window: {
        arrowsplit: 1,
        med: 1, frame: 1, cross: 1, fullFrame: 1, // traditionnal
        tall: 1, tallFrame: 1, tallCross: 1, tallFullFrame: 1, // taller versions
        triangular: 1, triangularCross: 1, // triangular top versions
        round: 1, roundCross: 1, // round top  versions
        allRound: 1, allRoundCross: 1 // all round versions
    },
    flag: {
        med: 1, tri: 1, rect: 1, trirect: 1, // traditionnal
        twotri: 0, irect: 0, diamond:0 // asian inspired
    },
    roof: {
        rect: {
            pyramid: 1, h2lPyramid: 1, l2hPyramid: 1, //pyramidal shaped with slope variants
            tri: 1, h2lTri: 1, l2hTri: 1, //triangular shaped with slope variants
            slope: 1,// Sloop roof
            flat: 1, wall: 1, outerWall: 1, batt: 1, outerBatt: 1 // Flat roof and similar
        },
        round: {
            spike: 2, h2lSpike: 2, l2hSpike: 2, //Spike shaped with slope variants
            flatR: 1, wallR: 1, outerWallR:1, battR:1, outerBattR: 1 // Flat roof and similar
        }
    }

};

function getBuildingTypes (){
    var type_map = {base: {}, door: {}, window:{}, flag:{}, roof:{rect:{}, round:{} } };
    var index;
    var themes;

    type_map.base.rect = randRangeFloat(0.1, 0.9);
    type_map.base.round = 1 - type_map.base.rect;

    themes = [
        {big: 1, barn: 1, med: 2, frame: 2, fullFrame: 1}, // medieval style
        {med: 2, frame: 2, fullFrame: 2, arc: 1, arcFullFrame: 1}, // rennaissance style
        {med: 1, frame: 1, fullFrame: 1, curtain: 2, curtainFrame: 2, curtainFrame: 2}, // desert style
        {round: 1, roundStep: 1} // asian style
    ]
    index = randMap({0:5, 1:2, 2:2, 3:1});
    type_map.door = themes[parseInt(index)];

    themes = [
        {cross: 1, fullFrame: 1, triangularCross: 1, roundCross: 1}, // medieval style - poor
        {arrowsplit: 1, med: 2, frame: 2, triangular: 1, round: 1, tallCross: 1, tallFullFrame: 1}, // medieval style - modest
        {arrowsplit: 1, med: 1, frame: 1, triangular: 2, round: 2, tall: 2, tallFrame: 1}, // medieval style - rich
        {triangular: 1, round: 1, tall: 1, tallFrame: 1, tallCross: 1, tallFullFrame: 1}, // rennaissance style
        {arrowsplit: 1, med: 1, frame: 1, round: 1}, // desert style
        {round: 1, roundCross: 1, allRound:2 , allRoundCross: 2} // asian style
    ]
    index = randMap({0:3, 1:3, 2:3, 3:1, 4:2, 5:1});
    type_map.window = themes[index];

    themes = [
        {med: 1, tri: 1, trirect: 1, rect: 1}, // medieval style
        {twotri: 1, irect: 1, diamond: 1} // asian style
    ]
    index = randMap({0:9, 1:1});
    type_map.flag = themes[index];

    themes = [
        {pyramid: 3, tri: 6, batt: 0.5, outerBatt: 0.5}, // medieval style - classic
        {h2lPyramid: 3, h2lTri: 6, batt: 0.5, outerBatt: 0.5}, // medieval style - variant 1
        {l2hPyramid: 3, l2hTri: 6, batt: 0.5, outerBatt: 0.5}, // medieval style - variant 2
        {flat: 1, slope: 2, wall: 1, outerWall: 1} // desert style
    ]
    index = randMap({0:1, 1:1, 2:1, 3:1});
    type_map.roof.rect = themes[index];
    themes = [
        {spike: 4, battR: 1, outerBattR: 1}, // medieval style - classic
        {h2lSpike: 4, battR: 1, outerBattR: 1}, // medieval style - variant 1
        {l2hSpike: 4, battR: 1, outerBattR: 1}, // medieval style - variant 2
        {flatR: 4, wallR: 2, outerWallR: 2, battR: 1, outerBattR: 1} // desert style
    ]
    type_map.roof.round = themes[index];

    return type_map;
}

function getBuildingColors (territory){
    var color_map = {wall: {}, roof: {} };
    var colors;

    // wall materials
    var color_wall = {
        woods: [
            "#DB8F31", // pine
            "#A16912", // oak
            "#683203", // walnut
            "#A2470E", // cedar
            "#E7D2AC" // birch
            ],
        stones: [
            "#c4c3c2", // stone 1s
            "#999DA9", // stone 2
            "#B2A89F", // stone 3
            "#F5F6FA", // stone 4
            "#EAB095" // granite
            ],
        bricks: [
            "#CC8066", // red brick
            "#AD9582", // sand brick
            "#AD9088" // gray brick
            ],
        sandstones: [
            "#CABF9E", // yellow sandstone
            "#D0B38B", // orange sandstone
            "#93604F" // red sandstone
            ]
        };
    colors = color_wall[randMap({ woods: 1, stones: 4, bricks: 2, sandstones: 2 })];
    color_map.wall.base = colorVariation( colors[randRangeInt(0, colors.length-1)], 10);
    color_map.wall.shade =  toHexString(d3.rgb(color_map.wall.base).darker(1));

    //roof materials
    var color_roof = {
        woods: [
            "#DB8F31", // pine
            "#A16912", // oak
            "#683203", // walnut
            "#A2470E", // cedar
            "#E7D2AC" // birch
            ],
        tiles: [
            "#495973", // bleu tiles
            "#92A4B8", // green tiles
            "#7F7F81", // grey tiles
            "#89787E", // dark orange tiles
            "#E3A9B0", // light orange tiles
            "#DDC0B2" // yellow tiles
            ],
        tach: ["#F0C68A"]
        };
    colors = color_roof[randMap({ woods: 3, tiles: 3, tach: 1})];
    color_map.roof.base = colorVariation( colors[randRangeInt(0, colors.length-1)], 10);
    color_map.roof.shade =  toHexString(d3.rgb(color_map.roof.base).darker(1));

    // other features
    color_map.structure = colorVariation( color_wall.woods[randRangeInt(0, color_wall.woods.length-1)], 10);
    color_map.door = color_map.structure;
    color_map.curtain = toHexString(d3.rgb(territory.color).darker(2));
    color_map.window =  toHexString(d3.rgb(color_map.wall.base).darker(2));

    return color_map;
}


////////////////////////////////////////////////////////////////////////////////////
//////////                      UTILITY FUNCTIONS                    ///////////////
////////////////////////////////////////////////////////////////////////////////////


function makeBattlement(point1, point2, height, number, ratio) {
    var points = [];
    var total_size = number+ratio; // we went to begin and end on the up side
    var width = [point2[0]-point1[0], point2[1]-point1[1]];
    for(var i=0; i<number;i++) {
        points.push( [point1[0]+width[0]*(i+ratio)/total_size, point1[1]+width[1]*(i+ratio)/total_size] );
        points.push( [point1[0]+width[0]*(i+ratio)/total_size, point1[1]+width[1]*(i+ratio)/total_size+height] );
        points.push( [point1[0]+width[0]*(i+1    )/total_size, point1[1]+width[1]*(i+1    )/total_size+height] );
        points.push( [point1[0]+width[0]*(i+1    )/total_size, point1[1]+width[1]*(i+1    )/total_size] );
    }
    points.push(point2)
    return points;
}

var roundSlopes = [ 0.31, 0.59, 0.81, 0.95];

function invertSlope(slopes) {
    return slopes.slice().reverse().map(function(value){return 1-value});
}

// The last poit is always included
function makeSlope(point1, point2, slopes) {
    var points = [];
    for(var i=0; i<slopes.length;i++) {
        points.push( [ point1[0] + (point2[0]-point1[0])*(i+1)/(slopes.length+1),
                       point1[1] + (point2[1]-point1[1])*slopes[i] ] );
    }
    points.push(point2);
    return points;
}

// The last poit is always included
function makeTriSlope(point1, point2, point3, slopes) {
    return makeSlope(point1, point2, slopes).concat( makeSlope(point2, point3, invertSlope(slopes)) );
}

function makeSlopeBattlement(point1, point2, slopes, height, startHigh) {
    if(height==0) return makeSlope(point1, point2, slopes);
    var points = [];
    if(!startHigh) points.push([point1[0], point1[1]+height])
    for(var i=0; i<slopes.length;i++) {
        points.push( [ point1[0] + (point2[0]-point1[0])*(i+1)/(slopes.length+1),
                       point1[1] + (point2[1]-point1[1])*slopes[i]+height*!startHigh ] );
        points.push( [ point1[0] + (point2[0]-point1[0])*(i+1)/(slopes.length+1),
                       point1[1] + (point2[1]-point1[1])*slopes[i]+height*startHigh ] );
        startHigh = !startHigh;
    }
    if( !startHigh ) {
        points.push([point2[0], point2[1]+height])
    }
    else {
        points.push(point2);
    }
    return points;
}

function makeTriSlopeBattlement(point1, point2, point3, slopes, height) {
    if(height==0) return makeTriSlope(point1, point2, point3, slopes);
    var startHigh = slopes.length%2 == 1;
    return makeSlopeBattlement(point1, point2, slopes, height, true).concat( makeSlopeBattlement(point2, point3, invertSlope(slopes), height, startHigh) );
}


////////////////////////////////////////////////////////////////////////////////////
//////////                       BASE GENERATION                     ///////////////
////////////////////////////////////////////////////////////////////////////////////


// Things to be implemented here:
// Base:
// - Multi base
function setBase(building, base, width, rotations, numberFloors, heightFloor, territory, params) {
    
    var base_type = randMap(territory.building_types.base);
    switch(base_type) {
        case "rect": // rectangular base
            building.base_shaded = {paths: [ [ [base[0], base[1]], 
                                               [base[0], base[1]-heightFloor*numberFloors],
                                               [base[0]-rotations[0], base[1]-heightFloor*numberFloors-rotations[1]],
                                               [base[0]-rotations[0], base[1]-rotations[1]],
                                               [base[0], base[1]] ] ],
                                    fill_colors: territory.colors.wall.shade,
                                    cardinal_tension: 0.9};

            building.base = {paths: [ [ [base[0], base[1]], 
                                        [base[0], base[1]-heightFloor*numberFloors],
                                        [base[0]+width, base[1]-heightFloor*numberFloors],
                                        [base[0]+width, base[1]],
                                        [base[0], base[1]] ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9};

            building.outline = {paths: [ [ [base[0]+width, base[1]-heightFloor*numberFloors],
                                           [base[0]+width, base[1]],
                                           [base[0], base[1]],
                                           [base[0]-rotations[0], base[1]-rotations[1]],
                                           [base[0]-rotations[0], base[1]-heightFloor*numberFloors-rotations[1]] ],
                                         [ [base[0], base[1]-heightFloor*numberFloors],
                                           [base[0], base[1]] ] ],
                                cardinal_tension: 0.9,
                                stroke_sizes: params.strokeSize};
            break;
        case "round": // round base
            building.base = {paths: [ [ [base[0]-rotations[0], base[1]-rotations[1]], 
                                        [base[0]-rotations[0], base[1]-rotations[1]-heightFloor*numberFloors],
                                        ...makeTriSlope( [base[0]-rotations[0], base[1]-rotations[1]-heightFloor*numberFloors],
                                                         [base[0]+width/2     , base[1]-heightFloor*numberFloors],
                                                         [base[0]+width       , base[1]-rotations[1]-heightFloor*numberFloors],
                                                         roundSlopes ),
                                        [base[0]+width               , base[1]-rotations[1]],
                                        ...makeTriSlope( [base[0]+width       , base[1]-rotations[1]],
                                                         [base[0]+width/2     , base[1]],
                                                         [base[0]-rotations[0], base[1]-rotations[1]],
                                                         roundSlopes ) ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9};
            building.base_shaded = {paths: [ [ [base[0]-rotations[0], base[1]-rotations[1]], 
                                               [base[0]-rotations[0], base[1]-rotations[1]-heightFloor*numberFloors],
                                               ...makeSlope( [base[0]-rotations[0], base[1]-rotations[1]-heightFloor*numberFloors],
                                                             [base[0]+width/2     , base[1]-heightFloor*numberFloors],
                                                             roundSlopes).slice(0,roundSlopes.length-1),
                                               ...makeSlope( [base[0]-rotations[0], base[1]-rotations[1]],
                                                             [base[0]+width/2     , base[1]],
                                                             invertSlope(roundSlopes) ).slice(0,roundSlopes.length-1).reverse(),
                                               [base[0]-rotations[0], base[1]-rotations[1]] ] ],
                                    fill_colors: territory.colors.wall.shade,
                                    cardinal_tension: 0.9};
            building.base_outline = {paths: [ [ [base[0]-rotations[0], base[1]-rotations[1]-heightFloor*numberFloors],
                                                [base[0]-rotations[0], base[1]-rotations[1]], 
                                                ...makeTriSlope( [base[0]-rotations[0], base[1]-rotations[1]], 
                                                                 [base[0]+width/2     , base[1]],
                                                                 [base[0]+width       , base[1]-rotations[1]],
                                                                 roundSlopes ),
                                                [base[0]+width               , base[1]-rotations[1]-heightFloor*numberFloors] ] ],
                                     cardinal_tension: 0.9,
                                     stroke_sizes: params.strokeSize};
            break;
    }
    building.base.type = base_type;
}


////////////////////////////////////////////////////////////////////////////////////
//////////                       ROOF GENERATION                     ///////////////
////////////////////////////////////////////////////////////////////////////////////


// Things to be implemented here:
// Roofs:
// - Japanse style roof
// - overhanging roof
function setRoof(building, base, width, rotations, heightRoof, territory, params) {
    var roof_type;
    if(building.base.type == "round") { roof_type = randMap(territory.building_types.roof.round); }
    else { roof_type = randMap(territory.building_types.roof.rect); }

    // variant selection in the case where a type can have mutiple side
    if(strListIncludes(roof_type, ["tri", "h2lTri", "l2hTri"])) roof_type += randMap({1:1, 2:1});
    if(roof_type == "slope") roof_type = randMap({slope1:1, slope2:1, slope3:1, slope4:1});

    // used to defined the slope of some roof types (pyramidal, triangular)
    var flexing_points = null;

    // used for battlements
    var do_batt = true; // do or not do battlement for round buildings
    var do_outer = true;
    var batt_ratio = 0.75;
    var number_batt = 3;
    var batt_heigth = heightRoof/2;
    var batt_heigth_ratio = 0.4;

    switch(roof_type) {
        case "h2lPyramid": // Pyramidal roof variant from high slope to low slope
            if( flexing_points==null ) flexing_points = [0.40, 0.70, 0.85, 0.95];
        case "l2hPyramid": // Pyramidal roof variant from low slope to high slope
            if( flexing_points==null ) flexing_points = [0.10, 0.25, 0.40, 0.65];
        case "pyramid": // Pyramidal roof
            if( flexing_points==null ) flexing_points = [0.20, 0.40, 0.60, 0.80];
            building.roof_shaded = {paths: [ [ [base[0], base[1]],
                                                ...makeTriSlope( [base[0], base[1]],
                                                                 [base[0]+width/2-rotations[0]/2, base[1]-heightRoof-rotations[1]/2],
                                                                 [base[0]-rotations[0], base[1]-rotations[1]],
                                                                 flexing_points),
                                               [base[0], base[1]] ] ],
                                    fill_colors: territory.colors.roof.shade,
                                    cardinal_tension: 0.9,
                                    stroke_sizes: params.strokeSize};

            building.roof = {paths: [ [ [base[0], base[1]],
                                        ...makeTriSlope( [base[0], base[1]],
                                                         [base[0]+width/2-rotations[0]/2, base[1]-heightRoof-rotations[1]/2],
                                                         [base[0]+width, base[1]],
                                                         flexing_points),
                                        [base[0], base[1]] ] ],
                             fill_colors: territory.colors.roof.base,
                             cardinal_tension: 0.9,
                             stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0]+width/2-rotations[0]/2, base[1]-heightRoof-rotations[1]/2] ];
            break;
        case "h2lTri1": // Triangular roof variant from high slope to low slope
            if( flexing_points==null ) flexing_points = [0.40, 0.70, 0.85, 0.95];
        case "l2hTri1": // Triangular roof variant from low slope to high slope
            if( flexing_points==null ) flexing_points = [0.10, 0.25, 0.40, 0.65];
        case "tri1": // Triangular roof
            if( flexing_points==null ) flexing_points = [0.20, 0.40, 0.60, 0.80];
            building.roof_shaded = {paths: [ [ [base[0]+width/2-rotations[0], base[1]-heightRoof-rotations[1]],
                                               [base[0]+width/2, base[1]-heightRoof],
                                               ...makeSlope( [base[0]+width/2, base[1]-heightRoof],
                                                             [base[0], base[1]],
                                                             invertSlope(flexing_points) ),
                                               [base[0]-rotations[0], base[1]-rotations[1]],
                                               ...makeSlope( [base[0]-rotations[0], base[1]-rotations[1]],
                                                             [base[0]+width/2-rotations[0], base[1]-heightRoof-rotations[1]],
                                                             flexing_points ) ] ],
                                    fill_colors: territory.colors.roof.shade,
                                    cardinal_tension: 0.9,
                                    stroke_sizes: params.strokeSize};
            building.roof_brigth = {paths: [ [ [base[0]+width/2-rotations[0], base[1]-heightRoof-rotations[1]],
                                               [base[0]+width/2, base[1]-heightRoof],
                                               ...makeSlope( [base[0]+width/2, base[1]-heightRoof],
                                                             [base[0]+width, base[1]],
                                                             invertSlope(flexing_points) ),
                                               [base[0]+width-rotations[0], base[1]-rotations[1]],
                                               ...makeSlope( [base[0]+width-rotations[0], base[1]-rotations[1]],
                                                             [base[0]+width/2-rotations[0], base[1]-heightRoof-rotations[1]],
                                                             flexing_points ) ] ],
                                    fill_colors: territory.colors.roof.base,
                                    cardinal_tension: 0.9,
                                    stroke_sizes: params.strokeSize};

            building.roof = {paths: [ [ [base[0], base[1]],
                                        ...makeTriSlope( [base[0], base[1]],
                                                         [base[0]+width/2, base[1]-heightRoof],
                                                         [base[0]+width, base[1]],
                                                         flexing_points),
                                        [base[0], base[1]] ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9};

            building.roof_outline = {paths: [building.roof.paths[0].slice(0, building.roof.paths[0].length-1)], // same as above without the closure
                                     cardinal_tension: 0.9,
                                     stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0]+width/2, base[1]-heightRoof],
                                             [base[0]+width/2-rotations[0]/2, base[1]-heightRoof-rotations[1]/2],
                                             [base[0]+width/2-rotations[0], base[1]-heightRoof-rotations[1]] ];
            break;
        case "h2lTri2": // Triangular roof variant from high slope to low slope - side 2
            if( flexing_points==null ) flexing_points = [0.40, 0.70, 0.85, 0.95];
        case "l2hTri2": // Triangular roof variant from low slope to high slope - side 2
            if( flexing_points==null ) flexing_points = [0.10, 0.25, 0.40, 0.65];
        case "tri2": // Triangular roof - side 2
            if( flexing_points==null ) flexing_points = [0.20, 0.40, 0.60, 0.80];
            building.roof_shaded = {paths: [ [ [base[0], base[1]],
                                                ...makeTriSlope( [base[0], base[1]],
                                                                 [base[0]-rotations[0]/2, base[1]-rotations[1]/2-heightRoof],
                                                                 [base[0]-rotations[0], base[1]-rotations[1]],
                                                                 flexing_points),
                                               [base[0], base[1]] ] ],
                                    fill_colors: territory.colors.wall.shade,
                                    cardinal_tension: 0.9};

            building.roof_outline = {paths: [ [ [base[0]-rotations[0]/2, base[1]-rotations[1]/2-heightRoof],
                                                ...makeSlope( [base[0]-rotations[0]/2, base[1]-rotations[1]/2-heightRoof],
                                                              [base[0]-rotations[0], base[1]-rotations[1]],
                                                              invertSlope(flexing_points)) ] ],
                                     cardinal_tension: 0.9,
                                     stroke_sizes: params.strokeSize};

            building.roof = {paths: [ [ [base[0]-rotations[0]/2, base[1]-rotations[1]/2-heightRoof],
                                        [base[0]+width-rotations[0]/2, base[1]-rotations[1]/2-heightRoof],
                                        ...makeSlope( [base[0]+width-rotations[0]/2, base[1]-rotations[1]/2-heightRoof],
                                                      [base[0]+width, base[1]],
                                                      invertSlope(flexing_points)),
                                        [base[0], base[1]],
                                        ...makeSlope( [base[0], base[1]],
                                                      [base[0]-rotations[0]/2, base[1]-rotations[1]/2-heightRoof],
                                                      flexing_points) ] ],
                             fill_colors: territory.colors.roof.base,
                             cardinal_tension: 0.9,
                             stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0]-rotations[0]/2, base[1]-rotations[1]/2-heightRoof],
                                             [base[0]-rotations[0]/2+width/2, base[1]-rotations[1]/2-heightRoof],
                                             [base[0]-rotations[0]/2+width, base[1]-rotations[1]/2-heightRoof] ];
            break;
        case "slope1": // Slope roof - side 1
            building.roof = {paths: [ [ [base[0]+width, base[1]-heightRoof],
                                        [base[0]+width, base[1]],
                                        [base[0], base[1]],
                                        [base[0]+width, base[1]-heightRoof] ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9,
                             stroke_color: territory.colors.wall.base,
                             stroke_sizes: params.strokeSize};

            building.roof_shaded = {paths: [ [ [base[0]+width-rotations[0], base[1]-heightRoof-rotations[1]],
                                               [base[0]+width, base[1]-heightRoof],
                                               [base[0], base[1]],
                                               [base[0]-rotations[0], base[1]-rotations[1]],
                                               [base[0]+width-rotations[0], base[1]-heightRoof-rotations[1]] ] ],
                                    fill_colors: territory.colors.roof.shade,
                                    cardinal_tension: 0.9,
                                    stroke_sizes: params.strokeSize};

            building.roof_outline = {paths: [ [ [base[0], base[1]],
                                                [base[0]+width, base[1]-heightRoof],
                                                [base[0]+width, base[1]] ] ],
                                     cardinal_tension: 0.9,
                                     stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0]+width, base[1]-heightRoof],
                                             [base[0]-rotations[0]/2+width, base[1]-rotations[1]/2-heightRoof],
                                             [base[0]-rotations[0]+width, base[1]-rotations[1]-heightRoof] ];
            break;
        case "slope2": // Slope roof - side 2
            building.roof = {paths: [ [ [base[0]-rotations[0], base[1]-heightRoof-rotations[1]],
                                        [base[0], base[1]-heightRoof],
                                        [base[0]+width, base[1]],
                                        [base[0]+width-rotations[0], base[1]-rotations[1]],
                                        [base[0]-rotations[0], base[1]-heightRoof-rotations[1]] ] ],
                             fill_colors: territory.colors.roof.base,
                             cardinal_tension: 0.9,
                             stroke_sizes: params.strokeSize};

            building.wall_ext = {paths: [ [ [base[0], base[1]-heightRoof],
                                            [base[0]+width, base[1]],
                                            [base[0], base[1]],
                                            [base[0], base[1]-heightRoof] ] ],
                                 fill_colors: territory.colors.wall.base,
                                 cardinal_tension: 0.9};

            building.wall_ext_shaded = {paths: [ [ [base[0], base[1]-heightRoof],
                                                   [base[0]-rotations[0], base[1]-heightRoof-rotations[1]],
                                                   [base[0]-rotations[0], base[1]-rotations[1]],
                                                   [base[0], base[1]],
                                                   [base[0], base[1]-heightRoof] ] ],
                                        fill_colors: territory.colors.wall.shade,
                                        cardinal_tension: 0.9,
                                        stroke_color: territory.colors.wall.shade,
                                        stroke_sizes: params.strokeSize};

            building.roof_outline = {paths: [ [ [base[0]+width, base[1]],
                                                [base[0], base[1]-heightRoof],
                                                [base[0]-rotations[0], base[1]-heightRoof-rotations[1]],
                                                [base[0]-rotations[0], base[1]-rotations[1]+0.001] ],
                                              [ [base[0], base[1]-heightRoof],
                                                [base[0], base[1]+0.001] ] ],
                                     cardinal_tension: 0.9,
                                     stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0], base[1]-heightRoof],
                                             [base[0]-rotations[0]/2, base[1]-rotations[1]/2-heightRoof],
                                             [base[0]-rotations[0], base[1]-rotations[1]-heightRoof] ];
            break;
        case "slope3": // Slope roof - from front
            building.roof_shaded = {paths: [ [ [base[0], base[1]],
                                               [base[0]-rotations[0], base[1]-rotations[1]],
                                               [base[0]-rotations[0], base[1]-rotations[1]-heightRoof],
                                               [base[0], base[1]], ] ],
                                    fill_colors: territory.colors.wall.shade,
                                    cardinal_tension: 0.9};

            building.roof = {paths: [ [ [base[0], base[1]],
                                        [base[0]+width, base[1]],
                                        [base[0]+width-rotations[0], base[1]-rotations[1]-heightRoof],
                                        [base[0]-rotations[0], base[1]-rotations[1]-heightRoof],
                                        [base[0], base[1]] ] ],
                             fill_colors: territory.colors.roof.base,
                             cardinal_tension: 0.9,
                             stroke_sizes: params.strokeSize};

            building.roof_outline = {paths: [ [ [base[0]-rotations[0], base[1]-rotations[1]-heightRoof],
                                                [base[0]-rotations[0], base[1]-rotations[1]] ] ],
                                     cardinal_tension: 0.9,
                                     stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0]-rotations[0], base[1]-rotations[1]-heightRoof],
                                             [base[0]-rotations[0]+width/2, base[1]-rotations[1]-heightRoof],
                                             [base[0]-rotations[0]+width, base[1]-rotations[1]-heightRoof] ];
            break;
        case "slope4": // Slope roof - from back
            building.roof = {paths: [ [ [base[0], base[1]],
                                        [base[0], base[1]-heightRoof],
                                        [base[0]+width, base[1]-heightRoof],
                                        [base[0]+width, base[1]],
                                        [base[0], base[1]] ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9};

            building.roof_shaded = {paths: [ [ [base[0], base[1]],
                                               [base[0], base[1]-heightRoof],
                                               [base[0]-rotations[0], base[1]-rotations[1]],
                                               [base[0], base[1]] ] ],
                                    fill_colors: territory.colors.wall.shade,
                                    cardinal_tension: 0.9};

            building.roof_outline = {paths: [ [ [base[0]+width, base[1]],
                                                [base[0]+width, base[1]-heightRoof],
                                                [base[0], base[1]-heightRoof],
                                                [base[0]-rotations[0], base[1]-rotations[1]] ],
                                              [ [base[0], base[1]-heightRoof],
                                                [base[0], base[1]] ] ],
                                     cardinal_tension: 0.9,
                                     stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0], base[1]-heightRoof],
                                             [base[0]+width/2, base[1]-heightRoof],
                                             [base[0]+width, base[1]-heightRoof] ];
            break;
        case "flat": // flat roof
            building.roof = {paths: [ [ [base[0]                   , base[1]],
                                        [base[0]+width             , base[1]],
                                        [base[0]+width-rotations[0], base[1]-rotations[1]],
                                        [base[0]-rotations[0]      , base[1]-rotations[1]],
                                        [base[0]                   , base[1]] ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9,
                             stroke_color: territory.colors.wall.base,
                             stroke_sizes: params.strokeSize};

            building.roof_outline = {paths: 
                                    [ [ [base[0]                   , base[1]],
                                        [base[0]+width             , base[1]],
                                        [base[0]+width-rotations[0], base[1]-rotations[1]],
                                        [base[0]-rotations[0]      , base[1]-rotations[1]],
                                        [base[0]                   , base[1]] ] ],
                             cardinal_tension: 0.9,
                             stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0]-rotations[0]/2+width/2, base[1]-rotations[1]/2],
                                             [base[0]-rotations[0], base[1]-rotations[1]],
                                             [base[0]+width, base[1]],
                                             [base[0]-rotations[0]+width, base[1]-rotations[1]],
                                             [base[0], base[1]] ];
            break;
        case "wall": // flat roof with a wall
            do_outer = false;
            number_batt = 0;
            batt_heigth = batt_heigth/2;
        case "batt": // flat roof with battlement
            do_outer = false;
        case "outerWall": // flat roof with a wall that sticks out
            if(do_outer) {
                number_batt = 0;
                batt_heigth = batt_heigth/2;
            }
        case "outerBatt": // flat roof with a battlement that sticks out
            if(do_outer) {
                width = width+rotations[0]*0.50;
                base[0] = base[0]-rotations[0]*0.25;
            }
            building.roof_in = {paths:  [ [ [base[0]                   , base[1]],
                                            [base[0]+width             , base[1]],
                                            [base[0]+width-rotations[0], base[1]-rotations[1]],
                                            [base[0]-rotations[0]      , base[1]-rotations[1]],
                                            [base[0]                   , base[1]] ],
                                          [ [base[0]-rotations[0]      , base[1]-rotations[1]],
                                            [base[0]+width-rotations[0], base[1]-rotations[1]],
                                            [base[0]+width-rotations[0], base[1]-rotations[1]-batt_heigth],
                                            ...makeBattlement( [base[0]+width-rotations[0], base[1]-rotations[1]-batt_heigth],
                                                               [base[0]-rotations[0]      , base[1]-rotations[1]-batt_heigth],
                                                               batt_heigth*batt_heigth_ratio, number_batt, batt_ratio),
                                            [base[0]-rotations[0]      , base[1]-rotations[1]] ] ],
                                 fill_colors: territory.colors.wall.base,
                                 cardinal_tension: 0.9};

            building.shaded_in = {paths: 
                                    [ [ [base[0]+width             , base[1]],
                                        [base[0]+width             , base[1]-batt_heigth],
                                        ...makeBattlement( [base[0]+width             , base[1]-batt_heigth],
                                                           [base[0]+width-rotations[0], base[1]-batt_heigth-rotations[1]],
                                                           batt_heigth*batt_heigth_ratio, number_batt-1, batt_ratio),
                                        [base[0]+width-rotations[0], base[1]-rotations[1]],
                                        [base[0]+width             , base[1]] ],
                                      [ [base[0]                   , base[1]],
                                        [base[0]+width             , base[1]],
                                        [base[0]+width-rotations[0], base[1]-rotations[1]],
                                        [base[0]                   , base[1]] ] ],
                             fill_colors: territory.colors.wall.shade,
                             cardinal_tension: 0.9};

            building.roof_outline_in = {paths: [building.roof_in.paths[1], building.shaded_in.paths[0]],
                                   cardinal_tension: 0.9,
                                   stroke_sizes: params.strokeSize};

            building.shaded_out = {paths: 
                                    [ [ [base[0]                   , base[1]],
                                        [base[0]                   , base[1]-batt_heigth],
                                        ...makeBattlement( [base[0]                   , base[1]-batt_heigth],
                                                           [base[0]-rotations[0]      , base[1]-rotations[1]-batt_heigth],
                                                           batt_heigth*batt_heigth_ratio, number_batt-1, batt_ratio),
                                        [base[0]-rotations[0]      , base[1]-rotations[1]],
                                        [base[0]                   , base[1]] ] ],
                             fill_colors: territory.colors.wall.shade,
                             cardinal_tension: 0.9};

            building.roof = {paths: [ [ [base[0]                   , base[1]],
                                        [base[0]+width             , base[1]],
                                        [base[0]+width             , base[1]-batt_heigth],
                                        ...makeBattlement( [base[0]+width             , base[1]-batt_heigth],
                                                           [base[0]                   , base[1]-batt_heigth],
                                                           batt_heigth*batt_heigth_ratio, number_batt, batt_ratio),
                                        [base[0]                   , base[1]] ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9};

            building.roof_outline = {paths: 
                                    [ [ [base[0]+width             , base[1]],
                                        [base[0]+width             , base[1]-batt_heigth],
                                        ...makeBattlement( [base[0]+width             , base[1]-batt_heigth],
                                                           [base[0]                   , base[1]-batt_heigth],
                                                           batt_heigth*batt_heigth_ratio, number_batt, batt_ratio),
                                        ...makeBattlement( [base[0]                   , base[1]-batt_heigth],
                                                           [base[0]-rotations[0]      , base[1]-rotations[1]-batt_heigth],
                                                           batt_heigth*batt_heigth_ratio, number_batt-1, batt_ratio),
                                        [base[0]-rotations[0]      , base[1]-rotations[1]] ],
                                      [ [base[0]                   , base[1]],
                                        [base[0]                   , base[1]-batt_heigth] ] ],
                             cardinal_tension: 0.9,
                             stroke_sizes: params.strokeSize};
            if(do_outer) building.roof_outline.paths.push( [ [base[0]+width       , base[1]],
                                                             [base[0]             , base[1]],
                                                             [base[0]-rotations[0], base[1]-rotations[1]]    ]);

            building.roof.flag_positions = [ [base[0]-rotations[0], base[1]-rotations[1]-batt_heigth],
                                             [base[0], base[1]-batt_heigth],
                                             [base[0]+width, base[1]-batt_heigth],
                                             [base[0]-rotations[0]+width, base[1]-rotations[1]-batt_heigth] ];
            break;
        case "h2lSpike": // Spike roof variant from high slope to low slope
            if( flexing_points==null ) flexing_points = [0.40, 0.70, 0.85, 0.95];
        case "l2hSpike": // Spike roof variant from low slope to high slope
            if( flexing_points==null ) flexing_points = [0.10, 0.25, 0.40, 0.65];
        case "spike": // Spike roof
            if( flexing_points==null ) flexing_points = [0.20, 0.40, 0.60, 0.80];
            var shade_point = makeSlope( [base[0]-rotations[0]        , base[1]-rotations[1]], // The point is aligned with the base shade on the front side
                                            [base[0]+width*0.50          , base[1]], 
                                            invertSlope(roundSlopes) )[roundSlopes.length-2]; 
            building.roof = {paths: [ [ [base[0]-rotations[0]        , base[1]-rotations[1]],
                                        ...makeTriSlope( [base[0]-rotations[0]        , base[1]-rotations[1]],
                                                         [base[0]+width/2-rotations[0]/2, base[1]-heightRoof-rotations[1]/2],
                                                         [base[0]+width               , base[1]-rotations[1]],
                                                         flexing_points ),
                                        ...makeTriSlope( [base[0]+width               , base[1]-rotations[1]],
                                                         [base[0]+width*0.50          , base[1]], 
                                                         [base[0]-rotations[0]        , base[1]-rotations[1]],
                                                         roundSlopes ) ] ],
                             fill_colors: territory.colors.roof.base,
                             cardinal_tension: 0.9};

            building.roof_shaded = {paths:
                                    [ [ [base[0]-rotations[0]        , base[1]-rotations[1]],
                                        ...makeTriSlope( [base[0]-rotations[0]        , base[1]-rotations[1]],
                                                         [base[0]+width/2-rotations[0]/2, base[1]-heightRoof-rotations[1]/2], 
                                                         shade_point, 
                                                         flexing_points ),
                                        ...makeSlope( [base[0]-rotations[0], base[1]-rotations[1]],
                                                      [base[0]+width/2     , base[1]],
                                                      roundSlopes ).slice(0,roundSlopes.length-1).reverse() ] ],
                             fill_colors: territory.colors.roof.shade,
                             cardinal_tension: 0.9};

            building.roof_outline = {paths: building.roof.paths,
                                     cardinal_tension: 0.9,
                                     stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0]+width/2-rotations[0]/2, base[1]-heightRoof-rotations[1]/2] ];
            break;
        case "flatR": // Flat roof
            building.roof = {paths: [ [ [base[0]-rotations[0], base[1]-rotations[1]],
                                        ...makeTriSlope( [base[0]-rotations[0] , base[1]-rotations[1]],
                                                         [base[0]+width/2      , base[1]-rotations[1]*2],
                                                         [base[0]+width        , base[1]-rotations[1]],
                                                         roundSlopes ),
                                        ...makeTriSlope( [base[0]+width        , base[1]-rotations[1]],
                                                         [base[0]+width/2      , base[1] ],
                                                         [base[0]-rotations[0] , base[1]-rotations[1]],
                                                         roundSlopes ) ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9,
                             stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0]+width/2-rotations[0]/2, base[1]-rotations[1]/2] ];
            break;
        case "wallR": // Roof with a wall border
            do_batt = 0;
            do_outer = false;
            batt_heigth = batt_heigth/2;
        case "battR": // Roof with an outer wall border
            do_outer = false;
        case "outerWallR": // Roof with a battlement border
            if(do_outer){
                do_batt = 0;
                batt_heigth = batt_heigth/2;
            }
        case "outerBattR": // Roof with an outer battlement border
            if(do_outer) {
                width = width+rotations[0]*0.50;
                base[0] = base[0]-rotations[0]*0.25;
            }
            building.roof_in = {paths: [ [ [base[0]-rotations[0], base[1]-rotations[1]],
                                            ...makeTriSlope( [base[0]-rotations[0] , base[1]-rotations[1]],
                                                             [base[0]+width/2      , base[1]-rotations[1]*2],
                                                             [base[0]+width        , base[1]-rotations[1]],
                                                             roundSlopes ),
                                            ...makeTriSlope( [base[0]+width        , base[1]-rotations[1]],
                                                             [base[0]+width/2      , base[1] ],
                                                             [base[0]-rotations[0] , base[1]-rotations[1]],
                                                             roundSlopes ) ],
                                          [ [base[0]+width, base[1]-rotations[1]],
                                            [base[0]+width, base[1]-rotations[1]-batt_heigth],
                                            ...makeTriSlopeBattlement( [base[0]+width        , base[1]-rotations[1]-batt_heigth],
                                                                       [base[0]+width/2      , base[1]-rotations[1]*2-batt_heigth],
                                                                       [base[0]-rotations[0] , base[1]-rotations[1]-batt_heigth],
                                                                       roundSlopes, do_batt*batt_heigth*batt_heigth_ratio),
                                            [base[0]-rotations[0], base[1]-rotations[1]],
                                            ...makeTriSlope( [base[0]-rotations[0] , base[1]-rotations[1]],
                                                             [base[0]+width/2      , base[1]-rotations[1]*2],
                                                             [base[0]+width        , base[1]-rotations[1]],
                                                             roundSlopes ) ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9};

            building.shade_in = {paths: [ [ [base[0]+width, base[1]-rotations[1]],
                                            ...makeTriSlope( [base[0]+width, base[1]-rotations[1]],
                                                             [base[0]+width/2           , base[1]],
                                                             [base[0]-rotations[0]      , base[1]-rotations[1]],
                                                             roundSlopes ).slice(0,2*roundSlopes.length-1),
                                            ...makeSlope( [base[0]+width   , base[1]-rotations[1]],
                                                          [base[0]+width/2 , base[1]-rotations[1]*2],
                                                          roundSlopes ).slice(0,roundSlopes.length-1).reverse() ],
                                           [ [base[0]+width, base[1]-rotations[1]],
                                             [base[0]+width, base[1]-rotations[1]-batt_heigth],
                                            ...makeSlopeBattlement( [base[0]+width, base[1]-rotations[1]-batt_heigth],
                                                                    [base[0]+width/2 , base[1]-rotations[1]*2-batt_heigth],
                                                                       roundSlopes, do_batt*batt_heigth*batt_heigth_ratio, true).slice(0, (1+do_batt)*(roundSlopes.length-1) ),
                                            ...makeSlope( [base[0]+width   , base[1]-rotations[1]],
                                                          [base[0]+width/2 , base[1]-rotations[1]*2],
                                                          roundSlopes ).slice(0,roundSlopes.length-1).reverse() ] ],
                                 fill_colors: territory.colors.wall.shade,
                                 cardinal_tension: 0.9};

            building.roof_outline_in = {paths: [building.roof_in.paths[1]],
                                       cardinal_tension: 0.9,
                                       stroke_sizes: params.strokeSize};

            building.roof = {paths: [ [ [base[0]-rotations[0], base[1]-rotations[1]],
                                        [base[0]-rotations[0], base[1]-rotations[1]-batt_heigth],
                                        ...makeTriSlopeBattlement( [base[0]-rotations[0] , base[1]-rotations[1]-batt_heigth],
                                                                   [base[0]+width/2      , base[1]-batt_heigth],
                                                                   [base[0]+width        , base[1]-rotations[1]-batt_heigth],
                                                                   roundSlopes, do_batt*batt_heigth*batt_heigth_ratio),
                                        [base[0]+width        , base[1]-rotations[1]],
                                        ...makeTriSlope( [base[0]+width        , base[1]-rotations[1]],
                                                         [base[0]+width/2      , base[1]],
                                                         [base[0]-rotations[0] , base[1]-rotations[1]],
                                                         roundSlopes ) ] ],
                             fill_colors: territory.colors.wall.base,
                             cardinal_tension: 0.9};

            building.shade = {paths: [ [ [base[0]-rotations[0], base[1]-rotations[1]],
                                         [base[0]-rotations[0], base[1]-rotations[1]-batt_heigth],
                                         ...makeSlopeBattlement( [base[0]-rotations[0], base[1]-rotations[1]-batt_heigth],
                                                                 [base[0]+width/2 , base[1]-batt_heigth],
                                                                 roundSlopes, do_batt*batt_heigth*batt_heigth_ratio, true).slice(0, (1+do_batt)*(roundSlopes.length-1) ),
                                         ...makeSlope( [base[0]-rotations[0], base[1]-rotations[1]],
                                                       [base[0]+width/2 , base[1]],
                                                       roundSlopes ).slice(0,roundSlopes.length-1).reverse() ] ],
                              fill_colors: territory.colors.wall.shade,
                              cardinal_tension: 0.9};

            building.roof_outline = {paths: do_outer ? building.roof.paths : [building.roof.paths[0].slice(0,building.roof.paths[0].length-2*(roundSlopes.length+1) ) ],
                                     cardinal_tension: 0.9,
                                     stroke_sizes: params.strokeSize};

            building.roof.flag_positions = [ [base[0]-rotations[0], base[1]-rotations[1]-batt_heigth],
                                             [base[0]+width/2, base[1]-batt_heigth],
                                             [base[0]+width, base[1]-rotations[1]-batt_heigth],
                                             [base[0]-rotations[0]+width/2, base[1]-2*rotations[1]-batt_heigth] ];
    }
    building.roof.type = roof_type;
}


////////////////////////////////////////////////////////////////////////////////////
//////////                    DECORATION GENERATION                  ///////////////
////////////////////////////////////////////////////////////////////////////////////

// Things to be implemented here:
// Doors:
// Windows:
function setDecoration(building, base, width, rotations, numberFloors, heightFloor, windowPerFloor, territory, params) {

    var door = -1;  // 1/4 of them have doors
    if(randRangeInt(0,3)==0>0) door = randRangeInt(0, windowPerFloor-1);
    if(door>=0 && building.base.type=="round" && windowPerFloor==3) door = 1; // small correction to avoid the curvature error in round base

    var door_type = randMap(territory.building_types.door);
    var door_color = null; // Can be used in case the door is a curtain
    var do_support = false; // do a frame around the door / window
    var do_basic_frame = false; // do a frame on top of the door / window
    var do_arc_frame = false; // do an arc on top of the door

    var window_type = randMap(territory.building_types.window);
    var window_color = territory.colors.window;
    var window_base = 1/3; // relative to floor height
    var window_top = 2/3;  // relative to floor height
    var slopes = roundSlopes;

    if(door>=0) {
        switch(door_type) {
            case "curtainFullFrame":
                do_support = true;
            case "curtainFrame":
                do_basic_frame = true;
            case "curtain":
                door_color = territory.colors.curtain;
            case "fullFrame":
                if(door_color == null && do_basic_frame == false) do_support = true;
            case "frame":
                if(door_color == null) do_basic_frame = true;
            case "arcFullFrame":
                if(door_color == null && do_basic_frame == false) do_support = true;
            case "arc":
                if(door_color == null && do_basic_frame == false) do_arc_frame = true;
            case "med":
                if(do_basic_frame) {
                    building.door_frame = {paths: [ [ [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.60], 
                                                      [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.50], 
                                                      [base[0]+(door+1+0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.50], 
                                                      [base[0]+(door+1+0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.60], 
                                                      [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.60] ] ],
                                          fill_colors: territory.colors.structure,
                                          cardinal_tension: 0.9,
                                          stroke_sizes: params.strokeSize};
                }

                if(do_arc_frame) {
                    building.door_frame = {paths: [ [ [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.50], 
                                                      [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.60], 
                                                       ...makeTriSlope( [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.60], 
                                                                        [base[0]+(door+1)*width/(windowPerFloor+1), base[1]-heightFloor*0.70], 
                                                                        [base[0]+(door+1+0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.60], 
                                                                        roundSlopes ),
                                                      [base[0]+(door+1+0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.50],
                                                      [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.50] ] ],
                                          fill_colors: territory.colors.structure,
                                          cardinal_tension: 0.9,
                                          stroke_sizes: params.strokeSize};
                }

                if(do_support) {
                    building.support = {paths: [ [ [base[0]+(door+1+0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.50], 
                                                   [base[0]+(door+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor*0.50], 
                                                   [base[0]+(door+1+0.25)*width/(windowPerFloor+1), base[1]], 
                                                   [base[0]+(door+1+0.35)*width/(windowPerFloor+1), base[1]], 
                                                   [base[0]+(door+1+0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.50] ],
                                                 [ [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.50], 
                                                   [base[0]+(door+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*0.50], 
                                                   [base[0]+(door+1-0.25)*width/(windowPerFloor+1), base[1]], 
                                                   [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]], 
                                                   [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.50] ] ],
                                       fill_colors: territory.colors.structure,
                                       cardinal_tension: 0.9,
                                       stroke_sizes: params.strokeSize};
                }

                if(door_color == null) door_color = territory.colors.door;
                building.door = {paths: [ [ [base[0]+(door+1-0.25)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor/2], 
                                            [base[0]+(door+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor/2], 
                                            [base[0]+(door+1+0.25)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1-0.25)*width/(windowPerFloor+1), base[1]] ] ],
                                fill_colors: door_color,
                                cardinal_tension: 0.9,
                                stroke_sizes: params.strokeSize};
                break;
            case "big":
                building.door = {paths: [ [ [base[0]+(door+1-0.40)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1-0.40)*width/(windowPerFloor+1), base[1]-heightFloor*0.6], 
                                            [base[0]+(door+1)*width/(windowPerFloor+1), base[1]-heightFloor*0.6], 
                                            [base[0]+(door+1)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1-0.40)*width/(windowPerFloor+1), base[1]] ],
                                          [ [base[0]+(door+1)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1)*width/(windowPerFloor+1), base[1]-heightFloor*0.6], 
                                            [base[0]+(door+1+0.40)*width/(windowPerFloor+1), base[1]-heightFloor*0.6], 
                                            [base[0]+(door+1+0.40)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1)*width/(windowPerFloor+1), base[1]] ] ],
                                fill_colors: territory.colors.door,
                                cardinal_tension: 0.9,
                                stroke_sizes: params.strokeSize};
                break;
            case "barn":
                building.door = {paths: [ [ [base[0]+(door+1-0.40)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1-0.40)*width/(windowPerFloor+1), base[1]-heightFloor*0.5], 
                                            ...makeSlope( [base[0]+(door+1)*width/(windowPerFloor+1)-width/8, base[1]-heightFloor*0.5], 
                                                          [base[0]+(door+1)*width/(windowPerFloor+1), base[1]-heightFloor*0.6], 
                                                          roundSlopes ),
                                            [base[0]+(door+1)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1-0.40)*width/(windowPerFloor+1), base[1]] ],
                                          [ [base[0]+(door+1)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1)*width/(windowPerFloor+1), base[1]-heightFloor*0.6], 
                                            ...makeSlope( [base[0]+(door+1)*width/(windowPerFloor+1), base[1]-heightFloor*0.6], 
                                                          [base[0]+(door+1+0.40)*width/(windowPerFloor+1), base[1]-heightFloor*0.5], 
                                                          invertSlope(roundSlopes) ),
                                            [base[0]+(door+1+0.40)*width/(windowPerFloor+1), base[1]], 
                                            [base[0]+(door+1)*width/(windowPerFloor+1), base[1]] ] ],
                                fill_colors: territory.colors.door,
                                cardinal_tension: 0.9,
                                stroke_sizes: params.strokeSize};
                break;
            case "roundStep":
                do_basic_frame = true;
            case "round":
                building.door = {paths: [ [ [base[0]+(door+1-0.25)*width/(windowPerFloor+1), base[1]], 
                                            ...makeTriSlope( [base[0]+(door+1-0.25)*width/(windowPerFloor+1), base[1]], 
                                                             [base[0]+(door+1-0.40)*width/(windowPerFloor+1), base[1]-heightFloor*0.3], 
                                                             [base[0]+(door+1)*width/(windowPerFloor+1), base[1]-heightFloor*0.6], 
                                                             invertSlope(roundSlopes) ),
                                            ...makeTriSlope( [base[0]+(door+1)*width/(windowPerFloor+1), base[1]-heightFloor*0.6], 
                                                             [base[0]+(door+1+0.40)*width/(windowPerFloor+1), base[1]-heightFloor*0.3], 
                                                             [base[0]+(door+1+0.25)*width/(windowPerFloor+1), base[1]], 
                                                             invertSlope(roundSlopes) ) ] ],
                                fill_colors: territory.colors.door,
                                cardinal_tension: 0.9,
                                stroke_sizes: params.strokeSize};
                if(do_basic_frame) {
                    building.door_frame = {paths: [ [ [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]], 
                                                      [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.10], 
                                                      [base[0]+(door+1+0.35)*width/(windowPerFloor+1), base[1]-heightFloor*0.10], 
                                                      [base[0]+(door+1+0.35)*width/(windowPerFloor+1), base[1]], 
                                                      [base[0]+(door+1-0.35)*width/(windowPerFloor+1), base[1]] ] ],
                                          fill_colors: territory.colors.structure,
                                          cardinal_tension: 0.9,
                                          stroke_sizes: params.strokeSize};
                }
                break;
        }
    }

    building.windows = {paths: [], fill_colors: [], cardinal_tension: 0.9, stroke_sizes: params.strokeSize};
    building.window_frame = {paths: [], fill_colors: territory.colors.structure, cardinal_tension: 0.9, stroke_sizes: params.strokeSize};
    for(var f=0; f<numberFloors; f++) {
        for(var w=0; w<windowPerFloor; w++) {
            if(f==0 && door==w) continue; // This is a door, it needs to be avoided
            building.windows.fill_colors.push( (randRangeFloat(0,1)>0.75) ? territory.colors.curtain : territory.colors.window);

            switch(window_type) {
                case "arrowsplit":
                    building.windows.paths.push([ [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                  [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)] ]);
                    break;
                case "tallFullFrame":
                case "tallFrame":
                case "tallCross":
                case "tall":
                    window_top = 0.75;
                    cont = true;
                case "fullFrame":
                case "frame":
                case "cross":
                case "med":
                    do_support = window_type.toLowerCase().includes("cross") || window_type.toLowerCase().includes("full");;
                    do_basic_frame = window_type.toLowerCase().includes("frame");

                    building.windows.paths.push([ [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                  [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)],
                                                  [base[0]+(w+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)],
                                                  [base[0]+(w+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                  [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)] ]);

                    if(do_support) {
                        building.window_frame.paths.push([ [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                           [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)] ]);
                        building.window_frame.paths.push([ [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+0.5*window_base+0.5*window_top)],
                                                           [base[0]+(w+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+0.5*window_base+0.5*window_top)] ]);
                    }

                    if(do_basic_frame) {
                        building.window_frame.paths.push([ [base[0]+(w+1-0.30)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)],
                                                           [base[0]+(w+1-0.30)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top+0.25*(window_top-window_base))],
                                                           [base[0]+(w+1+0.30)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top+0.25*(window_top-window_base))],
                                                           [base[0]+(w+1+0.30)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)],
                                                           [base[0]+(w+1-0.30)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)] ]);
                    }
                    break;
                case "triangularCross":
                case "triangular":
                    slopes = [];
                case "roundCross":
                case "round":
                    do_support = window_type.toLowerCase().includes("cross");

                    building.windows.paths.push([ [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                  [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)],
                                                  ...makeTriSlope( [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)],
                                                                   [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top+0.5*(window_top-window_base))],
                                                                   [base[0]+(w+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)],
                                                                   slopes),
                                                  [base[0]+(w+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                  [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)] ]);

                    if(do_support) {
                        building.window_frame.paths.push([ [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                           [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top+0.5*(window_top-window_base))] ]);
                        building.window_frame.paths.push([ [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+0.5*window_base+0.5*window_top)],
                                                           [base[0]+(w+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+0.5*window_base+0.5*window_top)] ]);
                    }
                    break;
                case "allRound":
                case "allRoundCross":
                    do_support = window_type.toLowerCase().includes("cross");

                    building.windows.paths.push([ [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                  ...makeTriSlope( [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                                   [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base+0.5*(window_top-window_base))],
                                                                   [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)],
                                                                   invertSlope(roundSlopes) ),
                                                  ...makeTriSlope( [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)],
                                                                   [base[0]+(w+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base+0.5*(window_top-window_base))],
                                                                   [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                                   invertSlope(roundSlopes) ) ]);

                    if(do_support) {
                        building.window_frame.paths.push([ [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_base)],
                                                           [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-heightFloor*(f+window_top)] ]);
                        building.window_frame.paths.push([ [base[0]+(w+1-0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+0.5*window_base+0.5*window_top)],
                                                           [base[0]+(w+1+0.25)*width/(windowPerFloor+1), base[1]-heightFloor*(f+0.5*window_base+0.5*window_top)] ]);
                    }
                    break;
            }
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////
//////////                       FLAG GENERATION                     ///////////////
////////////////////////////////////////////////////////////////////////////////////


// Things to be implemented here:
// Flags:
// - Banners with similar vairnats as flags
function setFlag(building, building_type, size_reference, territory, params) {
    if(randRangeFloat(0,1) > params[building_type].flagChance) return;
    
    var flag_type = randMap(territory.building_types.flag);
    building.flag = {type: flag_type};
    var indexes = [randRangeInt(0, building.roof.flag_positions.length-1)];

    if(strListIncludes(building.roof.type, ["wall", "outerWall", "batt", "outerBatt", "flat"])) {
        indexes = [[0, 3], [1, 2], [0, 2], [1, 3], [0, 1, 2, 3]][randRangeInt(0,4)];
    }
    if(building.roof.type == "flat" && randRangeFloat(0,1) < 1/6) indexes = [4];

    if(strListIncludes(building.roof.type, ["wallR", "outerWallR", "battR", "outerBattR"]) && randRangeFloat(0,1) < 0.5) {
        indexes = [[0, 2], [1, 3], [0, 1, 2, 3]][randRangeInt(0,2)];
    }

    for(var f=0; f<indexes.length; f++) {
        var flag_base = building.roof.flag_positions[indexes[f]];
        switch(flag_type) {
            case "med": // Rectangular shape with indented triangle
                building["flag"+f] = {paths: [ [ [flag_base[0]                       , flag_base[1]-0.45*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.41*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.30, flag_base[1]-0.43*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.60, flag_base[1]-0.40*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.40, flag_base[1]-0.30*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.60, flag_base[1]-0.20*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.30, flag_base[1]-0.23*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.21*size_reference[1] ],
                                                 [flag_base[0]                       , flag_base[1]-0.25*size_reference[1] ],
                                                 [flag_base[0]                       , flag_base[1]-0.45*size_reference[1] ] ]],
                                      fill_colors: territory.color,
                                      cardinal_tension: 0.9,
                                      stroke_sizes: params.strokeSize/2};
                break;
            case "tri": // Triangular shape
                building["flag"+f] = {paths: [ [ [flag_base[0]                       , flag_base[1]-0.45*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.35*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.30, flag_base[1]-0.27*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.60, flag_base[1]-0.20*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.30, flag_base[1]-0.18*size_reference[1] ],
                                                 [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.20*size_reference[1] ],
                                                 [flag_base[0]                       , flag_base[1]-0.25*size_reference[1] ],
                                                 [flag_base[0]                       , flag_base[1]-0.45*size_reference[1] ] ]],
                                      fill_colors: territory.color,
                                      cardinal_tension: 0.9,
                                      stroke_sizes: params.strokeSize/2};
                 break;
            case "rect": // Rectangular shape
                building["flag"+f] = {paths: [ [ [flag_base[0]                       , flag_base[1]-0.45*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.41*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.30, flag_base[1]-0.43*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.60, flag_base[1]-0.37*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.57, flag_base[1]-0.17*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.30, flag_base[1]-0.23*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.21*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.25*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.45*size_reference[1] ] ]],
                                 fill_colors: territory.color,
                                 cardinal_tension: 0.9,
                                 stroke_sizes: params.strokeSize/2};
                 break;
            case "trirect": // Rectangular shape with triangular ending
                building["flag"+f] = {paths: [ [ [flag_base[0]                       , flag_base[1]-0.45*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.41*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.30, flag_base[1]-0.43*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.40, flag_base[1]-0.40*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.60, flag_base[1]-0.30*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.40, flag_base[1]-0.20*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.30, flag_base[1]-0.23*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.21*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.25*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.45*size_reference[1] ] ]],
                                 fill_colors: territory.color,
                                 cardinal_tension: 0.9,
                                 stroke_sizes: params.strokeSize/2};
                 break;
            case "twotri": // Double triangular shape, Asian style
                building["flag"+f] = {paths: [ [ [flag_base[0]                       , flag_base[1]-0.50*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.36*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.20, flag_base[1]-0.28*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.26*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.30*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.50*size_reference[1] ] ],
                                          [ [flag_base[0]                       , flag_base[1]-0.30*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.16*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.20, flag_base[1]-0.08*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.10, flag_base[1]-0.06*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.10*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.30*size_reference[1] ] ]],
                                 fill_colors: territory.color,
                                 cardinal_tension: 0.9,
                                 stroke_sizes: params.strokeSize/2};
                 break;
            case "irect": // Rectangular shape, rotated, Asian style
                building["flag"+f] = {paths: [ [ [flag_base[0]                       , flag_base[1]-0.50*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.20, flag_base[1]-0.50*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.20, flag_base[1]-0.10*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.10*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.50*size_reference[1] ] ]],
                                 fill_colors: territory.color,
                                 cardinal_tension: 0.9,
                                 stroke_sizes: params.strokeSize/2};
                building["mast"+f] = {paths: [ [ [flag_base[0]                       , flag_base[1]-0.5*size_reference[1]],
                                            [flag_base[0]+size_reference[0]*0.20, flag_base[1]-0.5*size_reference[1]] ] ],
                                 cardinal_tension: 0.9,
                                 stroke_sizes: params.strokeSize};
            case "diamond": // diamond shape, rotated, Asian style
                building["flag"+f] = {paths: [ [ [flag_base[0]+size_reference[0]*0.20, flag_base[1]-0.50*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.35, flag_base[1]-0.25*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.15, flag_base[1]-0.05*size_reference[1] ],
                                            [flag_base[0]                       , flag_base[1]-0.30*size_reference[1] ],
                                            [flag_base[0]+size_reference[0]*0.20, flag_base[1]-0.50*size_reference[1] ] ]],
                                 fill_colors: territory.color,
                                 cardinal_tension: 0.9,
                                 stroke_sizes: params.strokeSize/2};
                building["mast"+f] = {paths: [ [ [flag_base[0]                       , flag_base[1]-0.5*size_reference[1]],
                                            [flag_base[0]+size_reference[0]*0.20, flag_base[1]-0.5*size_reference[1]] ] ],
                                 cardinal_tension: 0.9,
                                 stroke_sizes: params.strokeSize};
                 break;
        }
        if(flag_type != "unknown") {          
            building["pole"+f] = {paths: [ [ [flag_base[0], flag_base[1]],
                                        [flag_base[0], flag_base[1]-0.5*size_reference[1]] ] ],
                             cardinal_tension: 0.9,
                             stroke_sizes: params.strokeSize};
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////
//////////                       CITY GENERATION                     ///////////////
////////////////////////////////////////////////////////////////////////////////////


function select_position(bounding_box, range, bounding_boxes) {
    // WARNING: in as bounding box are defined from bottom to top, the y axis is decreasing
    if(range[0]>range[1]) range.reverse();

    // finding the conflicting segments
    var segments = [];
    for(var i=0; i<bounding_boxes.length; i++) {
        if( !(bounding_box[0][0] > bounding_boxes[i][1][0] || bounding_box[1][0] < bounding_boxes[i][0][0]) ) {
            if( !(bounding_box[0][1]+range[1] < bounding_boxes[i][1][1] || bounding_box[1][1]+range[0] > bounding_boxes[i][0][1]) ) {
                segments.push( [bounding_boxes[i][0][1], bounding_boxes[i][1][1] ] );
            }
        }
    }

    // cleaning segments
    var invalidated;
    do {
        invalidated = [];
        for(var s1=0; s1<segments.length; s1++) {
            for(var s2=s1+1; s2<segments.length; s2++) {
                if(s2 in invalidated) continue; // This segment is already applied
                if( !(segments[s1][1] > segments[s2][0] || segments[s1][0] < segments[s2][1]) ) {
                    invalidated.push(s2);
                    segments[s1] = [Math.max(segments[s1][0], segments[s2][0]), Math.min(segments[s1][1], segments[s2][1])];
                }
            }
        }
        invalidated.reverse(); // indexes are now in decreasing order, simpler for removal
        for(var i=0; i<invalidated.length; i++) {
            segments.splice(invalidated[i],1);
        }
    } while(invalidated.length>0)

    // getting the actual segments
    segments.sort((a,b) => (a[0] < b[0] ) ? 1 : ((b[0] < a[0] ) ? -1 : 0));  // decrasing values as y axis is reversed
    var positions = [ [bounding_box[0][1]+range[1], bounding_box[0][1]+range[0]] ];
    for(var s=0; s<segments.length; s++) {
        if( positions[positions.length-1][0]-segments[s][0] < bounding_box[0][1]-bounding_box[1][1] ) {
            positions[positions.length-1][0] = segments[s][1];
        }
        else {
            positions.push( [segments[s][1], positions[positions.length-1][1]] )
            positions[positions.length-2][1] = segments[s][0];
        }
    }
    if( positions[positions.length-1][0]-positions[positions.length-1][1] < bounding_box[0][1]-bounding_box[1][1] ) {
        positions.pop();
    }

    // getting the final point
    var map_position = {};
    for(var p=0; p<positions.length; p++) {
        map_position[p] = positions[p][0]-positions[p][1] - (bounding_box[0][1]-bounding_box[1][1]);
    }
    var index = randMap(map_position);
    if(index==null) return segments[segments.length-1][1]; // special case when we cannot fit anywhere
    index = parseInt(index);
    return randRangeFloat(positions[index][1] + (bounding_box[0][1]-bounding_box[1][1]), positions[index][0]);

}

// Things to be implemented here:
// Walls and stuff
// - Wood walls
// - Stone walls
// - Stone walls with small towers
// - Hill shape
// Doors and bridge
// Special buildings
// - Forts
// - Towers
// - Multi roof buildinds
// - Twin towers with bride
// - Church or similar cultural building
// - Ring tower
// - Light house
// - Ports
// - Farms
function getBuilding(city_base, base, width, rotations, building_type, territory, params) {
    var city_width = city_base[0];
    var city_height = city_base[1];

    var heightRoof = randRangeFloat(city_height*buildingParams[building_type].heightRoof[0], city_height*buildingParams[building_type].heightRoof[1]); // 1/5 of the max size plus 4 potential floors (for features)
    var windowPerFloor = randRangeInt(buildingParams[building_type].windowsPerFloor[0], buildingParams[building_type].windowsPerFloor[1]);
    var numberFloors = randRangeInt(buildingParams[building_type].floors[0], buildingParams[building_type].floors[1]);
    var heightFloor = randRangeFloat(city_height*buildingParams[building_type].heigthFloor[0], city_height*buildingParams[building_type].heigthFloor[1]);
    var flag_chance = buildingParams[building_type].flagChance;

    var building = {};

    setBase(building, base, width, rotations, numberFloors, heightFloor, territory, params);
    setRoof(building, [base[0], base[1]-heightFloor*numberFloors], width, rotations, heightRoof, territory, params);
    setDecoration(building, base, width, rotations, numberFloors, heightFloor, windowPerFloor, territory, params);
    setFlag(building, building_type,[width*params.flagScaling, heightFloor*params.flagScaling], territory, params)

    return building;
}

function getCity(base_point, city_width, city_height, city_type, territory, params) {
    buildingParams = params.features.cities;
    if (typeof territory == 'undefined') { // default values
        territory = { color: randomColor(), building_types: getBuildingTypes()};
        territory.colors = getBuildingColors(territory);
    }

    var city = {};
    city.bounding_box = [base_point, [base_point[0]+city_width, base_point[1]-city_height] ] ;
    var city_base = [city_width, city_height];

    var numberHouse = randRangeInt(buildingParams[city_type].numberBuildings[0], buildingParams[city_type].numberBuildings[1]);
    var numberFeatures = randRangeInt(buildingParams[city_type].numberFeatures[0], buildingParams[city_type].numberFeatures[1]);
    var building_footprints = []; // The base point of the different elements, for ordering purpose
    for(var h=0; h<numberHouse; h++) {
        var width = randRangeFloat(city_width*buildingParams.building.width[0], city_width*buildingParams.building.width[1]) * (1+(city_type!="city"));
        var rotation_level = randRangeFloat(0.1,0.2);
        var rotations = [width*rotation_level, width*rotation_level];
        var base = [base_point[0]+h*city_width/numberHouse, base_point[1]];

        base[1] = select_position( [ [base[0]-rotations[0], base[1]], [base[0]+width, base[1]-rotations[1]] ], [-city_height/10, 0], building_footprints);

        var building = getBuilding(city_base, base, width, rotations, "building", territory, buildingParams);

        building_footprints.push( [ [base[0]-rotations[0], base[1] ], [base[0]+width, base[1]-rotations[1] ]]);
        building_footprints[building_footprints.length-1].building = building;
    }

    for(var ft=0; ft<numberFeatures; ft++) {
        var width = randRangeFloat(city_width*buildingParams.feature.width[0], city_width*buildingParams.feature.width[1]) * (1+(city_type!="city"));
        var rotation_level = randRangeFloat(0.1,0.2);
        var rotations = [width*rotation_level, width*rotation_level];
        var base = [base_point[0]+randRangeFloat(0,city_width-width), base_point[1]];

        base[1] = select_position( [ [base[0]-rotations[0], base[1]], [base[0]+width, base[1]-rotations[1]] ], [-city_height/10, -city_height/5], building_footprints);

        var building = getBuilding(city_base, base, width, rotations, "feature", territory, buildingParams);

        building_footprints.push( [ [base[0]-rotations[0], base[1] ], [base[0]+width, base[1]-rotations[1] ]]);
        building_footprints[building_footprints.length-1].building = building;
    }

    //ordering the buildings
    building_footprints.sort((a,b) => (a[0][1] > b[0][1] ) ? 1 : ((b[0][1]  > a[0][1] ) ? -1 : 0)); 
    for(var i=0; i<building_footprints.length; i++) {
        for(var layer in building_footprints[i].building) {
            city["building"+(i+1)+"_"+layer] = building_footprints[i].building[layer];
        }
    }

    return city;
}