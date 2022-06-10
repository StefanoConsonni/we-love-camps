const express = require("express");
const path = require("path");
const port = 3000;
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
// const { reviewSchema } = require("./schemas");
// const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const sassMiddleware = require("node-sass-middleware");
const methodOverride = require("method-override");
// const Campground = require("./models/campground");
// const Review = require("./models/review");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

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

app.get("/", (req, res) => {
	res.render("home");
});

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

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
