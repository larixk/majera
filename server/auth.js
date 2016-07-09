const passport = require('passport');
const Strategy = require('passport-http').BasicStrategy;

module.exports = (app, verify) => {
  if (!verify) {
    // Return noop express middleware
    // Keeps function return value consistent
    return (req, res, next) => next();
  }
  passport.use(new Strategy(verify));

  return passport.authenticate('basic', { session: false });
};
