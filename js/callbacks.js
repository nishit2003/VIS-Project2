/* This script houses a bunch of UI element callbacks. Things such as the button clicked, dropdown selection, or text entered, event handlers. */
function setupUICallbacks() {
    // TODO: Some testing needs to be done with mixing filters (timeline & word search). They may not be 100% working correctly

    document.getElementById("btnSubmitFilters").addEventListener("click", function() {
        //console.log("btnSubmitFilters clicked!");   // for testing/development's sake

        // grab the keyword from the search textbox & convert the keyword to lowercase for case-insensitive matching
        const lowerKeyword = document.getElementById("txtWordSearch").value.toLowerCase();

        if (lowerKeyword == "") { return; } // if nothing is entered, we don't want to waste processing power filtering on nothing

        // Filter the data based on the description attribute containing the keyword
        DataStore.filteredData = DataStore.filteredData.filter(d => {
            const lowerDescription = String(d.description).toLowerCase();   // Convert the description to lowercase for case-insensitive matching
            return lowerDescription.includes(lowerKeyword); // Check if the keyword is found in the description
        });

        // Update the visualization
        updateVisualizations();
    });
    
    document.getElementById("btnResetTimeline").addEventListener("click", function() {
        //console.log("btnResetTimeline clicked!");   // for testing/development's sake
    
        // Remove the brushed selection
        timeline.brushGroup.call(timeline.brush.move, null);
    
        // Clear the filtered data
        DataStore.filteredData = timeline.data;
    
        // Update visualizations    
        updateVisualizations(); // Call the function to update all visualizations
    });

    document.getElementById("chkBrushMap").addEventListener("click", function() {
        if (this.checked) {            
            DataStore.brushingLeaflepMap = true;
            leafletMap.initializeMapBrush();
            leafletMap.disableMapInteraction();
        }
        else {            
            DataStore.brushingLeaflepMap = false;
            leafletMap.initializeMapBrush();
            leafletMap.enableMapInteraction();
        }
    });

    // TODO: Add more callbacks as necessary:
    //  Simply follow the structure above (copy & paste for template) of targeting the UI element,
    //      doing whatever processing is necessary, and calling the updateVisualizations() method afterwards
}