const mysql = require('mysql');
const SECRET = require('../config');

const conection = mysql.createConnection({
    host: SECRET.HOST,
    user: SECRET.USER,
    password: SECRET.PASSWORD,
    database: SECRET.DATABASE
});

conection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.message);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

module.exports = conection;