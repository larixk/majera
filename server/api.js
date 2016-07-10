const validate = require('jsonschema').validate;
const bodyParser = require('body-parser');
const auth = require('./auth');
const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;

module.exports = (app, db, options) => {
  const authenticate = auth(app, options.verify);

  const getModel = (req, res, next) => {
    const model = options.models[req.params.model];
    if (!model) {
      return res.status(404).send(`Model '${req.params.model}' not found`);
    }
    res.locals.model = model; // eslint-disable-line no-param-reassign
    return next();
  };

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.get(
    `${options.basePath}`,
    authenticate,
    (req, res) => {
      res.json({
        models: options.models,
      });
    }
  );

  app.get(
    `${options.basePath}/:model`,
    getModel,
    authenticate,
    (req, res) => {
      db.collection(res.locals.model.name).find().toArray((err, results) => {
        res.json(results);
      });
    }
  );

  app.post(
    `${options.basePath}/:model`,
    getModel,
    authenticate,
    (req, res) => {
      if (!validate(req.body, res.locals.model.schema).valid) {
        return res.status(400).send();
      }
      return db.collection(res.locals.model.name).insertOne(
        req.body,
        (err, writeResult) => {
          if (err) {
            return res.status(400).send(err.message);
          }
          return db.collection(res.locals.model.name).findOne(
            { _id: ObjectID(writeResult.insertedId) },
            (findErr, findResult) => {
              if (err || !findResult) {
                return res.status(404).send();
              }
              return res.json(findResult);
            }
          );
        }
      );
    }
  );

  app.get(
    `${options.basePath}/:model/:id`,
    getModel,
    authenticate,
    (req, res) => {
      db.collection(res.locals.model.name).findOne(
        { _id: ObjectID(req.params.id) },
        (err, result) => {
          if (err || !result) {
            return res.status(404).send();
          }
          return res.json(result);
        }
      );
    }
  );

  app.post(
    `${options.basePath}/:model/:id`,
    getModel,
    authenticate,
    (req, res) => {
      if (!validate(req.body, res.locals.model.schema).valid) {
        return res.status(400).send();
      }
      return db.collection(res.locals.model.name).replaceOne(
        { _id: ObjectID(req.params.id) },
        req.body,
        (writeError) => {
          if (writeError) {
            return res.status(400).send(writeError.message);
          }
          return db.collection(res.locals.model.name).findOne(
            { _id: ObjectID(req.params.id) },
            (findErr, findResult) => {
              if (findErr || !findResult) {
                return res.status(404).send();
              }
              return res.json(findResult);
            }
          );
        }
      );
    }
  );
};
