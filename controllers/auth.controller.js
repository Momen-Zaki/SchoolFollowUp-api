const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const UserController = require("../controllers/user.controller");

exports.register = UserController.create;

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) res.status(400).send({ message: "email doesnt exist" });

    const validPass = await bcrypt.compare(req.body.pass, user.pass);
    if (!validPass)
      res.status(400).send({ message: "email or password are in correct" });

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

    res.header("auth-token", token).send({ message: "logged in" });
  } catch (error) {
    console.log(error);
  }
};
