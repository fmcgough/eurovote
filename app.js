
/**
 * Module dependencies.
 */

var express = require('express');
var morgan = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var favicon = require('serve-favicon');
var path = require('path');
var session = require('express-session');

var routes = require('./routes');
var vote = require('./routes/vote');
var models = require('./models');
var signup = require('./routes/signup');
var login = require('./routes/login');
var group = require("./routes/group");
var passport = login.passport;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
// log every request to the console
app.use(morgan('dev'));
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}));
// simulate DELETE and PUT
app.use(methodOverride());

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: "supersupersecret",
	resave: false,
	saveUninitialized: false
}));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.use(passport.initialize());
app.use(passport.session());
// Helper middleware to give easy access to logged in username
app.use(login.locals);

var authenticated = login.authenticated;
// TODO extract into separate router module
app.get('/', authenticated, routes.index);
app.get('/vote', authenticated, vote.display);
app.post('/submit', authenticated, vote.submit);
app.get("/group", authenticated, group.display);
app.post("/group/create", authenticated, group.createValidator, group.create);
app.post("/group/join", authenticated, group.join);

app.get('/signup', signup.display);
app.post('/signup', signup.validator, signup.signup);
app.get("/login", login.display);
app.post("/login", login.login);
app.get("/logout", login.logout);

models.sequelize.sync().then(function() {
	app.listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});
});

exports.app = app;
