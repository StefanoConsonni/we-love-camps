const express = require("express");
const path = require("path");
const port = 3000;
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const sassMiddleware = require("node-sass-middleware");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");

mongoose.connect("mongodb://localhost:27017/we-love-camps");
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {
	console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
	sassMiddleware({
		src: path.join(__dirname, "sass"),
		dest: path.join(__dirname, "public/css"),
		indentedSyntax: false, // true = .sass  false = .scss
		sourceMap: true,
	})
);
app.use(express.static(path.join(__dirname, "public")));

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

app.get("/", (req, res) => {
	res.render("home");
});

app.get(
	"/campgrounds",
	catchAsync(async (req, res, next) => {
		const campgrounds = await Campground.find({});
		res.render("campgrounds/index", { campgrounds });
	})
);

app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new");
});

app.post(
	"/campgrounds",
	validateCampground,
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.get(
	"/campgrounds/:id",
	catchAsync(async (req, res, next) => {
		const campground = await Campground.findById(req.params.id);
		res.render("campgrounds/show", { campground });
	})
);

app.get(
	"/campgrounds/:id/edit",
	catchAsync(async (req, res, next) => {
		const campground = await Campground.findById(req.params.id);
		res.render("campgrounds/edit", { campground });
	})
);

app.put(
	"/campgrounds/:id",
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.delete(
	"/campgrounds/:id",
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		res.redirect("/campgrounds");
	})
);

app.post(
	"/campgrounds/:id/reviews",
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Something went wrong!";
	res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
	console.log(`Serving on port ${port}!`);
});
