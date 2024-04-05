import { make } from '../src/thing.js'

it('can really make thing #1', () => {
  var Thing = make({
    getStates: function () {
      let states = { type: this.getType() }
      if (!Object.hasOwn(this, 'mixins')) return states

      let compose = (mixins, trigger, defaultValue) => {
        let reducer = (states, prototype) => {
          if (!Object.hasOwn(prototype, trigger)) return states
          return {
            ...states,
            ...prototype[trigger].call(this),
          }
        }
        return mixins.reduce(reducer, defaultValue)
      }
      return compose(this.mixins, 'getState', states)
    },
    getType: function () { return this.type },
    setType: function (type) { this.type = type },
  })
  var IndexMixin = {
    index: 0,
    getState: function () {
      return { index: this.getIndex() }
    },
    setIndex: function (index) {
      if (isNaN(index)) return
      this.index = Number(index)
    },
    getIndex: function () {
      return this.index
    },
  }
  var VisibleMixin = {
    visible: true,
    getState: function () {
      return { visible: this.getVisible() }
    },
    setVisible: function (visible) {
      this.visible = visible
    },
    getVisible: function () {
      return this.visible
    },
    toggleVisible: function () {
      this.visible = !this.visible
    },
  }
  var a = Thing.new({}, IndexMixin, VisibleMixin)

  expect(a.getStates()).toStrictEqual({
    type: undefined,
    index: 0,
    visible: true,
  })
})
it('can really make thing #2', () => {
  var something = { items: new Set([0, 1, 2, 3]) }
  var testme = {
    name: 'a',
    function: function () { return true },
    set: new Set([1, 2]),
    map: new Map([{ one: 1 }]),
    [Symbol.iterator]: function * () {},
    something: make(something).new(),
  }
  var tests = [
    // Something
    (a) => expect(a.something.items.size).toStrictEqual(something.items.size),

    // symbols
    (a) => expect(a[Symbol.iterator]).toBeDefined(),
    (a) => expect(a === make(testme)).toBe(false),
    (a) => expect(a).toStrictEqual(make(testme)),

    // name
    (a) => expect(a.name).toStrictEqual(testme.name),
    (a) => expect(a.new().name).toStrictEqual(testme.name),

    // functions
    (a) => expect(a.function).toStrictEqual(testme.function),
    (a) => expect(a.new().function).toStrictEqual(testme.function),
    (a) => expect(a.function()).toStrictEqual(testme.function()),
    (a) => expect(a.new().function()).toStrictEqual(testme.function()),

    // set
    (a) => expect(a.set.size).toStrictEqual(testme.set.size),
    (a) => expect(a.new().set.size).toStrictEqual(testme.set.size),

    // map
    (a) => expect(a.map.size).toStrictEqual(testme.map.size),
    (a) => expect(a.new().map.size).toStrictEqual(testme.map.size),
  ]
  var items = [
    make(testme),
    make(make(testme)),
    make(make(make(testme))),
    make({}, testme),
    make(testme, {}),
    make(testme, testme),
    make(testme, make({}).new()),
    make(testme, make(testme).new(), testme),
    make(make({}).new(), make(testme).new(testme)),
    make(make(testme).new(), make(testme).new(), make(make(testme).new(), make(testme).new())),
    make(make(make(testme).new(), make(testme).new()), make(make(testme).new(), make(testme).new())),
  ]
  tests.forEach((test) => {
    return items.every(a => test(a))
  })
})
it('can really make thing #3', () => {
  var Iterrable = make({
    iterator: function (items) {
      return items
    },
    setItems: function (items = new Set()) {
      this.items = items
    },
    setIterator: function (iterator) {
      this.iterator = iterator
    },
    [Symbol.iterator]: function * () {
      for (const item of this.iterator(this.items)) { yield item }
    },
  })
  var Listable = Iterrable.new({
    list: function (transform = t => t) {
      return transform(this.items)
    },
    toArray: function () {
      return this.list(Array.from)
    },
  })
  var Dict = Listable.new({
    items: new Map(),
    add: function (key, value) {
      this.items.set(key, value)
    },
    get: function (type) {
      return this.items.get(type)
    },
    delete: function (item) {
      this.items.delete(item)
    },
    toArray: function () {
      return Array.from(this.items.values())
    },
  })

  expect(Iterrable[Symbol.iterator]).toBeDefined()
  expect(Listable[Symbol.iterator]).toBeDefined()
  expect(Dict[Symbol.iterator]).toBeDefined()

  var a = Dict.new()
  expect(a[Symbol.iterator]).toBeDefined()
})
it('can inheritant behaviors', () => {
  var a = make({
    name: 'name',
    say: function () {
      return this.name
    },
  })

  var b = a.new({ name: 'nameb' })
  expect(a.say()).toBe('name')
  expect(b.say()).toBe('nameb')

  a.say = function () {
    return this.name.toUpperCase()
  }
  expect(a.say()).toBe('NAME')
  expect(b.say()).toBe('NAMEB')
})
describe('be pure', () => {
  var a = {
    number: 1,
    string: 'string',
    true: true,
    false: false,
    object: {},
    array: [],
    set: new Set(),
    map: new Map(),
    [Symbol.iterator]: function*() { },
  }
  var b = make(a)
  it('primities check', () => {
    expect(b.number === a.number).toBe(true)
    expect(b.string === a.string).toBe(true)
    expect(b.true === a.true).toBe(true)
    expect(b.false === a.false).toBe(true)
    expect(b[Symbol.iterator] === a[Symbol.iterator]).toBe(true)
  })
  it('reference check', () => {
    expect(b.object === a.object).toBe(false)
    expect(b.array === a.array).toBe(false)
    expect(b.set === a.set).toBe(false)
    expect(b.map === a.map).toBe(false)
  })
  it('unicity check', () => {
    b.number = 10
    b.string = 'string string'

    expect(b.number === a.number).toBe(false)
    expect(b.string === a.string).toBe(false)
    expect(a.number).toBe(1)
    expect(b.number).toBe(10)
    expect(a.string).toBe('string')
    expect(b.string).toBe('string string')
  })
})
