const bcrypt = require("bcryptjs");
const saltRounds = 10;

module.exports = (_db) => {
  db = _db;
  return UserModel;
};

class UserModel {
  //enregistrer un user
  static saveOneUser(req) {
    return bcrypt
      .hash(req.body.password, saltRounds)
      .then((hash) => {
        return db
          .query(
            "INSERT INTO user (firstname, lastname, email, password, phone, create_at, id_role, id_status) VALUES (?, ?, ?, ?, ?, NOW(), (SELECT id FROM role WHERE name = 'user'), (SELECT id FROM status WHERE name = 'visible'))",
            [
              req.body.firstname,
              req.body.lastname,
              req.body.email,
              hash,
              req.body.phone,
              req.body.dateCreation,
              req.body.role,
              req.body.status,
            ]
          )
          .then((res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
      })
      .catch((err) => console.log(err));
  }

  //recup user par Id
  static getUserById(Id) {
    return db
      .query(
        "SELECT u.*, r.name AS role FROM user AS u JOIN role AS r ON u.id_role = r.id WHERE u.id = ?",
        [Id]
      )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //recup user par Email
  static getUserByEmail(Email) {
    return db
      .query("SELECT * FROM user WHERE email = ?", [Email])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //modif d'un user
  static updateUser(req, userId) {
    return db
      .query(
        "UPDATE user AS u SET u.firstname = ?, u.lastname = ?, u.phone = ? WHERE u.id = ?",
        [req.body.firstname, req.body.lastname, req.body.phone, userId]
      )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //modification de la derniere connexion d'un user
  static updateConnexion(id) {
    return db
      .query("UPDATE user SET connectionTimestamp = NOW() WHERE id =?", [id])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //Supprimer un User surement pas utiliser dans l'appication car on ne veut pas supprimer ses commandes ect...
  static deleteOneUser(id) {
    return db
      .query("DELETE FROM user WHERE id =?", [id])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //route modif role user pour admin seulement
  static updateUserRole(req, userId, id_role) {
    return db
      .query("UPDATE user SET id_role = ? WHERE user.id = ?", [id_role, userId])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //modification du statut d'un user
  static updateUserStatus(req, userId, id_status) {
    return db

      .query("UPDATE user SET id_status = ? WHERE user.id = ?", [
        id_status,
        userId,
      ])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }
  // récupérer tous les utilisateurs
  static getAllUsers() {
    return db
      .query("SELECT * FROM user")
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.error(
          "Erreur lors de la récupération des utilisateurs depuis la base de données :",
          err
        );
        return err;
      });
  }
}
