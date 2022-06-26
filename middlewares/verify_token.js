const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("auth-token") || null;
  if (!token) res.status(401).send({ messege: "Access Denied" });
  else {
    try {
      verified = jwt.verify(token, process.env.TOKEN_SECRET);
      req.payload = verified;
      next();
    } catch (error) {
      res.status(401).send("Invalid Token");
    }
  }
};
