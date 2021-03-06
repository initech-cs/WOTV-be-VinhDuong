const { User } = require("../models/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/me", auth, async (req, res) => {
	const user = await User.findById(req.user._id).select("-password");
	res.send(user);
});

router.post("/", async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);
	let user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send("Invalid email or password.");
	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send("Invalid email or password.");
	const token = jwt.sign({ _id: user._id }, process.env.JWTKEY, { expiresIn: "7d" });
	res.send(token);
});

function validate(req) {
	const schema = {
		email: Joi.string().min(5).max(255).required(),
		password: Joi.string().min(5).max(1024).required()
	};
	return Joi.validate(req, schema);
}

module.exports = router;
