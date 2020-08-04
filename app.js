var express = require('express');
var app = express();
//var mysql = require('mysql');
var bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
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



// app.post('/api/humio_connect', function(req, res){
//     console.log(req.body);
//     var strbody = JSON.stringify(req.body);
//     var mquri = process.env.rabbit_mq;
//     amqp.connect("amqp://" + mquri, function(error0, connection) {
//         if (error0) {
//             throw error0;
//         }
//         connection.createChannel(function(error1, channel) {
//             if (error1) {
//                 throw error1;
//             }
//             var queue = 'test_hum';
//             var msg = strbody;

//             channel.assertQueue(queue, {
//                 durable: false
//             });

//             channel.sendToQueue(queue, Buffer.from(msg));
//             console.log(" [x] Sent %s", msg);
//         });
//         // setTimeout(function() {
//         //     connection.close();
//         //     process.exit(0);
//         // }, 500);
//     });
//     res.json(req.body);
// });


app.get('/resume', function(req, res){
    res.render('resume')
});


app.get('/aboutme', function(req, res){
    res.render('aboutme')
});

app.listen(8080, function() {
    console.log('App listening on port 8080!');
});


