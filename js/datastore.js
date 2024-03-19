class DataStore {
    // Class Constants & Attributes
    static staticRawData = [];
    static staticFilteredData = [];     // TODO: We could use static variables to make these a singleton, globally accessible throughout

    // Constructor
    constructor() {
        // TODO: Implement as necessary
        this.rawData = [];
        this.filteredData = [];         // TODO: Or we could make these instance variables, and then pass the DataStore instance around the app
    }

    // Class Methods
    // TODO: Add methods as necessary

    // method which resets all attributes in the DataStore() class. Good for clearing filters, data, etc.
    reset() {   // TODO: If we use static (singleton) stuff, we'll have to add static to data-modifying method calls 
        // TODO: Implement as necessary
    }
}