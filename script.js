


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

svg.append("text")
        .attr("x", 10)
        .attr("y", 35)
        .attr("text-anchor", "left")
        .style("font-size", "36px")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .text("Tree Maintenance in San Francisco");

svg.append("text")
		.attr("x", 10)
		.attr("y", 60)
		.attr("text-anchor", "left")
		.style("font-size", "18px")
		.style("font-weight", "bold")
		.style("font-family", "sans-serif")
		.text("(Jan 1st, 2016 - Jan 1st, 2017)");

var color = d3.scaleThreshold()
    .domain([300, 450, 570, 900, 1000])
    .range(["#F0FFFF", "#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"]);

var x = d3.scaleLinear()
    .domain([300, 1200])
    .range([0, 240]);


var g = {
	basemap: svg.append("g").attr("id", "basemap"),
	houses: svg.append("g").attr("id", "houses"),
  	details: svg.append("g").attr("id", "details")
  };

var legend = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(" + (width - 230) + ",40)");

legend.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

legend.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .style("font-family", "sans-serif")
    .text("Total Number of Tree Incidents");

legend.call(d3.axisBottom(x)
    .tickSize(13)
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

// legend.call(xAxis).append("text")
//     .attr("class", "caption")
//     .attr("y", -6)
//     .text("Population per square mile");


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

	projection.fitSize([960, 600], basemap);

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
	    .attr("fill", "#ffffcc")
	    // .attr("fill", function(d){ return color(treeByDistrict.get(d.properties.supervisor));})
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

	// var houseByDistrict = d3.nest()
	// 	.key(function(d) { return d.District; })
	// 	.rollup(function(v) {
	// 		return v.length;})
	// 	.map(houses, d3.map);

	// 	console.log("trees by district: ", treeByDistrict)

	// 	var districtStatus = d3.nest()
	// 		.key(function(d) { return d.District; })
	// 		.key(function(d) { return d.Status; })
	// 		.rollup(function(v) {
	// 			return  v.length;})
	// 		.map(trees, d3.map);

	// 	console.log("districts status: ", districtStatus);





	  var details = g.details.append("foreignObject")
	    .attr("id", "details")
	    .attr("width", 350)
	    .attr("height", 400)
	    .attr("x", 10)
	    .attr("y", 65);


	var body = details.append("xhtml:body")
	    .style("text-align", "left")
	    .style("background", "none")
	    .html("<p>N/A</p>");

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
	  	console.log('title', d.title)
	  	console.log('price', d.price)
	  	console.log('neighborhood', d.neighborhood)
	    body.html("<table border=0 cellspacing=0 cellpadding=2>" + "\n" +
	    	"<tr><th>Title:</th><td>" + d.title + "</td></tr>" + "\n" +
	        "<tr><th>Neighborhood:</th><td>" + d.neighborhood + "</td></tr>" + "\n" +
	        "<tr><th>Bedrooms:</th><td>" + d.bedrooms + "</td></tr>" + "\n" +
	        "<tr><th>Bathrooms:</th><td>" + d.bathrooms + "</td></tr>" + "\n" +

	      "</table>")
	    	.style("font-size", "12px")
	    	.style("font-family", "sans-serif");


	});
	  // .style("opacity", 0)
	  // .style("visibility", "hidden");


	// 	background.on("click", function(d){

	// 		symbols.transition()
	// 				.delay(200)
	// 				.style("opacity", 0);

	// 		symbols.style("visibility","hidden");
	// 	});


	// 	  details.style("visibility", "hidden");

	// 	 	land.on("mouseover", function(d) {
	// 		    d3.select(d.properties.outline).classed("active", true)
	// 		    	.transition().delay(200);


	// 		    details.style("visibility", "visible");
	// 		});

	// 		land.on("mouseout", function(d) {

	// 		    d3.select(d.properties.outline).classed("active", false)
	// 		    	.transition().delay(200);

	// 		    details.style("visibility", "hidden");
	// 		});

	// 		var currDistrict = null;
	// 		land.on("click", function(d){

	// 			symbols.transition()
	// 				.style("opacity", 0);

	// 			symbols.style("visibility", "hidden");


	// 			symbols.filter(function(e){
	// 					return e.District == d.properties.supervisor;})
	// 					.style("visibility", "visible")
	// 					.transition().delay(200)
	// 					.style("opacity", 1);


	// 			console.log("curr", currDistrict)
	// 			symbols.filter(function(e){
	// 				return e.District == d.properties.supervisor;})
	// 				.on("mouseover", incidentOn);


	// 			symbols.filter(function(e){
	// 				return e.District == d.properties.supervisor;})
	// 				.on("mouseout", incidentOff);
	// 		})



	// 	function incidentOn(d){
	// 		d3.select(this).raise();
	//         d3.select(this).classed("active", true);

	//         body.html("<table border=0 cellspacing=0 cellpadding=2>" + "\n" +
	//           "<tr><th>As of April 7, 2017</th></tr>" + "\n" +
	//           "<tr><th>Address:</th><td>" + d.Address + "</td></tr>" + "\n" +
	//           "<tr><th>Opened Date:</th><td>" + d.Opened + "</td></tr>" + "\n" +
	//           "<tr><th>Source:</th><td>" + d.Source + "</td></tr>" + "\n" +
	//           "<tr><th>Details:</th><td>" + d.RequestDetails + "</td></tr>" + "\n" +
	//           "<tr><th>Details:</th><td>" + d.CaseID + "</td></tr>" + "\n" +

	//           "</table>");

	//         details.transition()
	//         	.style("visibility", "visible");
	//       };

	// 	function incidentOff(d){
	//         d3.select(this).classed("active", false);
	//       };

	});
}
