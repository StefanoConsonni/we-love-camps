mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: "map", // container ID
	style: "mapbox://styles/mapbox/outdoors-v11", // style URL
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 6, // starting zoom
	projection: "globe", // display the map as a 3D globe
});
map.on("style.load", () => {
	map.setFog({}); // Set the default atmosphere style
});

// Create a marker on the map
const marker = new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h6>${campground.title}</h6><p>${campground.location}`))
	.addTo(map);
