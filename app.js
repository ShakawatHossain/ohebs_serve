var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var login = require('./routes/login');
var registration = require('./routes/registration');
var accessRouter = require('./routes/access');
var event_captureRouter = require('./routes/eventcapture');
var event_verifyRouter = require('./routes/eventverify');
var event_priorInvestigation = require('./routes/eventprior');
var event_Investigation = require('./routes/eventinvestigation');
var user_role = require('./routes/userrole');
var visualpermission = require ('./routes/visualpermission');
var instituterouter = require ('./routes/getins');
var event_listrouter = require ('./routes/event_list');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/public',express.static('public'));

app.use((req,res,next) => {
	// res.append('Access-Control-Allow-Origin',"http://localhost:8080");
  res.append('Access-Control-Allow-Origin','*');
	res.append('Access-Control-Allow-Methods','GET,POST');
	res.append('Access-Control-Allow-Headers','Content-Type,Authorization');
	next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/users/:id', usersRouter);
app.use('/login', login);
app.use('/registration', registration);
app.use('/access', accessRouter);
app.use('/access/:id', accessRouter);
app.use('/event_capture', event_captureRouter);
app.use('/eventverify', event_verifyRouter);
app.use('/eventprior', event_priorInvestigation);
app.use('/eventinvest', event_Investigation);
app.use('/user_role', user_role);
app.use('/visualpermission', visualpermission);
app.use('/getins', instituterouter);
app.use('/event_list', event_listrouter);
app.use('/event_list/:year', event_listrouter);

// instituterouter

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
