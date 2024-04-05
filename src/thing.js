import { clone } from './clone.js'

let copySymbols = function (target, source) {
  for (let symbol of Object.getOwnPropertySymbols(source)) {
    target[symbol] = source[symbol]
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

    if (params) {
      for (let key in params) {
        if (typeof params[key] === 'function') {
          Object.defineProperty(instance, key, {
            get: function () { return params[key] },
            set: function (newValue) { params[key] = newValue },
            enumerable: true,
            configurable: true,
          })
        } else {
          instance[key] = clone(params[key])
        }
      }
      copySymbols(instance, params)
    }

    mixins.forEach(mixin => {
      for (let key in mixin) {
        instance[key] = clone(mixin[key])
      }
      copySymbols(instance, mixin)
    })

    return instance
  },
}

let make = (...args) => Thing.new(...args, UsefulThing)

export { Thing, make }
