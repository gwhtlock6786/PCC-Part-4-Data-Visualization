// ============================================================
// 1. DATA SOURCE
// ============================================================

const url = "./mock-data/data.json";

// ============================================================
// 2. CHART DIMENSIONS
// ============================================================

const w = 1000;
const h = 500;
const padding = 70;

// ============================================================
// 3. SELECT THE SVG
// ============================================================

const svg = d3.select("#chart").attr("width", w).attr("height", h);

// ============================================================
// 4. GET THE DATA
// ============================================================

fetch(url)
  .then((response) => response.json())

  .then((dataset) => {
    // ========================================================
    // THE DATA IS MADE UP OF OBJECTS
    // ========================================================
    //
    // Each object looks like:
    //
    // {
    //   Time: "36:50",
    //   Place: 1,
    //   Seconds: 2210,
    //   Name: "Marco Pantani",
    //   Year: 1995,
    //   Nationality: "ITA",
    //   Doping: "...",
    //   URL: "..."
    // }
    //
    // Therefore:
    //
    // d.Time
    // d.Seconds
    // d.Name
    // d.Year
    // d.Doping
    // d.URL
    //
    // ========================================================

    // ========================================================
    // 5. CREATE X SCALE
    // ========================================================

    const xScale = d3
      .scaleLinear()

      // The X-axis represents years.
      .domain([d3.min(dataset, (d) => d.Year), d3.max(dataset, (d) => d.Year)])

      // Leave space on the left and right.
      .range([padding, w - padding]);

    // ========================================================
    // 6. CREATE Y SCALE
    // ========================================================

    const yScale = d3
      .scaleLinear()

      // The Y-axis represents time in seconds.
      .domain([
        d3.min(dataset, (d) => d.Seconds),
        d3.max(dataset, (d) => d.Seconds),
      ])

      // SVG coordinates increase downward.
      //
      // Smaller times appear toward the top.
      // Larger times appear toward the bottom.
      .range([padding, h - padding]);

    // ========================================================
    // 7. CREATE X AXIS
    // ========================================================

    const xAxis = d3
      .axisBottom(xScale)

      // Display years as whole numbers.
      .tickFormat(d3.format("d"));

    // ========================================================
    // 8. CREATE Y AXIS
    // ========================================================

    const yAxis = d3
      .axisLeft(yScale)

      // Convert seconds into MM:SS.
      .tickFormat((seconds) => {
        const minutes = Math.floor(seconds / 60);

        const remainingSeconds = Math.floor(seconds % 60);

        return minutes + ":" + String(remainingSeconds).padStart(2, "0");
      });

    // ========================================================
    // 9. ADD X AXIS TO SVG
    // ========================================================

    svg
      .append("g")
      .attr("id", "x-axis")

      // Move the axis to the bottom of the SVG.
      .attr("transform", `translate(0, ${h - padding})`)

      .call(xAxis);

    // ========================================================
    // 10. ADD Y AXIS TO SVG
    // ========================================================

    svg
      .append("g")
      .attr("id", "y-axis")

      // Move the axis to the left side.
      .attr("transform", `translate(${padding}, 0)`)

      .call(yAxis);

    // ========================================================
    // 11. CREATE THE DOTS
    // ========================================================

    svg
      .selectAll(".dot")

      // Give D3 the dataset.
      .data(dataset)

      // Create one circle for every cyclist.
      .enter()

      .append("circle")

      // ======================================================
      // 12. ADD DOT CLASS
      // ======================================================

      .attr("class", "dot")

      // ======================================================
      // 13. X POSITION
      // ======================================================

      // Year determines the horizontal position.

      .attr("cx", (d) => {
        return xScale(d.Year);
      })

      // ======================================================
      // 14. Y POSITION
      // ======================================================

      // Seconds determine the vertical position.

      .attr("cy", (d) => {
        return yScale(d.Seconds);
      })

      // ======================================================
      // 15. DOT SIZE
      // ======================================================

      .attr("r", 6)

      // ======================================================
      // 16. DATA-XVALUE
      // ======================================================

      // FCC requires each dot to have
      // data-xvalue containing the year.

      .attr("data-xvalue", (d) => {
        return d.Year;
      })

      // ======================================================
      // 17. DATA-YVALUE
      // ======================================================

      // FCC requires data-yvalue to contain
      // a Date representing the time.
      //
      // Example:
      //
      // "36:50"
      //
      // becomes a Date representing 36 minutes
      // and 50 seconds.

      .attr("data-yvalue", (d) => {
        const timeParts = d.Time.split(":");

        const minutes = Number(timeParts[0]);

        const seconds = Number(timeParts[1]);

        // Start with midnight.
        const date = new Date(1970, 0, 1);

        // Add the cyclist's time.
        date.setMinutes(minutes);
        date.setSeconds(seconds);

        return date.toISOString();
      })

      // ======================================================
      // 18. MOUSEOVER
      // ======================================================

      .on("mouseover", function (event, d) {
        const tooltip = d3.select("#tooltip");

        tooltip

          // Make tooltip visible.
          .style("opacity", 1)

          // Required by FCC.
          .attr("data-year", d.Year)

          // Information displayed inside tooltip.
          .html(
            `
            <strong>${d.Name}</strong><br>
            Year: ${d.Year}<br>
            Time: ${d.Time}<br>
            Place: ${d.Place}<br>
            Nationality: ${d.Nationality}<br>
            ${d.Doping ? `Doping: ${d.Doping}` : "No doping allegations"}
          `,
          )

          // Position tooltip near mouse.
          .style("left", `${event.offsetX + 15}px`)

          .style("top", `${event.offsetY - 40}px`);
      })

      // ======================================================
      // 19. MOUSEOUT
      // ======================================================

      .on("mouseout", function () {
        d3.select("#tooltip").style("opacity", 0);
      });

    // ========================================================
    // 20. ADD LEGEND TEXT
    // ========================================================

    d3.select("#legend").text("Cyclists' times in the Tour de France");
  })

  // ==========================================================
  // 21. ERROR HANDLING
  // ==========================================================

  .catch((error) => {
    console.error("There was a problem loading the cyclist data:", error);
  });
