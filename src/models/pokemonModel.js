const mysql = require('mysql');
const fs = require('fs');
const path = require("path");
const waitPort = require('wait-port');

let con;

async function init() {
    const host = process.env.MYSQL_HOST
    con = mysql.createConnection({
        host,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB,
        multipleStatements: true
    });

    await waitPort({ host, port : 3306});

    con.connect((error) => {
        if(error) {
            console.log('Error connecting to DB');
            return;
        }
        console.log('Connection established');
    });

    const sql = fs.readFileSync(path.join(__dirname, '/init_db.sql')).toString();
    await con.query(sql, (error, results) => {
        if (error) {
            throw error;
        } else {
            console.log('DB initialized.')
        }
    });
}

async function teardown() {
    await con.end((error, result) => {
        if (error) {
            throw error;
        } else {
            console.log('Disconnected from DB');
        }
    });
}

module.exports = {
    init,
    teardown
};