let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require('body-parser');
// let session = require('express-session');
let token = require('./util/token');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let apiRouter = require('./routes/api');

let app = express();

app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "http://localhost:8080");
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Auth-Token");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("Content-Type", "application/json;charset=utf-8");
	res.header("Access-Control-Allow-Credentials", true);
	next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({
//     secret: 'sessionKey',
//     resave: true,
//     saveUninitialized: false,
//     cookie: {
//       maxAge : 1000 * 60 * 3,
//     },
// }));

// app.use((req, res, next) => {
// 	// if (!req.session.user) {
// 	// 	res.json({
// 	// 		code: 0,
// 	// 		msg: '登录过期，请重新登录',
// 	// 		result: false
// 	// 	});
// 	// }
// 	next();
// });
 
app.use((req, res, next) => {
	console.log(req.get('Auth-Token'));
	// res.json({
	// 	code: 0,
	// 	msg: '登录过期，请重新登录',
	// 	result: false,
	// 	token: tokenStr
	// });
	next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
