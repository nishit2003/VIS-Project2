class CsvDataParser {
    // Class Constants & Attributes
    // TODO: Add if necessary

    // Constructor
    constructor() {
        // TODO: Implement as necessary or remove?
    }

    // Class Methods
    // method which parses specifically the data from the 'ufo_sightings.csv' file. TODO: Maybe make more modular & pass file names/attributes to parse in?
    static parseUfoData() {
        const UFO_CSV_FILE = "data/ufo_sightings.csv";
        d3.csv(UFO_CSV_FILE).then(data => {
            console.log("Data:", data);
            data.forEach(d => {
                console.log(d);
                
                // TODO: Perform necessary operations/data cleaning
            });
        })
        .catch(error => console.error(error));
        
        // TODO: Return data? Or save it to the DataStore() class somehow?
    }
}