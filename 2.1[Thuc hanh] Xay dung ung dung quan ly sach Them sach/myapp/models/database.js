const mysql = require('mysql');
const express = require('express');
const app = express();
const PORT = 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password',
    database: 'dbtest',
    charset: 'utf8_general_ci'
});

connection.connect(function (err) {
    if (err) {
        throw err.stack;
    }
    console.log("connect success");
})

app.listen(PORT, () => {
    console.log("Server running on port:" + PORT);
});