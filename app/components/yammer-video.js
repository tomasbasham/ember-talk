import Ember from 'ember';

export default Ember.Component.extend({
  attributeBindings: ['autoplay', 'controls', 'loop', 'muted', 'poster', 'src'],
  classNames: ['yammer', 'video'],
  tagName: 'video'
});
