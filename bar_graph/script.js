document.addEventListener("DOMContentLoaded", function() {
    // Define margins and dimensions
    const margin = {top: 40, right: 20, bottom: 30, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    // Create an SVG container
    const svg = d3.select("#chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Load data
    d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json").then(data => {
      const dataset = data.data;
  
      // Parse the date
      const parseDate = d3.timeParse("%Y-%m-%d");
  
      // Set up scales
      const xScale = d3.scaleTime()
        .domain([d3.min(dataset, d => parseDate(d[0])), d3.max(dataset, d => parseDate(d[0]))])
        .range([0, width]);
  
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d[1])])
        .range([height, 0]);
  
      // Create axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);
  
      // Add axes to the svg
      svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
  
      svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);
  
      // Create bars
      svg.selectAll(".bar")
        .data(dataset)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(parseDate(d[0])))
        .attr("y", d => yScale(d[1]))
        .attr("width", width / dataset.length)
        .attr("height", d => height - yScale(d[1]))
        .attr("data-date", d => d[0])
        .attr("data-gdp", d => d[1])
        .on("mouseover", function(event, d) {
          const [date, gdp] = d;
          const tooltip = d3.select("#tooltip");
          tooltip.style("display", "block")
            .style("left", `${event.pageX + 5}px`)
            .style("top", `${event.pageY - 28}px`)
            .html(`Date: ${date}<br>GDP: ${gdp}`)
            .attr("data-date", date);
        })
        .on("mouseout", function() {
          d3.select("#tooltip").style("display", "none");
        });
  
      // Add ticks class to both axes
      d3.selectAll(".tick").attr("class", "tick");
    });
  });