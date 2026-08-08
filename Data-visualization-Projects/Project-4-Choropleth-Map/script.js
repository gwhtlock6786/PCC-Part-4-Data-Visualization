/* global d3, topojson */

// ============================================================
// SVG DIMENSIONS
// ============================================================

const width = 1000;
const height = 600;

// ============================================================
// CREATE SVG INSIDE #map-container
// ============================================================

const svg = d3
  .select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// ============================================================
// TOOLTIP
//
// The tooltip already exists in the HTML, so we select it
// instead of creating another one.
// ============================================================

const tooltip = d3.select("#tooltip").style("opacity", 0);

// ============================================================
// GEOGRAPHIC PATH
//
// The FCC TopoJSON data is already prepared for drawing,
// so we use the default geoPath.
// ============================================================

const path = d3.geoPath();

// ============================================================
// EDUCATION VALUE RANGE
// ============================================================

const minEducation = 2.6;
const maxEducation = 75.1;

// ============================================================
// COLOR SCALE
// ============================================================

const color = d3
  .scaleThreshold()
  .domain(
    d3.range(minEducation, maxEducation, (maxEducation - minEducation) / 8),
  )
  .range(d3.schemeGreens[9]);

// ============================================================
// LEGEND SCALE
// ============================================================

const legendScale = d3
  .scaleLinear()
  .domain([minEducation, maxEducation])
  .range([600, 860]);

// ============================================================
// LEGEND
// ============================================================

const legend = svg
  .append("g")
  .attr("id", "legend")
  .attr("class", "key")
  .attr("transform", "translate(0, 40)");

// ============================================================
// LEGEND RECTANGLES
// ============================================================

legend
  .selectAll("rect")
  .data(
    color.range().map(function (colorValue) {
      const extent = color.invertExtent(colorValue);

      if (extent[0] === null) {
        extent[0] = minEducation;
      }

      if (extent[1] === null) {
        extent[1] = maxEducation;
      }

      return extent;
    }),
  )
  .enter()
  .append("rect")
  .attr("height", 8)
  .attr("x", function (d) {
    return legendScale(d[0]);
  })
  .attr("width", function (d) {
    return legendScale(d[1]) - legendScale(d[0]);
  })
  .attr("fill", function (d) {
    return color(d[0]);
  });

// ============================================================
// LEGEND AXIS
// ============================================================

legend
  .append("g")
  .attr("transform", "translate(0, 8)")
  .call(
    d3
      .axisBottom(legendScale)
      .tickSize(13)
      .tickFormat(function (value) {
        return Math.round(value) + "%";
      })
      .tickValues(color.domain()),
  )
  .select(".domain")
  .remove();

// ============================================================
// LEGEND LABEL
// ============================================================

legend
  .append("text")
  .attr("x", 600)
  .attr("y", -6)
  .attr("fill", "#000")
  .attr("text-anchor", "start")
  .attr("font-weight", "bold")
  .text("Percentage of adults with a bachelor's degree or higher");

// ============================================================
// API URLS
// ============================================================

const EDUCATION_FILE =
  "https://pcc.perseverenow.org/api/content/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const COUNTY_FILE =
  "https://pcc.perseverenow.org/api/content/testable-projects-fcc/data/choropleth_map/counties.json";

// ============================================================
// LOAD DATA
// ============================================================

Promise.all([d3.json(COUNTY_FILE), d3.json(EDUCATION_FILE)])
  .then(function (data) {
    const countyData = data[0];
    const educationData = data[1];

    console.log("County data:", countyData);
    console.log("Education data:", educationData);

    drawMap(countyData, educationData);
  })
  .catch(function (error) {
    console.error("There was a problem loading the choropleth data:", error);
  });

// ============================================================
// DRAW MAP
// ============================================================

function drawMap(countyData, educationData) {
  // ==========================================================
  // CHECK TOPOJSON STRUCTURE
  // ==========================================================

  console.log("TopoJSON objects:", countyData.objects);

  // ==========================================================
  // CONVERT COUNTIES FROM TOPOJSON TO GEOJSON
  // ==========================================================

  const counties = topojson.feature(countyData, countyData.objects.counties);

  console.log("Converted counties:", counties);

  // ==========================================================
  // COUNTY GROUP
  // ==========================================================

  const countyGroup = svg.append("g").attr("class", "counties");

  // ==========================================================
  // CREATE COUNTY PATHS
  // ==========================================================

  countyGroup
    .selectAll("path")
    .data(counties.features)
    .enter()
    .append("path")

    // --------------------------------------------------------
    // FCC REQUIRED CLASS
    // --------------------------------------------------------

    .attr("class", "county")

    // --------------------------------------------------------
    // COUNTY FIPS
    //
    // Convert to string and pad to five digits so that
    // numeric/string differences do not cause failed matches.
    // --------------------------------------------------------

    .attr("data-fips", function (d) {
      return String(d.id).padStart(5, "0");
    })

    // --------------------------------------------------------
    // EDUCATION DATA
    // --------------------------------------------------------

    .attr("data-education", function (d) {
      const fips = String(d.id).padStart(5, "0");

      const result = educationData.find(function (county) {
        return String(county.fips).padStart(5, "0") === fips;
      });

      if (result) {
        return result.bachelorsOrHigher;
      }

      return 0;
    })

    // --------------------------------------------------------
    // COUNTY COLOR
    // --------------------------------------------------------

    .attr("fill", function (d) {
      const fips = String(d.id).padStart(5, "0");

      const result = educationData.find(function (county) {
        return String(county.fips).padStart(5, "0") === fips;
      });

      if (result) {
        return color(result.bachelorsOrHigher);
      }

      return "#ccc";
    })

    // --------------------------------------------------------
    // DRAW COUNTY
    // --------------------------------------------------------

    .attr("d", path)

    // --------------------------------------------------------
    // COUNTY BORDER
    // --------------------------------------------------------

    .attr("stroke", "#ffffff")
    .attr("stroke-width", 0.4)

    // ========================================================
    // MOUSEOVER
    // ========================================================

    .on("mouseover", function (event, d) {
      const fips = String(d.id).padStart(5, "0");

      const result = educationData.find(function (county) {
        return String(county.fips).padStart(5, "0") === fips;
      });

      if (!result) {
        return;
      }

      // ------------------------------------------------------
      // Required by FCC tests
      // ------------------------------------------------------

      tooltip.attr("data-education", result.bachelorsOrHigher);

      // ------------------------------------------------------
      // Tooltip content
      // ------------------------------------------------------

      tooltip
        .style("opacity", 0.9)
        .html(
          `
          <strong>${result.area_name}</strong><br>
          State: ${result.state}<br>
          Bachelor's or Higher: ${result.bachelorsOrHigher}%
        `,
        )

        // ----------------------------------------------------
        // Tooltip position
        // ----------------------------------------------------

        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })

    // ========================================================
    // MOUSEOUT
    // ========================================================

    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // ==========================================================
  // STATE BORDERS
  // ==========================================================

  if (countyData.objects.states) {
    svg
      .append("path")
      .datum(
        topojson.mesh(countyData, countyData.objects.states, function (a, b) {
          return a !== b;
        }),
      )
      .attr("class", "states")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);
  }

  // ==========================================================
  // FINAL DEBUG INFORMATION
  // ==========================================================

  console.log(
    "Map created successfully.",
    counties.features.length,
    "counties rendered.",
  );
}
