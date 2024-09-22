const jwt = require("jsonwebtoken");
const secret = "mon-super-secret";

const withAuthPrepa = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (token === undefined) {
    res.json({ status: 404, msg: "Token introuvable!" });
  } else {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.json({ status: 401, msg: "Erreur, ton token est invalide!" });
      } else {
        if (decoded.role !== "prepa") {
          res.json({ status: 401, msg: "Désole, vous n'avez pas les access" });
        } else {
          req.id = decoded.id;
          next();
        }
      }
    });
  }
};
module.exports = withAuthPrepa;
