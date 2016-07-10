const path = require('path');
const majera = require('..');
const express = require('express');
const assert = require('chai').assert;
const request = require('supertest');

describe('server', () => {
  it('crashes on boot with invalid mongo uri', () => {
    assert.throws(() => {
      majera({
        mongodbUri: 'http://127.0.0.2/majera-test',
      });
    });
  });

  it('can be destroyed immediately', (done) => {
    majera({
      mongodbUri: 'mongodb://localhost/majera-test',
    }).destroy(done);
  });

  it('allows you to bring your own express app', (done) => {
    const app = express();
    const majeraServer = majera({
      app,
      callback: () => majeraServer.destroy(done),
      mongodbUri: 'mongodb://localhost/majera-test',
    });
  });

  it('allows you to set your own path for urls', (done) => {
    const majeraServer = majera({
      basePath: '/testing',
      callback: () => {
        request(majeraServer.app())
          .get('/testing')
          .expect(200)
          .end(() => majeraServer.destroy(done));
      },
      mongodbUri: 'mongodb://localhost/majera-test',
    });
  });

  it('only needs a working mongodb', (done) => {
    const majeraServer = majera({
      mongodbUri: 'mongodb://localhost/majera-test',
    });

    // Use ugly intervals to show it works without using callbacks
    let interval = setInterval(() => {
      if (majeraServer.status() !== 'running') {
        return;
      }
      clearInterval(interval);
      majeraServer.destroy();
      interval = setInterval(() => {
        if (majeraServer.status() !== 'destroyed') {
          return;
        }
        clearInterval(interval);
        done();
      }, 2);
    }, 2);
  });
});
