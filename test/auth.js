const storage = require('..');
const request = require('supertest');

describe('no auth', () => {
  let storageServer;

  before((done) => {
    storageServer = storage({
      callback: done,
      mongodbUri: 'mongodb://localhost/storage-test',
    });
  });

  after((done) => storageServer.destroy(done));

  it('shows data when not logged in', (done) => {
    request(storageServer.app())
      .get('/storage')
      .expect(200)
      .end(done);
  });
});

describe('basic auth', () => {
  let storageServer;

  const verify = (username, password, done) => {
    if (username !== 'user' || password !== 'pass') {
      return done(null, false);
    }
    return done(null, true);
  };

  before((done) => {
    storageServer = storage({
      callback: done,
      mongodbUri: 'mongodb://localhost/storage-test',
      verify,
    });
  });

  after((done) => storageServer.destroy(done));

  it('blocks access if not logged in', (done) => {
    request(storageServer.app())
      .get('/storage')
      .expect(401)
      .end(done);
  });

  it('blocks access if authenticated incorrectly', (done) => {
    request(storageServer.app())
      .get('/storage')
      .auth('user', 'wrong')
      .expect(401)
      .end(done);
  });

  it('shows data when authenticated', (done) => {
    request(storageServer.app())
      .get('/storage')
      .auth('user', 'pass')
      .expect(200)
      .end(done);
  });
});
