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

module.exports.handler = serverless(app);