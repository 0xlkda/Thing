import { make } from '../src/thing.js'

// internet goody: https://stackoverflow.com/a/31236132/8743686
const getDesc = (obj, prop) => {
  let desc = Object.getOwnPropertyDescriptor(obj, prop)
  return desc || (Object.getPrototypeOf(obj) ? getDesc(Object.getPrototypeOf(obj), prop) : undefined)
}
const createProxy = (descriptor) => new Proxy(Object.prototype, descriptor)
const mixins = (...protos) => createProxy({
  has: (target, prop) => protos.some(obj => prop in obj),
  get: (target, prop, receiver) => {
    let obj = protos.find(obj => prop in obj)
    return obj ? Reflect.get(obj, prop, receiver) : undefined
  },
  set: (target, prop, value, receiver) => {
    let obj = protos.find(obj => prop in obj)
    return Reflect.set(obj || Object.create(null), prop, value, receiver)
  },
  enumerate: function* (target) { yield* this.ownKeys(target) },
  ownKeys: (target) => {
    let hash = Object.create(null)
    for (let obj of protos) {
      for (let p in obj) {
        if (!hash[p]) hash[p] = true
      }
    }
    return Object.getOwnPropertyNames(hash)
  },
  getOwnPropertyDescriptor: (target, prop) => {
    let obj = protos.find(obj => prop in obj)
    let desc = obj ? getDesc(obj, prop) : undefined
    if (desc) desc.configurable = true
    return desc
  },
  preventExtensions: (target) => false,
  defineProperty: (target, prop, desc) => false,
})

it('mine should do magic', () => {
  var a = { nested: {} }
  var b = make(a)
  expect(b === a).toBe(false)
  expect(b.nested === a.nested).toBe(false)
})
it('more magic with mine', () => {
  var a = {
    private: {},
    shared: function () {},
  }
  var b = make(a)
  expect(b === a).toBe(false)
  expect(b.private === a.private).toBe(false)
  expect(b.shared === a.shared).toBe(true)
})

it('they could not!', () => {
  var a = { nested: {} }
  var b = mixins(a)
  expect(b === a).toBe(false)
  expect((b.nested === a.nested) === false).toBe(false)
})
it('more magic and dead', () => {
  var a = {
    shared: function () {},
    private: {},
  }
  var b = mixins(a)
  expect(b === a).toBe(false)
  expect((b.private === a.private) === false).toBe(false)
  expect((b.shared === a.shared) === false).toBe(false)
})
