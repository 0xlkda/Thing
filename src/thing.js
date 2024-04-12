import { clone } from './clone.js'

let copyKeys = function (target, source) {
  for (let key in source) {
    target[key] = clone(source[key])
  }
}
let copySymbols = function (target, source) {
  for (let symbol of Object.getOwnPropertySymbols(source)) {
    target[symbol] = source[symbol]
  }
}
let copyEverythingExceptFunctions = function (target, source) {
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

let UsefulThing = {
  is: function (that) {
    return Object.is(this, that)
  },
  allocate: function () {
    return clone(this)
  },
  clone: function () {
    return this.allocate()
  },
}

let Thing = {
  new: function (params = this, ...mixins) {
    let instance = Object.create(this)
    instance.mixins = mixins.concat(this.mixins).filter(Boolean)
    instance.mixins.forEach(mixin => {
      copyKeys(instance, mixin)
      copySymbols(instance, mixin)
    })

    if (params) {
      copyEverythingExceptFunctions(instance, params)
      copySymbols(instance, params)
    }

    return instance
  },
}

let make = (...args) => Thing.new(...args, UsefulThing)

export {
  Thing, make, clone,
}
