import { Engines, clone } from '../src/clone.js'

it('Object', () => {
  var a = { props: { nested: { deepest: [] } } }
  expect(Engines.object(a)).toBeInstanceOf(Object)
  expect(Engines.object(a) === a).toBe(false)
  expect(Engines.object(a).props === a.props).toBe(false)
  expect(Engines.object(a).props.nested === a.props.nested).toBe(false)
  expect(Engines.object(a).props.nested.deepest === a.props.nested.deepest).toBe(false)
})
it('Array', () => {
  var a = [{ props: { nested: { deepest: [] } } }]
  expect(Engines.array(a)).toBeInstanceOf(Array)
  expect(Engines.array(a) === a).toBe(false)
  expect(Engines.array(a)[0] === a[0]).toBe(false)
  expect(Engines.array(a)[0].props === a[0].props).toBe(false)
  expect(Engines.array(a)[0].props.nested === a[0].props.nested).toBe(false)
  expect(Engines.array(a)[0].props.nested.deepest === a[0].props.nested.deepest).toBe(false)
})
it('Map', () => {
  var a = new Map()
  expect(Engines.map(a)).toBeInstanceOf(Map)
  expect(Engines.map(a) === a).toBe(false)
})
it('Set', () => {
  var a = new Set()
  expect(Engines.set(a)).toBeInstanceOf(Set)
  expect(Engines.set(a) === a).toBe(false)
})
it('everything at once', () => {
  var a = {
    number: 1,
    string: 'string',
    true: true,
    false: false,
    object: {},
    array: [],
    set: new Set(),
    map: new Map(),
    [Symbol.iterator]: function * () {},
  }

  expect(clone(a)).toStrictEqual(a)

  // primitives
  expect(clone(a).number === a.number).toBe(true)
  expect(clone(a).string === a.string).toBe(true)
  expect(clone(a).true === a.true).toBe(true)
  expect(clone(a).false === a.false).toBe(true)
  expect(clone(a)[Symbol.iterator] === a[Symbol.iterator]).toBe(true)

  // references
  expect(clone(a).object === a.object).toBe(false)
  expect(clone(a).array === a.array).toBe(false)
  expect(clone(a).set === a.set).toBe(false)
  expect(clone(a).map === a.map).toBe(false)
})
