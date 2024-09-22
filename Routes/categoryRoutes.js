// const express = require("express");

// const router = express.Router();
const withAuth = require("../withAuth");

module.exports = (app, db) => {
  const CategoryModel = require("../models/CategoryModel")(db);
  // Récupérer toutes les catégories
  app.get("/category/all", async (req, res) => {
    try {
      const categories = await CategoryModel.getAllCategory();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Récupérer une catégorie par son ID
  app.get("/category/one/:id", async (req, res) => {
    try {
      const category = await CategoryModel.getOneCategory(req.params.id);
      if (category) {
        res.json(category);
      } else {
        res.status(404).json({ message: "Category not found" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Ajouter une nouvelle catégorie
  app.post("/category/save", async (req, res) => {
    try {
      const { name, id_status } = req.body;
      const newCategory = await CategoryModel.saveOneCategory(name, id_status);
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Erreur lors de l'ajout de catégorie :", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Supprimer une catégorie
  app.delete("/category/delete/:id", async (req, res) => {
    try {
      await CategoryModel.deleteOneCategory(req.params.id);
      res.json({ message: "Category effacée" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  //Modifier une category
  app.put("/category/update/:id", async (req, res, next) => {
    //withAuth,
    const categoryId = req.params.id;
    const newStatus = req.body.id_status;
    const category = await CategoryModel.updateOneCategory(
      categoryId,
      newStatus
    );
    if (category.code) {
      res.json({ status: 500, msg: "Erreur: modification impossible" });
    } else {
      res.json({ status: 200, msg: "L'article a été modifié avec succés" });
    }
  });
};
