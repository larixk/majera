const path = require('path');
const express = require('express');
const mongodb = require('mongodb');
const api = require('./api');
const loadModels = require('./loadModels');
const debug = require('debug')('majera:server');

const defaults = {
  basePath: '/majera',
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

const server = (customOptions) => {
  debug('starting');

  const options = combineOptions(customOptions, defaults);

  let db;
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

  const onReady = (err) => {
    debug('server ready');

    status = 'running';
    if (!options.callback) {
      return;
    }
    options.callback(err, app, listener);
  };

  const onMongoConnected = (err, connection) => {
    debug('mongodb connected');

    db = connection;

    if (status === 'destroying') {
      destroy(savedDestroyCallback);
      return;
    }

    if (options.app) {
      app = options.app;
    } else {
      app = express();
    }

    api(app, db, options);

    if (!options.app) {
      listener = app.listen(options.port, onReady);
    } else {
      onReady();
    }
  };


  debug(`connecting to mongo at ${options.mongodbUri}`);
  mongodb.MongoClient.connect(options.mongodbUri, onMongoConnected);

  return {
    app: () => app,
    destroy,
    status: () => status,
  };
};

module.exports = server;
