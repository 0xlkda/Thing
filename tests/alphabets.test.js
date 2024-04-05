import { make } from '../src/thing.js'

var Char = make({
  value: '',
  change: function (value) {
    this.value = value
    return this
  },
})
var range = [65, 90]
var createRange = ([from, to]) => Array.from({ length: to - from })
  .reduce((list, _, index) => list.concat(from + index + 1), [from])

var unicodeChars = createRange(range)
var alphabets = unicodeChars.map(code => String.fromCharCode(code))
alphabets.toString = function (reducer = (s, c) => s.concat(c)) { return this.reduce(reducer, '') }

var chars = alphabets.map((value) => Char.new({ value }))
chars.toString = function () { return this.reduce((s, char) => s.concat(char.value), '') }

it('has 26 chars', () => expect(chars.toString().length).toBe(26))
it('is UPPERCASE english alphabets', () => expect(chars.toString()).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ'))
it('can be transformed to lowercase english alphabets', () => {
  chars.forEach(char => char.change(char.value.toLowerCase()))
  expect(chars.toString()).toBe('abcdefghijklmnopqrstuvwxyz')
})
it('has function expressions from Char', () => {
  Char.change = function (value) {
    this.value = `[${value}]`
    return this
  }
  chars.forEach(char => char.change(char.value.toLowerCase()))
  var expected = alphabets.toString((s, c) => s.concat(`[${c.toLowerCase()}]`))
  expect(chars.toString()).toBe(expected)
})
