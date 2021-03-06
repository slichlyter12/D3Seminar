// Three steps: 
// 1. Prepare the data (load and parse it)
// 2. Set up an SVG HTML element, basically a nice blank place to put our graph
// 3. Map the data into the visual space of the graph

// Step 1: Prepare the data
// Start by loading all the data
d3.csv("data2.csv", function (error, csvRows) {
    //throws error object if something went wrong while loading data
    if (error) throw error;

    // Now csvRows is an array, with one object per row in the csv.
    // Each row in this particular CSV has properties {date, close, open}
    // (indicating stock data: the date, the open price, and the close price).
    // But all these are strings. Let's convert them to a JS date and some floats.

    // To parse the date. There are different ways we can parse a date in D3. There are different ways 
    // we can parse the date
    // https://github.com/d3/d3-time-format/blob/master/README.md#locale_format
    // d3.csv will return an array with all the fields(each field as an JSON object with first line of file as the keys)
    // modify the data. close variable here should be a numerical value to plot. The second line will make sure
    // that it is a numeric value if it is not already so.
    var timeParser = d3.timeParse("%d-%b-%y");
    csvRows.forEach(function (row) {
        row.date = timeParser(row.date);
        row.close = +row.close;
        row.open = +row.open;
    });

    // whew, our data is now prepared. We have an array of objects (one per row),
    // and each attribute of each object is properly typed (date or float).

    // Step 2: Set up a blank space for our graph

    // To start, 
    // figure out how big we want the svg to be; set aside a little margin around it
    // Set the margin object, clockwise from top
    // width and height as inner dimensions(area where you plot graph) of the chart  
    // Margin convention: https://bl.ocks.org/mbostock/3019563
    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Appending a svg to the DOM with specified width and height
    // appends a group element (g) to the svg and move it to top left. 
    // This is achieved through applying transformation to g element
    // An svg can contain multiple g elements. In this case array of one g element 
    var svgObject = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Step 3: Map our data into the graph

    // We have to start by creating functions that can map from 
    // dates to horizontal positions (i.e., dates to pixel position in our graph),
    // and prices to vertical positions (i.e., stock open or close, to pixel position).

    // So, the function for horizontal positions maps from dates to pixels.
    // Its domain is the set of dates that it might receive.
    // This goes from the minimum date to the maximum date. 
    // d3.extent() is a handy function for finding the min and max.
    // The range of the mapping function goes from 0 on the leftmost date to width on the rightmost date.
    var dateToHorizPosition = d3.scaleTime()
        .domain(d3.extent(csvRows, (row) => row.date))
        .range([0, width]);

    // Likewise, prices will map to vertical positions.
    // The possible prices are between 0 and the maximum open or close price.
    // The possible vertical positions are between the top-left (i.e., height) down to 0.
    // Bigger prices have smaller pixel positions (because we count from top-left down to bottom-left).
    var priceToVertPosition = d3.scaleLinear()
        .domain([0, d3.max(csvRows, (row) => Math.max(row.close, row.open))])
        .range([height, 0]);


    // Now that we can map from prices to vert positions, and dates to horizon positions,
    // we need to use these mapping functions to generate lines from our csv rows.
    // The d3.line() function simplifies this process.
    // We create an "openLineObject" to indicate stock open prices.
    // And we create a second line for our stock close prices.
    var openLineObject = d3.line()
        .x((row) => dateToHorizPosition(row.date))
        .y((row) => priceToVertPosition(row.open));

    var closeLineObject = d3.line()
        .x((row) => dateToHorizPosition(row.date))
        .y((row) => priceToVertPosition(row.close));

    // Finally, we put our lines into the graph that we created, as well as put in our axes.

    //adds a new path element(a path element is something that we can use to draw shapes according to co-ordinates)
    // we get each data element and we are giving line as class name to apply styles
    //Here for each data element we call valueline function and attr d is a mini language specific to D3 which 
    //will move do M-moveto, Z-closepath, L-lineto, C-curveto
    // This is the key part which draws the line
    svgObject.append("path")
        .data([csvRows])
        .attr("class", "close-line")
        .attr("d", closeLineObject);

    svgObject.append("path")
        .data([csvRows])
        .attr("class", "open-line")
        .attr("d", openLineObject);


    // Just for fun, let's put a little dot on each close price.
    d3.select("g").selectAll("circle")
        .data(csvRows)
        .enter()
        .append("circle")
        .attr("cx", (row) => dateToHorizPosition(row.date))
        .attr("cy", (row) => priceToVertPosition(row.close))
        .attr("r", 10)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Add the X Axis
    // axisBottom will create ticks on bottom side of the x axis and transform will move the x axis from top to bottom
    svgObject.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(dateToHorizPosition));

    //Y axis can start from wherever it is and axisLeft will draw ticks on the left side
    // Add the Y Axis
    svgObject.append("g")
        .call(d3.axisLeft(priceToVertPosition));

});