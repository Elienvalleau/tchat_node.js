var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var bodyParser = require('body-parser');
var socket = require('socket.io');
var ent = require('ent');
var fs = require('fs');
var session      = require('express-session');
var cookieParser = require('cookie-parser');
var http = require('http').Server(app);


var configDB = require('./config/database.js');

mongoose.connect(configDB.url);

require('./config/passport')(passport);

app.configure(function() {

	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.set('view engine', 'ejs');
	app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());

});

require('./app/routes.js')(app, passport);

/*app.listen(port);
console.log('Connexion au port ' + port);*/

http.listen(8080, function(){
    console.log('Connexion au port 8080');
});


var htmlDirectory = __dirname + '/public';
app.use(express.static(htmlDirectory));

app.use(bodyParser.urlencoded({extended: false}));

var io = socket(http);

io.on('connection', function(socket, pseudo){
    socket.on('nouvel_utilisateur', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouvel_utilisateur', pseudo);
    });

    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message:message});
    });

});