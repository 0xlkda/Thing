import { make } from '../src/thing.js'

var TYPES = {
  SET: 'Set',
  MAP: 'Map',
  STATE: 'State',
  STATES: 'States',
  BEHAVIOR: 'Behavior',
  BEHAVIORS: 'Behaviors',
}
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
var Iterable = make({
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
var Listable = Iterable.new({
  list: function (transform = t => t) {
    return transform(this.items)
  },
  toArray: function () {
    return this.list(Array.from)
  },
})
var List = Listable.new({
  type: TYPES.SET,
  items: new Set(),
  add: function (...items) {
    for (const item of items) {
      this.items.add(item)
    }
  },
  delete: function (item) {
    this.items.delete(item)
  },
})
var Dict = Listable.new({
  type: TYPES.MAP,
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

var Property = make({
  new: function (name, type, value) {
    this.setName(name)
    this.setType(type)
    this.setValue(value)
    return Object.assign({}, this)
  },
  getName: function () {
    return this.name
  },
  setName: function (name) {
    this.name = name
  },
  setType: function (type) {
    this.type = type
  },
  getType: function () {
    return this.type
  },
  setValue: function (value) {
    this.value = value
  },
  getValue: function () {
    return this.value
  },
  toKeyValue: function () {
    return {
      key: this.getName(),
      value: this.getValue(),
    }
  },
})
var PropertyList = Dict.new({
  items: Dict.new(),
  add: function (name, type, value) {
    let property = Property.new(name, type, value)
    this.items.add(name, property)
    return this
  },
  delete: function (name) {
    this.items.delete(name)
  },
  getState: function () {
    let state = {}
    for (const { name, value: property } of this.items.listArray()) {
      state[name] = property.getValue()
    }
    return state
  },
  applyTo: function (element) {
    element.setPropertyList(this)
  },
  getProperty: function (name) {
    return this.items.get(name)
  },
  setPropertyType: function (name, type) {
    this.getProperty(name).setType(type)
  },
  getPropertyType: function (name) {
    return this.getProperty(name).getType()
  },
  getPropertyValue: function (name) {
    return this.getProperty(name).getValue()
  },
  setPropertyValue: function (name, value) {
    this.getProperty(name).setValue(value)
  },
})
var ConfigurableMixin = Thing.new({
  properties: Dict.new(),
  getState: function () {
    return { properties: this.getPropertyList().getState() }
  },
  addProperty: function (name, type, value) {
    this.getPropertyList().add(name, type, value)
  },
  getPropertyList: function () {
    return this.properties
  },
  setPropertyList: function (properties) {
    this.properties = properties
  },
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
var ObserverMixin = {
  update: function () {
    return this.getStates()
  },
}
var GraphicElement = make({
  setDisplayEngine: function (engine) {
    this.displayEngine = engine
  },
  display: function () {
    let states = this.getStates()
    return this.displayEngine.display(states)
  },
}, ConfigurableMixin, IndexMixin, VisibleMixin, ObserverMixin)

describe('Quicktests', () => {
  var Tests = {
    Listable: {
      stress: function (a) {
        Tests.Listable.test(a)
        Tests.Listable.test(a.new())
        Tests.Listable.test(make(a))
        Tests.Listable.test(make({}, a))
        Tests.Listable.test(make(a, a))
        Tests.Listable.test(make(a, {}))
        Tests.Listable.test(make(make(a, make(a))))
      },
      test: function (a) {
        expect(a.list).toBeDefined()
        expect(a.toArray).toBeDefined()
      },
    },
    Iterable: {
      stress: function (a) {
        Tests.Iterable.test(a)
        Tests.Iterable.test(a.new())
        Tests.Iterable.test(make(a))
        Tests.Iterable.test(make({}, a))
        Tests.Iterable.test(make(a, a))
        Tests.Iterable.test(make(a, {}))
        Tests.Iterable.test(make(make(a, make(a))))
      },
      test: function (a) {
        expect(a.iterator).toBeDefined()
        expect(a.setItems).toBeDefined()
        expect(a.setIterator).toBeDefined()
        expect(a[Symbol.iterator]).toBeDefined()
      },
    },
    List: {
      stress: function (a) {
        Tests.List.test(a)
        Tests.List.test(a.new())
      },
      test: function (a) {
        expect(a.add).toBeDefined()
        expect(a.delete).toBeDefined()
        expect(a.list).toBeDefined()
        expect(a.iterator).toBeDefined()
        expect(a.toArray).toBeDefined()
        expect(a.setItems).toBeDefined()
        expect(a.setIterator).toBeDefined()
        expect(a[Symbol.iterator]).toBeDefined()
      },
    },
    Dict: {
      stress: function (a) {
        Tests.Dict.test(a)
        Tests.Dict.test(a.new())
      },
      test: function (a) {
        expect(a.get).toBeDefined()
        expect(a.add).toBeDefined()
        expect(a.delete).toBeDefined()
        expect(a.list).toBeDefined()
        expect(a.iterator).toBeDefined()
        expect(a.toArray).toBeDefined()
        expect(a.setItems).toBeDefined()
        expect(a.setIterator).toBeDefined()
        expect(a[Symbol.iterator]).toBeDefined()
      },
    },
    PropertyList: {
      test: function (a) {
        expect(a.items).toBeDefined()
      },
    },
  }
  it('Iterable: should always green', () => {
    var a = Iterable.new()
    Tests.Iterable.stress(a)
  })
  it('Listable: should always green', () => {
    var a = Listable.new()
    Tests.Listable.stress(a)
  })
  it('List: should always green', () => {
    var a = List.new()
    Tests.List.stress(a)
  })
  it('Dict: should always green', () => {
    var a = Dict.new()
    Tests.Dict.stress(a)
  })
})
describe('Thing', () => {
  it('should work #1', () => {
    var a = make({
      name: 'hello',
      fun: function () {},
    })
    var b = make({
      name: 'world',
      fun: function () {},
    })

    expect(b.name).toBe('world')
    expect(a.name).toBe('hello')
    expect(a.fun === b.fun).toBe(false)
  })
  it('should work #2', () => {
    var a = make({
      name: 'hello',
      fun: function () {},
    })
    var b = a.new({ name: 'world' })

    expect(b.name).toBe('world')
    expect(a.name).toBe('hello')
    expect(a.fun === b.fun).toBe(true)
  })
  it('be constructive', () => {
    var VisibleMixin = make({
      type: 'visible',
      visible: undefined,
    })
    var thing = Thing.new({}, VisibleMixin.new())
    expect(thing.getStates()).toStrictEqual({ type: 'visible' })
  })
  it('compose states', () => {
    var a = Thing.new({ state: 'A' }, VisibleMixin, IndexMixin)
    var b = a.new()
    b.toggleVisible()

    // same primitive values
    expect(a.state).toStrictEqual('A')
    expect(b.state).toStrictEqual('A')

    // same function reference
    expect(a.getStates === b.getStates).toBe(true)

    // different states
    var expectedStateOfA = {
      index: 0,
      type: undefined,
      visible: true,
    }
    expect(a.getStates()).toStrictEqual(expectedStateOfA)
    expect(b.getStates()).toStrictEqual({
      ...a.getStates(),
      visible: false,
    })
  })
})
describe('List', () => {
  it('be unique', () => {
    var A = List.new()
    var B = List.new()
    expect(A.is(B)).toBe(false)
    expect(A.add === B.add).toBe(true)
    expect(A.remove === B.remove).toBe(true)
    expect(A.items === B.items).toBe(false)
  })
  it('can add item', () => {
    var list = List.new()
    var A = Thing.new()
    var B = Thing.new()

    list.add(A, B)
    expect(list.toArray()).toStrictEqual([A, B])
  })
  it('can delete item', () => {
    var list = List.new()
    var A = Thing.new()
    var B = Thing.new()

    list.add(A, B)
    list.delete(A)
    expect(list.toArray()).toStrictEqual([B])
  })
  it('can transform items', () => {
    var list = List.new()
    var A = Thing.new()
    var B = Thing.new()

    list.add(A, B)
    expect(list.list(Array.from)).toStrictEqual([A, B])
  })
  it('can be iterating', () => {
    var list = List.new()
    expect(typeof list[Symbol.iterator] === 'function').toBe(true)

    let count = 0
    list.add(Thing.new(), Thing.new())
    for (const item of list) { count++ }
    expect(count).toBe(2)
  })
})
describe('Dict', () => {
  it('be unique', () => {
    var A = Dict.new()
    var B = Dict.new()
    expect(A.is(B)).toBe(false)
    expect(A.add === B.add).toBe(true)
    expect(A.remove === B.remove).toBe(true)
    expect(A.items === B.items).toBe(false)
  })
  it('can add item', () => {
    var dict = Dict.new()
    var A = Thing.new()
    var B = Thing.new()

    dict.add('A', A)
    dict.add('B', B)
    expect(dict.toArray()).toHaveLength(2)
    expect(dict.toArray()).toStrictEqual([A, B])
  })
  it('can delete item', () => {
    var dict = Dict.new()
    var A = Thing.new()
    var B = Thing.new()

    dict.add('A', A)
    dict.add('B', B)
    dict.delete('A')
    expect(dict.toArray()).toStrictEqual([B])
  })
  it('can transform items', () => {
    var dict = Dict.new()
    var A = Thing.new()
    var B = Thing.new()

    dict.add('A', A)
    dict.add('B', B)
    expect(dict.list(dict.toArray.bind(dict))).toStrictEqual([A, B])
  })
  it('can be iterating', () => {
    var dict = Dict.new()
    expect(typeof dict[Symbol.iterator] === 'function').toBe(true)

    let count = 0
    dict.add('A', Thing.new())
    dict.add('B', Thing.new())
    for (const item of dict) { count++ }
    expect(count).toBe(2)
  })
})
describe('RealThing', () => {
  var State = make({ type: TYPES.STATE })
  var Behavior = make({ type: TYPES.BEHAVIOR })
  var States = List.new({ type: TYPES.STATES })
  var Behaviors = List.new({ type: TYPES.BEHAVIORS })
  var RealThing = Thing.new({
    type: 'Real',
    getType: function () { return this.type },
    setType: function (type) { this.type = type },
    states: States.new(),
    behaviors: Behaviors.new(),
  })

  it('be constructive', () => {
    var real = RealThing.new()
    expect(real.getType()).toBe('Real')
  })
  it('be unique', () => {
    var A = RealThing.new()
    var B = RealThing.new()

    expect(A.is(B)).toBe(false)
    expect(A.getType === B.getType).toBe(true)
    expect(A.states === B.states).toBe(false)
    expect(A.behaviors === B.behaviors).toBe(false)
  })
  it('has states', () => {
    var real = RealThing.new()
    var A = State.new()
    var B = State.new()

    real.states.add(A, B)
    expect(real.states.toArray()).toStrictEqual([A, B])
  })
  it('has behaviors', () => {
    var real = RealThing.new()
    var A = Behavior.new()
    var B = Behavior.new()

    real.behaviors.add(A, B)
    expect(real.behaviors.toArray()).toStrictEqual([A, B])
  })
  it('has both states and behaviors', () => {
    var real = RealThing.new()
    var S = State.new()
    var B = Behavior.new()

    real.states.add(S)
    real.behaviors.add(B)

    expect(real.states.toArray()).toStrictEqual([S])
    expect(real.behaviors.toArray()).toStrictEqual([B])
  })
})
describe('PropertyList', () => {
  it('can add new property', () => {
    let propertyList = PropertyList.new()
    propertyList.add('width', 'number', 100)
    propertyList.add('height', 'number', 100)

    expect(propertyList.getPropertyValue('width')).toBe(100)
    expect(propertyList.getPropertyValue('height')).toBe(100)
  })
  it('can change property type', () => {
    let propertyList = PropertyList.new()
    propertyList.add('something', 'number', 1000)
    propertyList.setPropertyType('something', 'string')

    expect(propertyList.getProperty('something').getType()).toBe('string')
    expect(propertyList.getProperty('something').getValue()).toBe(1000)
    expect(propertyList.getPropertyValue('something')).toBe(1000)
  })
  it('can change property value', () => {
    let propertyList = PropertyList.new()
    propertyList.add('something', 'number', 1000)
    propertyList.setPropertyValue('something', 0)

    expect(propertyList.getProperty('something').getType()).toBe('number')
    expect(propertyList.getProperty('something').getValue()).toBe(0)
    expect(propertyList.getPropertyValue('something')).toBe(0)
  })
})
describe('GraphicElement', () => {
  it('is unique', () => {
    var a = GraphicElement.new()
    var b = GraphicElement.new()

    expect(a.is(b)).toBe(false)

    var propsA = a.getPropertyList()
    expect(propsA).toBeDefined()

    var propsB = b.getPropertyList()
    expect(propsB).toBeDefined()

    expect(propsA === propsB).toBeFalsy()
  })
  it('has propertyList', () => {
    var a = GraphicElement.new()
    expect(a.getPropertyList).toBeDefined()
    expect(a.getPropertyList()).toBeDefined()
  })
})
