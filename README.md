# Majera

[![Travis Status](https://travis-ci.org/larixk/storage-api.svg?branch=master)](https://travis-ci.org/larixk/storage-api?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/larixk/storage-api/badge.svg?branch=master)](https://coveralls.io/github/larixk/storage-api?branch=master)


Majera is a spawnable express based rest api which saves to mongodb and validates data based on jsonschema.

`index.js`:

```
const majera = require('majera');

const majeraServer = majera({
  modelsPath: path.join(__dirname, 'models'),
  mongodbUri: 'mongodb://localhost/majera-example',
});

```

`models/message.js`:

```
module.exports = () => ({
  name: 'Message',
  schema: {
    properties: {
      body: {
        required: true,
        type: String,
      },
    },
    required: ['title'],
    type: 'object',
  },
});

```
