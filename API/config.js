require('dotenv').config()

const PORT = process.env.PORT
const CLAVE_ENCRIPTADO = process.env.CLAVE_ENCRIPTADO
const SECRETKEY = process.env.SECRETKEY
const HOST = process.env.HOST
const USER = process.env.DB_USER
const PASSWORD = process.env.PASSWORD
const DATABASE = process.env.DATABASE

module.exports = {
    PORT,
    CLAVE_ENCRIPTADO,
    SECRETKEY,
    HOST,
    USER,
    PASSWORD,
    DATABASE
}