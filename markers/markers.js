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