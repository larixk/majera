const fs = require('fs');
const path = require('path');

const loadModel = (modelsPath, filename) => {
  const model = require(path.join(modelsPath, filename))(); // eslint-disable-line global-require
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
