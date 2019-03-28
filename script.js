


var urls = {
	basemap: "districts.geojson",
	houses: "sf.csv",
	streets: "streets.geojson"
};



var svg = d3.select("body").select("#chloropleth"),
	width = +svg.attr("width"),
    height = +svg.attr("height"),
    active = d3.select(null);



var background = svg.append("rect")
	    .attr("class", "background")
	    .attr("width", width)
	    .attr("height", height)
	    .style("stroke", "grey")
	    .style("stroke-width", "5");

// svg.append("text")
//         .attr("x", 10)
//         .attr("y", 35)
//         .attr("text-anchor", "left")
//         .style("font-size", "36px")
//         .style("font-weight", "bold")
//         .style("font-family", "sans-serif")
//         .text("San Francisco Craigslist Rent");

// var color = d3.scaleThreshold()
//     .domain([300, 450, 570, 900, 1000])
//     .range(["#F0FFFF", "#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"]);

var x = d3.scaleLinear()
    .domain([300, 1200])
    .range([0, 240]);



var g = {
	basemap: svg.append("g").attr("id", "basemap"),
	houses: svg.append("g").attr("id", "houses"),
  	details: svg.append("g").attr("id", "details")
  };
var title = svg.append("text")
		.attr("x", 10)
		.attr("y", 25)
		.attr("text-anchor", "left")
		.style("font-size", "18px")
		.style("font-weight", "bold")
		.style("font-family", "sans-serif")



var projection = d3.geoConicEqualArea();
var path = d3.geoPath().projection(projection);

projection.parallels([37.692514, 37.840699]);

projection.rotate([122, 0]);

var q = d3.queue()
  .defer(d3.json, urls.basemap)
  .defer(d3.json, urls.streets)
  .await(drawMap);

