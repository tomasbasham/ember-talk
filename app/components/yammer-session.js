import Ember from 'ember';

const {
  computed,
  get,
  observer,
  on
} = Ember;

export default Ember.Component.extend({
  classNames: ['yammer', 'session'],

  /*
   * WebRTC session object.
   *
   * @type {Phone}
   */
  phone: null,

  /*
   * List of active phone calls.
   *
   * @type {Array}
   */
  calls: computed.alias('phone.calls'),

  /*
   * Create a WebRTC session and
   * initialise the user's webcam
   * and audio devices.
   *
   * @method createWebRTCSession
   * @on didInsertElement
   */
  createWebRTCSession: on('didInsertElement', function() {
    const phone = get(this, 'phone');
    const localMedia = this.$('#local');

    // In case there is no phone object
    // defined, just bail!
    if (!phone) {
      return;
    }

    phone.onLocalMediaStream = function(mediaStream) {
      attachMediaStream(localMedia[0], mediaStream);
    };

    phone.onGetMediaStreamError = function() {
      window.alert('Unable to attach to your local media');
    };

    phone.activate();
  }),

  /*
   * Attach the remote stream to a
   * video element. In the case that
   * there are several call objects
   * then we'll take the most recent
   * and hangup on all other calls.
   *
   * @method addRemoteMediaStream
   */
  addRemoteMediaStream: observer('calls.[]', function() {
    const newCall = get(this, 'calls.lastObject');
    const remoteMedia = this.$('#remote');

    // If there are no new call then
    // just return. This will likely
    // happen on object initialization.
    if (!newCall) {
      return;
    }

    newCall.onAddStream = function(mediaStream) {
      attachMediaStream(remoteMedia[0], mediaStream.stream);
    };
  })
});
