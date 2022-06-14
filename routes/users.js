const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

router.get("/register", (req, res) => {
	res.render("users/register");
});

router.post(
	"/register",
	catchAsync(async (req, res, next) => {
		try {
			const { email, username, password } = req.body;
			const user = new User({ email, username });
			const registeredUser = await User.register(user, password);
			req.login(registeredUser, (err) => {
				if (err) return next(err);
				req.flash("success", "Welcome to We Love Camps!");
				res.redirect("/campgrounds");
			});
		} catch (err) {
			req.flash("error", err.message);
			res.redirect("/register");
		}
	})
);

router.get("/login", (req, res) => {
	res.render("users/login");
});

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login", keepSessionInfo: true }), (req, res) => {
	const { username } = req.body;
	req.flash("success", `Welcome back ${username}!`);
	const redirectUrl = req.session.returnTo || "/campgrounds";
	delete req.session.returnTo;
	res.redirect(redirectUrl);
});

router.get("/logout", async (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		req.flash("success", "Goodbye!");
		res.redirect("/campgrounds");
	});
});

module.exports = router;
