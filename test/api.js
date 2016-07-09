const path = require('path');
const storage = require('..');
const assert = require('chai').assert;
const request = require('supertest');

describe('api', () => {
  let storageServer;

  before((done) => {
    storageServer = storage({
      callback: done,
      modelsPath: path.join(__dirname, 'models/valid'),
      mongodbUri: 'mongodb://localhost/storage-test',
    });
  });

  after((done) => storageServer.destroy(done));

  // List models

  it('shows all models when authenticated', (done) => {
    request(storageServer.app())
      .get('/storage')
      .expect(200)
      .expect((res) => {
        assert.isObject(res.body.models.message, 'Message model is available');
      })
      .end(done);
  });

  // List instances

  it('returns a 404 when getting non existing models', (done) => {
    request(storageServer.app())
      .get('/storage/unicorns')
      .expect(404)
      .end(done);
  });

  let messageCount;

  it('lists instances of a model', (done) => {
    request(storageServer.app())
      .get('/storage/message')
      .expect(200)
      .expect((res) => {
        assert.isArray(res.body);
        messageCount = res.body.length;
      })
      .end(done);
  });

  // Create

  let lastMessageId;

  it('creates models', (done) => {
    request(storageServer.app())
      .post('/storage/message')
      .send({ title: 'test' })
      .expect(200)
      .expect((res) => {
        assert.isObject(res.body, 'Message is available');
        assert.equal('test', res.body.title, 'Message title is set');
        lastMessageId = res.body._id;
      })
      .end(done);
  });

  it('is persistent', (done) => {
    request(storageServer.app())
      .get('/storage/message')
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.length, messageCount + 1);
      })
      .end(done);
  });

  it('returns a 400 when posting invalid models', (done) => {
    request(storageServer.app())
      .post('/storage/message')
      .send({ invalid: 'test' })
      .expect(400)
      .end(done);
  });

  it('returns a 404 when posting non existing models', (done) => {
    request(storageServer.app())
      .post('/storage/unicorns')
      .expect(404)
      .end(done);
  });

  // Read

  it('reads models', (done) => {
    request(storageServer.app())
      .get(`/storage/message/${lastMessageId}`)
      .expect(200)
      .expect((res) => {
        assert.isObject(res.body, 'Message is available');
        assert.equal('test', res.body.title, 'Message title is set');
      })
      .end(done);
  });

  it('returns 404s when getting non-existing models', (done) => {
    request(storageServer.app())
      .get('/storage/message/doesnotexist')
      .expect(404)
      .end(done);
  });

  // Update

  it('updates models', (done) => {
    request(storageServer.app())
      .post(`/storage/message/${lastMessageId}`)
      .send({ title: 'test2' })
      .expect(200)
      .expect((res) => {
        assert.isObject(res.body, 'Message is available');
        assert.equal('test2', res.body.title, 'Message title is set');
      })
      .end(done);
  });

  it('updates models persistently', (done) => {
    request(storageServer.app())
      .get(`/storage/message/${lastMessageId}`)
      .expect((res) => {
        assert.equal('test2', res.body.title, 'Message title is set');
      })
      .end(done);
  });


  it('returns 404s when updating non-existing models', (done) => {
    request(storageServer.app())
      .post('/storage/message/doesnotexist')
      .expect(404)
      .end(done);
  });

  it('returns a 400 when invalidly updating models', (done) => {
    request(storageServer.app())
      .post(`/storage/message/${lastMessageId}`)
      .send({ title: null })
      .expect(400)
      .end(done);
  });

  // Delete
});
