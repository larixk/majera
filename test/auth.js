const majera = require('..');
const request = require('supertest');

describe('no auth', () => {
  let majeraServer;

  before((done) => {
    majeraServer = majera({
      callback: done,
      mongodbUri: 'mongodb://localhost/majera-test',
    });
  });

  after((done) => majeraServer.destroy(done));

  it('shows data when not logged in', (done) => {
    request(majeraServer.app())
      .get('/majera')
      .expect(200)
      .end(done);
  });
});

describe('basic auth', () => {
  let majeraServer;

  const verify = (username, password, done) => {
    if (username !== 'user' || password !== 'pass') {
      return done(null, false);
    }
    return done(null, true);
  };

  before((done) => {
    majeraServer = majera({
      callback: done,
      mongodbUri: 'mongodb://localhost/majera-test',
      verify,
    });
  });

  after((done) => majeraServer.destroy(done));

  it('blocks access if not logged in', (done) => {
    request(majeraServer.app())
      .get('/majera')
      .expect(401)
      .end(done);
  });

  it('blocks access if authenticated incorrectly', (done) => {
    request(majeraServer.app())
      .get('/majera')
      .auth('user', 'wrong')
      .expect(401)
      .end(done);
  });

  it('shows data when authenticated', (done) => {
    request(majeraServer.app())
      .get('/majera')
      .auth('user', 'pass')
      .expect(200)
      .end(done);
  });
});
