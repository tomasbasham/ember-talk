# Yammer [![Build Status](https://travis-ci.org/tomasbasham/yammer.svg?branch=master)](https://travis-ci.org/tomasbasham/yammer)

An [Ember CLI](http://www.ember-cli.com/) WebRTC chat room using [negotiator](https://github.com/tomasbasham/negotiator). A working version of yammer is running at [https://yammer.tomasbasham.co.uk](https://yammer.tomasbasham.co.uk).

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

For simple deployment without having to checkout this repository you can deploy to [heroku](https://www.heroku.com/) using the 'Deploy to Heroku' button below. You will need a PubNub account and set both the `PUBNUB_SUBSCRIBE_KEY` and `PUBNUB_PUBLISH_KEY` environment variables through the heroku portal.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
