import { make as make } from '../src/thing.js'

let commands = {
  turnLeft: function () { return this.name + ' turned left' },
  turnRight: function () { return this.name + ' turned right' },
  go: function () { return this.name + ' gooo' },
  stop: function () { return this.name + ' stopped' },
}
let Car = make({ name: 'Toyasca' }, commands)

it('Car stories', () => {
  expect(Car.turnLeft()).toBe('Toyasca turned left')
  expect(Car.turnRight()).toBe('Toyasca turned right')
  expect(Car.go()).toBe('Toyasca gooo')
  expect(Car.stop()).toBe('Toyasca stopped')
})
describe('Pimp my rides', () => {
  let MorePowerEngine = {
    go: function () { return `${this.name} supadupa gooooooooooooooooooooooo` },
    nitros: function () { return this.go() + ' woooooshhhhhhhhhhh!' },
  }
  let testRides = function (PowerCar, Car) {
    it('Car', () => {
      expect(Car.turnLeft()).toBe('Toyasca turned left')
      expect(Car.turnRight()).toBe('Toyasca turned right')
      expect(Car.go()).toBe('Toyasca gooo')
      expect(Car.stop()).toBe('Toyasca stopped')
    })
    it('PowerCar', () => {
      expect(PowerCar.turnLeft()).toBe('Toyasca turned left')
      expect(PowerCar.turnRight()).toBe('Toyasca turned right')
      expect(PowerCar.go()).toBe('Toyasca supadupa gooooooooooooooooooooooo')
      expect(PowerCar.nitros()).toBe('Toyasca supadupa gooooooooooooooooooooooo woooooshhhhhhhhhhh!')
      expect(PowerCar.stop()).toBe('Toyasca stopped')
    })
  }

  describe('PowerCar as Car.new()', () => {
    var PowerCar = Car.new(MorePowerEngine)
    testRides(PowerCar, Car)
  })
  describe('PowerCar as composed Car', () => {

    var PowerCar = make(MorePowerEngine, Car)
    testRides(PowerCar, Car)

    var PowerCar = make(MorePowerEngine, Car.clone())
    testRides(PowerCar, Car)

    var PowerCar = make(MorePowerEngine, Car.new())
    testRides(PowerCar, Car)
  })
  describe('PowerCar as composed another way', () => {
    var PowerCar = make({}, Car, MorePowerEngine)
    testRides(PowerCar, Car)

    var PowerCar = make({}, Car.clone(), MorePowerEngine)
    testRides(PowerCar, Car)

    var PowerCar = make({}, Car.new(), MorePowerEngine)
    testRides(PowerCar, Car)
  })
})
