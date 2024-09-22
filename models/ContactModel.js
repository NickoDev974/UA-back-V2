module.exports = (_db) => {
  db = _db;
  return ContactModel;
};

class ContactModel {
  // Enregistrer un message de contact
  static saveContactMessage(lastname, firstname, email, content) {
    return db
      .query(
        "INSERT INTO `contact` ( `lastname`, `firstname`, `email`, `send_at`, `content`) VALUES (?, ?, ?, NOW(), ?)",
        [lastname, firstname, email, content]
      )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.error(
          "Erreur lors de l'enregistrement du message de contact :",
          err
        );
        return err;
      });
  }

  // Récupérer tous les messages de contact
  static getAllContactMessages() {
    return db
      .query("SELECT * FROM contact")
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.error(
          "Erreur lors de la récupération des messages de contact :",
          err
        );
        return err;
      });
  }
}
