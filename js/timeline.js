/* This class manages the brushable timeline found at the bottom, which offers the user a time-based filter/selection of data on the map. */
class Timeline {
    // Class Constants & Attributes
    // TODO: Add if necessary

    // Constructor
    /**
     * Class constructor with basic configuration.
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
        this.config = { parentElement: _config.parentElement, };
        this.data = _data;
    }

    // Class Methods
    initVis() {
        let vis = this;     // saves reference to the class to a locally-scoped variable

        // first, we need to parse the dates from the dataset into JavaScript Date() objects
        var parsedDates = vis.data.map(function(d) {
            return new Date(d.date_documented);
        });

        // then we'll set up margins and dimensions
        const margin = { top: 10, right: 50, bottom: 30, left: 50 };
        const width = 1600 - margin.left - margin.right;
        const height = 100 - margin.top - margin.bottom;

        // create/select the timeline SVG element
        const svg = d3.select("#timeline")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Set up x scale
        const xScale = d3.scaleTime()
            .domain(d3.extent(parsedDates))
            .range([0, width]);

        // Set up y scale (unused in this example)
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.data, d => d.value)])
            .range([height, 0]);

        // Create x-axis
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%Y"));   // Format ticks to display only years
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Create brush
        vis.brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("end", brushed);

        // Append brush to SVG
        vis.brushGroup = svg.append("g")
            .attr("class", "timeline-brush")
            .call(vis.brush);

        // Function to handle brushing
        function brushed(event) {
            if (!event.selection) return; // Ignore empty selections
            const [x0, x1] = event.selection.map(xScale.invert);    // x0 & x1 are Date() objects

            // Filter data based on selection
            //const filteredData = vis.data.filter(d => {
            DataStore.filteredData = vis.data.filter(d => {
                const date = new Date(d.date_documented);  // Convert d.date_documented to Date object
                return date >= x0 && date <= x1;
            });
            //console.log(filteredData);  // log filtered data to console for development purposes

            updateVisualizations(); // calls the 'updateVisualizations()' method in the main.js script, which'll then update ALL visualizations
        }
    }

    updateVis() {
        let vis = this;     // saves reference to the class to a locally-scoped variable

        // TODO: Implement as necessary. Is anything needed here?

    }
}