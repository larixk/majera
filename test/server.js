const path = require('path');
const storage = require('..');
const express = require('express');
const assert = require('chai').assert;
const request = require('supertest');

describe('server', () => {
  it('crashes on boot with invalid models', () => {
    assert.throws(() => {
      storage({
        modelsPath: path.join(__dirname, 'models/invalid'),
        mongodbUri: 'mongodb://localhost/storage-test',
      });
    });
  });

  it('crashes on boot with invalid mongo uri', () => {
    assert.throws(() => {
      storage({
        mongodbUri: 'http://127.0.0.2/storage-test',
      });
    });
  });

  it('can be destroyed immediately', (done) => {
    storage({
      mongodbUri: 'mongodb://localhost/storage-test',
    }).destroy(done);
  });

  it('allows you to bring your own express app', (done) => {
    const app = express();
    const storageServer = storage({
      app,
      callback: () => storageServer.destroy(done),
      mongodbUri: 'mongodb://localhost/storage-test',
    });
  });

  it('allows you to set your own path for urls', (done) => {
    const storageServer = storage({
      basePath: '/testing',
      callback: () => {
        request(storageServer.app())
          .get('/testing')
          .expect(200)
          .end(() => storageServer.destroy(done));
      },
      mongodbUri: 'mongodb://localhost/storage-test',
    });
  });

  it('only needs a working mongodb', (done) => {
    const storageServer = storage({
      mongodbUri: 'mongodb://localhost/storage-test',
    });

    // Use ugly intervals to show it works without using callbacks
    let interval = setInterval(() => {
      if (storageServer.status() !== 'running') {
        return;
      }
      clearInterval(interval);
      storageServer.destroy();
      interval = setInterval(() => {
        if (storageServer.status() !== 'destroyed') {
          return;
        }
        clearInterval(interval);
        done();
      }, 2);
    }, 2);
  });
});
