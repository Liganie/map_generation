function getMountain(base_point, mountain_width, mountain_height) {
    var mountain = {};
    mountain.bounding_box = [base_point, [base_point[0]+mountain_width, base_point[1]-mountain_height] ] ;

    var primary_path = [base_point, [base_point[0]+mountain_width/2, base_point[1]-mountain_height],[base_point[0]+mountain_width, base_point[1]]];
    primary_path[1][0] =  primary_path[1][0] + randRangeFloat(-mountain_width/4, mountain_width/4); // moving the peak a bit

    var path = []; // The mountain outline
    var samples = 8;
    var dynamic_range = [];
    for(var i=0; i<2; i++) {
        path.push(primary_path[i]);
        dynamic_range = [primary_path[i+1][0]-primary_path[i][0], primary_path[i+1][1]-primary_path[i][1]]
        for(var s=1; s<samples; s++) {
            path.push( [primary_path[i][0] + s/(samples+1)*dynamic_range[0] + randRangeFloat(-1, 1)*dynamic_range[0]/(2*samples), // Range to avoid crossing
                        primary_path[i][1] + s/(samples+1)*dynamic_range[1] + randRangeFloat(-1, 1)*dynamic_range[1]/samples ] ); // Range to allow crossing
        }
    }
    path.push(primary_path[2]);
    var outline = path;

    path = [primary_path[1]]; // the inside path form the top
    dynamic_range = [mountain_width, mountain_height];
    for(var s=1; s<samples+2; s++) {
        path.push( [primary_path[1][0] + randRangeFloat(-1, 1)*dynamic_range[0]/(2*samples), // Range to avoid crossing
                    primary_path[1][1] + s/(samples)*dynamic_range[1] + randRangeFloat(-1, 1)*dynamic_range[1]/(2*samples) ] ); // Range to avoid crossing
    }
    var center = path;

    mountain.base = {paths: [ outline.slice(0, samples+1).concat(center), 
                              outline.slice(samples, 2*samples+1).reverse().concat(center) ],
                     fill_colors: ['#cccccc', '#eeeeee']};
    mountain.outline = {paths: [outline],
                        stroke_sizes: 2};
    mountain.faded = {paths: [center],
                      stroke_sizes: [2, -1]};

    return mountain;
}

function getPineTree(base_point, tree_width, tree_height) {
    var tree = {};
    tree.bounding_box = [[base_point[0]-tree_width/2, base_point[1]], [base_point[0]+tree_width/2, base_point[1]-tree_height] ] ;

    // Adding the trunk
    tree.trunk = {paths: [ [ [base_point[0]-0.20*tree_width/2, base_point[1]], 
                             [base_point[0]-0.10*tree_width/2, base_point[1]-0.10*tree_height],
                             [base_point[0]+0.10*tree_width/2, base_point[1]-0.10*tree_height],
                             [base_point[0]+0.20*tree_width/2, base_point[1]] ] ],
                  fill_colors: '#661a00',
                  stroke_sizes: 1};

    // Adding the foliage   
    tree.foliage = {paths: [ [ [base_point[0]-0.02*tree_width, base_point[1]-tree_height], //base of the folliage
                               [base_point[0]-tree_width/2,base_point[1]-0.10*tree_height],
                               [base_point[0],base_point[1]-0.10*tree_height],
                               [base_point[0]+tree_width/2,base_point[1]-0.10*tree_height],
                               [base_point[0]+0.02*tree_width, base_point[1]-tree_height] ],
                             [ [base_point[0], base_point[1]-tree_height], //shade in the folliage
                               [base_point[0]+0.9*tree_width/2,base_point[1]-0.10*tree_height],
                               [base_point[0]-0.1*tree_width,base_point[1]-0.20*tree_height] ] ],
                  fill_colors: ['#006622', '#32844e']};

    tree.outline = {paths: [ [ [base_point[0]-0.02*tree_width, base_point[1]-tree_height],
                               [base_point[0]-tree_width/2,base_point[1]-0.10*tree_height],
                               [base_point[0],base_point[1]-0.10*tree_height],
                               [base_point[0]+tree_width/2,base_point[1]-0.10*tree_height],
                               [base_point[0]+0.02*tree_width, base_point[1]-tree_height] ] ],
                  stroke_sizes: 1};

    return tree;
}

