var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require("body-parser");
var fs = require('fs');
var morgan = require('morgan');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set('views', path.join(__dirname, '/views'));
app.use(morgan('combined'));
const blog = require('./blog.js');





app.get('/', function(req, res){
    res.render('index')
});

app.get('/index', function(req, res){
    res.render('index')
});


app.get('/blog', async function(req, res){
    let latest_post = await blog.get_latest_post();
    res.render('blog_home', {data:latest_post});
});

app.get('/blog/archive', async function(req, res){
    let blog_data = await blog.get_blog_data();
    res.render('blog_toc', {data:blog_data});
});


app.get('/resume', function(req, res){
    res.render('resume')
});


app.get('/aboutme', function(req, res){
    res.render('aboutme')
});

app.get('/blog/:blogSlug', async function(req, res){
    var blog_datas = await blog.get_blog_data()
    for (var b of blog_datas){
        if (b.slug === req.params.blogSlug) {
            break
        }
    }
    res.render('blog_post', {data:b});
});

app.listen(8080, function() {
    console.log('App listening on port 8080!');
});


