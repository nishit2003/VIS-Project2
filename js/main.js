/* This script will act as the main "runner" of the entire application. */
// some script-level (global) variables
let leafletMap, timeline, barGraphVisuals, graph;
//let btnSubmitFilters = document.getElementById("#btnSubmitFilters"); // the submit button for changing active on the map
//let btnResetTimeline = document.getElementById("#btnResetTimeline"); // the submit button for resetting the timeline selection

// Because we've moved the CSV data parsing into a separate module, we need to ensure the rest of the program waits for CSV parsing to complete.
//  If you look at the in-class examples, most of the visualization creation is done INSIDE of the "d3.csv()" tag, so the synchronization is encapsulated.
//  Since we've split it out, we need to ensure the main runner waits for the parsing to complete. That is why I've launched the application in this way.
async function main() {
    await CsvDataParser.parseUfoData(); 

    // next we create the brushable timeline
    timeline = new Timeline({parentElement: '#timeline'}, DataStore.rawData);
    timeline.initVis();

    // next we can generate the leaflet map
    leafletMap = new LeafletMap({ parentElement: '#map'}, DataStore.filteredData, "", "topo");
    leafletMap.updateVis();

    // next we can generate the leaflet map
    barGraphs = new BarGraphVisuals({ parentElement: '#month-graph'}, { parentElement: '#ufo-shape-graph'}, { parentElement: '#encounter-graph'}, { parentElement: '#time-graph'}, DataStore.filteredData);

    document.getElementById("btnResetGraphs").addEventListener("click", function() {
        barGraphs.updateVis(DataStore.filteredData)
        barGraphs.updateVisUFO(DataStore.filteredData)
        barGraphs.updateVisEncounter(DataStore.filteredData)
        barGraphs.updateVisTimeDay(DataStore.filteredData)
    })

    // Submit button to apply filters
    document.getElementById("btnSubmitFilters").addEventListener("click", function() {
        // Change colors of dots
        var filter = document.getElementById("filter").value;
        leafletMap.data = DataStore.filteredData
        leafletMap.filter = filter;
        leafletMap.updateVis();

        // Updates Legends to the current filter
        var legends = document.getElementsByClassName("legend-btn");
        for(var i = 0; i < legends.length; i++) {
            if (legends[i].classList.contains(leafletMap.filter)) {
                legends[i].setAttribute("style", "");
            }
            else {
                legends[i].setAttribute("style", "display: none");
        }}});


    // Toggle Map code
    document.getElementById("toggleBtn").addEventListener("click", function() {
        leafletMap.updateMap(leafletMap.map)
    })


    // Code for Legends
    // TODO Possibly add it where you can use multiple filters, ex. Filter summer sightings in the 1950s.
    d3.selectAll(".legend-btn").on("click", function () {
      // Toggle 'inactive' class
      d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
      // Check which categories are active
      let selectedStatus = [];
      d3.selectAll('.legend-btn:not(.inactive)').each(function() {
        selectedStatus.push(d3.select(this).attr('ufo_shape'));
        selectedStatus.push(d3.select(this).attr('month'));
        selectedStatus.push(d3.select(this).attr('year'));
        selectedStatus.push(d3.select(this).attr('time_day'));
        if (leafletMap.filter == 'ufo_shape') {
            leafletMap.data = DataStore.filteredData.filter(d => selectedStatus.includes(d.ufo_shape));
        }
        else if (leafletMap.filter == 'year') {
            leafletMap.data = DataStore.filteredData.filter(d => 
                {if (typeof d.date_time != "number") {
                    var year = d.date_time.split(" ")[0].split("/")[2]
                    if (Number(year) <= 9 && Number(year) >= 0 && selectedStatus.includes("2000")) {return true}
                    else if (Number(year) <= 19 && Number(year) >= 10 && selectedStatus.includes("2010")) {return true}
                    else if (Number(year) <= 59 && Number(year) >= 50 && selectedStatus.includes("1950")) {return true}
                    else if (Number(year) <= 69 && Number(year) >= 60 && selectedStatus.includes("1960")) {return true}
                    else if (Number(year) <= 79 && Number(year) >= 70 && selectedStatus.includes("1970")) {return true}
                    else if (Number(year) <= 89 && Number(year) >= 80 && selectedStatus.includes("1980")) {return true}
                    else if (Number(year) <= 99 && Number(year) >= 90 && selectedStatus.includes("1990")) {return true}
                    else {return false}
                }

            });
        }
        else if (leafletMap.filter == 'month') {
            leafletMap.data = DataStore.filteredData.filter(d => {
                if (d.date_time.length > 6) {
                    var month = d.date_time.split(" ")[0].split("/")[0]
                    if (Number(month) == 1 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 2 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 3 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 4 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 5 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 6 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 7 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 8 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 9 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 10 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 11 && selectedStatus.includes(month)) {return true}
                    else if (Number(month) == 12 && selectedStatus.includes(month)) {return true}
                }
            });
        }
        else if (leafletMap.filter == 'time_day') {
            leafletMap.data = DataStore.filteredData.filter(d => {
                if (typeof d.date_time != "number") {
                    var hour = d.date_time.split(" ")[1].split(":")[0]
                    if ((Number(hour) <= 5 || Number(hour) >= 22) && selectedStatus.includes("0:00")) {return true}
                    else if ((Number(hour) >= 6 && Number(hour) <= 10) && selectedStatus.includes("6:00")) {return true}
                    else if ((Number(hour) >= 11 && Number(hour) <= 17) && selectedStatus.includes("12:00")) {return true}
                    else if ((Number(hour) >= 18 && Number(hour) <= 21) && selectedStatus.includes("18:00")) {return true}            
            }});
        }
    });
      // Filter data accordingly and update vis

      leafletMap.updateVis();
    });
    
    // TODO: next we can initialize and connect callbacks/listeners for other features we want to add (timeline, buttons, dropdowns, etc)
    //   Some examples in pseudocode:
    //var attributeDropdown = Dropdown()
    //var timelineSlider = TimelineSlider()
    //var resetButton = ResetButton()
    /*
    resetButton.addEventListener("click", function() {
        // button that resets something
    }
    .catch(error => console.error(error));
    */

    // lastly, we setup the UI event handlers (callbacks)
    setupUICallbacks();
}

/**
 * 
 * This method is used as a global access point for updating the various visualizations.
 * It should call into each JS class' respective updateVis() method.
 * The beauty of this mechanism (paired with the global, singleton DataStore() class) is that we don't need to pass updated data in.
 *  Inside the class method itself, we can target the 'DataStore.filteredData' which is also directly modified from UI controls.
 */
function updateVisualizations() {
    console.log("called main script updateVisualizations() method"); 
    leafletMap.data = DataStore.filteredData       // testing
    leafletMap.updateVis();
    timeline.updateVis();

    //console.log("# of data points in rawData:", DataStore.rawData.length);  // testing
    //console.log("# of data points shown:", DataStore.filteredData.length);  // testing

    // TODO: Add calls as necessary
}
main(); // calls the main() function to begin execution
