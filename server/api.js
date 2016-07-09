
const bodyParser = require('body-parser');
const auth = require('./auth');

module.exports = (app, options) => {
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
      res.locals.model.mongooseModel.find().exec((err, results) => {
        res.json(results);
      });
    }
  );

  app.post(
    `${options.basePath}/:model`,
    getModel,
    authenticate,
    (req, res) => {
      const instance = new res.locals.model.mongooseModel(req.body);
      instance.save((err) => {
        if (err) {
          return res.status(400).send(err.message);
        }
        return res.status(200).send(instance.toJSON());
      });
    }
  );

  app.get(
    `${options.basePath}/:model/:id`,
    getModel,
    authenticate,
    (req, res) => {
      res.locals.model.mongooseModel.findById(req.params.id).exec((err, result) => {
        if (err || !result) {
          return res.status(404).send();
        }
        return res.json(result);
      });
    }
  );

  app.post(
    `${options.basePath}/:model/:id`,
    getModel,
    authenticate,
    (req, res) => {
      res.locals.model.mongooseModel.findById(req.params.id).exec((findError, instance) => {
        if (findError || !instance) {
          return res.status(404).send();
        }
        instance.set(req.body);
        return instance.save((saveError) => {
          if (saveError) {
            return res.status(400).send(saveError.message);
          }
          return res.status(200).send(instance.toJSON());
        });
      });
    }
  );
};
