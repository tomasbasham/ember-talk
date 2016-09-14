import Ember from 'ember';

const {
  get
} = Ember;

export default Ember.Component.extend({
  actions: {
    animationForOpenOperation() {
      return Ember.Promise.resolve();
    },

    animationForCloseOperation() {
      return Ember.Promise.resolve();
    },

    updated() {
      const controller = get(this, 'modalContext.controller');
      const actionName = get(this, 'modalContext.options.action');
      const username = get(this, 'username') || '';

      controller.send(actionName, username);
      this.sendAction('dismiss');
    }
  }
});
