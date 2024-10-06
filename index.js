const express = require("express");
const session = require("express-session");
const { check, validationResult } = require("express-validator");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const MySQLStore = require("express-mysql-session")(session);

const app = express();
app.use(cors());

const port = 3000;

const mysqlconnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "database",
});

mysqlconnection.connect(function (error) {
  if (error) {
    console.error("Error connecting to MySQL:", error);
  } else {
    console.log("connecté à la base de données MySQL");
  }
});
const sessionStore = new MySQLStore({}, mysqlconnection);
app.use(express.json());
app.use(
  session({
    key: "session_cookie",
    secret: "secret",
    store: sessionStore,
    // resave : 'false', pour eviter de creer des sessions apres chaque requette
    resave: false,
    // Pour eviter de stocker des sessions vides
    saveUninitialized: false,
    cookie: {
      // secure : false car nous utilisons le protocole http et non https.Mais il faudra le mettre a true lors de la phase dde production
      secure: false,
      // Empeche le cross site scripting attac (XXS)
      httpOnly: true,
      // Temps d'expiration, une journée
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ========================== REGISTER USER ENDPOINT.

app.post(
  "/inscription",
  [
    check("nom").trim().notEmpty().withMessage("Le nom ne doit pas etre vide"),

    check("emailCompte")
      .trim()
      .notEmpty()
      .withMessage("Le champ email ne doit pas etre vide")
      .isEmail()
      .withMessage("Veuillez rentrer un Email conforme"),

    check("mdpCompte")
      .trim()
      .notEmpty()
      .withMessage("Le mot de passe ne peut pas etre vide")
      .isLength({ min: 8 })
      .withMessage("Le mot de passe doit avoir minimum 8 caracteres")
      .matches(/[A-Z]/)
      .withMessage(
        "Votre mot de passe doit contenir au moins une lettre majuscule"
      )
      .matches(/[0-9]/)
      .withMessage("Votre mot de passe doit comporter au moins un chiffre")
      .matches(/[!@#$%^&*]/)
      .withMessage(
        "Votre mot de passe doit avoir au moins un caractere specail"
      ),

    check("telephone")
      //  .trim()
      .notEmpty()
      .withMessage("Le telephone ne doit pas etre vide"),

    check("villeAgent")
      //  .trim()
      .notEmpty(),

    check("cniAgent")
      //  .trim()
      .notEmpty()
      .withMessage("Le numero de cni ne doit pas etre vide"),
    check("businessRegistrationNumber")
      //  .trim()
      .notEmpty()
      .withMessage("Le businessRegistrationNumber  ne doit pas etre vide"),

    check("typeCompte").trim().notEmpty().withMessage("selection enregistré"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ inscrit: false, ...errors });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.mdpCompte, 10);
      const uuid = uuidv4();
      // Creating basic raw account
      const sql =
        "INSERT INTO compte(idCompte, emailCompte, mdpCompte,  typeCompte) VALUES (?,?, ?, ?)";
      var valeur = [
        uuid,
        req.body.emailCompte,
        hashedPassword,
        req.body.typeCompte,
      ];
      mysqlconnection.query(sql, valeur, (err, data) => {
        if (err) {
          res.json({ inscrit: false, ...err });
        } else {
          // Checking If Raw Account Is Present And Creating Sub With These Information
          const nom = req.body.nom;
          const telephone = req.body.telephone;
          // Checking If User Want To Create A Particular Account
          if (req.body.typeCompte === "particulier") {
            const sql =
              "INSERT INTO particulier (id, nom, telephone) VALUES (?,?,?)";
            const valeur = [uuid, nom, telephone];
            mysqlconnection.query(sql, valeur, (err, data) => {
              if (err) {
                res.json({ inscrit: false, ...err });
              } else {
                console.log("Welcome Particular Account ->" + nom);
                res.json({inscrit: true, ...data});
              }
            });
          }
          const cniAgent = req.body.cniAgent;
          const villeAgent = req.body.villeAgent;
          const businessRegistrationNumber =
            req.body.businessRegistrationNumber;
          // If it's Agent Account
          if (req.body.typeCompte === "agent") {
            const sql =
              "INSERT INTO agent (id, nom, telephone,cniAgent,villeAgent,businessRegistrationNumber) VALUES (?,?,?,?,?,?)";
            const valeur = [
              uuid,
              nom,
              telephone,
              cniAgent,
              villeAgent,
              businessRegistrationNumber,
            ];
            mysqlconnection.query(sql, valeur, (err, data) => {
              if (err) {
                res.json({ inscrit: false, ...err });
              } else {
                console.log("Welcome Profile Agent" + nom);
                res.json({inscrit: true, ...data});
              }
            });
          }
          res.json({ inscrit: false });
        }
      });
    }
    res.json({ inscrit: false });
  }
);

// ======================== CONNEXION ENDPOINT.

app.post("/connexion", (req, res) => {
  const sql = `SELECT * FROM compte WHERE emailCompte = ?`;
  const valeur = [req.body.emailCompte];

  mysqlconnection.query(sql, valeur, async (err, data) => {
    if (err) {
      res.json({ connected: false, msg: `erreur sur le serveur` });
    } else {
      if (data.length > 0) {
        const isPasswordValid = await bcrypt.compare(
          req.body.mdpCompte,
          data[0].mdpCompte
        );
        console.log("mot de passes:", req.body.mdpCompte, data[0].mdpCompte);
        console.log(isPasswordValid);
        if (!isPasswordValid) {
          req.session.nomCompte = data[0].nomCompte;
          res.json({ connected: true, msg: `bienvenue sur la plateforme` });
        } else {
          res.json({
            connected: false,
            msg: `veuillez verifier vos informations entrées`,
          });
        }
      } else {
        res.json({
          connected: false,
          msg: `veuillez verifier vos informations`,
        });
      }
    }
  });
});

app.get("/", (req, res) => {
  console.log(req.session);
  if (req.session.username) {
    res.json({ authorisé: true });
    console.log(`L'usager est autorisé`);
  } else {
    res.json({ authorisé: false, msg: `Veuillez verifier vos Informations` });
    console.log(`il doit d'abord se connecter`);
  }
});

// ========================== DISCONNECTING USER ENDPOINT.
app.post("/deconnexion", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(`Deconnexion Echoué`);
    } else {
      res.clearCookie("session_cookie");
      res.json({ deconnecté: true, msg: "Vous avez été deconnecté" });
    }
  });
});

