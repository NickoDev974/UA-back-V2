const withAuth = require("../withAuth");
const jwt = require("jsonwebtoken");
const secret = "mon-super-secret";

//routes de gestion d'acces avec le token

module.exports = (app, db) => {
  const userModel = require("../models/UserModel")(db);
  //route connection auto
  app.get("/user/checkToken", withAuth, async (req, res, next) => {
    const user = await userModel.getUserById(req.id);
    if (user.code) {
      res.json({ status: 500, msg: "Une erreur est survenue" });
    } else {
      const myUser = {
        id: user[0].id,
        firstname: user[0].firstname,
        lastname: user[0].lastname,
        email: user[0].email,
        phone: user[0].phone,
        role: user[0].role,
        status: user[0].status,
      };
      res.json({ status: 200, user: myUser });
    }
  });
};
