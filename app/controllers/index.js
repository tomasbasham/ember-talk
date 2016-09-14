import Ember from 'ember';

const {
  computed,
  get,
  inject,
  on,
  run,
  set
} = Ember;

export default Ember.Controller.extend({
  lobby: null,
  private: null,

  /*
   * The PubNub API service used as an
   * interface between the PubNub JavaScript
   * library and an ember application.
   *
   * @type {Ember.Service}
   */
  pubnub: inject.service(),

  /*
   * Subscribe to the global channel
   * where all users are present. It
   * is from here that users will see
   * who is online.
   *
   * @method joinLobby
   * @on init
   */
  joinLobby: on('init', function() {
    const pubnub = get(this, 'pubnub');
    const channelName = 'lobby';

    // In case there is no pubnub service
    // defined, just bail!
    if (!pubnub) {
      return;
    }

    // Subscribe to the channel.
    const channel = pubnub.subscribe(channelName);

    // Add and remove users from the list
    // as they join and leave the channel.
    channel.on(pubnub.presenceEventString, () => {
      const usersWithoutMe = channel.hereNow().without(pubnub.me());
      set(this, 'users', usersWithoutMe);
    });

    // Handle incoming messages. These will
    // be chat requests and may or may not
    // be for the current user.
    channel.on(pubnub.messageEventString, ({ message }) => {
      if (message.requestRecipient && message.requestRecipient === pubnub.me()) {

        // Check the message type using a
        // switch statement for greater
        // efficiency, although this will
        // be trivial.
        switch(message.type) {
          case 'chatRequest':
            this.sendMessage('chatResponse', message.requestSender);
            break;
          case 'chatResponse':
            this._createCall(message).dial();
            break;
        }
      }
    });

    // Hide the sidebar after initialisation.
    run.later(() => {
      this.send('toggleSidebar');
    }, 1000);

    set(this, 'lobby', channel);
  }),

  /*
   * Subscribe to a private channel.
   * The user will only be able to
   * read from this channel whilst
   * other can only publish to this
   * channel.
   *
   * @method joinPrivateChannel
   * @on init
   */
  joinPrivateChannel: on('init', function() {
    const pubnub = get(this, 'pubnub');

    // In case there is no pubnub service
    // defined, just bail!
    if (!pubnub) {
      return;
    }

    pubnub.uuid((uuid) => {

      // Subscribe to the channel.
      const channel = pubnub.subscribe(uuid);

      // Handle incoming messages. These will
      // be in the form of SDP events that we
      // must handle and send to bond.
      channel.on(pubnub.messageEventString, ({ message }) => {

        // Check the message type using a
        // switch statement for greater
        // efficiency, although this will
        // be trivial.
        switch(message.type) {
          case 'offer':
            if(window.confirm(`${message.remoteUuid} is calling you. Do you want to accept?`)) {
              this._createCall(message);
            }
            break;
          case 'answer':
            this._answerCall(message);
            break;
          case 'ice':
            this._addCandidate(message);
            break;
        }
      });

      set(this, 'private', channel);
    });
  }),

  /*
   * Leave the lobby when the application
   * is destroyed.
   *
   * @method leaveLobby
   * @on willDestroy
   */
  leaveLobby: on('willDestroy', function() {
    const channel = get(this, 'lobby');
    channel.unsubscribe();
  }),

  /*
   * Leave the private channel when the
   * application is destroyed.
   *
   * @method leavePrivateChannel
   * @on willDestroy
   */
  leavePrivateChannel: on('willDestroy', function() {
    const channel = get(this, 'private');
    channel.unsubscribe();
  }),

  /*
   * Send a chat request/response to
   * a remote user on the public lobby
   * channel. All users are listening
   * on this channel so we need to
   * send the recipients UUID also.
   *
   * @method sendMessage
   *
   * @param {String} requestType
   *   The type of the message. Either chatRequest ot chatResponse.
   *
   * @param {String} recipientUuid
   *   The user UUID to send the message to.
   */
  sendMessage(requestType, recipientUuid) {
    const pubnub = get(this, 'pubnub');
    const channel = get(this, 'lobby');
    const privateChannelName = get(this, 'private.name');

    channel.publish({
      message: {
        'type': requestType,
        'requestRecipient': recipientUuid,
        'requestSender': pubnub.me(),
        'requestChannel': privateChannelName
      }
    });
  },

  /*
   * Create a new phone object we can
   * use to make remote calls to peers.
   *
   * @type {Phone}
   */
  phone: computed({
    get() {
      return negotiator().registerPhone();
    }
  }).readOnly(),

  /*
   * Initiate a Phone call using the
   * negotiator library. All signalling
   * messages are sent on private
   * channels.
   *
   * @method createCall
   * @private
   *
   * @param {Object} message
   *   Any valid JSON object.
   */
  _createCall(message) {
    const pubnub = get(this, 'pubnub');
    const phone = get(this, 'phone');
    const privateChannelName = get(this, 'private.name');

    // Create a new call and setup any callbacks
    // necssary for interactivity.
    let call = null;
    if (message.type === 'offer') {
      call = phone.answerCall(message.description);
    } else {
      call = phone.createCall();
    }

    call.descriptionSuccess = function(description) {
      pubnub.publish({
        channel: message.requestChannel,
        message: {
          'type': (message.type === 'offer' ? 'answer' : 'offer'),
          'remoteUuid': pubnub.me(),
          'description': description,
          'requestChannel': privateChannelName
        }
      });
    };

    call.onIceCandidate = function(iceCandidate) {
      pubnub.publish({
        channel: message.requestChannel,
        message: {
          'type': 'ice',
          'ice': iceCandidate.candidate,
          'requestChannel': privateChannelName
        }
      });
    };

    return call;
  },

  /*
   * Accept a Phone call using the
   * negotiator library. All signalling
   * messages are sent on private
   * channels.
   *
   * @method answerCall
   * @private
   *
   * @param {Object} message
   *   Any valid JSON object.
   */
  _answerCall(message) {
    const call = get(this, 'phone.calls.lastObject');
    call.accept(message.description);
  },

  /*
   * As well as exchanging information
   * about the media, peers must
   * exchange information about the
   * network connection. This is known
   * as an ICE candidate and details the
   * available methods the peer is able
   * to communicate (directly or through
   * a TURN server).
   *
   * @method addCandidate
   * @private
   *
   * @param {Object} message
   *   A valid JSON object conatining an ice candidate.
   */
  _addCandidate(message) {
    if (!message.ice || typeof message.ice.candidate !== 'string') {
      return;
    }

    const phone = get(this, 'phone');
    phone.addIceCandidate(message.ice);
  },

  actions: {

    /*
     * Open up a modal giving the user
     * the opportunity to change their
     * username.
     *
     * @method changeUsername
     */
    openModal() {
      this.transitionToRoute({ queryParams: { username: true }});
    },

    /*
     * Show/Hide the side menu.
     *
     * @method toggleSidebar
     */
    toggleSidebar() {
      Ember.$('body').toggleClass('menu-active');
    },

    /*
     * Send a chat request to the remote
     * user.
     *
     * @method userSelected
     *
     * @param {String} uuid
     *   The UUID of the remote user.
     */
    userSelected(uuid) {
      this.sendMessage('chatRequest', uuid);
    }
  }
});
