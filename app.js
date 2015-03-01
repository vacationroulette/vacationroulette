var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.config = require('./config.json');
app.api = require('./api/index')(app);

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  if (err) console.log('Error: ' + JSON.parse(err));
});

module.exports = app;