function getOakTree(base_point, tree_width, tree_height) {
    var tree = {};
    tree.bounding_box = [[base_point[0]-tree_width/2, base_point[1]], [base_point[0]+tree_width/2, base_point[1]-tree_height] ] ;

    // Adding the trunk
    tree.trunk = {paths: [ [ [base_point[0]-0.20*tree_width/2, base_point[1]], 
                             [base_point[0]-0.10*tree_width/2, base_point[1]-0.50*tree_height],
                             [base_point[0]+0.10*tree_width/2, base_point[1]-0.50*tree_height],
                             [base_point[0]+0.20*tree_width/2, base_point[1]] ] ],
                  fill_colors: '#661a00',
                  stroke_sizes: 1};

    // Adding the foliage   
    tree.foliage = {paths: [ [ [base_point[0]-0.02*tree_width, base_point[1]-tree_height], //base of the folliage
                               [base_point[0]-tree_width/2,base_point[1]-2*tree_height/3],
                               [base_point[0],base_point[1]-tree_height/3],
                               [base_point[0]+tree_width/2,base_point[1]-2*tree_height/3],
                               [base_point[0]+0.02*tree_width, base_point[1]-tree_height] ],
                             [ [base_point[0]-0.02*tree_width, base_point[1]-tree_height], //shade of the folliage
                               [base_point[0]-0.20*tree_width,base_point[1]-2*tree_height/3],
                               [base_point[0],base_point[1]-1.20*tree_height/3],
                               [base_point[0]+tree_width/2,base_point[1]-2*tree_height/3],
                               [base_point[0]+0.02*tree_width, base_point[1]-tree_height] ] ],
                   fill_colors: ['#72a604', '#9be006'],
                   cardinal_tension: 0};

    tree.outline = {paths: [ [ [base_point[0]-0.02*tree_width, base_point[1]-tree_height],
                               [base_point[0]-tree_width/2,base_point[1]-2*tree_height/3],
                               [base_point[0],base_point[1]-tree_height/3],
                               [base_point[0]+tree_width/2,base_point[1]-2*tree_height/3],
                               [base_point[0]+0.02*tree_width, base_point[1]-tree_height] ] ],
                  stroke_sizes: 1,
                  cardinal_tension: 0};

    return tree;
}

function getBuilding(base, width, door, sizeFloor, numberFloors, windowPerFloor, sizeRoof, flag_chance, color_wall, color_door, color_roof, color_flag) {
    var building = {};

    building.base = {paths: [ [ [base[0], base[1]], 
                            [base[0], base[1]-sizeFloor*numberFloors],
                            [base[0]+width, base[1]-sizeFloor*numberFloors],
                            [base[0]+width, base[1]],
                            [base[0], base[1]] ] ],
                 fill_colors: color_wall,
                 cardinal_tension: 0.9,
                 stroke_sizes: 1};

    building.windows = {paths: [], stroke_sizes: 1};
    for(var f=0; f<numberFloors; f++) {
        for(var w=0; w<windowPerFloor; w++) {
            if(f==0 && door==w) {
                building.door = {paths: [ [ [base[0]+(w+1)*width/(windowPerFloor+1)-width/15, base[1]], 
                                            [base[0]+(w+1)*width/(windowPerFloor+1)-width/15, base[1]-sizeFloor/2], 
                                            [base[0]+(w+1)*width/(windowPerFloor+1)+width/15, base[1]-sizeFloor/2], 
                                            [base[0]+(w+1)*width/(windowPerFloor+1)+width/15, base[1]], 
                                            [base[0]+(w+1)*width/(windowPerFloor+1)-width/15, base[1]] ] ],
                                fill_colors: color_door,
                                cardinal_tension: 0.9,
                                stroke_sizes: 1};
                continue;
            }
            building.windows.paths.push([ [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-sizeFloor*(f+1/3)],
                                          [base[0]+(w+1)*width/(windowPerFloor+1), base[1]-sizeFloor*(f+2/3)] ]);
        }
    }

    building.roof = {paths: [ [ [base[0]+width/2, base[1]-sizeFloor*numberFloors-sizeRoof],
                                [base[0]+width, base[1]-sizeFloor*numberFloors],
                                [base[0], base[1]-sizeFloor*numberFloors],
                                [base[0]+width/2, base[1]-sizeFloor*numberFloors-sizeRoof] ] ],
                     fill_colors: color_roof,
                     cardinal_tension: 0.9,
                     stroke_sizes: 1};

    if(randRangeFloat(0,1)<=flag_chance) {
        building.pole = {paths: [ [ [base[0]+width/2, base[1]-sizeFloor*numberFloors-sizeRoof],
                                    [base[0]+width/2, base[1]-sizeFloor*numberFloors-1.5*sizeRoof] ] ],
                         cardinal_tension: 0.9,
                         stroke_sizes: 1};

        building.flag = {paths: [ [ [base[0]+width*0.50, base[1]-sizeFloor*numberFloors-1.45*sizeRoof],
                                    [base[0]+width*1.10, base[1]-sizeFloor*numberFloors-1.45*sizeRoof],
                                    [base[0]+width*0.90, base[1]-sizeFloor*numberFloors-1.35*sizeRoof],
                                    [base[0]+width*1.10, base[1]-sizeFloor*numberFloors-1.25*sizeRoof],
                                    [base[0]+width*0.50, base[1]-sizeFloor*numberFloors-1.25*sizeRoof],
                                    [base[0]+width*0.50, base[1]-sizeFloor*numberFloors-1.45*sizeRoof] ] ],
                         fill_colors: color_flag,
                         cardinal_tension: 0.9,
                         stroke_sizes: 1};
    }

    return building;
}

