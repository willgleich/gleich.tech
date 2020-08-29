var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require("body-parser");
var fs = require('fs');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set('views', path.join(__dirname, '/views'));


app.get('/', function(req, res){
    res.render('index')
});



app.get('/index', function(req, res){
    res.render('index')
});


app.get('/blog', function(req, res){
    // read the file async and render the response
    fs.readFile(path.join(__dirname, './public/blog_docs/blog1.md'), 'utf8', function(err, contents) {
        var showdown  = require('showdown'),
            converter = new showdown.Converter(),
            html      = converter.makeHtml(contents);

        var data = {title: "Homelab Antics Part 1",
            body: html,
            date: "2020-08-08"};

        res.render('blog', {data:data});

    });
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


