
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

var routes = require('./routes');
var vote = require('./routes/vote');
var models = require('./models');

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

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/', routes.index);
app.get('/vote', vote.display);
app.post('/submit', vote.submit);

models.sequelize.sync().then(function() {
	app.listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});
});

exports.app = app;
