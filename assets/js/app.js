// @TODO: YOUR CODE HERE!
// function makeResponsive(){
    
    
var svgWidth = 960;
var svgHeight = 500;


var margin = {
    top: 50,
    right: 50,
    bottom: 100,
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
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

function renderText(circlesTextGroup, newXScale, chosenXAxis){

    circlesTextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));

    return circlesTextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, circlesTextGroup){
    if (chosenXAxis == "poverty") {
        var label = "In Poverty:"
    }
    else{
        var label = "Age:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([70, -50])
        .html(function(d){
            return (`<strong>${d.state}<br>${label} ${d[chosenXAxis]}`);
        })
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data){
        
        // toolTip.style("display", "block");
        toolTip.show(data, this);
    })
    .on("mouseout", function(data, index){
        toolTip.hide(data);
    });

    return circlesGroup;
}

var circlesTextGroup;
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
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
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
            .attr("fill", "#2980B9")
            .attr("opacity", ".7")
            .attr("stroke", "grey")
            // .attr("border", "2px")
            // .append("text")
            // .data(censusData)
            // .enter().append('g').attr('class','circle')
            // .attr("x", d => xLinearScale(d[chosenXAxis]))
            // .attr("y", d => yLinearScale(d.healthcare))
            // .attr("dx", -6)
            // .attr("dy", 4)
            // .text(d => d.abbr)
            // .attr("font-size", "10px")
            // .attr("fill", "white");
 
            
        // Append text to circles
        circlesTextGroup = chartGroup.selectAll(".circle")
            .data(censusData)
            // .enter().append('g').attr('class','circle')
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d.healthcare))
            .attr("dx", -6)
            .attr("dy", 4)
            .text(d => d.abbr)
            .attr("font-size", "10px")
            .attr("fill", "white");
    
        // Append text to circles
        // var circlesTextGroup = chartGroup.selectAll(".circle")
        // // var circlesGroup = chartGroup.selectAll(".circle")
        //     .data(censusData)
        //     // .enter().append('g').attr('class','circle')
        //     .append("text")
            
        //     .attr("x", d => xLinearScale(d[chosenXAxis]))
        //     .attr("y", d => yLinearScale(d.healthcare))
        //     .attr("dx", -6)
        //     .attr("dy",  4)
        //     .text(d => d.abbr)
        //     .attr("font-size", "10px")
        //     .attr("fill", "black");

        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width/2}, ${height +20})`);
        
            // Create group for  2 x- axis labels
        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            // .style("font-weight", "bold")
            .text("in Poverty (%)");

        var ageLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Median Age");
        
            // append y axis
        var healthcareLabel = chartGroup.append("text")
            .attr("transform", `rotate(-90)`)
            .attr("x", 0 - (height / 1.5))
            .attr("y", -25)
            .text("Lacks Healthcare (%)")
            // .style("font-weight", "bold");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, circlesTextGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function(){

        var value = d3.select(this).attr("value");

        if (value !== chosenXAxis){

            chosenXAxis = value;

            xLinearScale = xScale(censusData, chosenXAxis);

            xAxis = renderAxes(xLinearScale, xAxis);

            console.log(circlesGroup, circlesTextGroup)

            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            
            circlesTextGroup = renderText(circlesTextGroup, xLinearScale, chosenXAxis);
            

            circlesGroup = updateToolTip(chosenXAxis, circlesGroup, circlesTextGroup);
            

            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false)
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }else{
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }


        });
    })
    .catch(error => console.error(error)); 

// } 