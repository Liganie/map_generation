////////////////////////////////////////////////////////////////////////////////////
//////////              ARRAY MANIPULATION AND CONVERSION            ///////////////
////////////////////////////////////////////////////////////////////////////////////

// Return the norm of a 2 element vector
function norm2(point) {
    return Math.sqrt(Math.pow(point[0],2) + Math.pow(point[1],2));
}

// Get the normal along a given path
function getNormals(array) {
    var normalArray = [];
    var norm;

    for(var i=0; i<array.length-1; i++) {
        normalArray[i] = [array[i+1][0]-array[i][0], array[i+1][1]-array[i][1]];
    }
    normalArray[i] = [array[i][0]-array[i-1][0], array[i][1]-array[i-1][1]]; // Special case for the last point

    for(var i=0; i<array.length; i++) { // Normalizing the vectors
        norm = norm2(normalArray[i]);
        normalArray[i] = [-normalArray[i][1]/norm, normalArray[i][0]/norm]; // Getting the normal
    }

    var normals = normalArray.slice(); // Copy of the normal array
    for(var i=1; i<array.length-1; i++) {

        normals[i] = [normalArray[i][0] + normalArray[i-1][0],
                          normalArray[i][1] + normalArray[i-1][1]];
        norm = norm2(normals[i]);
        normals[i] = [normals[i][0]/norm, normals[i][1]/norm];
    }

    return normals;
}

// Get a boudary around a given path, starting with a given width and ending with another one
function getLine(array, width_array, stroke_alignement) {
    if(typeof width_array == 'undefined') width_array =  1;
    stroke_alignement = stroke_alignement || 'center';

    var widths = [];
    for(var i=0; i<array.length; i++) {
        if( typeof(width_array) == 'number') {// It is a scalar
            widths[i] = width_array / 2000; // 1000 factor to compensate for the map scaling, then divided by 2 as we go up and down
        }
        else if(width_array.length == 2){
            widths[i] = Math.max(width_array[0]/2000 + (width_array[1] - width_array[0])/2000 * i/array.length, 0);
        }
        else if(width_array.length == array.length){ // It is an array
            widths[i] = width_array[i]/2000;
        }
        else {
            console.error('Dimension of the arrays do not match: Data array['+array.length+'], width array['+width_array.length+']');
            return;
        }
    }
    if(    !stroke_alignement.includes('center')
        && !stroke_alignement.includes('inside')
        && !stroke_alignement.includes('outside') ) {
        console.error('Stroke alignement defined does is not recognized: '+stroke_alignement);
        return;
    }

    var normalUp = getNormals(array);
    var normalDown = getNormals(array);
    for(var i=0; i<array.length; i++) {
        normalUp[i][0] = array[i][0] + widths[i]*normalUp[i][0];
        normalUp[i][1] = array[i][1] + widths[i]*normalUp[i][1];

        normalDown[i][0] = array[i][0] - widths[i]*normalDown[i][0];
        normalDown[i][1] = array[i][1] - widths[i]*normalDown[i][1];
    }

    if(stroke_alignement.includes('center')) {
        return normalUp.concat(normalDown.reverse());
    }
    else if(stroke_alignement.includes('inside')) {
        return array.concat(normalDown.reverse());
    }
    else if(stroke_alignement.includes('outside')) {
        return normalUp.concat(array.reverse());
    }
}

// Convert a Nx2 array into a data element for d3
function convertToD3(array) {
    var d3array = [];
    if(array[0].length == 2) { // It is x y coordinates
        for(var i=0; i<array.length; i++) {
            d3array[i] = {'x':1000*array[i][0], 'y':1000*array[i][1]}; // Due to the scaling of the map
        }
    }
    else if(array[0].length == 3) { // Those are circles
        for(var i=0; i<array.length; i++) {
            d3array[i] = {'cx':1000*array[i][0], 'cy':1000*array[i][1], 'r':array[i][2]}; // Due to the scaling of the map
        }
    }
    return d3array;
}

////////////////////////////////////////////////////////////////////////////////////
//////////                        D3 API WARPER                      ///////////////
////////////////////////////////////////////////////////////////////////////////////

function drawObject(svg, cls, o) {
    drawArea(svg, cls, o.area, o.area.colors);
    drawCurvedPaths(svg, cls, o.outline, o.outline.colors, o.outline.strokes);
    drawCurvedPaths(svg, cls, o.faded, o.faded.colors, o.faded.strokes);
    // for debug purposes
    //drawCurvedPaths(svg, cls, [o.bounding_box], 'red', 2, 0);
}

function drawObjects(svg, cls, objects) {
    for(var o=0; o<objects.length; o++) {
        drawObject(svg, cls, objects[o]);
    }
}

function drawPoints(svg, cls, points, radius, stroke_color, stroke_width, fill_color) {
    // Need to ensure that radius is an array of the same size

    data = points;
    for(var i=0; i<points.length; i++) {
        if( typeof(radius) == 'number') {// It is a scalar
            data[i][2] = radius; //
        }
        else if(points.length == radius.length){ // It is an array of the same size
            data[i][2] = radius[i];
        }
        else {
            console.error('Dimension of the arrays do not match: Data array['+points.length+'], radius array['+radius.length+']');
            return;
        }
    }
    data = convertToD3(data);

    for(var p=0; p<points.length; p++) {
        svg.append("circle")
           .classed(cls, true)
           .attr("cx", data[p]["cx"])
           .attr("cy", data[p]["cy"])
           .attr("r", data[p]["r"])
           .style("stroke", stroke_color)
           .style("stroke-width", stroke_width)
           .style("fill", fill_color)
           .style('stroke-linecap', 'round')
           .raise() // dsplay at the top
    }
}

