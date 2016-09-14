/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'yammer',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    pubnub: {
      subscribe_key: process.env.PUBNUB_SUBSCRIBE_KEY,
      publish_key: process.env.PUBNUB_PUBLISH_KEY,
      ssl: true
    },

    contentSecurityPolicy: {
      'connect-src': "'self' http://*.pubnub.com",
      'img-src': "'self' data:",
      'media-src': "'self' blob:"

    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
