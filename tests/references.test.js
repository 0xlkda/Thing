import { make } from '../src/thing.js'

var Thing = make()

it('return new Thing instance when call Thing.new()', () => {
  var a = Thing.new()
  expect(Object.getPrototypeOf(a)).toBe(Thing)

  var b = a.new()
  expect(Object.getPrototypeOf(b)).toBe(a)
})
it('return new Thing instance when call Thing.new(params)', () => {
  var params = {
    name: 'a',
    function: function () {},
  }
  var a = Thing.new(params)

  expect(a.name).toStrictEqual('a')
  expect(a.function === params.function).toStrictEqual(true)
  expect(Object.getPrototypeOf(a)).toBe(Thing)
})
it('instance share function expressions, but not others', () => {
  var params = {
    name: undefined,
    function: function () {},
  }
  var a = Thing.new(params)
  var b = Thing.new(params)

  expect(a.function === b.function).toBe(true)
  expect(a.name).toBeUndefined()
  expect(b.name).toBeUndefined()
  expect(a.name === b.name).toBe(true)

  a.name = 'a'
  b.name = 'b'
  expect(b.name).toBe('b')
  expect(a.name).toBe('a')
})
it('params changed its function, all instances should have the changes', () => {
  var params = {
    name: undefined,
    function: function () {},
  }
  var a = Thing.new(params)
  var b = Thing.new(params)
  expect(a.function).toBeDefined()
  expect(b.function).toBeDefined()
  expect(a.function === b.function).toBe(true)

  params.function = function () { return 2 }
  expect(a.function()).toBe(2)
  expect(b.function()).toBe(2)
})
it('return new Thing instance when call Thing.new(params, ...mixins)', () => {
  var params = {
    name: undefined,
    function: function () {},
  }
  var mixin1 = { say: function () {} }
  var mixin2 = { bay: function () {} }
  var a = Thing.new(params, mixin1, mixin2)

  expect(a.function).toBeDefined()
  expect(a.say).toBeDefined()
  expect(a.bay).toBeDefined()
})
it('instances share all the function expressions with params & mixins', () => {
  var params = {
    name: undefined,
    function: function () {},
  }
  var mixin1 = { say: function () {} }
  var mixin2 = { bay: function () {} }
  var a = Thing.new(params, mixin1, mixin2)
  var b = Thing.new(params, mixin1, mixin2)

  expect(a.function === b.function).toBe(true)
  expect(a.say === b.say).toBe(true)
  expect(a.bay === b.bay).toBe(true)

  expect(a.name).toBeUndefined()
  expect(b.name).toBeUndefined()
  expect(a.name === b.name).toBe(true)

  a.name = 'a'
  b.name = 'b'
  expect(b.name).toBe('b')
  expect(a.name).toBe('a')
})
it('params changed its function, so instance with mixins should have the change too', () => {
  var params = {
    name: undefined,
    function: function () {},
  }
  var mixin1 = {
    world: 'peace!',
    say: function () {},
  }
  var mixin2 = {
    earth: 'ease',
    bay: function () {},
  }
  var a = Thing.new(params, mixin1, mixin2)
  var b = Thing.new(params, mixin1, mixin2)

  expect(a.function).toBeDefined()
  expect(b.function).toBeDefined()
  expect(a.function()).toBeUndefined()
  expect(b.function()).toBeUndefined()

  params.function = function () { return 0 }
  expect(a.function()).toBe(0)
  expect(b.function()).toBe(0)

  a.say = function () { return 1 }
  b.say = function () { return 2 }
  expect(a.say()).toBe(1)
  expect(b.say()).toBe(2)

  expect(a.world).toBe('peace!')
  expect(b.earth).toBe('ease')

  b.world = 'peace! peace!'
  expect(a.world).toBe('peace!')
  expect(b.world).toBe('peace! peace!')
  expect(a.world).toBe('peace!')
})
