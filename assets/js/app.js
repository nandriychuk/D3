var svgWidth = 900;
var svgHeight = 550;

// create margin
var margin = {
    top: 10,
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

// create chart group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Inital Params for axis
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
            d3.max(censusData, d => d[chosenXAxis]) * 1.1
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
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis){

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles text group with a transition to
// new text position
function renderText(circlesTextGroup, newXScale, chosenXAxis){

    circlesTextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));

    return circlesTextGroup;
}

// function used for updating circles group and text group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, circlesTextGroup){

    var yLabel = "Obesity:"

    if (chosenXAxis == "poverty") {
        label = "In Poverty:"
    }
    else if (chosenXAxis == "age"){
        label = "Age:";
    }else{
        label = "Income:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([70, -50])
        .html(function(d){
            return (`<strong>${d.state}<br>${label} ${d[chosenXAxis]} <br>${yLabel} ${d.obesity}%`);
        })
    circlesGroup.call(toolTip);
    circlesTextGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data){
        toolTip.show(data, this);
    })
    .on("mouseout", function(data, index){
        toolTip.hide(data);
    });

    circlesTextGroup.on("mouseover", function(data){
        toolTip.show(data, this);
    })
    .on("mouseout", function(data, index){
        toolTip.hide(data);
    });

    return circlesGroup;
}


// Retrieve data from the CSV file and execute all functions below
d3.csv("assets/data/data.csv")
    .then(censusData => {
        // console.log(censusData)
        censusData.forEach(function(data){
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
        });

        // xLinearScale function above csv import
        var xLinearScale = xScale(censusData, chosenXAxis)

        var yLinearScale = d3.scaleLinear()
            .domain([20, d3.max(censusData, d => d.obesity) + 1])
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

        // append y axis
        chartGroup.append("g")
            .call(leftAxis);

        // append circles to data points
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter().append('g').attr('class','circle')
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d.obesity))
            .attr("r", 10)
            .attr("fill", "#2980B9")
            .attr("opacity", ".7")
            .attr("stroke", "grey")
            
        // Append text to circles
        var circlesTextGroup = chartGroup.selectAll(".circle")
            .data(censusData)
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d.obesity))
            .attr("dx", -6)
            .attr("dy", 4)
            .text(d => d.abbr)
            .attr("font-size", "10px")
            .attr("fill", "white");
    
        // create label group
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width/2}, ${height +20})`);
        
        // Create group for  3 x-axis labels
        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Median Age");

        var incomeLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Median Income");
        
        // append y axis
        var obesityLabel = chartGroup.append("text")
            .attr("transform", `rotate(-90)`)
            .attr("x", 0 - (height / 1.5))
            .attr("y", -25)
            .text("Obesity (%)")
            .style("font-weight", "bold");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, circlesTextGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function(){
        // get value of selection
        var value = d3.select(this).attr("value");
        // if value not equals to chosen axes
        if (value !== chosenXAxis){
            // replaces chosenXAxis with value
            chosenXAxis = value;
            // updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);
            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            // updates circles' text with new x values
            circlesTextGroup = renderText(circlesTextGroup, xLinearScale, chosenXAxis);
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup, circlesTextGroup);
            
            // changes classes to change bold text
            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false)
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true)
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }else if (chosenXAxis === "poverty"){
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }else{
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false)
            }
        }


        });
    })
    .catch(error => console.error(error)); 

