module.exports = (_db) => {
  db = _db;
  return CategoryModel;
};

class CategoryModel {
  // recuperation de toutes les category
  static getAllCategory() {
    return db
      .query("SELECT * FROM category")
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //récupération d'une seule category par id
  static getOneCategory(id) {
    return db
      .query("SELECT * FROM category WHERE id = ?", [id])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //save one category
  static saveOneCategory(name, id_status) {
    return db
      .query("INSERT INTO `category` ( `name`, `id_status`) VALUES ( ?, '2')", [
        name,
        id_status,
      ])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //delete category
  static deleteOneCategory(id) {
    return db
      .query("DELETE FROM category WHERE id = ?", [id])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //modif de category
  static updateOneCategory(id, id_status) {
    return db
      .query(
        "UPDATE `category` SET `id_status` = ? WHERE `category`.`id` = ?",
        [id_status, id]
      )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }
}
