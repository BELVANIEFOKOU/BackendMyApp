// Importation du module session pour la gestion des sessions et envoi des cookies
const session = require("express-session");
// Syntaxe par defaut de l'importation d'un store mysql pour express-session
const MySQLStore = require("express-mysql-session")(session);
const mysql = require("mysql");
const { check, validationResult } = require("express-validator");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const port = 3000;
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
// Autoriser les requetes venant d'autres sources(par example flutter)
app.use(cors());
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
      const sql =
        "INSERT INTO compte(idCompte, emailCompte, mdpCompte,  typeCompte) VALUES (?,?, ?, ?)";
      var valeur = [
        uuid,
        //  req.body.nomCompte,
        req.body.emailCompte,
        hashedPassword,
        //  req.body.telCompte,
        req.body.typeCompte,
      ];
      mysqlconnection.query(sql, valeur, (err, data) => {
        if (err) {
          res.json({ inscrit: false, ...err });
        } else {
          // checking and creating sub
          const nom = req.body.nom;
          const telephone = req.body.telephone;
          if (req.body.typeCompte === "particulier") {
            console.log("Particulier ahead");
            const sql =
              "INSERT INTO particulier (id, nom, telephone) VALUES (?,?,?)";
            const valeur = [uuid, nom, telephone];
            mysqlconnection.query(sql, valeur, (err, data) => {
              if (err) {
                res.json({ inscrit: false, ...err });
              } else {
                console.log("Bienvenue" + nom);
                res.json(data);
              }
            });
          }
          const cniAgent = req.body.cniAgent;
          const villeAgent = req.body.villeAgent;
          const businessRegistrationNumber =
            req.body.businessRegistrationNumber;
          if (req.body.typeCompte === "agent") {
            console.log("agent ahead");
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
                console.log("Bienvenue agent" + nom);
                res.json(data);
              }
            });
          }
          // res.json({ inscrit: true });
        }
      });
    }
  }
);

//  connexion
// app.post("/connexion", (req, res) => {
//   const sql = `SELECT * FROM compte WHERE emailCompte = ?`;
//   const valeur = [req.body.emailCompte];
//   console.log(req.body.emailCompte);
//   mysqlconnection.query(sql, valeur, async (err, data) => {
//     if (err) {
//       res.json({ connected: false, msg: `erreur sur le serveur` });
//     } else {
//       if (data.length > 0) {
//         // Comparer le mot de passe entré avec le mot de passe haché
//         const isPasswordValid = await bcrypt.compare(req.body.mdpCompte, data[0].mdpCompte);
//         console.log(req.body.mdpCompte);
//         if (isPasswordValid) {
//           req.session.nomCompte = data[0].nomCompte;

//           res.json({ connected: true, msg: `bienvenue sur la plateforme` });
//         } else {
//           res.json({
//             connected: false,
//             msg: `veuillez verifier vos informations`,
//           });
//         }
//       } else {
//         res.json({
//           connected: false,
//           msg: `veuillez verifier vos informations`,
//         });
//       }
//     }
//   });
// });
app.post("/connexion", (req, res) => {
  const sql = `SELECT * FROM compte WHERE emailCompte = ?`;
  const valeur = [req.body.emailCompte];
  console.log(sql, valeur);
  console.log(req.body.emailCompte);
  console.log(req.body.mdpCompte);

  mysqlconnection.query(sql, valeur, async (err, data) => {
    if (err) {
      console.log(err);
      res.json({ connected: false, msg: `erreur sur le serveur` });
    } else {
      console.log(data);
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
app.post("/deconnexion", (req, res) => {
  // req.session.destroy()
  // req.session.destroy() supprime uniquement la session sans supprimer le cookie
  req.session.destroy((err) => {
    if (err) {
      console.log(`Deconnexion Echoué`);
    } else {
      res.clearCookie("session_cookie");
      res.json({ deconnecté: true, msg: "Vous avez été deconnecté" });
    }
  });
});

// code de l'ajout

// Create (Add) function
app.post("/ajouterPropriete", async (req, res) => {
  const propriete = req.body;
  try {
    const checkQuery = `SELECT * from propriete WHERE libellePropriete=?`;
    mysqlconnection.query(
      checkQuery,
      // [propriete.libellePropriete],
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

  console.log(sql);
  // Envoi de la requette a la BD
  mysqlconnection.query(sql, (err, data) => {
    err ? res.json(err) : res.json(data);
  });
});
// recherche selective

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
// app.get("/rechercheLogement2", async (req, res) => {
//   console.log(req.params);
//   try {
//     const { villePropriete } = req.params;
//     const { quartierPropriete, prixPropriete, statutPropriete } = req.query;

//     let sql = "SELECT * FROM propriete WHERE quartierPropriete='valeur22'";
//     const values = [];

//     // if (villePropriete) {
//     //   sql += ` AND villePropriete LIKE ?`;
//     //   values.push(`%${villePropriete}%`);
//     // }
//     // if (quartierPropriete) {
//     //   sql += " AND quartierPropriete LIKE ?";
//     //   values.push(`%${quartierPropriete}%`);
//     // }
//     // if (prixPropriete) {
//     //   sql += " AND prixPropriete <= ?";
//     //   values.push(prixPropriete);
//     // }
//     // // if (superficiePropriete) {
//     // //   sql += " AND superficiePropriete >= ?";
//     // //   values.push(superficiePropriete);
//     // // }
//     // if (statutPropriete) {
//     //   sql += " AND statutPropriete = ?";
//     //   values.push(statutPropriete);
//     // }

//     console.log("SQL:", sql);
//     console.log("Values:", values);

//     const results = mysqlconnection.query(sql, values);

//     console.log("le résultat est: ", results);

//     mysqlconnection.query(sql, values, async (err, data) => {
//       if (err) {
//         res.json({ recherche: false, msg: `erreur sur le serveur` });
//       } else {
//         if (data.length > 0) {
//           res.json({ recherche: true, msg: `recheche effectué avec succès` });
//         }
//       }
//     });
//     // if (results[0].length === 0) {
//     //   //<- ici results n'est pas un tableau/array et n'a donc pas d'attribut length
//     //   //Regarde la valeur de results(qui est probablement un objet et cherche si il ya un tableau dedans)
//     //   res.status(404).json({ message: "Aucun logement trouvé" });
//     // } else {
//     //   res.status(200).json(results);
//     // }
//   } catch (error) {
//     console.error("Erreur lors de la recherche de logements:", error);
//     res
//       .status(500)
//       .json({ message: "Erreur lors de la recherche de logements" });
//   }
// });

app.use("/uss", async (req, res) => {
  console.log("USS HERE");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
