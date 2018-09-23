const serverless = require('serverless-http');
const express = require('express')
const app = express()
var db = require('./queries');

app.get('/', db.getAllModels);
app.get('/byProcess/:process',db.getModelsByProcess)

module.exports.handler = serverless(app);