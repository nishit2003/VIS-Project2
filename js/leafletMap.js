class LeafletMap {
    // Class Constants & Attributes
    // TODO: Add if necessary

    // Constructor
    /**
     * Class constructor with basic configuration.
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _filter) {
        this.config = { parentElement: _config.parentElement, };
        this.data = _data;
        this.filter = _filter;
        this.map = "topo";

        // various leaflet map bases
        this.ESRI_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';    // ESRI
        this.ESRI_ATTR = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        this.TOPO_URL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';     // TOPO
        this.TOPO_ATTR = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
        this.THOUT_URL = 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}';     // Thunderforest Outdoors- requires key, so maybe don't use?
        this.THOUT_ATTR = '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        this.ST_URL = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';     // Stamen
        this.ST_ATTR = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

        DataStore.currMapBckgrnd = [ this.TOPO, this.TOPO_ATTR ];   // by default, we use the TOPO leaflet map background
        this.MAPNIK_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        this.MAPNIK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        this.initVis()
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

        // handler here for updating the map, as you zoom in and out           
        vis.theMap.on("zoomend", function() {
            vis.updateVis();
        });
    }

    updateVis() {
        let vis = this;
        //want to control the size of the radius to be a certain number of meters? 
        vis.radiusSize = 3;
        // these are the city locations, displayed as a set of dots 
        vis.Dots = vis.svg.selectAll('circle')
            //.data(vis.data)
            .data(vis.data)
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
                    .attr("r", 4);  // change radius
                
                // create a tool tip
                d3.select("#tooltip")
                    .style('opacity', 1)
                    .style('z-index', 1000000)
                    .html(
                        `<div class="tooltip-label">
                            <h3 class="tooltip-title">${d.city_area.charAt(0).toUpperCase()}${d.city_area.slice(1)}</h3>
                            <ul>
                                <li>Date and Time of Occurance: ${d.date_time}</li>
                                <li>Shape of UFO: ${d.ufo_shape}</li>
                                <li>Description: ${d.description}</li>
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
                    .attr('r', 3)     // change radius
                d3.select('#tooltip').style('opacity', 0);  // turn off the tooltip
            });

        // handler here for updating the map, as you zoom in and out           
        vis.theMap.on("zoomend", function() {
            vis.updateVis();
        });

        // Enter new dots
        vis.Dots.enter()
            .data(vis.data)
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
        vis.getColorScale(vis.filter)
    }

    renderVis() {
        let vis = this;

        // not using right now...
    }

    getColorScale(filter) {
        let vis = this;
        if (filter == "year") {
            vis.colorScale = d3.scaleOrdinal()
                .range(["#585661", '#9151a8', '#85152f', '#b0522a', "#b09a2a",  "#186e26",  "#094263"])
                .domain(['1950','1960',"1970","1980","1990", "2000", "2010"]);
            vis.Dots.attr("fill", d => {
                if (typeof d.date_time != "number") {
                    var year = d.date_time.split(" ")[0].split("/")[2]
                    if (Number(year) <= 1959) {return vis.colorScale("1950")}
                    else if (Number(year) <= 1969) {return vis.colorScale("1960")}
                    else if (Number(year) <= 1979) {return vis.colorScale("1970")}
                    else if (Number(year) <= 1989) {return vis.colorScale("1980")}
                    else if (Number(year) <= 1999) {return vis.colorScale("1990")}
                    else if (Number(year) <= 2009) {return vis.colorScale("2000")}
                    else if (Number(year) <= 2019) {return vis.colorScale("2010")}
                }
                else {return vis.colorScale("2010")}
            })
        }
        else if (filter == "month") {
            vis.colorScale = d3.scaleOrdinal()
            .range(['#c41d1d', '#995f12', '#998c12', "#7a9912", "#3b9912", "#0f7d1c", "#0f7d41", "#0f7d63", "#0f787d", "#0e75a1", "#0f4187", "#0f2387"])
            .domain(['1','2', "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]);
            vis.Dots.attr("fill", d => {
                if (typeof d.date_time != "number") {
                    var month = d.date_time.split(" ")[0].split("/")[0]
                    if (Number(month) == 1) {return vis.colorScale("1")}
                    else if (Number(month) == 2) {return vis.colorScale("2")}
                    else if (Number(month) == 3) {return vis.colorScale("3")}
                    else if (Number(month) == 4) {return vis.colorScale("4")}
                    else if (Number(month) == 5) {return vis.colorScale("5")}
                    else if (Number(month) == 6) {return vis.colorScale("6")}
                    else if (Number(month) == 7) {return vis.colorScale("7")}
                    else if (Number(month) == 8) {return vis.colorScale("8")}
                    else if (Number(month) == 9) {return vis.colorScale("9")}
                    else if (Number(month) == 10) {return vis.colorScale("10")}
                    else if (Number(month) == 11) {return vis.colorScale("11")}
                    else if (Number(month) == 12) {return vis.colorScale("12")}
                }
                else {return vis.colorScale("1")}
            })
        }
        else if (filter == "ufo_shape") {
            vis.colorScale = d3.scaleOrdinal()
            .range(['#c41d1d', '#995f12', '#998c12', "#7a9912", "#3b9912", "#0f7d1c", "#0f7d41", "#0f7d63", "#0f787d", "#0e75a1",
                    "#0f4187", "#0f2387", "#321bb3", "#3f1170", "#9c3cc2", "#744975", "#c286b4", "#752b49", "#8f2845", "#ce9ab2"])
            .domain(['changing','chevron', "cigar", "circle", "cylinder", "diamond", "disk", "egg", "fireball", "flash", 
                    "formation", "light", "NA", "other", "oval", "rectangle", "sphere", "teardrop", "triangle", "unknown"]);
            vis.Dots.attr("fill", d => vis.colorScale(d.ufo_shape))
        }
        else if (filter == "time_day") {
            vis.colorScale = d3.scaleOrdinal()
            .range(["#19544e", '#0f780d', '#83b010', '#b04010'])
            .domain(['0:00','6:00', "12:00", "18:00"]);
            vis.Dots.attr("fill", d => {
                if (typeof d.date_time != "number") {
                    var hour = d.date_time.split(" ")[1].split(":")[1]
                    if (Number(hour) <= 5 || Number(hour) >= 22) {return vis.colorScale("0:00")}
                    else if (Number(hour) >= 6 && Number(hour) <= 10) {return vis.colorScale("6:00")}
                    else if (Number(hour) >= 11 && Number(hour) <= 17) {return vis.colorScale("12:00")}
                    else if (Number(hour) >= 18 && Number(hour) <= 21) {return vis.colorScale("18:00")}
                }
                else {return vis.colorScale("0:00")}
            })
        }
        else {vis.Dots.attr("fill", "steelblue")}
    }

    updateMap(map) {
        let vis = this;

        // Switch Maps
        if (map == "mapnik") {
            var url = vis.TOPO_URL;
            var attr = vis.TOPO_ATTR;
            vis.map = "topo";
        } else {
            var url = vis.MAPNIK_URL;
            var attr = vis.MAPNIK_ATTR;
            vis.map = "mapnik";
        }

        vis.base_layer = L.tileLayer(url, {
            id: 'thout-image',
            attribution: attr,
            ext: 'png'
        });

        vis.theMap.setView(vis.theMap.getCenter(), vis.theMap.getZoom()); // Set the new center and zoom level
        vis.theMap.eachLayer(function(layer) {
            vis.theMap.removeLayer(layer); // Remove existing layers
        });

        L.svg({clickable:true}).addTo(vis.theMap) 
        vis.base_layer.addTo(vis.theMap);
        vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
        vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")
        vis.updateVis(); // Update the data visualization
    }
}