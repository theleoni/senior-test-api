const express = require('express');
const bodyParser = require('body-parser');
const load = require('express-load');
const logger = require('morgan');

const app = express();

// initialize PG-PROMISE instance to use in future's DB PostgreSql connections
require("./app/infra/connectionFactory").initDb();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// configure routes and db connections
load('routes', {cwd: 'app'})
.then('infra')
.into(app);

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
