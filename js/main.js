/* This script will act as the main "runner" of the entire application. */
let leafletMap, timeline    // some script-level (global) variables

// Because we've moved the CSV data parsing into a separate module, we need to ensure the rest of the program waits for CSV parsing to complete.
//  If you look at the in-class examples, most of the visualization creation is done INSIDE of the "d3.csv()" tag, so the synchronization is encapsulated.
//  Since we've split it out, we need to ensure the main runner waits for the parsing to complete. That is why I've launched the application in this way.
async function main() {
    await CsvDataParser.parseUfoData();     // parses UFO data & saves to the DataStore() class (singleton, static class)
    
    // next we can generate the leaflet map
    leafletMap = new LeafletMap({parentElement: '#map'}, DataStore.filteredData);
    leafletMap.initVis();

    // next we create the brushable timeline
    timeline = new Timeline({parentElement: '#timeline'}, DataStore.rawData);
    timeline.initVis();
    
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
}

/**
 * 
 * This method is used as a global access point for updating the various visualizations.
 * It should call into each JS class' respective updateVis() method.
 * The beauty of this mechanism (paired with the global, singleton DataStore() class) is that we don't need to pass updated data in.
 *  Inside the class method itself, we can target the 'DataStore.filteredData' which is also directly modified from UI controls.
 */
function updateVisualizations() {
    console.log("called main script updateVisualizations() method");        // testing
    leafletMap.updateVis();
    timeline.updateVis();

    //console.log("# of data points in rawData:", DataStore.rawData.length);  // testing
    //console.log("# of data points shown:", DataStore.filteredData.length);  // testing

    // TODO: Add calls as necessary
}

main(); // calls the main() function to begin execution
