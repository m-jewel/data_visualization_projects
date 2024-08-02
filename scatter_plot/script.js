// Wait for the DOM to fully load before running the script
document.addEventListener("DOMContentLoaded", function() {
  // Fetch the data from the provided URL
  fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
    .then(response => response.json())  // Parse the JSON data
    .then(data => {
      // Call the function to create the scatterplot with the fetched data
      createScatterplot(data);
    });

  // Function to create a scatterplot
  function createScatterplot(data) {
    // Set the dimensions of the SVG canvas
    const width = 800;
    const height = 500;
    const padding = 60;

    // Create the SVG canvas
    const svg = d3.select("#scatterplot")
                  .attr("width", width)
                  .attr("height", height);

    // Set up the scales for the x and y axes
    const xScale = d3.scaleLinear()
                     .domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1])
                     .range([padding, width - padding]);

    const yScale = d3.scaleTime()
                     .domain([d3.min(data, d => new Date(d.Seconds * 1000)), d3.max(data, d => new Date(d.Seconds * 1000))])
                     .range([padding, height - padding]);

    // Create the x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    // Create the y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    // Append the x-axis to the SVG
    svg.append("g")
       .attr("id", "x-axis")
       .attr("transform", `translate(0, ${height - padding})`)
       .call(xAxis);

    // Append the y-axis to the SVG
    svg.append("g")
       .attr("id", "y-axis")
       .attr("transform", `translate(${padding}, 0)`)
       .call(yAxis);

    // Create circles for each data point
    svg.selectAll(".dot")
       .data(data)
       .enter()
       .append("circle")
       .attr("class", d => d.Doping ? "dot doping" : "dot no-doping")  // Add class based on doping status
       .attr("cx", d => xScale(d.Year))
       .attr("cy", d => yScale(new Date(d.Seconds * 1000)))
       .attr("r", 5)
       .attr("data-xvalue", d => d.Year)
       .attr("data-yvalue", d => new Date(d.Seconds * 1000))
       // Event listener for mouseover
       .on("mouseover", function(event, d) {
         const tooltip = d3.select("#tooltip");
         tooltip.classed("hidden", false)
                .attr("data-year", d.Year)
                // Position tooltip near the hovered circle
                .style("left", `${xScale(d.Year) + 10}px`)
                .style("top", `${yScale(new Date(d.Seconds * 1000)) - 30}px`)
                .html(`${d.Name}: ${d.Nationality}<br>Year: ${d.Year}, Time: ${d.Time}<br><br>${d.Doping ? d.Doping : "No doping allegations"}`);
       })
       // Event listener for mouseout
       .on("mouseout", function() {
         d3.select("#tooltip").classed("hidden", true);
       })
       // Event listener for mousemove
       .on("mousemove", function(event, d) {
         d3.select("#tooltip")
           .style("left", `${xScale(d.Year) + 10}px`)
           .style("top", `${yScale(new Date(d.Seconds * 1000)) - 30}px`);
       });
  }
});
