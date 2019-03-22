// @TODO: YOUR CODE HERE!
// function makeResponsive(){
    
    
var svgWidth = 960;
var svgHeight = 500;


var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
}

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// Create an SVG wrapper, append an SVG group that will hold our chart, 
//and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

    //why do need it here? example 3.9
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Inital Params for axis
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
            d3.max(censusData, d => d[chosenXAxis]) * 1.2
        ])

        .range([0, width]);
    
        return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis){

    circlesGroup.transition()
        .duraiton(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup){
    if (chosenXAxis == "poverty") {
        var label = "In Poverty:"
    }
    else{
        var label = "Age:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d){
            return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
        })
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data){
        toolTip.show(data);
    })
    .on("mouseout", function(data, index){
        toolTip.hide(data);
    });

    return circlesGroup;
}


//path relative to html, not js
d3.csv("assets/data/data.csv")
    .then(censusData => {
        // console.log(censusData)
        censusData.forEach(function(data){
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
        });

        // //Create scale functions
        // var xLinearScale = d3.scaleLinear()
        //     .domain([8, d3.max(censusData, d => d.poverty)])
        //     .range([0, width]);

        // xLinearScale function above csv import
        var xLinearScale = xScale(censusData, chosenXAxis)

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(censusData, d => d.healthcare)])
            .range([height, 0]);

        //Create axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        //Append Axis to the chart
        chartGroup.append("g")
        // transform wil draw ticks on the same distanse from each other
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // append circles to data points
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter().append('g').attr('class','circle')
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", 10)
            .attr("fill", "blue")
            .attr("opacity", ".5")
            // .attr('text', d => d.abbr)
            // .attr('font-size','20px')
            
        // Append text to circles
        var circlesGroup = chartGroup.selectAll(".circle")
            .data(censusData)
            .append("text")
            .attr("x", d => xLinearScale(d.poverty))
            .attr("y", d => yLinearScale(d.healthcare))
            .attr("dx", -6)
            .attr("dy", 4)
            .text(d => d.abbr)
            .attr("font-size", "10px")
            .attr("fill", "white");
            console.log(circlesGroup)

        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width/2}, ${height +20})`);

        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .style("font-weight", "bold")
            .text("in Poverty (%)");
        
        var healthcareLabel = chartGroup.append("text")
            .attr("transform", `rotate(-90)`)
            .attr("x", 0 - (height / 1.5))
            .attr("y", -25)
            .text("Lacks Healthcare (%)")
            .style("font-weight", "bold");

    })
    .catch(error => console.error(error)); 

// } 