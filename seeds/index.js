const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/we-love-camps");
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
	console.log("Database connected");
});

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: "62aa49d963bbe4f1e36233bb",
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			// image: `https://source.unsplash.com/random/360x345?camping,${i}`,
			// image: "https://source.unsplash.com/random/300x280?campground#" + new Date().getTime(),
			description:
				"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sit fugiat labore consequatur incidunt fugit officia a. Dignissimos officia, aut, perspiciatis quasi cupiditate, cum nemo harum in eligendi corrupti aperiam velit? Ratione dolore illum aperiam accusamus in reiciendis exercitationem eos unde voluptatem, ullam quidem blanditiis vel alias esse, facilis reprehenderit deserunt dolores harum laboriosam corporis necessitatibus eius repellendus? Quos, est aliquam.",
			price: price,
			images: [
				{
					url: "https://res.cloudinary.com/stecons/image/upload/v1656610263/WeLoveCamps/kbvkcs12kk3dpy6km2zx.jpg",
					filename: "WeLoveCamps/kbvkcs12kk3dpy6km2zx",
				},
				{
					url: "https://res.cloudinary.com/stecons/image/upload/v1656610263/WeLoveCamps/fuwzkfvuyxfuohhbnici.jpg",
					filename: "WeLoveCamps/fuwzkfvuyxfuohhbnici",
				},
			],
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
