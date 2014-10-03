/**
 * Module dependencies
 */

var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var Template = require('./template');

exports = module.exports = App;

function App(routes) {
  var self = this;
  Emitter.apply(this);
  this._routes = routes(update, Template);
  function update(err) {
    if (err) return self.emit('error', err);
    self.emit('update', self._routes);
  }
}
inherits(App, Emitter);

App.prototype.use = function(name, mod) {
  return this;
};

App.prototype.start = function(fn) {
  fn(this._routes, this);
};
