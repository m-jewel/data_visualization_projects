// Set the dimensions of the SVG container
const width = 1000;
const height = 600; // Increased height to accommodate the legend
const padding = 60;

// URL to fetch the dataset
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

// Fetch the data
d3.json(url).then(data => {
    // Extract base temperature and monthly variance data
    const baseTemperature = data.baseTemperature;
    const monthlyVariance = data.monthlyVariance;

    // Get unique years and define month names
    const years = [...new Set(monthlyVariance.map(d => d.year))];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Create scales for x (years) and y (months) axes
    const xScale = d3.scaleBand()
        .domain(years)
        .range([padding, width - padding]);

    const yScale = d3.scaleBand()
        .domain(d3.range(0, 12))
        .range([height - padding - 40, padding]); // Adjusted range to leave space for legend

    // Calculate temperature variance range for color scaling
    const tempVariance = monthlyVariance.map(d => d.variance);
    const minTemp = baseTemperature + d3.min(tempVariance);
    const maxTemp = baseTemperature + d3.max(tempVariance);

    // Create color scale based on temperature variance
    const colorScale = d3.scaleQuantile()
        .domain([minTemp, maxTemp])
        .range(["#4575b4", "#91bfdb", "#e0f3f8", "#fee090", "#fc8d59", "#d73027"]);

    // Create the SVG container
    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Add x-axis to the SVG
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height - padding - 40})`) // Adjusted to move above the legend
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => !(i % 10))));

    // Add y-axis to the SVG
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => months[d]));

    // Create and position the heatmap cells
    svg.selectAll(".cell")
        .data(monthlyVariance)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-year", d => d.year)
        .attr("data-month", d => d.month - 1)
        .attr("data-temp", d => baseTemperature + d.variance)
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.month - 1))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(baseTemperature + d.variance))
        .on("mouseover", (event, d) => {
            const tooltip = d3.select("#tooltip");
            tooltip.style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`)
                .style("opacity", 0.9)
                .html(`<strong>Year:</strong> ${d.year}<br><strong>Month:</strong> ${months[d.month - 1]}<br><strong>Temp:</strong> ${(baseTemperature + d.variance).toFixed(2)}℃`)
                .attr("data-year", d.year);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
        });

    // Create the legend
    const legendWidth = 300;
    const legendHeight = 20;
    const legendRectWidth = legendWidth / colorScale.range().length;

    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${padding}, ${28 + height - padding})`); // Positioned at the bottom

    legend.selectAll("rect")
        .data(colorScale.range().map(color => {
            const d = colorScale.invertExtent(color);
            if (!d[0]) d[0] = minTemp;
            if (!d[1]) d[1] = maxTemp;
            return d;
        }))
        .enter()
        .append("rect")
        .attr("height", legendHeight)
        .attr("x", (d, i) => i * legendRectWidth)
        .attr("width", legendRectWidth)
        .attr("fill", d => colorScale(d[0]));

    // Add text to the legend
    legend.append("text")
        .attr("x", 0)
        .attr("y", legendHeight + 20)
        .text(`Temperature (℃)`);
});
