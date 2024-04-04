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
            // Split the string into date and time components
            const [dateString, timeString] = d.date_time.split(' ');

            // Convert the date/time string into a format recognized by the Date constructor
            const formattedDateTimeString = `${dateString} ${timeString}`;

            // Create a new Date object using the formatted date/time string
            return new Date(formattedDateTimeString);
        });

        // save the min & max dates parsed
        let minDate = d3.min(parsedDates);
        let maxDate = d3.max(parsedDates);

        // then we'll set up margins and dimensions
        const margin = { top: 10, right: 50, bottom: 30, left: 50 };
        const width = 1000 - margin.left - margin.right;
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

        // Tooltip
        vis.brushGroup.on('mouseover', function(event, d) {
            d3.select(this).transition()    // D3 selects the object we have moused over in order to perform operations on it
                .duration('150')    // how long we are transitioning between the two states
                .attr("r", 4);  // change radius
            
            // create a tool tip
            d3.select("#timeline-tooltip")
                .style('opacity', 1)
                .style('z-index', 1000000)
                .html(
                    `<div class="tooltip-label">
                        <ul>
                            <li>${minDate.getFullYear()} - ${maxDate.getFullYear()}</li>
                        </ul>
                    </div>`
                );
        })
        .on('mousemove', (event) => {
            //position the tooltip
            d3.select('#timeline-tooltip')
                .style('left', (event.pageX + 10) + 'px')   
                .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseleave', function() {  // function to add mouseover event
            d3.select(this).transition()    // D3 selects the object we have moused over in order to perform operations on it
                .duration('150')  // how long we are transitioning between the two states
                .attr('r', 3)     // change radius
            d3.select('#timeline-tooltip').style('opacity', 0);  // turn off the tooltip
        });

        // Function to handle brushing
        function brushed(event) {
            if (!event.selection) return; // Ignore empty selections
            const [x0, x1] = event.selection.map(xScale.invert);    // x0 & x1 are Date() objects

            // Filter data based on selection
            DataStore.filteredData = vis.data.filter(d => {
                const date = new Date(d.date_time);  // Convert d.date_documented to Date object
                minDate = x0;   // updates min date
                maxDate = x1;   // updates max date
                return date >= x0 && date <= x1;
            });

            updateVisualizations(); // calls the 'updateVisualizations()' method in the main.js script, which'll then update ALL visualizations
        }
    }

    updateVis() {
        let vis = this;     // saves reference to the class to a locally-scoped variable

        // TODO: Implement as necessary. Is anything needed here?

    }
}