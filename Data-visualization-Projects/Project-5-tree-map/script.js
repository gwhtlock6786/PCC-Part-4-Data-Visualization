/* global d3 */

// ============================================================
// SVG DIMENSIONS
// ============================================================

const width = 1200;
const height = 700;

// ============================================================
// DATA API
// ============================================================

const DATA_FILE =
  "https://pcc.perseverenow.org/api/content/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

// ============================================================
// CREATE SVG
// ============================================================

const svg = d3
  .select("#chart-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// ============================================================
// TOOLTIP
// ============================================================

const tooltip = d3.select("#tooltip").style("opacity", 0);

// ============================================================
// LOAD DATA
// ============================================================

d3.json(DATA_FILE)
  .then(function (data) {
    console.log("Video game data:", data);
    console.log(JSON.stringify(data));

    drawTreemap(data);
  })
  .catch(function (error) {
    console.error("Error loading video game data:", error);
  });

// ============================================================
// DRAW TREEMAP
// ============================================================

function drawTreemap(data) {
  // ==========================================================
  // CREATE HIERARCHY
  // ==========================================================

  const root = d3
    .hierarchy(data)
    .sum(function (d) {
      return d.value || 0;
    })
    .sort(function (a, b) {
      return b.value - a.value;
    });

  console.log("Hierarchy:", root);

  // ==========================================================
  // CREATE TREEMAP
  // ==========================================================

  const treemap = d3
    .treemap()
    .size([width, height])
    .paddingInner(1)
    .paddingOuter(2);

  treemap(root);

  console.log("Treemap:", root);

  // ==========================================================
  // GET CATEGORIES
  // ==========================================================

  const categories = root.children.map(function (category) {
    return category.data.name;
  });

  console.log("Categories:", categories);

  // ==========================================================
  // COLOR SCALE
  // ==========================================================

  const color = d3.scaleOrdinal().domain(categories).range(d3.schemeCategory10);

  // ==========================================================
  // CREATE TILE GROUPS
  // ==========================================================

  const tiles = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return `translate(${d.x0}, ${d.y0})`;
    });

  // ==========================================================
  // CREATE TILE RECTANGLES
  // ==========================================================

  tiles
    .append("rect")
    .attr("class", "tile")

    // --------------------------------------------------------
    // FCC REQUIRED ATTRIBUTES
    // --------------------------------------------------------

    .attr("data-name", function (d) {
      return d.data.name;
    })

    .attr("data-category", function (d) {
      return d.parent.data.name;
    })

    .attr("data-value", function (d) {
      return d.data.value;
    })

    // --------------------------------------------------------
    // TILE POSITION
    // --------------------------------------------------------

    .attr("x", 0)
    .attr("y", 0)

    // --------------------------------------------------------
    // TILE SIZE
    // --------------------------------------------------------

    .attr("width", function (d) {
      return d.x1 - d.x0;
    })

    .attr("height", function (d) {
      return d.y1 - d.y0;
    })

    // --------------------------------------------------------
    // TILE COLOR
    // --------------------------------------------------------

    .attr("fill", function (d) {
      return color(d.parent.data.name);
    })

    // ========================================================
    // MOUSEOVER
    // ========================================================

    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 0.9)

        // FCC REQUIRED ATTRIBUTE
        .attr("data-value", d.data.value)

        // Tooltip content
        .html(
          `
          <strong>${d.data.name}</strong>
          Category: ${d.parent.data.name}<br>
          Sales: ${d.data.value} million
        `,
        )

        // Tooltip position
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
  // TILE LABELS
  // ==========================================================

  tiles
    .append("text")
    .attr("class", "tile-label")
    .attr("x", 4)
    .attr("y", 14)
    .text(function (d) {
      return d.data.name;
    })
    .each(function (d) {
      const tileWidth = d.x1 - d.x0;
      const tileHeight = d.y1 - d.y0;

      // Hide labels when the tile is too small
      if (tileWidth < 50 || tileHeight < 25) {
        d3.select(this).style("display", "none");
      }
    });

  // ==========================================================
  // CREATE LEGEND
  // ==========================================================

  createLegend(categories, color);

  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log(
    "Treemap created successfully.",
    root.leaves().length,
    "tiles rendered.",
  );
}

// ============================================================
// CREATE LEGEND
// ============================================================

function createLegend(categories, color) {
  // ----------------------------------------------------------
  // LEGEND DIMENSIONS
  // ----------------------------------------------------------

  const legendWidth = 700;
  const legendHeight = 120;

  // ----------------------------------------------------------
  // CREATE LEGEND SVG
  // ----------------------------------------------------------

  const legendSvg = d3
    .select("#legend-container")
    .append("svg")
    .attr("id", "legend")
    .attr("width", legendWidth)
    .attr("height", legendHeight);

  // ----------------------------------------------------------
  // LEGEND ITEM WIDTH
  // ----------------------------------------------------------

  const itemWidth = 110;

  // ----------------------------------------------------------
  // CREATE LEGEND GROUPS
  // ----------------------------------------------------------

  const items = legendSvg
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return `translate(${(i % 6) * itemWidth}, ${Math.floor(i / 6) * 40})`;
    });

  // ----------------------------------------------------------
  // LEGEND RECTANGLES
  // ----------------------------------------------------------

  items
    .append("rect")
    .attr("class", "legend-item")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", function (d) {
      return color(d);
    });

  // ----------------------------------------------------------
  // LEGEND TEXT
  // ----------------------------------------------------------

  items
    .append("text")
    .attr("class", "legend-label")
    .attr("x", 24)
    .attr("y", 14)
    .text(function (d) {
      return d;
    });
}
