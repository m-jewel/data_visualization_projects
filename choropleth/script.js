// script.js

// URL of the dataset
const DATA_URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

// Dimensions of the treemap
const width = 1000;
const height = 600;

// Colors for different categories
const colors = d3.scaleOrdinal(d3.schemeCategory10);

// Tooltip element
const tooltip = d3.select("#tooltip");

// Create the SVG element for the treemap
const svg = d3.select("#treemap")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Fetch the data and create the treemap
d3.json(DATA_URL).then(data => {
  // Create a root node
  const root = d3.hierarchy(data)
    .eachBefore(d => {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  // Create a treemap layout
  d3.treemap()
    .size([width, height])
    .paddingInner(1)
    (root);

  // Create the tiles
  const tile = svg.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  tile.append("rect")
    .attr("class", "tile")
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => colors(d.data.category))
    .on("mouseover", function(event, d) {
      tooltip.style("display", "block")
        .html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
        .attr("data-value", d.data.value);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY + 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("display", "none");
    });

  tile.append("text")
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter().append("tspan")
    .attr("x", 4)
    .attr("y", (d, i) => 13 + i * 10)
    .text(d => d);

  // Create the legend
  const categories = Array.from(new Set(data.children.map(d => d.name)));
  const legend = d3.select("#legend")
    .append("svg")
    .attr("width", 200)
    .attr("height", categories.length * 20);

  const legendItem = legend.selectAll("g")
    .data(categories)
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legendItem.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => colors(d))
    .attr("class", "legend-item");

  legendItem.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(d => d);
}).catch(error => {
  console.error('Error fetching the data:', error);
});
