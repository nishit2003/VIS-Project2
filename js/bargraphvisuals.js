class BarGraphVisuals {
    // Class Constants & Attributes
    // TODO: Add if necessary

    // Constructor
    /**
     * Class constructor with basic configuration.
     * @param {Object}
     * @param {Array}
     */
    constructor(_config_year, _config_ufo, _config_encounter, _config_time, _data) {
        this.config_year = {
        parentElement: _config_year.parentElement,
        containerWidth: 500,
        containerHeight: 400,
        margin: _config_year.margin || { top: 50, right: 60, bottom: 50, left: 100 },
        tooltipPadding: _config_year.tooltipPadding || 15,
        };
        this.config_ufo = {
        parentElement: _config_ufo.parentElement,
        containerWidth: 500,
        containerHeight: 400,
        margin: _config_ufo.margin || { top: 50, right: 60, bottom: 50, left: 100 },
        tooltipPadding: _config_ufo.tooltipPadding || 15,
        };
        this.data = _data;

        this.initVisMonth()
        this.initVisUFO()
    }
    
    initVisMonth() {
        let vis = this;

        vis.width = vis.config_year.containerWidth - vis.config_year.margin.left - vis.config_year.margin.right;
        vis.height = vis.config_year.containerHeight - vis.config_year.margin.top - vis.config_year.margin.bottom;

        // Create SVG
        vis.svg = d3.select(vis.config_year.parentElement)
        .append('svg')
        .attr('width', vis.config_year.containerWidth)
        .attr('height', vis.config_year.containerHeight)
        .append('g')
        .attr('transform', `translate(${vis.config_year.margin.left},${vis.config_year.margin.top})`);

        // Define scales
        vis.xScale = d3.scaleLinear()
        .range([0, vis.width])
        .domain([1, 13]);

        // Y axis scale
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)

        vis.yAxis = d3.axisLeft(vis.yScale)

        // Create histogram layout
        vis.histogram = d3.histogram()
        .value(d => {
            if (typeof d.date_time != "number") {
                return d.date_time.split(" ")[0].split("/")[0]}
            })
        .domain(vis.xScale.domain())
        .thresholds(vis.xScale.ticks(12));

        // Generate bins
        vis.bins = vis.histogram(vis.data);

        // Update yScale domain based on data
        vis.yScale.domain([0, d3.max(vis.bins, d => d.length)]);

        // Append X axis
        vis.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${vis.height})`)
        .call(vis.xAxis);

        // Append Y axis
        vis.svg.append("g")
        .attr("class", "y-axis")
        .call(vis.yAxis);

        // Append both axis titles
        vis.svg.append('text')
            .attr('y', vis.height + 25)
            .attr('x', vis.width)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text("Month");

        vis.svg.append('text')
            .attr('x', -80)
            .attr('y', -5)
            .attr('dy', '.71em')
            .text("Frequency");

        vis.svg.append('text')
            .attr('x', vis.width/5)
            .attr('y', -40)
            .attr('font-size', "px")
            .attr('dy', '.71em')
            .text(`Months Histogram`);

        // Update yScale domain based on data
        vis.yScale.domain([0, d3.max(vis.bins, d => d.length)]);
        // Draw bars
        vis.bars = vis.svg.selectAll(".bar")
        .data(vis.bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => vis.xScale(d.x0))
        .attr("y", d => vis.yScale(d.length))
        .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
        .attr("height", d => vis.height - vis.yScale(d.length))
        .style("fill", "#69b3a2");

    }

    updateVis() {
    let vis = this;

    // Generate bins
    vis.bins = vis.histogram(vis.data);

    // Update the existing bars
    vis.svg.selectAll(".bar")
      .data(vis.bins)
      .transition()
      .duration(500)
      .attr("x", d => vis.xScale(d.x0))
      .attr("y", d => vis.yScale(d.length))
      .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
      .attr("height", d => vis.height - vis.yScale(d.length));

    // Add tooltip
    vis.bars
      .on("mousemove", (event, d) => {
        d3.select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config_year.tooltipPadding + "px")
          .style("top", event.pageY + vis.config_year.tooltipPadding + "px")
          .html(`<div class="tooltip-title">${d.length} counties</div>
                 <div></div>`);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });
    }

    initVisUFO() {
        let vis = this;

        // Create SVG
        vis.svg1 = d3.select(vis.config_year.parentElement)
        .append('svg')
        .attr('width', vis.config_year.containerWidth)
        .attr('height', vis.config_year.containerHeight)
        .append('g')
        .attr('transform', `translate(${vis.config_year.margin.left},${vis.config_year.margin.top})`);

        // Calculate frequency of each ufo_shape
        let ufoShapeCounts = d3.rollup(vis.data, v => v.length, d => d.ufo_shape);

        // Convert the rollup map to an array of objects
        let ufoShapes = Array.from(ufoShapeCounts, ([ufo_shape, Value]) => ({ ufo_shape, Value }));

        // X axis
        var x = d3.scaleBand()
            .range([0, vis.width])
            .domain(ufoShapes.map(d => d.ufo_shape))
            .padding(0.2);

        vis.svg1.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(ufoShapes, d => d.Value)]) // Adjust domain based on the maximum frequency
            .range([vis.height, 0]);

        vis.svg1.append("g")
            .call(d3.axisLeft(y));

        // Bars
        vis.svg1.selectAll("mybar")
            .data(ufoShapes)
            .enter()
            .append("rect")
                .attr("x", function(d) { return x(d.ufo_shape); })
                .attr("y", function(d) { return y(d.Value); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return vis.height - y(d.Value); })
                .attr("fill", "#69b3a2");
            }

}