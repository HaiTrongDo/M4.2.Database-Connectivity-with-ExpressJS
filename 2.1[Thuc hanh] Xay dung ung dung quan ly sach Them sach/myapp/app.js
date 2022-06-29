const mysql = require('mysql');
const multer = require('multer');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const PORT = 5000;

app.use(bodyParser.json());
const upload = multer();
app.set("view engine", "ejs");
app.set("views", "./views");


app.listen(PORT, () => {
    console.log("Server running on port:" + PORT);
});


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
    } else {
        console.log("connect success");
        const sqlCreate = `CREATE TABLE IF NOT EXISTS books (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(255),
                       price INT,quantity INT,
                       author VARCHAR(255)
                       )`;
        app.get("/create", (req, res) => {
            res.render("create")
        })
        app.post("/book/create", upload.none(), (req, res) => {
            const {name, price, quantity, author} = req.body;
            const sqlInsert = "INSERT INTO books (name, price, quantity, author) VALUES ?";
            const value = [
                [name, price, quantity, author]
            ];
            connection.query(sqlInsert, [value], function (err, result) {
                if (err) throw err;
                res.render("success");
            });
        });

        connection.query(sqlCreate, function (err, result) {
            if (err) throw err;
            console.log("Create table success");
        });
    }
});