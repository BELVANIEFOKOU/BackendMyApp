

const mysql = require('mysql');
const mysqlconnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database',
     port :3000,
});
mysqlconnection.connect(function(error) {
    if (error) {
        console.error('Error connecting to MySQL:', error);
    } else {
        console.log('Connected to database!');
    }
});
module.exports = mysqlconnection;