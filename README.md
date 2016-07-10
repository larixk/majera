# Majera

MongoDB And JSON Schema in an Express-based Rest Api

[![Travis Status](https://travis-ci.org/larixk/storage-api.svg?branch=master)](https://travis-ci.org/larixk/storage-api?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/larixk/storage-api/badge.svg?branch=master)](https://coveralls.io/github/larixk/storage-api?branch=master)

Majera is a spawnable express-based rest api which saves to mongodb and validates data based on jsonschema. Install it through `npm install majera`.

## Options

All options are optional. These are all options with their defaults:

```
const majera = require('majera');

const options = {
  app: null,                           // Bring your own express app, or Majera will create and launch one
  basePath: '/majera',                 // Base path for all public urls
  callback: null                       // Function called when server is ready
  models: {},                          // A javascript object with models as values. See models below.
  modelsPath: null                     // Path to folder containing models, each in their own module file. See models below.
  mongodbUri: process.env.MONGODB_URI, // A working MongoDB
  port: process.env.PORT || 3000,      // Port for express to use, not used if you bring your own express app
  verify: null,                        // Verify function to be used in basic auth
};

const majeraServer = majera(options);
```

## Models

Models can be provided in their own folder. Each in their own module file. Modules should be javascript objects and should look somewhat like this:

`models/message.js`:

```
module.exports = () => ({
  // Pretty name
  name: 'Message',

  // JSON Schema definition
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
