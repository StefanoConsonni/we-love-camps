if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const sassMiddleware = require("node-sass-middleware");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const User = require("./models/user");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");

mongoose.connect(dbUrl);
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
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());
app.use(
	sassMiddleware({
		src: path.join(__dirname, "sass"),
		dest: path.join(__dirname, "public/css"),
		indentedSyntax: false, // true = .sass  false = .scss
		sourceMap: true,
	})
);

app.use(
	helmet({
		contentSecurityPolicy: false,
		crossOriginEmbedderPolicy: false,
	})
);

const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60, // time period in seconds (24 hours)
	crypto: {
		secret: process.env.SESSION_SECRET,
	},
});

store.on("error", (err) => {
	console.log("SESSION STORE ERROR", err);
});

const sessionConfig = {
	store: store,
	name: process.env.SESSION_NAME,
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // milliseconds * minutes * hour * day * week
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use("", usersRoutes);

app.get("/", (req, res) => {
	res.render("home");
});

app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = "Something went wrong!";
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log("Serving on port 3000!");
});
