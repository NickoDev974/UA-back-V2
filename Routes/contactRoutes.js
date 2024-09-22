// jwt generation de token
const jwt = require("jsonwebtoken");
const secret = "mon-super-secret";

module.exports = (app, db) => {
  const ContactModel = require("../models/ContactModel")(db);

  // Route pour enregistrer les messages de contact
  app.post("/contact", async (req, res, next) => {
    try {
      const { lastname, firstname, email, content } = req.body;

      // Vérifier si l'adresse e-mail est au format correct avec une regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 400,
          message: "L'adresse e-mail n'est pas valide",
        });
      }

      // Enregistrez les données du formulaire de contact dans votre base de données
      await ContactModel.saveContactMessage(
        lastname,
        firstname,
        email,
        content
      );
      // Répondez avec un statut 201 pour indiquer que le message a été enregistré avec succès
      res
        .status(201)
        .json({ status: 201, message: "Message enregistré avec succès" });
    } catch (error) {
      console.error(error);
      // En cas d'erreur, répondez avec un statut 500 et un message d'erreur approprié
      res.status(500).json({
        status: 500,
        message:
          "Une erreur s'est produite lors de l'enregistrement du message de contact",
      });
    }
  });

  // Route pour récupérer tous les messages de contact
  app.get("/contact/all", async (req, res, next) => {
    try {
      const messages = await ContactModel.getAllContactMessages();
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message:
          "Une erreur s'est produite lors de la récupération des messages de contact",
      });
    }
  });
};