// ============================ SET NEW PROPRIETIE ENDPOINT ROUTE.
app.post("/ajouterPropriete", async (req, res) => {
  const propriete = req.body;
  try {
    const checkQuery = `SELECT * from propriete WHERE libellePropriete=?`;
    mysqlconnection.query(
      checkQuery,
      [req.body.libellePropriete],
      (err, data) => {
        let count = data.length;
        console.log("Résultat brut de la vérification:", data);
        console.log("Nombre de propriétés trouvées:", count);

        if (count > 0) {
          console.log({ message: "Cette propriété existe déjà" });
          return res.json({ message: "Cette propriété existe déjà" });
        } else {
          const insertQuery = `
      INSERT INTO propriete (libellePropriete,typePropriete,
        prixPropriete, quartierPropriete, villePropriete, superficiePropriete,
        etatPropriete, statutPropriete, imagePropriete
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

          const values = [
            propriete.libellePropriete,
            propriete.typePropriete,
            propriete.prixPropriete,
            propriete.quartierPropriete,
            propriete.villePropriete,
            propriete.superficiePropriete,
            propriete.etatPropriete,
            propriete.statutPropriete,
            propriete.imagePropriete,
          ];
          const result = mysqlconnection.query(insertQuery, values);
          const insertId = result && result.insertId ? result.insertId : null;
          return res.json({
            message: "Propriété ajoutée avec succès",
            id: insertId,
          });
        }
      }
    );

    console.log("Libelle vérifié:", req.body.libellePropriete);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la propriété:", error);
    res.json({
      message: "Erreur lors de l'ajout de la propriété",
      error: error.message,
    });
  }
});

app.get("/rechercheLogement", (req, res) => {
  const sql = `SELECT * FROM propriete  WHERE quartierPropriete='valeur20 ' `;

  mysqlconnection.query(sql, (err, data) => {
    err ? res.json(err) : res.json(data);
  });
});

// ============================ SEARCHING LOGMENT ENDPOINT ROUTE.
app.get("/rechercheLogement2", async (req, res) => {
  try {
    const { villePropriete } = req.query;
    const { quartierPropriete, prixPropriete, typePropriete, statutPropriete } = req.query;

    let sql = "SELECT * FROM propriete WHERE 1=1";
    const values = [];

    if (villePropriete) {
      sql += " AND villePropriete LIKE ?";
      values.push(`%${villePropriete}%`);
    }
    if (quartierPropriete) {
      sql += " AND quartierPropriete LIKE ?";
      values.push(`%${quartierPropriete}%`);
    }
    if (prixPropriete) {
      sql += " AND prixPropriete <= ?";
      values.push(prixPropriete);
    }
    if (typePropriete) {
      sql += " AND typePropriete = ?";
      values.push(typePropriete);
    }
    if (statutPropriete) {
      sql += " AND statutPropriete = ?";
      values.push(statutPropriete);
    }

    console.log("SQL:", sql);
    console.log("Values:", values);

    mysqlconnection.query(sql, values, async (err, data) => {
      if (err) {
        res.json({ recherche: false, msg: `erreur sur le serveur` });
      } else {
        if (data.length > 0) {
          res.json({ recherche: true, msg: `recherche effectué avec succès`, data });
        } else {
          res.json({ recherche: false, msg: `Aucun logement trouvé` });
        }
      }
    });
  } catch (error) {
    console.error("Erreur lors de la recherche de logements:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche de logements" });
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
