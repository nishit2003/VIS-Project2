class DataStore {
    // Class Constants & Attributes
    static rawData = undefined;         // This should remain unmodified. Simply a storage slot for the raw, unchanged data.
    static filteredData = undefined;    // This is the data which we'll modify inside the application. It'll be accessed throughout.
    static currMapBckgrnd = undefined;  // This is a list of size 2, where first element is the URL, and the second elemnt is the ATTR list.

    // TODO: Add as necessary

    // Constructor
    constructor() {
        // TODO: Implement if necessary
    }

    // Class Methods
    // method which resets all attributes in the DataStore() class. Good for clearing filters, data, etc.
    static reset() {
        // TODO: Implement as necessary
        DataStore.rawData = undefined;
        DataStore.filteredData = undefined;
    }
}