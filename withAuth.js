const jwt = require("jsonwebtoken");
const secret = "mon-super-secret";

const withAuth = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (token === undefined) {
    res.json({ status: 404, msg: "Token Introuvable" });
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.json({ status: 401, msg: "Token Invalide" });
      } else {
        req.id = decoded.id;
        next();
      }
    });
  }
};
module.exports = withAuth;
