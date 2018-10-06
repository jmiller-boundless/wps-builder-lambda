const serverless = require('serverless-http');
const express = require('express')
const app = express()
var db = require('./queries');
const jwt = require('jsonwebtoken');

const jwtMiddleware = (req, res, next) => {
    try {
      let token = req.get('authorization').replace('Bearer ', '');
      let decodedJwt = jwt.decode(token, { complete: true });
      req.jwt = decodedJwt;
      next();
    } catch (err) {
      console.log('Error: unable to decode jwt.');
      console.log(err);
      res.status(500).send('Could\'t decode jwt.');
    }
  }
  
  app.use(express.json({ strict: false }), jwtMiddleware);
  app.disable('x-powered-by');

app.get('/', db.getAllModels);
app.get('/byProcess/:process',db.getModelsByProcess);
app.post('/',db.insertModel);
app.put('/:id',db.updateModel);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status( err.code || 500 )
    .json({
      status: 'error',
      message: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  .json({
    status: 'error',
    message: err.message
  });
});

module.exports.handler = serverless(app);