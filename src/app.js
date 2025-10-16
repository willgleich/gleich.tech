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


// Blog home page - shows all posts in card grid
app.get('/blog', async function(req, res){
    let posts = await blog.get_blog_data();
    res.render('blog_home', { posts: posts.reverse() });
});

// Individual blog post page
app.get('/blog/:slug', async function(req, res){
    const slug = req.params.slug;
    const post = await blog.get_blog_post_by_slug(slug);

    if (!post) {
        return res.status(404).send('Blog post not found');
    }

    // Get all posts for "recent posts" sidebar
    const allPosts = await blog.get_blog_data();
    const recentPosts = allPosts.reverse().slice(0, 5).filter(p => p.slug !== slug);

    // Get previous/next posts for navigation
    const adjacentPosts = blog.get_adjacent_posts(slug);

    // Get all tags
    const allTags = blog.get_all_tags();

    res.render('blog_post', {
        post: post,
        recentPosts: recentPosts,
        previousPost: adjacentPosts.previous,
        nextPost: adjacentPosts.next,
        allTags: allTags
    });
});

// Legacy route for old blog page (optional - can be removed if not needed)
app.get('/blog-old', async function(req, res){
    let blog_data = await blog.get_blog_data();
    res.render('blog', {data:blog_data.reverse()});
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


