// ============================================================
// 1. DATA SOURCE
// ============================================================

const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

// ============================================================
// 2. CHART DIMENSIONS
// ============================================================

const w = 1200;
const h = 550;

const padding = {
  top: 40,
  right: 40,
  bottom: 70,
  left: 90,
};

// ============================================================
// 3. HEAT MAP DIMENSIONS
// ============================================================

const chartWidth = w - padding.left - padding.right;

const chartHeight = h - padding.top - padding.bottom;

// ============================================================
// 4. CREATE SVG
// ============================================================

const svg = d3
  .select("#chart-container")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

// ============================================================
// 5. CREATE MAIN CHART GROUP
// ============================================================

const chart = svg
  .append("g")
  .attr("transform", `translate(${padding.left}, ${padding.top})`);

// ============================================================
// 6. GET THE DATA
// ============================================================

fetch(url)
  .then((response) => response.json())

  .then((data) => {
    // ========================================================
    // DATA STRUCTURE
    // ========================================================
    //
    // The JSON looks approximately like this:
    //
    // {
    //   "baseTemperature": 8.66,
    //
    //   "monthlyVariance": [
    //     {
    //       "year": 1753,
    //       "month": 1,
    //       "variance": -1.233
    //     },
    //     ...
    //   ]
    // }
    //
    // baseTemperature = average base temperature
    //
    // variance = difference from that base temperature
    //
    // Therefore:
    //
    // temperature =
    // baseTemperature + variance
    //
    // ========================================================

    // ========================================================
    // 7. GET BASE TEMPERATURE
    // ========================================================

    const baseTemperature = data.baseTemperature;

    // ========================================================
    // 8. GET MONTHLY DATA
    // ========================================================

    const dataset = data.monthlyVariance;

    // ========================================================
    // 9. CALCULATE ACTUAL TEMPERATURE
    // ========================================================

    // Add a temperature property to every data object.

    dataset.forEach((d) => {
      d.temperature = baseTemperature + d.variance;
    });

    // ========================================================
    // 10. FIND YEAR RANGE
    // ========================================================

    const minYear = d3.min(dataset, (d) => d.year);

    const maxYear = d3.max(dataset, (d) => d.year);

    // ========================================================
    // 11. CREATE X SCALE
    // ========================================================

    const xScale = d3
      .scaleLinear()

      // DOMAIN = actual years in the dataset.
      .domain([minYear, maxYear])

      // RANGE = physical x positions.
      .range([0, chartWidth]);

    // ========================================================
    // 12. CREATE Y SCALE
    // ========================================================

    const yScale = d3
      .scaleBand()

      // Months 1 through 12.
      .domain(d3.range(1, 13))

      // RANGE = physical y positions.
      .range([0, chartHeight])

      // Small gap between cells.
      .padding(0);

    // ========================================================
    // 13. MONTH NAMES
    // ========================================================

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // ========================================================
    // 14. CREATE X AXIS
    // ========================================================

    const xAxis = d3
      .axisBottom(xScale)

      // Show approximately one tick every 10 years.
      .ticks(27)

      // Display years as integers.
      .tickFormat(d3.format("d"));

    // ========================================================
    // 15. CREATE Y AXIS
    // ========================================================

    const yAxis = d3
      .axisLeft(yScale)

      // Use full month names.
      .tickFormat((month) => {
        return monthNames[month - 1];
      });

    // ========================================================
    // 16. ADD X AXIS
    // ========================================================

    chart
      .append("g")

      .attr("id", "x-axis")

      .attr("class", "axis")

      // Move X axis to bottom.
      .attr("transform", `translate(0, ${chartHeight})`)

      .call(xAxis);

    // ========================================================
    // 17. ADD Y AXIS
    // ========================================================

    chart
      .append("g")

      .attr("id", "y-axis")

      .attr("class", "axis")

      .call(yAxis);

    // ========================================================
    // 18. CREATE COLOR SCALE
    // ========================================================

    // The temperature range is divided into
    // multiple colors.
    //
    // This automatically gives us more than
    // the required 4 colors.

    const colorScale = d3
      .scaleQuantize()

      .domain([
        d3.min(dataset, (d) => d.temperature),

        d3.max(dataset, (d) => d.temperature),
      ])

      .range([
        "#313695",
        "#4575b4",
        "#74add1",
        "#abd9e9",
        "#fee090",
        "#fdae61",
        "#f46d43",
        "#d73027",
        "#a50026",
      ]);

    // ========================================================
    // 19. CREATE HEAT MAP CELLS
    // ========================================================

    chart
      .selectAll(".cell")

      // Bind the monthly data.
      .data(dataset)

      // Create one rectangle for every data point.
      .enter()

      .append("rect")

      // ======================================================
      // 20. CELL CLASS
      // ======================================================

      .attr("class", "cell")

      // ======================================================
      // 21. CELL X POSITION
      // ======================================================

      // The year determines the horizontal position.

      .attr("x", (d) => {
        return xScale(d.year);
      })

      // ======================================================
      // 22. CELL Y POSITION
      // ======================================================

      // The month determines the vertical position.

      .attr("y", (d) => {
        return yScale(d.month);
      })

      // ======================================================
      // 23. CELL WIDTH
      // ======================================================

      // Each cell represents one year.

      .attr("width", chartWidth / (maxYear - minYear + 1))

      // ======================================================
      // 24. CELL HEIGHT
      // ======================================================

      // scaleBand calculates the height automatically.

      .attr("height", yScale.bandwidth())

      // ======================================================
      // 25. CELL COLOR
      // ======================================================

      // Temperature determines the color.

      .attr("fill", (d) => {
        return colorScale(d.temperature);
      })

      // ======================================================
      // 26. DATA-MONTH
      // ======================================================

      .attr("data-month", (d) => {
        // FCC expects the month value.
        //
        // The dataset uses:
        // January = 1
        // December = 12

        return d.month - 1;
      })

      // ======================================================
      // 27. DATA-YEAR
      // ======================================================

      .attr("data-year", (d) => {
        return d.year;
      })

      // ======================================================
      // 28. DATA-TEMP
      // ======================================================

      .attr("data-temp", (d) => {
        return d.temperature;
      })

      // ======================================================
      // 29. MOUSEOVER
      // ======================================================

      .on("mouseover", function (event, d) {
        const tooltip = d3.select("#tooltip");

        // Make tooltip visible.

        tooltip
          .style("opacity", 1)

          // Required FCC property.

          .attr("data-year", d.year)

          // Display information about
          // the selected temperature.

          .html(
            `
            <strong>${monthNames[d.month - 1]}</strong>
            ${d.year}
            <br>
            Temperature:
            ${d.temperature.toFixed(2)}°C
            <br>
            Variance:
            ${d.variance.toFixed(2)}°C
          `,
          )

          // Position tooltip.

          .style("left", `${event.pageX + 15}px`)

          .style("top", `${event.pageY - 40}px`);
      })

      // ======================================================
      // 30. MOUSEOUT
      // ======================================================

      .on("mouseout", function () {
        d3.select("#tooltip").style("opacity", 0);
      });

    // ========================================================
    // 31. CREATE LEGEND
    // ========================================================

    const legendWidth = 450;
    const legendHeight = 40;

    const legendSvg = d3
      .select("#legend-container")
      .append("svg")

      .attr("id", "legend")

      .attr("width", legendWidth)

      .attr("height", legendHeight);

    // ========================================================
    // 32. CREATE LEGEND SCALE
    // ========================================================

    const legendScale = d3
      .scaleLinear()

      .domain(colorScale.domain())

      .range([0, legendWidth]);

    // ========================================================
    // 33. GET COLOR VALUES
    // ========================================================

    const colors = colorScale.range();

    // ========================================================
    // 34. CREATE LEGEND RECTANGLES
    // ========================================================

    legendSvg
      .selectAll(".legend-cell")

      .data(colors)

      .enter()

      .append("rect")

      // Give every legend rectangle
      // the class "legend-cell".

      .attr("class", "legend-cell")

      // Position each rectangle.

      .attr("x", (d, i) => {
        return i * (legendWidth / colors.length);
      })

      // Position vertically.

      .attr("y", 0)

      // Width of each color box.

      .attr("width", legendWidth / colors.length)

      // Height of each color box.

      .attr("height", 20)

      // Use the same colors as the heat map.

      .attr("fill", (d) => d);

    // ========================================================
    // 35. CREATE LEGEND SCALE AXIS
    // ========================================================

    const legendAxis = d3
      .axisBottom(legendScale)

      .ticks(colors.length)

      .tickFormat((d) => `${d.toFixed(1)}°C`);

    // ========================================================
    // 36. ADD LEGEND AXIS
    // ========================================================

    legendSvg
      .append("g")

      .attr("transform", "translate(0, 20)")

      .call(legendAxis);
  })

  // ==========================================================
  // 37. ERROR HANDLING
  // ==========================================================

  .catch((error) => {
    console.error("There was a problem loading the temperature data:", error);
  });
