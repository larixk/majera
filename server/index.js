const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const api = require('./api');
const loadModels = require('./loadModels');

const defaults = {
  basePath: '/storage',
  models: {},
  mongodbUri: process.env.MONGODB_URI,
  port: process.env.PORT || 3000,
  public: path.join(__dirname, 'public'),
};

const combineOptions = (customOptions, defaultOptions) => {
  const options = Object.assign({}, defaultOptions, customOptions);

  if (options.modelsPath) {
    options.models = Object.assign({}, options.models, loadModels(options.modelsPath));
  }

  return options;
};

const connectToMongodb = (uri) => {
  mongoose.connect(uri);
  const db = mongoose.connection;
  db.once('error', () => {
    throw new Error(`Could not connect to  MongoDB at '${uri}'`);
  });
  return db;
};

const server = (customOptions) => {
  const options = combineOptions(customOptions, defaults);

  const db = connectToMongodb(options.mongodbUri);

  let listener;
  let app;

  let status = 'starting';

  let savedDestroyCallback;

  const destroy = (callback) => {
    if (status === 'starting') {
      savedDestroyCallback = callback;
      status = 'destroying';
      return;
    }
    db.close();
    if (listener) {
      listener.close();
    }
    status = 'destroyed';
    if (callback) {
      callback();
    }
  };

  const ready = (err) => {
    status = 'running';
    if (!options.callback) {
      return;
    }
    options.callback(err, app, listener);
  };

  const startApp = () => {
    if (status === 'destroying') {
      destroy(savedDestroyCallback);
      return;
    }

    if (options.app) {
      app = options.app;
    } else {
      app = express();
    }

    api(app, options);

    if (!options.app) {
      listener = app.listen(options.port, ready);
    } else {
      ready();
    }
  };

  db.once('open', startApp);

  return {
    app: () => app,
    destroy,
    status: () => status,
  };
};

module.exports = server;
