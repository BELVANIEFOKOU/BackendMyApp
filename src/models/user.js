const express = require('express');


// const database=require('../database/database');
const mysqlconnection=require('../database/database');

router.get('foo/',(req,res)=>{
  res.send('test')
})
// router.get('/',async(req,res)=>{
//     res.status(200).json({message:'All products'});});
//      router.get('/users',(req,res)=>{
//         mysqlconnection.query('SELECT * FROM compte',(error,rows,fields)=>{
//             if (!error) {
//                 res.json(rows);
//             } else {
//                console.log(error); 
//             }
//         });
//     });
//     router.get('/users/:id',(req,res)=>{
//         const {id}=req.params;
//     mysqlconnection.query('SELECT * FROM compte WHERE id=?',[req.params.id],(error,rows,fields)=>{
        
//     if (!error) {
//         res.json(rows);
//     } else {
//         console.log(error);
//     }
//  })
// })
// router.post('/users',(req,res)=>{
//     const {idCompte,  nomCompte,emailCompte,mdpCompte,telCompte,typeCompte}=req.body;
//     mysqlconnection.query('INSERT INTO compte (idCompte,nomCompte,emailCompte,mdpCompte,telCompte,typeCompte) VALUES (?,?,?,?,?,?)',[idCompte,nomCompte,emailCompte,mdpCompte,telCompte,typeCompte,],(error,rows,fields)=>{
//         if (!error) {
//             res.json({message:'User added successfully'});
//             console.log('inscrit')
//         } else {
//             console.log(error);
//         }
//     });
// });
// router.put('/users/:id',(req,res)=>{
//     const {idCompte,nomCompte,emailCompte,mdpCompte,telCompte,typeCompte }=req.body;
//   console.log(req.body);
//    mysqlconnection.query('UPDATE compte SET nomCompte=?,emailCompte=?,mdpCompte=?,telCompte=?,typeCompte=? WHERE idCompte=?',[idCompte,nomCompte,emailCompte,mdpCompte,telCompte,typeCompte,],(error,rows,fields)=>{
//         if (!error) {
//             res.json({message:'User updated successfully'});
//                 }
//                 else {
//                     console.log(error);
//                 }

//     });
// });
// router.delete('/users/:id',(req,res)=>{
//     const {id}=req.params;
//     mysqlconnection.query('DELETE FROM compte WHERE idCompte=?',[id],(error,rows,fields)=>{
//         if (!error) {
//             res.json({message:'User deleted successfully'});
//         } else {
//             console.log(error);
//         }
//     });
// });
// module.exports = router;
const { check, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const mysqlconnection = require('../database/database');

// router.get('/', (req, res) => {
//     res.status(200).json({message: 'tous les comptes'});
// });
