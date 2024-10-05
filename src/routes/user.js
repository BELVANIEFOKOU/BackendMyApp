const express = require("express");
const router = express.Router();
const mysqlconnection = require('../database/database');
const bcrypt = require('bcrypt');
const { check, validationResult } = require("express-validator");

router.post("/", [
  check("idAgent")
  .trim()
  .notEmpty()
  .withMessage("L'id ne doit pas etre vide")
  ,
  
   check("nomCompte")
   .trim()
   .notEmpty()
   .withMessage("Le nom ne doit pas etre vide"),
 
   check("emailCompte")
     .trim()
     .notEmpty()
     .withMessage("Le champ email ne doit pas etre vide")
     .isEmail()
     .withMessage("Veuillez rentrer un Email conforme"),
 
     check('mdpCompte')
     .trim()
     .notEmpty()
     .withMessage('Le mot de passe ne peut pas etre vide')
     .isLength({min : 8})
     .withMessage('Le mot de passe doit avoir minimum 8 caracteres')
     .matches(/[A-Z]/)
     .withMessage('Votre mot de passe doit contenir au moins une lettre majuscule')
     .matches(/[0-9]/)
     .withMessage('Votre mot de passe doit comporter au moins un chiffre')
     .matches(/[!@#$%^&*]/)
     .withMessage('Votre mot de passe doit avoir au moins un caractere specail'),
 
     check("telCompte")
     .trim()
     .notEmpty()
     .withMessage("Le telephone ne doit pas etre vide"),

     check("typeCompte")
     .trim()
     .notEmpty()
     .withMessage("ne doit pas etre vide"),
 
 ], async(req, res) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({inscrit: false, errors: errors.array()});
   }

   try {
     const hashedPassword = await bcrypt.hash(req.body.mdpCompte, 10);
     const sql = 'INSERT INTO compte(nomCompte, emailCompte, mdpCompte, telCompte, typeCompte) VALUES (?, ?, ?, ?, ?)';
    var valeur = [
       req.body.nomCompte,
       req.body.emailCompte,
       hashedPassword,
       req.body.telCompte,
       req.body.typeCompte,
     ];

    mysqlconnection.query(sql, valeur, (err, data) => {
       if (err) {
         console.error('Database error:', err);
         return res.status(500).json({ inscrit: false, message: 'Database error' });
       }
       res.status(201).json({ inscrit: true });
     });
   } catch (error) {
     console.error('Server error:', error);
     res.status(500).json({ inscrit: false, message: 'Server error' });
   }
 });

module.exports = router;


