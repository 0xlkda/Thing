var KeepAsIs = ['function', 'symbol', 'number', 'string', 'boolean']

export var Types = {
  isArray: (obj) => Array.isArray(obj),
  isObject: (obj) => Object.prototype.toString.call(obj) === '[object Object]',
  isSet: obj => obj instanceof Set,
  isMap: obj => obj instanceof Map,
}

export var Engines = {
  object: (obj) => Reflect.ownKeys(obj).reduce((o, k) => (o[k] = clone(obj[k]), o), {}),
  array: (obj) => obj.map((o) => clone(o)),
  map: (obj) => {
    let map = new Map()
    for (let [k, v] of obj) { map.set(clone(k), clone(v)) }
    return map
  },
  set: (obj) => {
    let set = new Set()
    for (let v of obj) { set.add(clone(v)) }
    return set
  },
}

export var clone = function (obj, keepAsIs = KeepAsIs) {
  if (keepAsIs.includes(typeof obj)) return obj
  if (Types.isArray(obj)) return Engines.array(obj)
  else if (Types.isObject(obj)) return Engines.object(obj)
  else {
    if (typeof structuredClone === 'function') {
      try {
        return structuredClone(obj)
      } catch (error) {
        return obj
      }
    }
    else {
      if (Types.isMap(obj)) return Engines.map(obj)
      else if (Types.isSet(obj)) return Engines.set(obj)
      else return obj
    }
  }
}