function drawText(svg, cls, points, texts, font_sizes, alignements, extras) {
    // Need to ensure that radius is an array of the same size

    sizes = [];
    aligns = [];
    if(points.length == texts.length){ // It is an array of the same size
        sizes[i] = texts[i];
    }
    else {
        console.error('Dimension of the arrays do not match: Data array['+points.length+'], text array['+font_sizes.length+']');
        return;
    }
    for(var i=0; i<points.length; i++) {
        if( typeof(font_sizes) == 'number') {// It is a scalar
            sizes[i] = font_sizes; //
        }
        else if(points.length == font_sizes.length){ // It is an array of the same size
            sizes[i] = font_sizes[i];
        }
        else {
            console.error('Dimension of the arrays do not match: Data array['+points.length+'], font size array['+font_sizes.length+']');
            return;
        }

        if( typeof(alignements) == 'string') {// It is a scalar
            aligns[i] = alignements; //
        }
        else if(points.length == alignements.length){ // It is an array of the same size
            aligns[i] = alignements[i];
        }
        else {
            console.error('Dimension of the arrays do not match: Data array['+points.length+'], alignement array['+alignements.length+']');
            return;
        }
    }
    data = convertToD3(points);

    var svg_path = [];
    for(var p=0; p<points.length; p++) {
        svg_path = svg.append("text")
                      .classed(cls, true)
                      .attr('x', data[p]["x"])
                      .attr('y', data[p]["y"])
                      .style('font-size', sizes[p]+'px')
                      .style('text-anchor', aligns[p])
                      .text(texts[p])
                      .raise()
                      .style("font-family", ["Palatino Linotype", "Book Antiqua", "Palatino", "serif"])
                      .style('color', 'black')
                      .style('stroke', 'white')
                      .style('stroke-width', 5)
                      .style('stroke-linejoin', 'round')
                      .style('paint-order', 'stroke')
                      .style('stroke-linecap', 'butt');
        if(extras) {
            for(var i=0; i<extras.length; i+=2) {
                svg_path.style(extras[i], extras[i+1]);
            }
        }
    }
}

function drawCurvedPathsExtras(svg, cls, paths, stroke_color, stroke_width, extras) {
    var lineFunction = d3.line()
                            .x(function(d) { return d.x; })
                            .y(function(d) { return d.y; })
                            .curve(d3.curveCardinal.tension(0.5))

    var path = [];
    var svg_path = [];
    for(var p=0; p<paths.length; p++) {
        path = convertToD3(paths[p]);
        svg_path = svg.append("path")
                           .classed(cls, true)
                           .attr("d", lineFunction(path))
                           .style("stroke", stroke_color)
                           .style("stroke-width", stroke_width)
                           .style("fill", 'none')
                           .style('stroke-linecap', 'round')
        if(extras) {
            for(var i=0; i<extras.length; i+=2) {
                svg_path.style(extras[i], extras[i+1]);
            }
        }
    }
}

function drawCurvedPaths(svg, cls, paths, stroke_color, stroke_width, cardinal_tension, stroke_alignement) {
    if(typeof stroke_width == 'undefined') stroke_width =  1;
    if(typeof cardinal_tension == 'undefined') cardinal_tension =  0.5;
    stroke_alignement = stroke_alignement || 'center';

    var widths = [];
    for(var i=0; i<paths.length; i++) {
        if( typeof(stroke_width) == 'number') {// It is a scalar
            widths[i] = stroke_width; //
        }
        else if(typeof(stroke_width[0]) == 'number'){ // It is an array of scalars
            widths[i] = stroke_width;
        }
        else if(stroke_width.length == paths.length){ // It is an array of the same size, and not of scalars
            widths[i] = stroke_width[i];
        }
        else {
            console.error('Dimension of the arrays do not match: Data array['+paths.length+'], width array['+stroke_width.length+']');
            return;
        }
    }
    var lineFunction = d3.line()
                            .x(function(d) { return d.x; })
                            .y(function(d) { return d.y; })
                            .curve(d3.curveCardinalClosed.tension(cardinal_tension))

    var custom_stroke = [];
    for(var p=0; p<paths.length; p++) {
        custom_stroke = convertToD3(getLine(paths[p], widths[p], stroke_alignement));
        svg.append("path")
                   .classed(cls, true)
                   .attr("d", lineFunction(custom_stroke))
                   .style("stroke", 'none')
                   .style("fill", stroke_color);
    }
}

function drawArea(svg, cls, paths, fill_colors, stroke_width, cardinal_tension, extras) {
    stroke_width = stroke_width || 0;
    if(typeof cardinal_tension == 'undefined') cardinal_tension =  1;

    var colors = [];
    for(var i=0; i<paths.length; i++) {
        if( typeof(fill_colors) == 'string') {// It is a unique color
            colors[i] = fill_colors;
        }
        else if(paths.length == fill_colors.length){ // It is an array
            colors[i] = fill_colors[i];
        }
        else {
            console.error('Dimension of the arrays do not match: Data array['+paths.length+'], colors array['+fill_colors.length+']');
            return;
        }
    }

    var lineFunction = d3.line()
                                .x(function(d) { return d.x; })
                                .y(function(d) { return d.y; })
                                .curve(d3.curveCardinalClosed.tension(cardinal_tension))

    var svg_path = [];
    for(var p=0; p<paths.length; p++) {
        svg_path = svg.append("path")
                       .classed(cls, true)
                       .attr("d", lineFunction( convertToD3(paths[p]) ))
                       .style("stroke", colors[p])
                       .style("stroke-width", stroke_width)
                       .style("fill", colors[p]);
        if(extras) {
            for(var i=0; i<extras.length; i+=2) {
                svg_path.style(extras[i], extras[i+1]);
            }
        }
    }
}