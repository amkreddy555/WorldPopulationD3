// setting the dimensions and margins of the graph
const margin = { top: 10, right: 150, bottom: 50, left: 50 },
  width = 900 - margin.left - margin.right,
  height = 360 - margin.top - margin.bottom;

// append the svg object to the body
const svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let data;

// method for plotting the graph
function graphPlotter(selectedYear, selectedata) {
  document.getElementById("demo").innerHTML = "(" + selectedYear + ")";

  // Filtering data as per the selected Year
  let data = selectedata.filter(function (d) { return d.Year == selectedYear });

  // Logic for finding and displaying Total population
  const population_values = data.map(d => d.Population);

  function populationSum(arr) {
    let sum = 0;
    const specialChars = /\,/g;
    arr.forEach(item => {
      if (specialChars.test(item)) {
        item = item.replace(/\,/g, '');
      }
      item = parseInt(item, 10);
      sum += item;
    });
    return sum;
  }

  let total_population = populationSum(population_values) / 1000000; //converting to Millions

  document.getElementById("totPop").innerHTML = total_population.toLocaleString(); //number display format of en-US

  // To Remove previously drawn SVG on change of Selected year
  d3.selectAll("g > *").remove();

  // Add X scale
  const population_density_values = data.map(d => parseInt(d.Population_Density));
  const xMax = d3.max(population_density_values);
  const x = d3
    .scaleLinear()
    .domain([0, xMax])
    .range([0, width]);
  // Add X axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add X axis label:
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width - 290)
    .attr("y", height + margin.top + 25)
    .text("Population Density");

  // Add Y axis
  const yMax = d3.max(data, d => parseInt(d.Population_Growth_Rate)) + 1;
  const y = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add Y axis label:
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -margin.top - 50)
    .text("Population growth (%)")

  const zDomain = d3.extent(data, d => parseInt(d.Population.replace(",", "")));

  // Add a scale for bubble size
  const z = d3.scaleLinear()
    .domain(zDomain)
    .range([1, 20]);

  // tooltip
  const tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "#2196f3")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("color", "white")
    .style("display", "block")
    .style("position", "absolute")

  // Show, hide tooltip
  const showTooltip = function (event, d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html(d.Country + ", " + d.Population + ", " + d.Population_Density + ", " + d.Population_Growth_Rate)
      .style("left", event.x + "px")
      .style("top", event.y + "px")
  }
  const moveTooltip = function (event, d) {
    tooltip
      .style("left", event.x + "px")
      .style("top", event.y + "px")
  }
  const hideTooltip = function (event, d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
      .style("display", "inline")
  }

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Population_Density))
    .attr("cy", d => y(d.Population_Growth_Rate))
    .attr("r", d => z(parseInt(d.Population.replace(",", ""))))
    .style("fill", "#69b3a2")
    .style("opacity", "0.7")
    .attr("stroke", "black")
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip)
}

// Method for finding selected year from dropdown
function selectYear() {
  let selectedYear = document.getElementById("year").value;
  graphPlotter(selectedYear, data);
}

// fetching the data from an api having data in csv file using D3 fetch
d3.csv("https://gist.githubusercontent.com/amkreddy555/fd5fb73640dbfc2ce34bf4395a06dc53/raw").then(function (incomingData) {
  data = incomingData;//Assigning to global variable for future use

  // for Generating unique Year values in the dropdown
  const availableYears = data.map(d => d.Year);
  let uniqueYears = [...new Set(availableYears)];

  let selectElement = document.getElementById("year");

  for (let i = 0; i < uniqueYears.length; i++) {
    let opt = uniqueYears[i];
    let el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectElement.appendChild(el);
  }

  // call the plot method for plotting the graph on initial load with default Year
  graphPlotter(uniqueYears[0], data);
})
