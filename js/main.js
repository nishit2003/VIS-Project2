/* This script will act as the main "runner" of the entire application. */

// Because we've moved the CSV data parsing into a separate module, we need to ensure the rest of the program waits for CSV parsing to complete.
//  If you look at the in-class examples, most of the visualization creation is done INSIDE of the "d3.csv()" tag, so the synchronization is encapsulated.
//  Since we've split it out, we need to ensure the main runner waits for the parsing to complete. That is why I've launched the application in this way.
async function main() {
    await CsvDataParser.parseUfoData();     // parses UFO data & saves to the DataStore() class (singleton, static class)
    
    // next we can generate the leaflet map
    let leafletMap = new LeafletMap({ parentElement: '#map'}, DataStore.filteredData);
    leafletMap.initVis();
    
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

main(); // calls the main() function to begin execution