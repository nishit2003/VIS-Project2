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
                    .attr('r', 3)     // change radius
                d3.select('#tooltip').style('opacity', 0);  // turn off the tooltip
            });

        // handler here for updating the map, as you zoom in and out           
        vis.theMap.on("zoomend", function() {
            vis.updateVis();
        });
    }

    updateVis() {
        console.log("hi")
        let vis = this;
        vis.getColorScale(vis.filter)
        //want to control the size of the radius to be a certain number of meters? 
        vis.radiusSize = 3;

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
    }

    renderVis() {
        let vis = this;

        // not using right now...
    }

    getColorScale(filter) {

        if (filter == "year") {
            console.log("hi")
            this.colorScale = d3.scaleOrdinal()
                .range(["#585661", '#9151a8', '#85152f', '##b0522a', "#b09a2a",  "#186e26",  "#094263"])
                .domain(['1950','1960',"1970","1980","1990", "2000", "2010"]);
            this.Dots.attr("fill", d => {
                if (typeof d.date_time != "number") {
                    var year = d.date_time.split(" ")[0].split("/")[2]
                    if (Number(year) <= 1959) {return this.colorScale("1950")}
                    else if (Number(year) <= 1969) {return this.colorScale("1960")}
                    else if (Number(year) <= 1979) {return this.colorScale("1970")}
                    else if (Number(year) <= 1989) {return this.colorScale("1980")}
                    else if (Number(year) <= 1999) {return this.colorScale("1990")}
                    else if (Number(year) <= 2009) {return this.colorScale("2000")}
                    else if (Number(year) <= 2019) {return this.colorScale("2010")}
                }
                else {return this.colorScale("2010")}
            })
        }
        else if (filter == "month") {
            this.colorScale = d3.scaleOrdinal()
            .range(['#c41d1d', '#995f12', '#998c12', "#7a9912", "#3b9912", "#0f7d1c", "#0f7d41", "#0f7d63", "#0f787d", "#0e75a1", "#0f4187", "#0f2387"])
            .domain(['1','2', "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]);
            this.Dots.attr("fill", d => {
                if (typeof d.date_time != "number") {
                    var month = d.date_time.split(" ")[0].split("/")[0]
                    if (Number(month) == 1) {return this.colorScale("1")}
                    else if (Number(month) == 2) {return this.colorScale("2")}
                    else if (Number(month) == 3) {return this.colorScale("3")}
                    else if (Number(month) == 4) {return this.colorScale("4")}
                    else if (Number(month) == 5) {return this.colorScale("5")}
                    else if (Number(month) == 6) {return this.colorScale("6")}
                    else if (Number(month) == 7) {return this.colorScale("7")}
                    else if (Number(month) == 8) {return this.colorScale("8")}
                    else if (Number(month) == 9) {return this.colorScale("9")}
                    else if (Number(month) == 10) {return this.colorScale("10")}
                    else if (Number(month) == 11) {return this.colorScale("11")}
                    else if (Number(month) == 12) {return this.colorScale("12")}
                }
                else {return this.colorScale("1")}
            })
        }
        else if (filter == "ufo_shape") {
            this.colorScale = d3.scaleOrdinal()
            .range(['#c41d1d', '#995f12', '#998c12', "#7a9912", "#3b9912", "#0f7d1c", "#0f7d41", "#0f7d63", "#0f787d", "#0e75a1",
                    "#0f4187", "#0f2387", "#321bb3", "#3f1170", "#9c3cc2", "#744975", "#c286b4", "#752b49", "#8f2845", "#8f2845"])
            .domain(['changing','chevron', "cigar", "circle", "cylinder", "diamond", "disk", "egg", "fireball", "flash", 
                    "formation", "light", "NA", "other", "oval", "rectangle", "sphere", "teardrop", "triangle", "unknown"]);
            this.Dots.attr("fill", d => this.colorScale(d.ufo_shape))
        }
        else if (filter == "time_day") {
            this.colorScale = d3.scaleOrdinal()
            .range(["#19544e", '#0f780d', '#83b010', '#b04010'])
            .domain(['0:00','6:00', "12:00", "18:00"]);
            this.Dots.attr("fill", d => {
                if (typeof d.date_time != "number") {
                    var hour = d.date_time.split(" ")[1].split(":")[1]
                    if (Number(hour) <= 5 || Number(hour) >= 22) {return this.colorScale("0:00")}
                    else if (Number(hour) >= 6 && Number(hour) <= 10) {return this.colorScale("6:00")}
                    else if (Number(hour) >= 11 && Number(hour) <= 17) {return this.colorScale("12:00")}
                    else if (Number(hour) >= 18 && Number(hour) <= 21) {return this.colorScale("18:00")}
                }
                else {return this.colorScale("0:00")}
            })
        }
        else {this.Dots.attr("fill", "blue")}
    }
    // TOOD: Add class methods as necessary
}