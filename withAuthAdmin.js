const jwt = require("jsonwebtoken");
const secret = "mon-super-secret";

const withAuthAdmin = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (token === undefined) {
    res.json({ status: 404, msg: "Token introuvable" });
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.json({ status: 401, msg: "Token Invalide" });
      } else {
        if (decoded.role !== "admin") {
          res.json({
            status: 401,
            msg: "Desole vous n'avez pas les autorisations ",
          });
        } else {
          req.id = decoded.id;
          next();
        }
      }
    });
  }
};
module.exports = withAuthAdmin;
