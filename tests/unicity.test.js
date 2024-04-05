import { make } from '../src/thing.js'

let Thing = make()
let TestMe = { props: { nested: {} } }
let Expects = {
  ref: {
    object: TestMe,
    array: [TestMe],
    thing: Thing.new(TestMe),
    mixin: Thing.new(TestMe),
    mixinArray: Thing.new([TestMe]),
  },
}
let Tests = {
  ref: {
    object: [
      (a) => expect(a.ref).toBeDefined(),
      (a) => expect(a.ref).toBeInstanceOf(Object),
      // new
      (a) => expect(a.ref === a.new(a).ref).toBe(false),
      (a) => expect(a.ref.props === a.new(a).ref.props).toBe(false),
      (a) => expect(a.ref.props.nested === a.new(a).ref.props.nested).toBe(false),
      // clone
      (a) => expect(a.ref === a.clone(a).ref).toBe(false),
      (a) => expect(a.ref.props === a.clone(a).ref.props).toBe(false),
      (a) => expect(a.ref.props.nested === a.clone(a).ref.props.nested).toBe(false),
    ],
    array: [
      (a) => expect(a.ref).toBeDefined(),
      (a) => expect(a.ref).toBeInstanceOf(Array),
      (a) => expect(a.ref === a.new(a).ref).toBe(false),
      (a) => expect(a.ref === a.clone(a).ref).toBe(false),
      (a) => Tests.ref.object.every(test => test(a.ref[0])),
    ],
  },
  isUnique: (...inputs) => expect(new Set(inputs).size).toEqual(inputs.length),
  allKeysIsUnique: (a, b) => {
    for (const key in a) {
      if (!a.hasOwnProperty(key)) continue
      if (typeof a[key] != 'object') continue
      expect(a[key] === b[key]).toBe(false)
    }
  },
  quickTest: (thing, ...keys) => {
    let a = thing.new()
    let b = thing.new()
    let c = a.new()
    let d = a.clone(a)
    let items = [a, b, c, d]

    Tests.isUnique(a, b, c, d)
    for (let index = 0; index < keys.length; index++) {
      let key = keys[index]
      let itemValues = items.map(i => i[key])
      Tests.isUnique(...itemValues)
    }
  },
}
let TYPES = {
  SET: 'Set',
  MAP: 'Map',
  STATE: 'State',
  STATES: 'States',
  BEHAVIOR: 'Behavior',
  BEHAVIORS: 'Behaviors',
}

it('constructive', () => {
  let a = make({
    name: 'A',
    getStates: function () {},
  })
  expect(a.name).toBeDefined()
  expect(a.getStates).toBeDefined()

  let b = a.new()
  expect(b.name).toBeDefined()
  expect(b.getStates).toBeDefined()
})
it('test #1: ref to object', () => {
  let a = Thing.new({ ref: Expects.ref.object })
  Tests.ref.object.every(test => test(a))
})
it('test #2: ref to array', () => {
  let a = Thing.new({ ref: Expects.ref.array })
  Tests.ref.array.every(test => test(a))
})
it('test #3: ref to Thing', () => {
  let a = Thing.new({ ref: Expects.ref.thing })
  Tests.ref.object.every(test => test(a))
})
it('test #4: ref to Thing in array', () => {
  let a = Thing.new({ ref: [Expects.ref.thing] })
  Tests.ref.array.every(test => test(a))
})
it('test #5: ref in mixin to object', () => {
  let a = Thing.new({}, Thing.new({ ref: Expects.ref.object }))
  Tests.ref.object.every(test => test(a))
})
it('test #6: ref in mixin to array', () => {
  let a = Thing.new({}, Thing.new({ ref: Expects.ref.array }))
  Tests.ref.array.every(test => test(a))
})
it('test #7: ref in mixin to Thing', () => {
  let a = Thing.new({}, Thing.new({ ref: Expects.ref.thing }))
  Tests.ref.object.every(test => test(a))
})
it('test #8: ref in mixin Thing in array', () => {
  let a = Thing.new({}, Thing.new({ ref: [Expects.ref.thing] }))
  Tests.ref.array.every(test => test(a))
})
it('test #9: composed', () => {
  let a = make({ items: new Set() })
  let b = a.clone()

  expect(a.items).toBeDefined()
  expect(b.items).toBeDefined()

  let Iterrable = make({
    name: 'Iterrable',
    new: function () {
      this.setItems()
      return this.clone()
    },
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
  let Listable = make({
    name: 'Listable',
    list: function (transform = t => t) {
      return transform(this.items)
    },
    listArray: function () {
      return this.list(Array.from)
    },
  }, Iterrable.new())
  let Dict = make({
    items: new Map(),
    name: 'Dict',
    add: function (key, value) {
      this.items.set(key, value)
    },
    get: function (type) {
      return this.items.get(type)
    },
    delete: function (item) {
      this.items.delete(item)
    },
    listArray: function () {
      return this.list(map => Array.from(map, ([name, value]) => ({
        name,
        value,
      })))
    },
  }, Listable.new())

  Tests.quickTest(Dict, 'items')
})
