const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
	res.render("users/register");
};

module.exports.registerNewUser = async (req, res, next) => {
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
};

module.exports.renderLoginForm = (req, res) => {
	res.render("users/login");
};

module.exports.login = (req, res) => {
	const { username } = req.body;
	req.flash("success", `Welcome back ${username}!`);
	const redirectUrl = req.session.returnTo || "/campgrounds";
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

module.exports.logout = async (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		req.flash("success", "Goodbye!");
		res.redirect("/campgrounds");
	});
};
