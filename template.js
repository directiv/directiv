/**
 * Module dependencies
 */

var inherits = require('util').inherits;
var Syrinx = require('syrinx');
var compile = require('directiv-core-compiler');

module.exports = Template;

function Template(ready, modules, name) {
  Syrinx.call(this, name);

  if (modules) {
    if (!modules._modules) throw new Error('modules should be a syrinx container');
    this._modules = Object.create(modules._modules);
    this._baseModules = modules;
  }

  // Callback to notify the template has compiled
  this.ready = ready;

  var acc = this._accessor = this.accessor();
}
inherits(Template, Syrinx);

Template.prototype.use = function(name, mod, params) {
  // it's a directiv package
  if (mod.__package) return mod(params)(this);

  // it's another template function
  if (mod.__template) return this._modules['el-' + name] = createChildTemplate(mod, this.ready, this._baseModules);

  // it's probably a directive, store, etc
  if (name && mod.requires) return this.register(name, mod);

  // TODO are there any other possibilities?
  console.log('DID NOT MATCH LOADER', name);
  // register it for now
  return this.register(name, mod);

  return this;
};

Template.prototype.compile = function(ast) {
  this.render = compile(ast, this._accessor);
  if (process.env.NODE_ENV === 'production') this.ready();
};

function createChildTemplate(mod, ready, base) {
  var render =  mod(ready, Template, base).render;
  return {
    value: function(el) {
      return render ? render(el.$state) : '';
    },
    deps: [],
    isLoaded: true
  };
}
