//http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
var Promise = require('promise');


var Container = module.exports = {

  _factories: {},

  _sharedInstances: {},

  _instances: {},

  _addProperty: function(prop){
    var self = this;
    this.__defineGetter__(prop, function(){
      return self.resolve(prop);
    });
  },


  bind: function(name, fn){
    if(typeof fn !== 'function'){
      throw new TypeError("'fn' must be a function.");
    }

    this.unbind(name);

    this._factories[name] = fn;

    this._addProperty(name);

    return this;
  },


  unbind: function(name){
    delete this._factories[name];
    delete this._sharedInstances[name];
    delete this._instances[name];

    return this;
  },


  bindShared: function(name, fn){
    if(typeof fn !== 'function'){
      throw new TypeError("'fn' must be a function.");
    }

    this.unbind(name);

    this._sharedInstances[name] = fn;

    this._addProperty(name);

    return this;
  },
  

  instance: function(name, instance){

    this.unbind(name);

    this._instances[name] = instance;

    this._addProperty(name);

    return this;
  },
  

  resolve: function(name){
    // Get resolved singleton
    if(this._instances.hasOwnProperty(name)){
      return this._instances[name];
    }

    // Create singleton instance
    if(this._sharedInstances.hasOwnProperty(name)){
      // resolve
      var instance = this._sharedInstances[name](this);
      // set new singleton instance
      this.instance(name, instance);
      
      return instance;
    }

    // Get factory and create
    if(this._factories.hasOwnProperty(name)){
      return this._factories[name](this);
    }

    throw new Error("No service registered: '" + name + "'");
  },


  build: function(func){
    if(typeof func !== 'function')
      throw new TypeError("Container::build() argument is not a Function.");

    var args = this._getFunctionArgs(func)
      .map(function(arg){
        try{
          return this.resolve(arg);
        }catch(e){
          throw new Error("BindingResolution: Cannot instantiate " + func.constructor.name);
        }
      }.bind(this));

    function F(){
      return func.apply(this, args);
    }

    F.prototype = func.prototype;

    return new F();
  },

  _getFunctionArgs: function(func) {
    return (func+'').replace(/\s+/g,'')
      .replace(/[/][*][^/*]*[*][/]/g,'') // strip simple comments
      .split('){',1)[0].replace(/^[^(]*[(]/,'') // extract the parameters
      .replace(/=[^,]+/g,'') // strip any ES6 defaults
      .split(',').filter(Boolean); // split & filter [""]
  },



  /*/
   * Extra Interfaces
  /*/
  register: function(name, fn){
    return this.bind(name, fn);
  },
  
  singleton: function(name, fn){
    return this.bindShared(name, fn);
  },

  make: function(name){
    return this.resolve(name);
  },
  
  create: function(name){ // not used
    return this._factories[name](this);
  },

  getInstance: function(name){ // not used
    return this._instances[name];
  }

}