function getCity(base_point, city_width, city_height, city_type, territory) {
    if(typeof territory == 'undefined') territory =  {color: randomColor()};
    var city = {};
    city.bounding_box = [base_point, [base_point[0]+city_width, base_point[1]-city_height] ] ;

    var numberHouse = city_type == "city" ? randRangeInt(8,12): randRangeInt(3,6);
    var numberFeatures = city_type == "city" ? randRangeInt(0,2): randRangeInt(0,1);
    var buildings = [];

    var color_wall = "#c4c3c2";
    var color_roof = "#faae70";
    var color_door = "#faae70";
    var color_flag = territory.color;

    for(var h=0; h<numberHouse; h++) {
        var flag_chance = 0.1;
        var sizeRoof = randRangeFloat(city_height/20, city_height*4/20); // 1/5 of the max size plus 4 potential floors (for features)
        var windowPerFloor = randRangeInt(1, 2);
        var numberFloors = randRangeInt(1, 2);
        var sizeFloor = randRangeFloat(city_height*2/20, city_height*3/20);
        var width = randRangeFloat(city_width*2/20, city_width*5/20) * (1+(city_type!="city"));
        var base = [base_point[0]+h*city_width/numberHouse, base_point[1]+randRangeFloat(-city_height/100,city_height/100) ];
        var door = randRangeInt(-3*windowPerFloor,windowPerFloor-1); // 1/4 of them have doors

        var building = getBuilding(base, width, door, sizeFloor, numberFloors, windowPerFloor, sizeRoof, flag_chance, color_wall, color_door, color_roof, color_flag);
        buildings.push(building);
    }

    for(var ft=0; ft<numberFeatures; ft++) {

        var flag_chance = 0.80;
        var sizeRoof = randRangeFloat(city_height*2/20, city_height*6/20); // 1/5 of the max size plus 4 potential floors
        var windowPerFloor = randRangeInt(1, 2);
        var numberFloors = randRangeInt(3, 4);
        var sizeFloor = randRangeFloat(city_height*2/20, city_height*3/20);
        var width = randRangeFloat(city_width*3/20, city_width*6/20) * (1+(city_type!="city"));
        var base = [base_point[0]+width/2+randRangeFloat(0,1)*(city_width-width/2), base_point[1]+randRangeFloat(-city_height/100,0) ];

        var building = getBuilding(base, width, door, sizeFloor, numberFloors, windowPerFloor, sizeRoof, flag_chance, color_wall, color_door, color_roof, color_flag);
        buildings.push(building);
    }

    //ordering the buildings
    buildings.sort((a,b) => (a.base.paths[0][0][1] > b.base.paths[0][0][1] ) ? 1 : ((b.base.paths[0][0][1]  > a.base.paths[0][0][1] ) ? -1 : 0)); 
    for(var i=0; i<numberHouse; i++) {
        for(var layer in buildings[i]) {
            city["building"+(i+1)+"_"+layer] = buildings[i][layer];
        }
    }

    return city;
}