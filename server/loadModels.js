const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const loadModel = (modelsPath, filename) => {
  const model = require(path.join(modelsPath, filename))(); // eslint-disable-line global-require
  try {
    if (mongoose.models[model.name]) {
      delete mongoose.models[model.name];
    }
    if (mongoose.modelSchemas[model.name]) {
      delete mongoose.modelSchemas[model.name];
    }
    model.mongooseModel = mongoose.model(model.name, model.schema);
  } catch (e) {
    throw new Error(`Error loading model '${model.name}' from '${filename}'`);
  }
  return model;
};

module.exports = (modelsPath) => {
  const models = {};

  fs.readdirSync(modelsPath)
    .filter((name) => /(\.(js)$)/i.test(path.extname(name)))
    .forEach((filename) => {
      models[path.basename(filename, '.js')] = loadModel(modelsPath, filename);
    });

  return models;
};