function drawMap(error, basemap, streets) {
	if (error) throw error;

	console.log("basemap", basemap);
  	console.log("streets", streets);

	projection.fitSize([700, 700], basemap);

	var land = g.basemap.selectAll("path.land")
    	.data(basemap.features)
    	.enter()
    	.append("path")
    	.attr("d", path)
    	.attr("class", "land");

	g.basemap.selectAll("path.district")
	    .data(basemap.features)
	    .enter()
	    .append("path")
	    .attr("d", path)
	    .attr("class", "district")
	    .attr("fill", "#fff3e2")
	    .each(function(d) {
	  // save selection in data for interactivity
	  		d.properties.outline = this;
		});


	g.basemap.selectAll("path.street")
		.data(streets.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "street")
		.style("stroke", "grey")
		.style("stroke-width", "0.5px");


	d3.csv(urls.houses, function(error, houses){
		  if (error) throw error;
  			console.log("houses", houses);

	var price_buckets= d3.nest()
		.key(function(d) { return(+d.price_bucket)})
		.rollup(function(v) {
			return v.length;})
		.map(houses, d3.map);
	price_buckets = d3.entries(price_buckets).slice(0,4)

		console.log("trees by district: ", price_buckets)

	// 	var districtStatus = d3.nest()
	// 		.key(function(d) { return d.District; })
	// 		.key(function(d) { return d.Status; })
	// 		.rollup(function(v) {
	// 			return  v.length;})
	// 		.map(trees, d3.map);

	// 	console.log("districts status: ", districtStatus);





	  var details = g.details.append("foreignObject")
	    .attr("id", "details")
	    .attr("width", 500)
	    .attr("height", 100)
	    .attr("x", 10)
	    .attr("y", 25);


	var body = details.append("xhtml:body")
	    .style("text-align", "left")
	    .style("background", "none")
	    .html("<p></p>");

	var symbols = g.houses
	  .selectAll("circle")
	  .data(houses)
	  .enter()
	  .append("circle")
	  .filter(function(d) { return d.Status != "NaN"})
	  .attr("cx", function(d, i) {
	    return projection([+d.longitude, +d.latitude])[0];
	    })
	  .attr("cy", function(d, i) {
	    return projection([+d.longitude, +d.latitude])[1];
	    })
	  .attr("r", 4.5)
	  .attr("class", "symbol")
	  .on("mouseover", function(d) {
	    body.html("<table border=0 cellspacing=0 cellpadding=2>" + "\n" +
	    	// "<tr><th>Title:</th><td>" + d.title + "</td></tr>" + "\n" +
	        "<tr><th>Neighborhood:</th><td>" + d.neighborhood.toUpperCase() + "</td></tr>" + "\n" +
	        "<tr><th>Bedrooms:</th><td>" + d.bedrooms + "</td></tr>" + "\n" +
	        "<tr><th>Bathrooms:</th><td>" + d.bathrooms + "</td></tr>" + "\n" +

	      "</table>")
	    	.style("font-size", "12px")
	    	.style("font-family", "sans-serif");
	    title.text(d.title);


	});

	var text_x = 720
	var text_y = 400

	svg.append("rect")
	    .attr("class", "legend")
	    .attr("width", 250)
	    .attr("height", 250)
	    .attr("x", text_x-25)
	    .attr("y", text_y-70)
	    .style("stroke", "grey")
	    .style("stroke-width", "1");

	  svg.append('text')
	  	.attr("x", text_x-15)
		.attr("y", text_y-40)
		.attr("text-anchor", "left")
		.style("font-size", "20px")
		.style("font-weight", "bold")
		.style("font-family", "sans-serif")
		.text("Highlight Price Range")
	  svg.append('text')
	  	.attr("x", text_x-15)
		.attr("y", text_y-18)
		.attr("text-anchor", "left")
		.style("font-size", "20px")
		.style("font-weight", "bold")
		.style("font-family", "sans-serif")
		.text("To Filter Bubbles")

	  svg.append('text')
	  	.attr("x", text_x)
		.attr("y", text_y+20)
		.attr("text-anchor", "left")
		.style("font-size", "18px")
		.style("font-weight", "bold")
		.style("font-family", "sans-serif")
		.text("$0 - $2,650")
		.on("mouseover", function(d){
			symbols.filter(function(e){
					return e.price_bucket != 0})
					.style("visibility", "hidden")

		})
		.on("mouseout", function(d){
			symbols.filter(function(e){
					return e.price_bucket != 0})
					.style("visibility", "visible")
		})

	svg.append('text')
	  	.attr("x", text_x)
		.attr("y", text_y+70)
		.attr("text-anchor", "left")
		.style("font-size", "18px")
		.style("font-weight", "bold")
		.style("font-family", "sans-serif")
		.text("$2,651 - $3,475")
		.on("mouseover", function(d){
			symbols.filter(function(e){
					return e.price_bucket != 1})
					.style("visibility", "hidden")
		})
		.on("mouseout", function(d){
			symbols.filter(function(e){
					return e.price_bucket != 1})
					.style("visibility", "visible")
		})
	svg.append('text')
	  	.attr("x", text_x)
		.attr("y", text_y+120)
		.attr("text-anchor", "left")
		.style("font-size", "18px")
		.style("font-weight", "bold")
		.style("font-family", "sans-serif")
		.text("$3,476 - $4,382")
		.on("mouseover", function(d){
			symbols.filter(function(e){
					return e.price_bucket != 2})
					.style("visibility", "hidden")
		})
		.on("mouseout", function(d){
			symbols.filter(function(e){
					return e.price_bucket != 2})
					.style("visibility", "visible")
		})

	svg.append('text')
	  	.attr("x", text_x)
		.attr("y", text_y+170)
		.attr("text-anchor", "left")
		.style("font-size", "18px")
		.style("font-weight", "bold")
		.style("font-family", "sans-serif")
		.text("$4,383 - $17,700")
		.on("mouseover", function(d){
			symbols.filter(function(e){
					return e.price_bucket != 3})
					.style("visibility", "hidden")
		})
		.on("mouseout", function(d){
			symbols.filter(function(e){
					return e.price_bucket != 3})
					.style("visibility", "visible")
		})





});
}
