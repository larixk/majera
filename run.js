const path = require('path');

require('./index.js')({
  modelsPath: path.join(__dirname, 'test/models'),
});
