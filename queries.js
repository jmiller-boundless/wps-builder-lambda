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
    db.any('select data from models')
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
    db.any("select data from models where lower(data::text)::jsonb->>'descriptions' like $1",['%'+req.params.process+'%'])
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

module.exports = {
  getAllModels: getAllModels,
  getModelsByProcess: getModelsByProcess
};