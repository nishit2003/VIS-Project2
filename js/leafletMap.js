class LeafletMap {
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

        // various leaflet map bases
        this.ESRI_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';    // ESRI
        this.ESRI_ATTR = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        this.TOPO_URL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';     // TOPO
        this.TOPO_ATTR = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
        this.THOUT_URL = 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}';     // Thunderforest Outdoors- requires key, so maybe don't use?
        this.THOUT_ATTR = '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        this.ST_URL = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';     // Stamen
        this.ST_ATTR = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }

    // Class Methods
    initVis() {
        let vis = this;     // saves reference to the class to a locally-scoped variable

        // experimenting with the topographic map:
        vis.base_layer = L.tileLayer(vis.TOPO_URL, {
            id: 'thout-image',
            attribution: vis.TOPO_ATTR,
            ext: 'png'
        });
    
        vis.theMap = L.map('map', {
            center: [30, 0],
            zoom: 2,
            layers: [vis.base_layer]
        });

        // initialize svg for d3 to add to map
        L.svg({clickable:true}).addTo(vis.theMap)   // we have to make the svg layer clickable
        vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
        vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")

        // these are the city locations, displayed as a set of dots 
        vis.Dots = vis.svg.selectAll('circle')
            //.data(vis.data)
            .data(DataStore.filteredData)
            .join('circle')
            .attr("fill", "steelblue")
            .attr("stroke", "black")
            // Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
            // leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
            // Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
            .attr("cx", d => {
                if ((d.longitude == "NA") || (d.latitude == "NA")) { /* If longitude/latitude is 'NA' then we do nothing */ }
                else { return vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x }
            })
            .attr("cy", d => {
                if ((d.longitude == "NA") || (d.latitude == "NA")) { /* If longitude/latitude is 'NA' then we do nothing */ }
                else { return vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y }
            })
            //.attr("cx", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x)
            //.attr("cy", d => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y)
            .attr("r", 3)
            .on('mouseover', function(event, d) {
                d3.select(this).transition()    // D3 selects the object we have moused over in order to perform operations on it
                    .duration('150')    // how long we are transitioning between the two states
                    .attr("fill", "red")    // change the fill
                    .attr("r", 4);  // change radius
                
                // create a tool tip
                d3.select("#tooltip")
                    .style('opacity', 1)
                    .style('z-index', 1000000)
                    .html(
                        `<div class="tooltip-label">
                            <h3 class="tooltip-title">${d.city_area.charAt(0).toUpperCase()}${d.city_area.slice(1)}</h3>
                            <ul>
                                <li>Date Documented: ${d.date_documented}</li>
                            </ul>
                        </div>`
                    );
            })
            .on('mousemove', (event) => {
                //position the tooltip
                d3.select('#tooltip')
                    .style('left', (event.pageX + 10) + 'px')   
                    .style('top', (event.pageY + 10) + 'px');
            })
            .on('mouseleave', function() {  // function to add mouseover event
                d3.select(this).transition()    // D3 selects the object we have moused over in order to perform operations on it
                    .duration('150')  // how long we are transitioning between the two states
                    .attr("fill", "steelblue")    // change the fill
                    .attr('r', 3)     // change radius
                d3.select('#tooltip').style('opacity', 0);  // turn off the tooltip
            });

        // handler here for updating the map, as you zoom in and out           
        vis.theMap.on("zoomend", function() {
            vis.updateVis();
        });
    }

    updateVis() {
        let vis = this;     // saves reference to the class to a locally-scoped variable
        
        // want to control the size of the radius to be a certain number of meters? 
        vis.radiusSize = 3; 
    
        // Redraw based on new zoom - need to recalculate on-screen position
        vis.Dots = vis.svg.selectAll('circle')
            .data(DataStore.filteredData); // Use filtered data here
            
        // Update existing dots
        vis.Dots
            .attr("cx", d => {
                if ((d.longitude == "NA") || (d.latitude == "NA")) { /* If longitude/latitude is 'NA' then we do nothing */ }
                else { return vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x }
            })
            .attr("cy", d => {
                if ((d.longitude == "NA") || (d.latitude == "NA")) { /* If longitude/latitude is 'NA' then we do nothing */ }
                else { return vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y }
            })
            .attr("r", vis.radiusSize);
    
        // Enter new dots
        vis.Dots.enter()
            .append('circle')
            .attr("fill", "steelblue")
            .attr("stroke", "black")
            .attr("cx", d => {
                if ((d.longitude == "NA") || (d.latitude == "NA")) { /* If longitude/latitude is 'NA' then we do nothing */ }
                else { return vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x }
            })
            .attr("cy", d => {
                if ((d.longitude == "NA") || (d.latitude == "NA")) { /* If longitude/latitude is 'NA' then we do nothing */ }
                else { return vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y }
            })
            .attr("r", vis.radiusSize);
    
        // Remove dots not in filtered data
        vis.Dots.exit().remove();
    }

    renderVis() {
        let vis = this;

        // not using right now...
    }

    // TOOD: Add class methods as necessary
}