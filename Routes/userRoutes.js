const bcrypt = require("bcryptjs");
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const secret = "mon-super-secret";
const withAuth = require("../withAuth");
const withAuthAdmin = require("../withAuthAdmin");

module.exports = (app, db) => {
  const userModel = require("../models/UserModel")(db);

  //route d'enregistrement d'un user
  app.post("/user/save", async (req, res, next) => {
    //verification du mail existant ou non
    const check = await userModel.getUserByEmail(req.body.email);
    if (check.code) {
      res.json({
        status: 500,
        msg: "Erreur lors de l'enregistrement",
      });
    } else {
      if (check.length > 0) {
        if (check[0].email === req.body.email) {
          res.json({
            status: 401,
            msg: "Votre compte existe dejas connectez vous.",
          });
        }
      } else {
        const user = await userModel.saveOneUser(req);
        if (user.code) {
          res.json({
            status: 500,
            msg: "Une erreur lors de l'enregistrement s'est produite ",
          });
        } else {
          res.json({
            status: 200,
            msg: `L'utilisateur a bien été enregistré, bienvenue ${req.body.firstname}, ${req.body.lastname}!`,
          });
        }
      }
    }
  });

  //route connextion avec creation token
  // le message d'erreur est le meme afin de ne pas donner d'indication au hacker
  app.post("/user/login", async (req, res, next) => {
    //verif compte existant :
    const check = await userModel.getUserByEmail(req.body.email);
    if (check.code) {
      res.json({ status: 500, msg: "Mot de passe ou Identifiant invalide" });
    } else {
      // si email innexistant sur la BDD
      if (check.length === 0) {
        res.json({ status: 404, msg: "Mot de passe ou Identifiant invalide" });
      } else {
        //le mail existe donc on verrifit le password
        const same = await bcrypt.compare(req.body.password, check[0].password);
        if (same) {
          //password ok -> creation du payload (contenue envoyer dans le token)
          const payload = {
            id: check[0].id,
            role: check[0].role,
            status: check[0].status,
          };
          //creation du token avec signature
          const token = jwt.sign(payload, secret);
          //modification de status de connexion
          const connect = await userModel.updateConnexion(check[0].id);
          if (connect.code) {
            res.json({
              status: 500,
              msg: "Mot de passe ou Identifiant invalide",
            });
          } else {
            const user = {
              id: check[0].id,
              firstname: check[0].firstname,
              lastname: check[0].lastname,
              email: check[0].email,
              phone: check[0].phone,
              role: check[0].role,
              status: check[0].status,
            };
            res.json({ status: 200, token: token, user: user });
          }
        } else {
          //password != ok
          res.json({
            status: 404,
            msg: "Mot de passe ou Identifiant invalide",
          });
        }
      }
    }
  });

  // Route de modif d'un user
  app.put("/user/update/:id", withAuth, async (req, res, next) => {
    const user = await userModel.updateUser(req, req.params.id);
    if (user.code) {
      res.json({
        status: 500,
        msg: "Une erreur est survenue lors de la mise a jour de l'utilisateur",
      });
    } else {
      const newUser = await userModel.getUserById(req.params.id);
      if (newUser.code) {
        res.json({
          status: 500,
          msg: "Une erreur est survenue lors de la mise a jour de l'utilisateur",
        });
      } else {
        const myUser = {
          id: newUser[0].id,
          firstname: newUser[0].firstname,
          lastname: newUser[0].lastname,
          email: newUser[0].email,
          phone: newUser[0].phone,
          role: newUser[0].role,
          status: newUser[0].status,
        };
        res.json({ status: 200, result: user, newUser: myUser });
      }
    }
  });

  //Route de suppression d'un user
  // creation de la route mais utilisation incertaine
  app.delete("/user/delete/:id", withAuth, async (req, res, next) => {
    const deleteUser = await userModel.deleteOneUser(req.params.id);
    if (deleteUser.code) {
      res.json({
        status: 500,
        msg: "Une erreur est survenue, suppression impossible",
      });
    } else {
      res.json({ status: 200, msg: "Suppression de l'utilisateur confirmée" });
    }
  });

  //Route special admin pour changer role et status d'un user
  app.put("/user/updateRole/:id", async (req, res, next) => {
    try {
      const user = await userModel.updateUserRole(
        req,
        req.params.id,
        req.body.id_role
      );
      res.json({ status: 200, msg: "Rôle utilisateur mis à jour avec succès" });
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: "Erreur lors de la mise à jour du rôle utilisateur",
      });
    }
  });

  // Route spéciale admin pour changer le statut d'un utilisateur
  app.put("/user/updateStatus/:id", async (req, res, next) => {
    try {
      const user = await userModel.updateUserStatus(
        req,
        req.params.id,
        req.body.id_status
      );

      res.json({
        status: 200,
        msg: "Statut utilisateur mis à jour avec succès",
      });
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: "Erreur lors de la mise à jour du statut utilisateur",
      });
    }
  });
  // Route pour récupérer tous les utilisateurs
  app.get("/user/all", withAuth, async (req, res, next) => {
    try {
      const user = await userModel.getAllUsers();
      res.json({ status: 200, user: user });
    } catch (err) {
      res.status(500).json({
        status: 500,
        msg: "Erreur lors de la récupération des utilisateurs",
      });
    }
  });
};
