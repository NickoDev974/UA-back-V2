module.exports = (_db) => {
  db = _db;
  return OrderModel;
};

class OrderModel {
  // Ajout d'une commande avec option de payment
  static saveOneOrder(userId, totalPrice, totalQuantity, orderDate, payment) {
    return db
      .query(
        "INSERT INTO orders (id_user, total_price, total_quantity, order_date, id_order_status, id_shop, payment) VALUES (?,?,?,NOW(),'1','1','not payed')",
        [userId, totalPrice, totalQuantity, orderDate, payment]
      )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  // Ajout d'une ligne de commande (qui sera appeler en boucle en fonction du nombre d'articles)
  static saveOneOrderLine(orderId, product) {
    const total = parseInt(product.quantityInCart) * product.price;
    return db
      .query(
        "INSERT INTO order_line (id_product, quantity, unit_price, id_order,total ) SELECT ?, ?, ?, ?, (SELECT price FROM product WHERE id = ?)",
        [product.id, product.quantityInCart, product.price, orderId, product.id]
      )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //Modif montant total
  static updateTotalCommande(orderId, totalPrice) {
    return db
      .query("UPDATE orders SET total_price =? WHERE id =?", [
        totalPrice,
        orderId,
      ])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //Recup commande par ID
  static getOneOrder(id) {
    return db
      .query("SELECT * FROM orders WHERE id = ?", [id])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //modif Status de la commande
  static updateOrderStatus(id_order_status, orderId) {
    return db
      .query("UPDATE orders SET id_order_status = ? WHERE id= ?", [
        id_order_status,
        orderId,
      ])
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  //recup de toutes les commandes
  static getAllOrders() {
    return db
      .query("SELECT * FROM orders")
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }

  // recup des lignes d'une commande
  static getAllOrdersLine(orderId) {
    return db
      .query(
        "SELECT order_line.id, order_line.quantity, price, name, img, content FROM order_line INNER JOIN product ON product.id = order_line.id_product WHERE id_order = ?",
        [orderId]
      )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  }
}
