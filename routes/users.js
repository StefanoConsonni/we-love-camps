const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const users = require("../controllers/users");

router.get("/register", users.renderRegisterForm);

router.post("/register", catchAsync(users.registerNewUser));

router.get("/login", users.renderLoginForm);

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login", keepSessionInfo: true }), users.login);

router.get("/logout", users.logout);

module.exports = router;
