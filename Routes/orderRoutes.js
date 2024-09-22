//ma clef de test stripe
const stripe = require("stripe")(
  "sk_test_51LoWZjBQwgcwEFPsvJRPQsmwbSesyPskhP1TYRgsQIJZWLfET0aygSeqY9wB0kSaqgVI0n08qcYQfneyH2CGZq8H00JNLqp2iN"
);
const withAuth = require("../withAuth");

module.exports = (app, db) => {
  const orderModel = require("../models/Ordermodel")(db);
  const articleModel = require("../models/ArticleModel")(db);
  const userModel = require("../models/UserModel")(db);

  //Route d'enregistrement d'une commande
  app.post("/order/save", withAuth, async (req, res, next) => {
    let totalPrice = 0;
    let totalQuantity = 0;
    req.body.basket.forEach((product) => {
      totalQuantity += product.quantityInCart;
    });

    const orderInfos = await orderModel.saveOneOrder(
      req.body.user_id,
      totalPrice,
      totalQuantity
    );

    if (orderInfos.code) {
      res.json({
        status: 500,
        msg: "Echec de l'enregistrement de la commande",
      });
    } else {
      const orderId = orderInfos.insertId;
      //boucle pour recup de tous les articles dans le panier
      req.body.basket.forEach(async (products) => {
        const product = await articleModel.getOneProduct(products.id);
        if (product.code) {
          res.json({
            status: 500,
            msg: "Echec de l'enregistrement de la commande",
          });
        } else {
          products.safePrice = parseFloat(product[0].price);
          const detail = await orderModel.saveOneOrderLine(orderId, products);
          if (detail.code) {
            res.json({
              status: 500,
              msg: "Echec de l'enregistrement de la commande",
            });
          } else {
            // calcul du montant de la commande
            totalPrice += parseInt(products.quantityInCart) * products.price;
            //mise a jours du montant total
            const update = await orderModel.updateTotalCommande(
              orderId,
              totalPrice
            );
          }
        }
      });

      res.json({ status: 200, orderId: orderId });
    }
  });

  //---------------------------------------------------------------------------------------------------------------
  //                                    paiement
  //---------------------------------------------------------------------------------------------------------------

  //Route de gestion de paiement
  app.post("/order/payment", async (req, res, next) => {
    //withAuth

    const order = await orderModel.getOneOrder(req.body.orderId);
    if (order.code) {
      res.json({ status: 500, msg: "Le paiement ne peut être vérifié" });
    } else {
      // suivi du paiement
      const payementIntent = await stripe.paymentIntents.create({
        amount: order[0].totalPrice * 100,
        currency: "eur",
        metadata: { integration_check: "accept_a_payement" },
        receipt_email: req.body.email,
      });
      res.json({ status: 200, client_secret: payementIntent["client_secret"] });
    }
  });

  //-------------------------------------------------------------------------------------------------------------------

  //Route de modif du status de la commande

  app.put("/order/validate", withAuth, async (req, res, next) => {
    try {
      const validate = await orderModel.updateOrderStatus(
        req.body.id_order_status,
        req.body.orderId
      );

      if (validate) {
        res.json({ status: 200, msg: "Status de commande mis à jour" });
      } else {
        res.json({ status: 500, msg: "Une erreur est survenue" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 500, msg: "Une erreur est survenue" });
    }
  });

  //Route de recuperation de toutes les commandes
  app.get("/order/all", withAuth, async (req, res, next) => {
    const orders = await orderModel.getAllOrders();
    if (orders.code) {
      res.josn({ status: 500, msg: "Une erreur est survenue" });
    } else {
      res.json({ status: 200, result: orders });
    }
  });

  // Reucuperation d'une commande complete
  app.get("/order/getOneOrder/:id", withAuth, async (req, res, next) => {
    const order = await orderModel.getOneOrder(req.params.id);
    if (order.code) {
      res.json({ status: 500, msg: "Une erreur est survenue" });
    } else {
      const user = await userModel.getUserById(order[0].id_user);
      if (user.code) {
        res.json({ status: 500, msg: "Une erreur est survenue" });
      } else {
        const myUser = {
          firstname: user[0].firstname,
          lastname: user[0].lastname,
          email: user[0].email,
          phone: user[0].phone,
        };
        //recuperation des order_line
        const detail = await orderModel.getAllOrdersLine(req.params.id);
        if (detail.code) {
          res.json({ status: 500, msg: "Une erreur est survenue" });
        } else {
          res.json({
            status: 200,
            order: order[0],
            user: myUser,
            order_line: detail,
          });
        }
      }
    }
  });
};
