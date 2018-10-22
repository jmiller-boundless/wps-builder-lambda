var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise,
  query(e) {
    console.log(e.query);
  }
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
pgp.pg.types.setTypeParser(20, parseInt); //big int is parsed as int due to row count coming back as bigint

function getAllModels(req, res, next) {
  var offset = typeof req.query.offset  !== 'undefined' ?  req.query.offset  : 0;
  var limit = typeof req.query.limit  !== 'undefined' ?  req.query.limit  : 99999999999999;
    db.any("select model_id, data, count(*) OVER() AS full_count from models "
    +"ORDER BY to_timestamp(data->'metadata'->>'updated','YYYY-MM-DDTHH:MI:SS.MS') DESC OFFSET $1 LIMIT $2 ",
    [parseInt(offset,10),parseInt(limit,10)])
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

  function getModelsByMetadata(req, res, next) {
    var offset = typeof req.query.offset  !== 'undefined' ?  req.query.offset  : 0;
    var limit = typeof req.query.limit  !== 'undefined' ?  req.query.limit  : 99999999999999;
    var keyword = req.params.keyword !='*' ? req.params.keyword : "";
    db.any("select model_id, data, count(*) OVER() AS full_count from models where lower(data::text)::jsonb->'metadata'->>'title' like lower($1) "+
    "or lower(data::text)::jsonb->'metadata'->>'abstract' like lower($1) "+ 
    "or lower(data::text)::jsonb->'metadata'->>'keywords' like lower($1)"+ 
    "ORDER BY to_timestamp(data->'metadata'->>'updated','YYYY-MM-DDTHH:MI:SS.MS') DESC OFFSET $2 LIMIT $3",
    ['%'+keyword+'%',parseInt(offset,10),parseInt(limit,10)])
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

  function deleteModel(req,res,next){
    db.tx(t => {
      const q2 = t.one('DELETE from models WHERE model_id = $1 RETURNING model_id', [req.params.id]);
      return t.batch([q2]);
    })
    .then(data => {
      //success
      res.status(200)
          .json({
            status: 'success',
            message: 'Deleted a model'
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
  getModelsByMetadata: getModelsByMetadata,
  insertModel: insertModel,
  updateModel: updateModel,
  deleteModel: deleteModel
};