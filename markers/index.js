include('markers/markers.js');
include('markers/display.js');
include('markers/city.js');


function getTree(base_point, tree_width, tree_height, params, types) {
    var tree;
    var type = types[randRangeInt(0,types.length-1)];
    if(type == 'Pine') {
        tree = getPineTree( base_point, tree_width, tree_height );
        tree.trunk.fill_colors = params.features.forests.pine.trunkColor;
        tree.foliage.fill_colors = [params.features.forests.pine.foliageShade, params.features.forests.pine.foliageBase];
    }
    else if(type == 'Oak') {
        tree = getOakTree( base_point, tree_width, tree_height );
        tree.trunk.fill_colors = params.features.forests.oak.trunkColor;
        tree.foliage.fill_colors = [params.features.forests.oak.foliageShade, params.features.forests.oak.foliageBase];
    }
    return tree;
}
