var express = require('express');
var app = express();
//var mysql = require('mysql');
// var bodyParser = require("body-parser");
app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));


app.get('/', function(req, res){
    res.render('construct')
});



app.get('/index', function(req, res){
    res.render('index')
});


app.get('/blog', function(req, res){
    var data1 = {title: "Coming soon to a browser near you...", body:"First Blog Post"};
    res.render('blog', {data:data1});
});

app.get('/resume', function(req, res){
    res.render('resume')
});


app.get('/aboutme', function(req, res){
    res.render('aboutme')
});

app.listen(8080, function() {
    console.log('App listening on port 8080!');
});


