// ============================================================
// 1. DATA SOURCE
// ============================================================

// URL for the GDP JSON data provided by freeCodeCamp.
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

// ============================================================
// 2. CHART DIMENSIONS
// ============================================================

const w = 1000;
const h = 500;

// Padding gives the axes and their labels room
// inside the SVG.
const padding = 70;

// ============================================================
// 3. SELECT THE SVG
// ============================================================

// Select the <svg id="chart"> element from index.html.
const svg = d3.select("#chart").attr("width", w).attr("height", h);

// ============================================================
// 4. GET THE DATA WITH FETCH()
// ============================================================

// fetch() sends a GET request to the JSON API.
fetch(url)
  // The first .then() receives the HTTP response.
  .then(function (response) {
    // Convert the response from JSON into
    // a JavaScript object.
    return response.json();
  })

  // The second .then() receives the actual data.
  .then(function (data) {
    // The API returns an object.
    //
    // The actual GDP records are inside data.data.
    //
    // Each record looks like:
    //
    // ["1947-01-01", 243.164]
    //
    // index 0 = date
    // index 1 = GDP
    const dataset = data.data;

    // ========================================================
    // 5. FIND THE FIRST AND LAST DATES
    // ========================================================

    const firstDate = new Date(dataset[0][0]);

    const lastDate = new Date(dataset[dataset.length - 1][0]);

    // ========================================================
    // 6. CREATE THE X SCALE
    // ========================================================

    const xScale = d3
      .scaleTime()

      // DOMAIN = actual data values.
      //
      // Our domain is the first date
      // through the last date.
      .domain([firstDate, lastDate])

      // RANGE = where those values appear
      // inside the SVG.
      //
      // We use padding so the chart doesn't
      // touch the edges.
      .range([padding, w - padding]);

    // ========================================================
    // 7. CREATE THE Y SCALE
    // ========================================================

    // Find the largest GDP value.
    const maxGDP = d3.max(dataset, function (d) {
      return d[1];
    });

    const yScale = d3
      .scaleLinear()

      // DOMAIN = GDP data values.
      //
      // Start at zero and end at the largest GDP.
      .domain([0, maxGDP])

      // RANGE is reversed because SVG's y-axis
      // increases downward.
      //
      // 0 GDP → bottom
      // max GDP → top
      .range([h - padding, padding]);

    // ========================================================
    // 8. CREATE THE X AXIS
    // ========================================================

    const xAxis = d3.axisBottom(xScale);

    // ========================================================
    // 9. CREATE THE Y AXIS
    // ========================================================

    const yAxis = d3.axisLeft(yScale);

    // ========================================================
    // 10. ADD THE X AXIS TO THE SVG
    // ========================================================

    svg
      .append("g")

      // Required by the FCC tests.
      .attr("id", "x-axis")

      // Add the axis class.
      .attr("class", "axis")

      // Move the axis to the bottom of the chart.
      //
      // x = 0
      // y = h - padding
      .attr("transform", "translate(0," + (h - padding) + ")")

      // Generate the axis and its tick marks.
      .call(xAxis);

    // ========================================================
    // 11. ADD THE Y AXIS TO THE SVG
    // ========================================================

    svg
      .append("g")

      // Required by the FCC tests.
      .attr("id", "y-axis")

      .attr("class", "axis")

      // Move the y-axis to the left padding.
      //
      // x = padding
      // y = 0
      .attr("transform", "translate(" + padding + ",0)")

      // Generate the axis and its tick marks.
      .call(yAxis);

    // ========================================================
    // 12. CALCULATE BAR WIDTH
    // ========================================================

    // Divide the available chart width by
    // the number of data points.
    const barWidth = (w - 2 * padding) / dataset.length;

    // ========================================================
    // 13. CREATE THE BARS
    // ========================================================

    svg
      .selectAll(".bar")

      // Give D3 all of the GDP records.
      .data(dataset)

      // Create one element for every data item.
      .enter()

      // Create a <rect> for every data item.
      .append("rect")

      // Required by the FCC tests.
      .attr("class", "bar")

      // --------------------------------------------------------
      // X POSITION
      // --------------------------------------------------------

      // d[0] is the date.
      //
      // xScale converts the date into
      // an SVG x-coordinate.
      .attr("x", function (d) {
        return xScale(new Date(d[0]));
      })

      // --------------------------------------------------------
      // Y POSITION
      // --------------------------------------------------------

      // d[1] is the GDP value.
      //
      // yScale converts the GDP value into
      // an SVG y-coordinate.
      //
      // This determines where the TOP
      // of the bar starts.
      .attr("y", function (d) {
        return yScale(d[1]);
      })

      // --------------------------------------------------------
      // BAR WIDTH
      // --------------------------------------------------------

      .attr("width", barWidth)

      // --------------------------------------------------------
      // BAR HEIGHT
      // --------------------------------------------------------

      // The bottom of the chart is h - padding.
      //
      // Subtract the top position from the bottom
      // to determine the bar's height.
      .attr("height", function (d) {
        return h - padding - yScale(d[1]);
      })

      // --------------------------------------------------------
      // DATA-DATE ATTRIBUTE
      // --------------------------------------------------------

      // Store the original date directly on
      // the bar as a data attribute.
      .attr("data-date", function (d) {
        return d[0];
      })

      // --------------------------------------------------------
      // DATA-GDP ATTRIBUTE
      // --------------------------------------------------------

      // Store the GDP value directly on
      // the bar.
      .attr("data-gdp", function (d) {
        return d[1];
      })

      // ========================================================
      // 14. MOUSEOVER EVENT
      // ========================================================

      .on("mouseover", function (event, d) {
        // Select the tooltip.
        d3.select("#tooltip")

          // Make it visible.
          .style("opacity", 1)

          // The FCC tests require the tooltip
          // to have a data-date attribute.
          .attr("data-date", d[0])

          // Add information about the current
          // data point.
          .html("Date: " + d[0] + "<br>GDP: $" + d[1] + " Billion")

          // Position the tooltip near the mouse.
          .style("left", event.offsetX + 15 + "px")
          .style("top", event.offsetY - 40 + "px");
      })

      // ========================================================
      // 15. MOUSEOUT EVENT
      // ========================================================

      .on("mouseout", function () {
        // Hide the tooltip when the mouse
        // leaves the bar.
        d3.select("#tooltip").style("opacity", 0);
      });
  });
