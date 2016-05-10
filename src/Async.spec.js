var Promise = require('promise');

describe('AsyncContainer', function(){
    
    var Container = {
        
        _factories: {},
        
        
        bind: function(name, fn)
        {
            this._factories[name] = fn;
            
            return this;
        },
        
        
        resolve: function(name)
        {
            return this._factories[name](this);
        },
        
        make: function(name)
        {
            return this.resolve(name);
        }
    };
    
    it("sets and gets", function(){
       Container.bind('one', function(){
           return '1';
       });
       
       Container.bind('two', function(cntr){
           return cntr.resolve('one') + '.2';
       });
       
       Container.bind('three', function(cntr){
           return cntr.resolve('two') + '.3';
       });
       
       expect(Container.make('three')).toEqual('1.2.3');
    });
    
});