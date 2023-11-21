const sql = require('mssql');
const dotenv = require('dotenv').config().parsed;

const sqlConfig = {
    user: dotenv.DATABASE_USER,
    password: dotenv.DATABASE_PWD,
    server: dotenv.DATABASE_SERVER,
    database: dotenv.DATABASE_DATA,
    trustServerCertificate: true,
};

module.exports = sqlConfig;

sql.connect(sqlConfig, function (err) {
    if (err) console.log(err);
    else {
        console.log("Kết nối database thành công !");
    };
});