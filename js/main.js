/// This script will act as the main "runner" of the entire application.
///     For a modular layout, we could place all functionality in external scripts/classes, and simply instantiate + use objects here.
///     I've created an example of this for the CsvDataParsing & DataStore classes.
///     However, we don't have to use this layout by any means.
///     I just wanted to add my thoughts & a sort of 'template' for us that'll keep things organized.

// first of all, we parse the UFO .csv file data
CsvDataParser.parseUfoData();

// next we'll initialize the DataStore class.
//  This includes filters, raw/filtered data, etc. Basically save all the data here

// next we can generate the leafletMap
let leafletMap = new LeafletMap();
leafletMap.initVis();

// next we can initialize and connect callbacks/listeners for other features we want to add (timeline, buttons, dropdowns, etc)
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