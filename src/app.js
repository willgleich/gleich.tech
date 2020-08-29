var express = require('express');
var app = express();
var path = require('path');
//var mysql = require('mysql');
var bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set('views', path.join(__dirname, '/views'));
const router = express.Router({ strict: true })


app.get('/', function(req, res){
    res.render('index')
});



app.get('/index', function(req, res){
    res.render('index')
});


app.get('/blog', function(req, res){
    var data1 = {title: "Homelab Antics",
                body:"            <!-- Post Content -->\n" +
                    "            <p class=\"lead\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus, vero, obcaecati, aut, error quam sapiente nemo saepe quibusdam sit excepturi nam quia corporis eligendi eos magni recusandae laborum minus inventore?</p>\n" +
                    "\n" +
                    "            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut, tenetur natus doloremque laborum quos iste ipsum rerum obcaecati impedit odit illo dolorum ab tempora nihil dicta earum fugiat. Temporibus, voluptatibus.</p>\n" +
                    "\n" +
                    "            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos, doloribus, dolorem iusto blanditiis unde eius illum consequuntur neque dicta incidunt ullam ea hic porro optio ratione repellat perspiciatis. Enim, iure!</p>\n" +
                    "\n" +
                    "            <blockquote class=\"blockquote\">\n" +
                    "                <p class=\"mb-0\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>\n" +
                    "                <footer class=\"blockquote-footer\">Someone famous in\n" +
                    "                    <cite title=\"Source Title\">Source Title</cite>\n" +
                    "                </footer>\n" +
                    "            </blockquote>\n" +
                    "\n" +
                    "            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error, nostrum, aliquid, animi, ut quas placeat totam sunt tempora commodi nihil ullam alias modi dicta saepe minima ab quo voluptatem obcaecati?</p>\n" +
                    "\n" +
                    "            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Harum, dolor quis. Sunt, ut, explicabo, aliquam tenetur ratione tempore quidem voluptates cupiditate voluptas illo saepe quaerat numquam recusandae? Qui, necessitatibus, est!</p>\n",
                date: "2020-08-08"};
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


