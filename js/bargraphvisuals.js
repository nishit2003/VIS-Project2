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
        this.config_encounter = {
        parentElement: _config_encounter.parentElement,
        containerWidth: 500,
        containerHeight: 400,
        margin: _config_encounter.margin || { top: 50, right: 60, bottom: 50, left: 100 },
        tooltipPadding: _config_encounter.tooltipPadding || 15,
        };
        this.config_time = {
        parentElement: _config_time.parentElement,
        containerWidth: 500,
        containerHeight: 400,
        margin: _config_time.margin || { top: 50, right: 60, bottom: 50, left: 100 },
        tooltipPadding: _config_time.tooltipPadding || 15,
        }; 
        this.data = _data;

        this.initVisMonth()
        this.initVisUFO()
        this.initVisEncounter()
        this.initVisTimeDay()
    }
    
    initVisMonth() {
        let vis = this;

        vis.width_month = vis.config_year.containerWidth - vis.config_year.margin.left - vis.config_year.margin.right;
        vis.height_month = vis.config_year.containerHeight - vis.config_year.margin.top - vis.config_year.margin.bottom;

        // Create SVG
        vis.svg_month = d3.select(vis.config_year.parentElement)
        .append('svg')
        .attr('width', vis.config_year.containerWidth)
        .attr('height', vis.config_year.containerHeight)
        .append('g')
        .attr('transform', `translate(${vis.config_year.margin.left},${vis.config_year.margin.top})`);

        // Define scales
        vis.xScale_month = d3.scaleLinear()
        .range([0, vis.width_month])
        .domain([1, 13]);

        // Y axis scale
        vis.yScale_month = d3.scaleLinear().range([vis.height_month, 0]);

        // Initialize axes
        vis.xAxis_month = d3.axisBottom(vis.xScale_month)

        vis.yAxis_month = d3.axisLeft(vis.yScale_month)

        // Create histogram layout
        vis.histogram_month = d3.histogram()
        .value(d => {
            if (typeof d.date_time != "number") {
                return d.date_time.split(" ")[0].split("/")[0]}
            })
        .domain(vis.xScale_month.domain())
        .thresholds(vis.xScale_month.ticks(12));

        // Generate bins
        vis.bins_month = vis.histogram_month(vis.data);

        // Update yScale domain based on data
        vis.yScale_month.domain([0, d3.max(vis.bins_month, d => d.length)]);

        // Append X axis
        vis.svg_month.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${vis.height_month})`)
        .call(vis.xAxis_month);

        // Append Y axis
        vis.svg_month.append("g")
        .attr("class", "y-axis")
        .call(vis.yAxis_month);

        // Append both axis titles
        vis.svg_month.append('text')
            .attr('y', vis.height_month + 25)
            .attr('x', vis.width_month)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text("Month");

        vis.svg_month.append('text')
            .attr('x', -80)
            .attr('y', -5)
            .attr('dy', '.71em')
            .text("Frequency");

        vis.svg_month.append('text')
            .attr('x', vis.width_month/5)
            .attr('y', -40)
            .attr('font-size', "px")
            .attr('dy', '.71em')
            .text(`Months Histogram`);

        const brushed = (event) => {
            if (!event.selection) return;
            var [x0, x1] = event.selection;
            const selectedBars = vis.bins_month.filter(d => x0 <= vis.xScale_month(d.x0) && x1 >= vis.xScale_month(d.x1));
            vis.selectedData = selectedBars.flatMap(bin => bin.map(d => d));
            vis.bars_month.classed("selected", d => x0 <= vis.xScale_month(d.x0) && x1 >= vis.xScale_month(d.x1));
            vis.bars_month.filter(".selected").style("fill", "blue");
            vis.bars_month.filter(":not(.selected)").style("fill", "#69b3a2");
        }

        const brushend = (event) => {
            if (!event.selection) return;
            vis.data = vis.selectedData
            vis.updateVis(vis.selectedData);
            vis.updateVisEncounter(vis.selectedData);
            vis.updateVisTimeDay(vis.selectedData);
            vis.updateVisUFO(vis.selectedData);
        }

        // Append brush
        vis.brush_month = d3.brushX()
        .extent([[0, 0], [vis.width_month, vis.height_month]])
        .on("start brush", brushed)
        .on("end", brushend);

        vis.svg_month.append("g")
        .attr("class", "brush")
        .call(vis.brush_month);

        // Update yScale domain based on data
        vis.yScale_month.domain([0, d3.max(vis.bins_month, d => d.length)]);
        // Draw bars
        vis.bars_month = vis.svg_month.selectAll(".bar")
        .data(vis.bins_month)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => vis.xScale_month(d.x0))
        .attr("y", d => vis.yScale_month(d.length))
        .attr("width", d => vis.xScale_month(d.x1) - vis.xScale_month(d.x0) - 1)
        .attr("height", d => vis.height_month - vis.yScale_month(d.length))
        .style("fill", "#69b3a2");

    }

    updateVis(data) {
        let vis = this;

        vis.bins_month = vis.histogram_month(data)

        var min = d3.min(data, d => {
            if (typeof d.date_time != "number") {
                return d.date_time.split(" ")[0].split("/")[0]}
            })
        var max = (d3.max(data, d => {
            if (typeof d.date_time != "number") {
                return Number(d.date_time.split(" ")[0].split("/")[0])}
            }))

        vis.xScale_month.domain([min, max + 1])

        // Update yScale domain based on data
        vis.yScale_month.domain([0, d3.max(vis.bins_month, d => d.length)]);

        // Update the x-axis
        vis.svg_month.select(".x-axis")
        .call(vis.xAxis_month);

        // Update the y-axis
        vis.svg_month.select(".y-axis")
        .call(vis.yAxis_month);

        // Update the existing bars
        vis.svg_month.selectAll(".bar")
        .data(vis.bins_month)
        .attr("x", d => vis.xScale_month(d.x0))
        .attr("y", d => vis.yScale_month(d.length))
        .attr("width", d => vis.xScale_month(d.x1) - vis.xScale_month(d.x0))
        .attr("height", d => vis.height_month - vis.yScale_month(d.length));
        
    }

    initVisUFO() {
        let vis = this;

        vis.width_ufo = vis.config_ufo.containerWidth - vis.config_ufo.margin.left - vis.config_ufo.margin.right;
        vis.height_ufo = vis.config_ufo.containerHeight - vis.config_ufo.margin.top - vis.config_ufo.margin.bottom;

        // Create SVG
        vis.svg_ufo = d3.select(vis.config_ufo.parentElement)
            .append('svg')
            .attr('width', vis.config_ufo.containerWidth)
            .attr('height', vis.config_ufo.containerHeight)
            .append('g')
            .attr('transform', `translate(${vis.config_ufo.margin.left},${vis.config_ufo.margin.top})`);

        // Calculate frequency of each ufo_shape
        vis.ufoShapeCounts = d3.rollup(vis.data, v => v.length, d => d.ufo_shape);

        // Convert the rollup map to an array of objects
        vis.ufoShapes = Array.from(vis.ufoShapeCounts, ([ufo_shape, Value]) => ({ ufo_shape, Value }));

        // X axis
        vis.xScale_ufo = d3.scaleBand()
            .range([0, vis.width_ufo])
            .domain(vis.ufoShapes.map(d => d.ufo_shape))
            .padding(0.2);

        // Add Y axis
        vis.yScale_ufo = d3.scaleLinear()
            .domain([0, d3.max(vis.ufoShapes, d => d.Value)]) // Adjust domain based on the maximum frequency
            .range([vis.height_ufo, 0]);

        // Initialize axes
        vis.xAxis_ufo = d3.axisBottom(vis.xScale_ufo)

        vis.yAxis_ufo = d3.axisLeft(vis.yScale_ufo)

        // Update the domain of y scale with new data
        vis.yScale_ufo.domain([0, d3.max(vis.ufoShapes, d => d.Value)]);

        vis.svg_ufo.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height_ufo})`) // Corrected translation
            .call(vis.xAxis_ufo);

        // Append Y axis
        vis.svg_ufo.append("g")
            .attr("class", "y-axis")
            .call(vis.yAxis_ufo);

        // Append both axis titles
        vis.svg_ufo.append('text')
            .attr('y', vis.height_ufo + 25)
            .attr('x', vis.width_ufo)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text("Shape");

        vis.svg_ufo.append('text')
            .attr('x', -80)
            .attr('y', -5)
            .attr('dy', '.71em')
            .text("Frequency");

        vis.svg_ufo.append('text')
            .attr('x', vis.width_ufo / 5)
            .attr('y', -40)
            .attr('font-size', "px")
            .attr('dy', '.71em')
            .text(`UFO Shape Histogram`);

        // Convert ufoShapes to histogram bins
        vis.histogramData = vis.ufoShapes.map(d => ({
            ufo_shape: d.ufo_shape,
            frequency: d.Value
        }));

        const brushed = (event) => {
            if (!event.selection) return;
            var [x0, x1] = event.selection;
            
            // Filter bars within the brushed area
            const selectedBars = vis.histogramData.filter(d => {
                const barX = vis.xScale_ufo(d.ufo_shape);
                return barX >= x0 && barX <= x1;
            });

            vis.svg_ufo.selectAll(".bar").classed("selected", d => selectedBars.includes(d));
            vis.svg_ufo.selectAll(".bar").filter(".selected").style("fill", "blue");
            vis.svg_ufo.selectAll(".bar").filter(":not(.selected)").style("fill", "#69b3a2");

            // Filter data points within the brushed area
            vis.selectedData = vis.data.filter(d => {
                const barX = vis.xScale_ufo(d.ufo_shape);
                return barX >= x0 && barX <= x1;
            });
        }

        const brushend = (event) => {
            if (!event.selection) return;
            vis.data = vis.selectedData
            vis.updateVis(vis.selectedData);
            vis.updateVisEncounter(vis.selectedData);
            vis.updateVisTimeDay(vis.selectedData);
            vis.updateVisUFO(vis.selectedData);
        }

        // Append brush
        vis.brush_ufo = d3.brushX()
        .extent([[0, 0], [vis.width_ufo, vis.height_ufo]])
        .on("start brush", brushed)
        .on("end", brushend);

        vis.svg_ufo.append("g")
        .attr("class", "brush")
        .call(vis.brush_ufo);

        // Draw histogram bars
        vis.svg_ufo.selectAll(".bar")
            .data(vis.histogramData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.xScale_ufo(d.ufo_shape))
            .attr("y", d => vis.yScale_ufo(d.frequency))
            .attr("width", vis.xScale_ufo.bandwidth())
            .attr("height", d => vis.height_ufo - vis.yScale_ufo(d.frequency))
            .style("fill", "#69b3a2");
    }

    updateVisUFO(data) {
        let vis = this;

        var min = d3.min(data, d => d.encounter_length)
        var max = Math.min(d3.max(data, d => d.encounter_length), 10800)
        
        vis.xScale_enc.domain([min, max])

        // Calculate frequency of each ufo_shape
        vis.ufoShapeCounts = d3.rollup(data, v => v.length, d => d.ufo_shape);

        // Convert the rollup map to an array of objects
        vis.ufoShapes = Array.from(vis.ufoShapeCounts, ([ufo_shape, Value]) => ({ ufo_shape, Value }));

        // Update the domain of y scale with new data
        vis.yScale_ufo.domain([0, d3.max(vis.ufoShapes, d => d.Value)]);

        // Update the domain of x scale with new data
        vis.xScale_ufo.domain(vis.ufoShapes.map(d => d.ufo_shape));

        // Update the x-axis
        vis.svg_ufo.select(".x-axis")
            .call(vis.xAxis_ufo);

        // Update the y-axis
        vis.svg_ufo.select(".y-axis")
            .call(vis.yAxis_ufo);

        // Convert ufoShapes to histogram bins
        vis.histogramData = vis.ufoShapes.map(d => ({
            ufo_shape: d.ufo_shape,
            frequency: d.Value
        }));

        // Update existing bars
        vis.bars_ufo = vis.svg_ufo.selectAll(".bar")
            .data(vis.histogramData);

        // Enter new bars
        vis.bars_ufo.enter().append("rect")
            .attr("class", "bar")
            .merge(vis.bars_ufo)
            .attr("x", d => vis.xScale_ufo(d.ufo_shape))
            .attr("width", vis.xScale_ufo.bandwidth())
            .attr("y", d => vis.yScale_ufo(d.frequency))
            .attr("height", d => vis.height_ufo - vis.yScale_ufo(d.frequency))
            .style("fill", "#69b3a2");

        // Remove bars that are not needed
        vis.bars_ufo.exit().remove();
    }

    initVisEncounter() {

        let vis = this;
        // set the dimensions and margins of the graph
        vis.width_enc = vis.config_encounter.containerWidth - vis.config_encounter.margin.left - vis.config_encounter.margin.right;
        vis.height_enc = vis.config_encounter.containerHeight - vis.config_encounter.margin.top - vis.config_encounter.margin.bottom;

        // Create SVG
        vis.svg_enc = d3.select(vis.config_encounter.parentElement)
        .append('svg')
        .attr('width', vis.config_encounter.containerWidth)
        .attr('height', vis.config_encounter.containerHeight)
        .append('g')
        .attr('transform', `translate(${vis.config_encounter.margin.left},${vis.config_encounter.margin.top})`);

        // Define scales
        vis.xScale_enc = d3.scaleLinear()
        .range([0, vis.width_enc])
        .domain([0, 10800]);

        // Y axis scale
        vis.yScale_enc = d3.scaleLinear().range([vis.height_enc, 0]);

        // Initialize axes
        vis.xAxis_enc = d3.axisBottom(vis.xScale_enc)

        vis.yAxis_enc = d3.axisLeft(vis.yScale_enc)

        // Create histogram layout
        vis.histogram_enc = d3.histogram()
        .value(d => d.encounter_length)
        .domain(vis.xScale_enc.domain())
        .thresholds(vis.xScale_enc.ticks(40));

        // Generate bins
        vis.bins_enc = vis.histogram_enc(vis.data);

        // Update yScale domain based on data
        vis.yScale_enc.domain([0, d3.max(vis.bins_enc, d => d.length)]);

        // Append X axis
        vis.svg_enc.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${vis.height_enc})`)
        .call(vis.xAxis_enc);

        // Append Y axis
        vis.svg_enc.append("g")
        .attr("class", "y-axis")
        .call(vis.yAxis_enc);

        // Append both axis titles
        vis.svg_enc.append('text')
            .attr('y', vis.height_enc + 25)
            .attr('x', vis.width_enc)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text("Seconds");

        vis.svg_enc.append('text')
            .attr('x', -80)
            .attr('y', -5)
            .attr('dy', '.71em')
            .text("Frequency");

        vis.svg_enc.append('text')
            .attr('x', vis.width_enc/5)
            .attr('y', -40)
            .attr('font-size', "px")
            .attr('dy', '.71em')
            .text(`Encounter Length Histogram`);

        // Update yScale domain based on data
        vis.yScale_enc.domain([0, d3.max(vis.bins_enc, d => d.length)]);
        // Draw bars
        vis.bars_enc = vis.svg_enc.selectAll(".bar")
        .data(vis.bins_enc)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => vis.xScale_enc(d.x0))
        .attr("y", d => vis.yScale_enc(d.length))
        .attr("width", d => vis.xScale_enc(d.x1) - vis.xScale_enc(d.x0) - 1)
        .attr("height", d => vis.height_enc - vis.yScale_enc(d.length))
        .style("fill", "#69b3a2");

        const brushed = (event) => {
            if (!event.selection) return;
            var [x0, x1] = event.selection;
            const selectedBars = vis.bins_enc.filter(d => x0 - 10 <= vis.xScale_enc(d.x0) && x1 >= vis.xScale_enc(d.x1));
            vis.selectedData = selectedBars.flatMap(bin => bin.map(d => d));
            vis.bars_enc.classed("selected", d => x0 <= vis.xScale_enc(d.x0) && x1 >= vis.xScale_enc(d.x1));
            vis.bars_enc.filter(".selected").style("fill", "blue");
            vis.bars_enc.filter(":not(.selected)").style("fill", "#69b3a2");
        }

        const brushend = (event) => {
            if (!event.selection) return;
            vis.data = vis.selectedData
            vis.updateVis(vis.selectedData);
            vis.updateVisEncounter(vis.selectedData);
            vis.updateVisTimeDay(vis.selectedData);
            vis.updateVisUFO(vis.selectedData);
        }

        // Append brush
        vis.brush_enc = d3.brushX()
        .extent([[0, 0], [vis.width_enc, vis.height_enc]])
        .on("start brush", brushed)
        .on("end", brushend);

        vis.svg_enc.append("g")
        .attr("class", "brush")
        .call(vis.brush_enc);

    }

    updateVisEncounter(data) {
        let vis = this;

        console.log(data)
        vis.bins_enc = vis.histogram_enc(data)


        // Update yScale domain based on data
        vis.yScale_enc.domain([0, d3.max(vis.bins_enc, d => d.length)]);

        // Update the x-axis
        vis.svg_enc.select(".x-axis")
        .call(vis.xAxis_enc);

        // Update the y-axis
        vis.svg_enc.select(".y-axis")
        .call(vis.yAxis_enc);

        // Update the existing bars
        vis.svg_enc.selectAll(".bar")
        .data(vis.bins_enc)
        .attr("x", d => vis.xScale_enc(d.x0))
        .attr("y", d => vis.yScale_enc(d.length))
        .attr("width", d => vis.xScale_enc(d.x1) - vis.xScale_enc(d.x0))
        .attr("height", d => vis.height_enc - vis.yScale_enc(d.length));
        
    }

    initVisTimeDay() {

        let vis = this;
        // set the dimensions and margins of the graph
        vis.width_time = vis.config_time.containerWidth - vis.config_time.margin.left - vis.config_time.margin.right;
        vis.height_time = vis.config_time.containerHeight - vis.config_time.margin.top - vis.config_time.margin.bottom;

        // Create SVG
        vis.svg_time = d3.select(vis.config_time.parentElement)
        .append('svg')
        .attr('width', vis.config_time.containerWidth)
        .attr('height', vis.config_time.containerHeight)
        .append('g')
        .attr('transform', `translate(${vis.config_time.margin.left},${vis.config_time.margin.top})`);

        // Define scales
        vis.xScale_time = d3.scaleLinear()
        .range([0, vis.width_time])
        .domain([0, 24]);

        // Y axis scale
        vis.yScale_time = d3.scaleLinear().range([vis.height_time, 0]);

        // Initialize axes
        vis.xAxis_time = d3.axisBottom(vis.xScale_time)

        vis.yAxis_time = d3.axisLeft(vis.yScale_time)

        // Create histogram layout
        vis.histogram_time = d3.histogram()
        .value(d => {
            if (typeof d.date_time != "number") {
                return d.date_time.split(" ")[1].split(":")[0]}
            })
        .domain(vis.xScale_time.domain())
        .thresholds(vis.xScale_time.ticks(24));

        // Generate bins
        vis.bins_time = vis.histogram_time(vis.data);

        // Update yScale domain based on data
        vis.yScale_time.domain([0, d3.max(vis.bins_time, d => d.length)]);

        // Append X axis
        vis.svg_time.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${vis.height_time})`)
        .call(vis.xAxis_time);

        // Append Y axis
        vis.svg_time.append("g")
        .attr("class", "y-axis")
        .call(vis.yAxis_time);

        // Append both axis titles
        vis.svg_time.append('text')
            .attr('y', vis.height_time + 25)
            .attr('x', vis.width_time)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text("Hour of day");

        vis.svg_time.append('text')
            .attr('x', -80)
            .attr('y', -5)
            .attr('dy', '.71em')
            .text("Frequency");

        vis.svg_time.append('text')
            .attr('x', vis.width_time/5)
            .attr('y', -40)
            .attr('font-size', "px")
            .attr('dy', '.71em')
            .text(`Hour Histogram`);

        // Update yScale domain based on data
        vis.yScale_time.domain([0, d3.max(vis.bins_time, d => d.length)]);
        // Draw bars
        vis.bars_time = vis.svg_time.selectAll(".bar")
        .data(vis.bins_time)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => vis.xScale_time(d.x0))
        .attr("y", d => vis.yScale_time(d.length))
        .attr("width", d => vis.xScale_time(d.x1) - vis.xScale_time(d.x0) - 1)
        .attr("height", d => vis.height_time - vis.yScale_time(d.length))
        .style("fill", "#69b3a2");

        const brushed = (event) => {
            if (!event.selection) return;
            var [x0, x1] = event.selection;
            const selectedBars = vis.bins_time.filter(d => x0 <= vis.xScale_time(d.x0) && x1 >= vis.xScale_time(d.x1));
            vis.selectedData = selectedBars.flatMap(bin => bin.map(d => d));
            vis.bars_time.classed("selected", d => x0 <= vis.xScale_time(d.x0) && x1 >= vis.xScale_time(d.x1));
            vis.bars_time.filter(".selected").style("fill", "blue");
            vis.bars_time.filter(":not(.selected)").style("fill", "#69b3a2");
        }

        const brushend = (event) => {
            if (!event.selection) return;

            vis.updateVis(vis.selectedData);
            vis.updateVisEncounter(vis.selectedData);
            vis.updateVisTimeDay(vis.selectedData);
            vis.updateVisUFO(vis.selectedData);
        }

        // Append brush
        vis.brush_time = d3.brushX()
        .extent([[0, 0], [vis.width_time, vis.height_time]])
        .on("start brush", brushed)
        .on("end", brushend);

        vis.svg_time.append("g")
        .attr("class", "brush")
        .call(vis.brush_time);

    }

    updateVisTimeDay(data) {
        let vis = this;
        console.log(data)

        const hourValues = data.map(d => {
            if (typeof d.date_time != "number") {
                return parseInt(d.date_time.split(" ")[1].split(":")[0]);
            }
            return null;
        }).filter(d => d !== null);

        // Calculate the minimum and maximum hour values
        const minHour = d3.min(hourValues);
        let maxHour = d3.max(hourValues);

        // Update xScale domain based on the min and max hour values
        vis.xScale_time.domain([minHour, maxHour + 1]);
        vis.bins_time = vis.histogram_time(data)

        // Update yScale domain based on data
        vis.yScale_time.domain([0, d3.max(vis.bins_time, d => d.length)]);

        // Update the x-axis
        vis.svg_time.select(".x-axis")
        .call(vis.xAxis_time);

        // Update the y-axis
        vis.svg_time.select(".y-axis")
        .call(vis.yAxis_time);

        // Update the existing bars
        vis.svg_time.selectAll(".bar")
        .data(vis.bins_time)
        .attr("x", d => vis.xScale_time(d.x0))
        .attr("y", d => vis.yScale_time(d.length))
        .attr("width", d => vis.xScale_time(d.x1) - vis.xScale_time(d.x0))
        .attr("height", d => vis.height_time - vis.yScale_time(d.length));
        
    }


}