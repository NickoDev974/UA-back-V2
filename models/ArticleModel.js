module.exports = (_db) => {
  db = _db;
  return ArticleModel;
};

class ArticleModel {
  //recup d'un article
  static getOneProduct(id) {
    return db
      .query("SELECT * FROM product WHERE id = ?", [id])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //recup de tous les articles
  static getAllProducts() {
    return db
      .query("SELECT * FROM product ")
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //supression d'un article
  static deleteOneProduct(id) {
    return db
      .query("DELETE FROM product WHERE id =? ", [id])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //Ajout d'un article
  static saveOneProduct(req) {
    return db
      .query(
        "INSERT INTO `product` (`name`, `content`, `img`, `alt`, `price`, `stock`, `id_category`, `id_status`) VALUES (?, ?, ?, ?, ?, ?, '4', '2')",
        [
          req.body.name,
          req.body.content,
          req.body.img,
          req.body.alt,
          req.body.price,
          req.body.stock,
          req.body.id_category,
          req.body.id_status,
        ]
      )
      .then((result) => {
        const productId = result.insertId;
        return productId;
      })
      .catch((err) => {
        return err;
      });
  }

  //Modif d'un article
  static updateOneProduct(req, id) {
    return db
      .query(
        "UPDATE `product` SET `name` = ?, `content` = ?, `img` = ?, `alt` = ?, `price` = ?, `stock` = ?, `id_category` = ?, `id_status` = ? WHERE `product`.`id` = ?",
        [
          req.body.name,
          req.body.content,
          req.body.img,
          req.body.alt,
          req.body.price,
          req.body.stock,
          req.body.id_category,
          req.body.id_status,
          id,
        ]
      )
      .then((res) => {
        return { productId: productId };
      })
      .catch((err) => {
        return err;
      });
  }

  // Méthode pour mettre à jour le stock d'un produit
  static updateProductStock(productId, newStock) {
    return db
      .query("UPDATE `product` SET `stock` = ? WHERE `id` = ?", [
        newStock,
        productId,
      ])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  // Méthode pour récupérer le stock d'un produit
  static getProductStock(productId) {
    return db
      .query("SELECT stock FROM product WHERE id = ?", [productId])
      .then((res) => {
        // Vérifiez si le résultat est vide
        if (res.length === 0) {
          throw new Error("Le produit n'existe pas.");
        }
        // Retournez le stock du produit
        return res[0].stock;
      })
      .catch((err) => {
        return err;
      });
  }

  //---------------------------------------------------------------------------------------------------------------
  //----------------------Images table picture ----------------------------------------------

  // Ajouter une image dans la base de données
  static savePictureData(pictureData) {
    return db
      .query("INSERT INTO `picture` (name, alt, id_product) VALUES (?, ?, ?)", [
        pictureData.name,
        pictureData.alt,
        pictureData.id_product,
      ])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  // Méthode pour récupérer les images associées à un produit spécifique
  static getProductImages(productId) {
    return db
      .query("SELECT * FROM `picture` WHERE id_product = ?", [productId])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }
}
