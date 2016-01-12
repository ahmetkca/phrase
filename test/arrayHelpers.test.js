import expect from 'expect'

import u from 'updeep'
import { uIncrement, uAppend, uReplace } from '../src/helpers/arrayHelpers.js'

describe("updeep arrayHelpers", () => {

  var obj1 = {
    name: "50 Cent",
    fruits: [
      "Apple",
      "Orange",
      "Grape"
    ],
    cash: 250
  };

  describe("uIncrement", () => {

    it("should increment by the correct amount", () => {
      [1, -3, 235987].forEach(amount => {
        var obj2 = u({cash: uIncrement(amount)}, obj1)
        expect( obj2.cash ).toEqual( obj1.cash + amount )
      })
    })

  })

  describe("uAppend", () => {

    it("should append the element", () => {
      var obj2 = u.updateIn(['fruits'], uAppend("Banana"), obj1);
      expect( obj2.fruits.length ).toEqual( obj1.fruits.length + 1 )
      expect( obj2.fruits[obj1.fruits.length] ).toEqual( "Banana" )
    });

    it("should be sorted", () => {
      var obj3 = u.updateIn(['fruits'], uAppend("Banana", true), obj1);
      expect( obj3.fruits.indexOf("Banana") ).toNotEqual( obj3.fruits[obj1.fruits.length] )
    });

  });

  describe("uReplace", () => {

    var original = "Orange"
    var replacement = "Banana"
    var obj2 = u.updateIn(['fruits'], uReplace(original, replacement), obj1);

    it("should have the same length before/after", () => {
      expect( obj2.fruits.length ).toEqual( obj1.fruits.length )
    });

    it("should be in the same position", () => {
      expect( obj2.fruits.indexOf(replacement) ).toEqual( obj1.fruits.indexOf(original) )
    });

  });

});