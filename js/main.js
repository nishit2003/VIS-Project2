d3.csv('data/ufo_sightings.csv')
.then(data => {
    console.log(data[0]);
    console.log(data.length);
    data.forEach(d => {
      console.log(d);
      d.latitude = +d.latitude; 
      d.longitude = +d.longitude; 
    });

    leafletMap = new LeafletMap({ parentElement: '#map'}, data);
    console.log("loaded sucessfully")
  })
  .catch(error => console.error(error));