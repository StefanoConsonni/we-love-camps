const express = require("express");
const path = require("path");
const port = 3000;
const mongoose = require("mongoose");
const Campground = require("./models/campground");

mongoose.connect("mongodb://localhost:27017/we-love-camps");
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
	console.log("Database connected");
});

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/campgrounds", async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/:id", async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	res.render("campgrounds/show", { campground });
});

app.listen(port, () => {
	console.log("Serving on port 3000!");
});
