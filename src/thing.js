import { clone } from './clone.js'

function copyKeys(target, source) {
  for (let key in source) {
    target[key] = clone(source[key])
  }
}
function copySymbols(target, source) {
  for (let symbol of Object.getOwnPropertySymbols(source)) {
    target[symbol] = source[symbol]
  }
}
function copyEverythingExceptFunctions(target, source) {
  for (let key in source) {
    if (typeof source[key] === 'function') {
      Object.defineProperty(target, key, {
        get: function () { return source[key] },
        set: function (newValue) { source[key] = newValue },
        enumerable: true,
        configurable: true,
      })
    } else {
      target[key] = clone(source[key])
    }
  }
}

function handleParams(instance, params) {
  copyEverythingExceptFunctions(instance, params)
  copySymbols(instance, params)
}
function handleMixins(instance, mixins) {
  instance.mixins = mixins
  instance.mixins.forEach(mixin => {
    copyKeys(instance, mixin)
    copySymbols(instance, mixin)
  })
}
function cleanupMixins(...mixins) {
  return Array.from(new Set(...mixins)).filter(Boolean)
}

let Thing = {
  new: function (params = this, ...mixins) {
    var instance = Object.create(this)
    var mixins = cleanupMixins([].concat(this.mixins, params.mixins, mixins))

    handleMixins(instance, mixins)
    handleParams(instance, params)
    return instance
  },
}
let VerbalThing = {
  new: function (params = this, ...mixins) {
    var instance = Thing.new(...arguments)
    console.log('INPUT: ', {
      this: this,
      params,
      mixins,
    })
    console.log('OUTPUT: ', { instance })
    return instance
  },
}

let UsefulMixin = {
  is: function (that) {
    return Object.is(this, that)
  },
  clone: function () {
    return clone(this)
  },
}

let make = (...args) => Thing.new(...args, UsefulMixin)
let makeVerbal = (...args) => VerbalThing.new(...args, UsefulMixin)

export {
  Thing,
  clone,
  make,
  makeVerbal,
}
