mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: "map", // container ID
	style: "mapbox://styles/mapbox/streets-v11", // style URL
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 8, // starting zoom
	projection: "globe", // display the map as a 3D globe
});
map.on("style.load", () => {
	map.setFog({}); // Set the default atmosphere style
});

// Create a new marker on the map
const marker = new mapboxgl.Marker().setLngLat(campground.geometry.coordinates).addTo(map);
