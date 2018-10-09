var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
const cn = {
    host:  process.env.DATABASE_CONNECTION_HOST,
    port: process.env.DATABASE_CONNECTION_PORT,
    database: 'wpsbuilder',
    user: process.env.DATABASE_CONNECTION_USERNAME,
    password: process.env.DATABASE_CONNECTION_PASSWORD
};
var db = pgp(cn);

function getAllModels(req, res, next) {
    db.any('select model_id, data from models')
      .then(function (data) {
          //console.info(data);
        res.status(200)
          .json({
            status: 'success',
            data: data,
            message: 'Retrieved All Models'
          });
      })
      .catch(function (err) {
        return next(err);
      });
  }

  function getModelsByProcess(req, res, next) {
    db.any("select model_id, data from models where lower(data::text)::jsonb->>'descriptions' like lower($1)",['%'+req.params.process+'%'])
      .then(function (data) {
          //console.info(data);
        res.status(200)
          .json({
            status: 'success',
            data: data,
            message: 'Retrieved All Models'
          });
      })
      .catch(function (err) {
        return next(err);
      });
  }

  function insertModel(req,res,next){
    db.tx(t => {
      const q2 = t.one('INSERT INTO models(data) VALUES($1) RETURNING model_id', [req.body]);
      return t.batch([q2]);
    })
    .then(data => {
      //success
      console.info(data);
      res.status(200)
          .json({
            status: 'success',
            data: data,
            message: 'Inserted a model'
          });
    })
    .catch(error => {
      //failure, Rollback
      return next(error);
    });
  }

  function updateModel(req,res,next){
    db.tx(t => {
      const q2 = t.one('UPDATE models SET DATA = $2 WHERE model_id = $1 RETURNING model_id', [req.params.id,req.body]);
      return t.batch([q2]);
    })
    .then(data => {
      //success
      res.status(200)
          .json({
            status: 'success',
            message: 'Updated a model'
          });
    })
    .catch(error => {
      //failure, Rollback
      return next(error);
    });
  }

module.exports = {
  getAllModels: getAllModels,
  getModelsByProcess: getModelsByProcess,
  insertModel: insertModel,
  updateModel: updateModel
};