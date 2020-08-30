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
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

 async function get_blog_data(filename) {

     const contents = await readFile(path.join(__dirname, './public/blog_docs/' + filename),'utf8');
     const showdown = require('showdown'),
         converter = new showdown.Converter(),
         html = await converter.makeHtml(contents);
     const file_stat = await stat(path.join(__dirname, './public/blog_docs/' + filename),'utf8');
     return {
         title: "Homelab Antics Part 1",
         body: html,
         date: formatDate(file_stat.mtime)
     };
}

app.get('/', function(req, res){
    res.render('index')
});



app.get('/index', function(req, res){
    res.render('index')
});


app.get('/blog', async function(req, res){
    blog_data = await get_blog_data("blog1.md");
    res.render('blog', {data:blog_data});
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


