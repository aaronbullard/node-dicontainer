var Container = require('./Container.js');
var Promise = require('promise');

describe('ContainerSpec', function(){

  it('binds factories', function(){
    function Person(){}

    Container.bind('Person', function(){
      return new Person();
    });

    var person1 = Container.make('Person');
    var person2 = Container.make('Person');

    // returns object of person
    expect(person1.constructor.name).toEqual('Person');
    // returns different instance
    expect(person1 === person2).toEqual(false);
  });


  it('registers singleton instances', function(){
    function Person(name){
      this.name = name;
    }

    Container.instance('Person', new Person('Aaron'));

    var person = Container.resolve('Person');
    person.name = 'Bob';

    // returns same instance
    expect(Container.make('Person').name).toEqual('Bob');
  });


  it('shares factoried objects as singletons', function(){
    function Person(name){
      this.name = name;
    }

    Container.bindShared('Person', function(){
      return new Person('Aaron');
    });

    var person = Container.resolve('Person');
    person.name = 'Bob';

    // returns same instance
    expect(Container.resolve('Person').name).toEqual('Bob');
  });


  it('exposes resolve by properties', function(){
    function Person(){}

    Container.bind('Person', function(){
      return new Person();
    });

    expect( Container.Person instanceof Person ).toEqual(true);
  });


  it('unregisters bindings', function(){
      Container.bind('Obj', function(){
        return {
          a: 'a'
        };
      });

      expect( Container.Obj.a ).toEqual('a');

      // unregister
      Container.unbind('Obj');

      var isUnregistered = false;
      try{
        Container.Obj;
      }
      catch(e){
        isUnregistered = true;
      }
      expect( isUnregistered ).toEqual(true);
  });


  it('throws an error when register is not passed a function', function(){
    expect( function(){
      Container.register('not_a_function', {func: false})
    }).toThrowError()
  });

  it('throws an error when bindShared is not passed a function', function(){
    expect( function(){
      Container.bindShared('not_a_function', {func: false})
    }).toThrowError()
  });

  describe("uses automatic resolution through reflection", function(){
    function Voice(){
      this.sayHello = function(){
        return "Hello";
      }
    }

    function Legs(){
      this.run = function(){
        return "I'm running";
      }
    }

    function Person (Voice, Legs){
      this.speak = Voice.sayHello;
      this.run = Legs.run;
    }

    beforeEach(function(){
      Container.bind('Voice', function(){
        return new Voice();
      });

      Container.bind('Legs', function(){
        return new Legs();
      });
    });

    it("builds an constructor object", function(){
      var person = Container.build(Person);

      expect(person).toBeDefined();
      expect(person.constructor.name).toEqual('Person');
      expect(person.speak()).toEqual('Hello');
      expect(person.run()).toEqual("I'm running");
    });

    it("builds a closure with injected dependencies", function(){
      var obj = Container.build(function(Legs, Voice){
        return {
          legs: Legs,
          voice: Voice
        }
      });

      expect(obj.legs.run()).toEqual("I'm running");
      expect(obj.voice.sayHello()).toEqual('Hello');
    });

  });

  describe("it uses promises", function(){

      function wait(){
          for (var i = 0; i < 1000000000; i++) {}
          return true;
      }
/*/
     it("resolves dependencies recursively", function(){
         function Parent(child1, child2, child3){
             return [child1, child2, child3];
         }

         function Child(name){
             this.name = name;
         }

         Container.bind('Child1', function(){
             wait();
             return new Child('one');
         });
         Container.bind('Child2', function(){
             wait();
            return new Child('two');
         });
         Container.bind('Child3', function(){
             wait();
            return new Child('three');
         });

         Container.bind('Parent', function(container){
var time1 = (new Date).getTime();
             var par = new Parent(
                container.Child1,
                container.Child2,
                container.Child3
             );
var time2 = (new Date).getTime();
var diff = time2 - time1;
console.log(diff);
// done();
             return par;
         });

         expect(Container.Parent).toEqual([
             Container.Child1,
             Container.Child2,
             Container.Child3
         ]);
         expect(Container.Child1.name).toEqual('one');
     });
/*/
     it("test async with promises", function(){
         var p = new Promise(wait);
         var time1 = (new Date).getTime();
         p.then(function(){
             var time2 = (new Date).getTime();
             console.log('done: ', time2 - time1);
         }).catch(function(err){
             console.log(err);
         });
     });
  });

});
