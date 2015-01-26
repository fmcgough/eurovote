
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var vote = require('./routes/vote');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var nowjs = require('now');
var everyone = nowjs.initialize(server);


everyone.now.update = function(data){
    console.log("Sending update: " + JSON.stringify(data));
    everyone.now.receiveUpdate(data);
}

app.get('/', routes.index);
app.get('/vote', vote.display);
app.post('/submit', vote.submit(everyone.now.update));

