//pour supprimer les images locales
const fs = require("fs");
const upload = require("../multerConfig");
const path = require("path");
const withAuth = require("../withAuth");
const withAuthAdmin = require("../withAuthAdmin");
const { clearScreenDown } = require("readline");
//const withAuthPrepa = require("../withAuthPrepa");

module.exports = (app, db) => {
  const articleModel = require("../models/ArticleModel")(db);

  //Route de recuperation de tous les articles
  app.get("/article/all", async (req, res, next) => {
    const products = await articleModel.getAllProducts();
    if (products.code) {
      res.json({
        status: 500,
        msg: "Accés a la liste des produits impossible",
      });
    } else {
      res.json({ status: 200, result: products });
    }
  });

  //Route de recuperation d'un seul article
  app.get("/article/one/:id", async (req, res, next) => {
    const product = await articleModel.getOneProduct(req.params.id);
    if (product.code) {
      res.json({
        status: 500,
        msg: "Erreur, impossible de récupérer cet l'article",
      });
    } else {
      res.json({ status: 200, result: product[0] });
    }
  });

  //Route d'ajout d'un article
  app.post("/article/save", async (req, res, next) => {
    const product = await articleModel.saveOneProduct(req);
    if (product.code) {
      res.json({ status: 500, msg: "Erreur: article non enregistré" });
    } else {
      res.json({
        status: 200,
        msg: "L'article a bien été ajouter",
        id: product.id,
      });
    }
  });

  // Route pour l'ajout d'une image dans la base
  app.post("/article/img", async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.json({
        status: 400,
        msg: "Ce produit n'a pas de photo ou celle-ci est inaccessible",
      });
    }

    const newImageName = req.header("New-Image-Name"); // Récupération du nouveau nom de l'image depuis l'en-tête de la requête

    req.files.image.mv(`public/images-produits/${newImageName}`, (err) => {
      if (err) {
        return res.json({ status: 500, msg: "Erreur: image non enregistrée" });
      } else {
        // Image enregistrée, retournez le nouveau nom vers le front
        return res.json({
          status: 200,
          msg: "L'image a bien été enregistrée",
          url: newImageName,
        });
      }
    });
  });

  //Route de  modification d'un article
  app.put("/article/update/:id", withAuth, async (req, res, next) => {
    const product = await articleModel.updateOneProduct(req, req.params.id);
    if (product.code) {
      console.error("Erreur lors de la modification de l'article :", product);
      res.json({ status: 500, msg: "Erreur: modification impossible" });
    } else {
      res.json({ status: 200, msg: "L'article a été modifié avec succés" });
    }
  });

  //Route de suppression d'un article
  app.delete("/article/delete/:id", withAuth, async (req, res, next) => {
    const product = await articleModel.getOneProduct(req.params.id);
    if (product.code) {
      res.json({ status: 500, msg: "Une erreur est survenue" });
    } else {
      const deleteProduc = await articleModel.deleteOneProduct(req.params.id);
      if (deleteProduc.code) {
        res.json({
          status: 500,
          msg: "Erreur:  suppression Impossible article en commade  ",
        });
      } else {
        // suppression -> ok, il faut supprimer l'image
        if (product[0].img !== "no-pict.jpg") {
          fs.unlink(`public/images-produits/${product[0].img}`, (err) => {
            if (err) {
              console.error("Erreur lors de la suppression de l'image :", err);
              res.json({
                status: 500,
                msg: "Erreur: impossible de supprimer l'image",
              });
            }
          });

          res.json({ status: 200, msg: "Article supprimer avec succés" });
        } else {
          console.error("Erreur lors de la suppression de l'article :", err);
          res.json({ status: 200, msg: "Article supprimer avec succés" });
        }
      }
    }
  });

  // Route pour la mise à jour du stock d'un produit
  app.put("/article/updateStock/:id", async (req, res, next) => {
    try {
      const productId = req.params.id;
      const quantityOrdered = req.body.quantity;
      const currentStock = await articleModel.getProductStock(productId);

      // Vérif stock produit
      if (!currentStock || currentStock < quantityOrdered) {
        return res
          .status(400)
          .json({ msg: "Stock insuffisant pour cette commande" });
      }
      const newStock = currentStock - quantityOrdered;
      const result = await articleModel.updateProductStock(productId, newStock);

      // Vérifier si la mise à jour du stock a réussi
      if (result.code) {
        console.error(
          "Erreur lors de la mise à jour du stock du produit :",
          result
        );
        return res
          .status(500)
          .json({ msg: "Erreur: mise à jour du stock impossible" });
      } else {
        return res
          .status(200)
          .json({ msg: "Le stock du produit a été mis à jour avec succès" });
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du stock du produit :", err);
      return res.status(500).json({
        msg: "Une erreur est survenue lors de la mise à jour du stock du produit",
      });
    }
  });

  //---------------------------------------------------------------------------------------------------------------
  //----------------------Images table picture ----------------------------------------------

  // Route pour l'ajout d'une image dans la base et enregistrement du fichier
  app.post("/article/picture", async (req, res, next) => {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({
          status: 400,
          msg: "Aucune image n'a été envoyée ou l'image est inaccessible",
        });
      }

      const pictureData = {
        name: req.body.name,
        alt: req.body.alt,
        id_product: req.body.id_product,
      };

      // Récupérer le fichier d'image
      const imageFile = req.files.image;

      // Déplacer le fichier d'image vers le dossier images-produits
      imageFile.mv(
        `public/images-produits/${pictureData.name}`,
        async (err) => {
          if (err) {
            console.error("Erreur lors du déplacement du fichier :", err);
            return res.status(500).json({
              status: 500,
              msg: "Erreur lors de l'enregistrement du fichier d'image",
            });
          }
          const result = await articleModel.savePictureData(pictureData);

          return res
            .status(200)
            .json({ msg: "L'image a été ajoutée avec succès" });
        }
      );
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'image :", err);
      return res.status(500).json({
        msg: "Une erreur est survenue lors de l'ajout de l'image",
      });
    }
  });

  // Route pour récupérer les images associées à un produit spécifique
  app.get("/article/images/:productId", async (req, res, next) => {
    try {
      const productId = req.params.productId;
      const images = await articleModel.getProductImages(productId);
      res.json({ status: 200, images: images });
    } catch (err) {
      console.error("Erreur lors de la récupération des images :", err);
      res.status(500).json({
        msg: "Une erreur est survenue lors de la récupération des images",
      });
    }
  });
};
