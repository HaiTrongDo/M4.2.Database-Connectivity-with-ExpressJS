const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const PORT = 3000;
const indexRouter = require('./routes');
const employeesRouter = require('./routes/employees');
const bodyParser = require("body-parser");
const multer = require("multer");
const mysql = require("mysql");
const app = express();
const fileUpload = require('express-fileupload');

app.use(fileUpload());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/employees', employeesRouter);

//set up view engine
app.use(bodyParser.json());
const upload = multer();
app.set("view engine", "ejs");
app.set("views", "./views");

//send file
app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Password',
        database: 'dbtest',
        charset: 'utf8_general_ci'
    },
    {multipleStatements: true}
);


connection.connect(function (err) {
    if (err) {
        throw err.stack;
    } else {
        console.log("connect success");
        const sqlCreate = `CREATE TABLE IF NOT EXISTS employee (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(40),
                       phone INT,
                       address VARCHAR(255)
                       )`;
        app.get("/register", (req, res) => {
            // res.json("dasd")
            res.render("register")
        })
        app.post("/register", upload.none(), (req, res) => {
            const sqlInsert = "INSERT INTO employee SET ?";
            connection.query(sqlInsert, req.body, function (err, result) {
                if (err) throw err;
                res.render("register");
            });
        });
        connection.query(sqlCreate, function (err, result) {
            if (err) throw err;
            console.log("Create table success");
        });
    }
});

app.get("/employee/list", async (req, res) => {
    let pages = req.query.page > 0 ? req.query.page * 5 : 1;
    const sql = "SELECT * FROM employee LIMIT 5 OFFSET ?";
    const sqlCount = "SELECT COUNT(*) as total from employee;"

    let employeeArray = function () {
        return new Promise((resolve, reject) => {
            connection.query(sql, [pages], function (err, result) {
                if (err) {
                    reject(err.message)
                }
                console.log(result);
                resolve(result)
            })
        });
    }
    let totalEmployee = function () {
        return new Promise((resolve, reject) => {
            connection.query(sqlCount, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                resolve(result)
            })
        })
    }
    let total = await totalEmployee().catch(err =>{throw new Error(err.message)})
    let dataArray = await employeeArray().catch(err =>{throw new Error(err.message)});
    res.render("list", {total:total,employeeList: dataArray});
})


app.listen(PORT, () => {
    console.log("Server running on port:" + PORT);
});


app.post('/upload', function(req, res) {
    let sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.sampleFile;
    uploadPath = __dirname + '/uploadFile/' + sampleFile.name;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
        if (err)
            return res.status(500).send(err);
        res.send('File uploaded!');
    });
});


module.exports = app;
