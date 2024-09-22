const express = require("express");
const app = express();

const mysql = require("promise-mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images-produits"); // Dossier de destination des fichiers
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Nom de fichier original (on pourras le changer ici apres)
  },
});

const upload = multer({ storage: storage });

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-access-token",
      "new-image-name",
    ],
  })
);

const fileUpload = require("express-fileupload");

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

//verification de si connecter en local ou en ligne pour la bdd

let config;

if (!process.env.HOST) {
  //En local
  config = require("./config-offline");
} else {
  //En ligne
  config = require("./config-online");
}

// connection BDD
const host = process.env.HOST_DB || config.db.host;
const database = process.env.DATABASE_DB || config.db.database;
const user = process.env.USER_DB || config.db.user;
const password = process.env.PASSWORD_DB || config.db.password;
//special mac et mamp
const port = process.env.PORT || config.db.port;

//Importation des Routes
const authRoutes = require("./Routes/authRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const productRoutes = require("./Routes/productRoutes");
const userRoutes = require("./Routes/userRoutes");
const categoryRoutes = require("./Routes/categoryRoutes");
const contactRoutes = require("./Routes/contactRoutes");

mysql
  .createConnection({
    host: host,
    database: database,
    user: user,
    password: password,
    //special mac :
    port: port,
    charset: "utf8mb4", // Définir le jeu de caractères sur utf8mb4
    collation: "utf8mb4_unicode_ci", // Définir la collation sur utf8mb4_unicode_ci
  })
  .then((db) => {
    console.log("connect to BDD, It's OK");
    setInterval(async () => {
      const res = await db.query("SELECT 1");
    }, 10000);

    app.get("/", async (req, res, next) => {
      res.json({ status: 200, msg: "connect to BDD, It's OK" });
    });

    authRoutes(app, db);
    orderRoutes(app, db);
    productRoutes(app, db);
    userRoutes(app, db);
    categoryRoutes(app, db);
    contactRoutes(app, db);
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 9500;
app.listen(PORT, () => {
  console.log(`Connect TO server port : ${PORT}`);
});
