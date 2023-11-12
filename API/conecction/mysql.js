const mysql = require('mysql');

const conection = mysql.createConnection({
    host: 'localhost',
    user: 'superAdmin',
    password: 'RoblesFabioElisaErniMiguel',
    database: 'notas'
});

conection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.message);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

module.exports = conection;