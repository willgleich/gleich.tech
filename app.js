var express = require('express');
var app = express();
//var mysql = require('mysql');
var bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true})
);
app.use(express.static(__dirname + "/public"));


app.get('/', function(req, res){
    res.render('construct')
})


app.get('/random', function(req, res){
    var num = Math.floor((Math.random()*10)+1)
    res.send(String(num))
});

app.get('/index', function(req, res){
    res.render('index')
})



app.listen(8080, function() {
    console.log('App listening on port 8080!');
});


// console.log(faker.internet.email())

//var connection = mysql.createConnection ({
//    host    : 'localhost',
//    user    : 'd3fn',
//    database: 'join_us'
//});
//
//app.get("/", function (req, res){
//    var q = "SELECT COUNT(*) as count FROM users";
//    connection.query(q, function(err, results){
//        if(err) throw err;
//        var count= results[0].count
//        // res.send("We have "+ count + " users in our DB");
//        res.render("home", {data:count});
//    });
//});

//app.post("/register", function(req, res){
//
//    console.log(req.body.email)
//    var em = {email: req.body.email}
//    var q = "INSERT INTO users SET ?"
//    connection.query(q, em, function(err, results){
//        if(err) throw err;
//        res.redirect("/")
//    });
//
//});


