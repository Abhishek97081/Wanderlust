
  let mapToken=mapToken;
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });

console.log(coordinates);


 const marker1 = new mapboxgl.Marker( { color: 'red' })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25,})
    .setLngLat(e.lngLat)
    .setHTML("<h4>" + listing.location + "</h4><p>Exact location provided after booking</p>")
    .setMaxWidth("300px"))
    .addTo(map);
        