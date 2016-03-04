import test from 'blue-tape'
import Freezer from 'freezer-js'
import { isFridge, commit, morph, parallel, serial } from '../'

function setup () {
  const fridge = new Freezer({
    p0: true, p1: { q0: true, q1: false },
  })
  return {
    fridge,
  }
}

function willDo (delay, fn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(fn()), delay)
  })
}

test('isFridge', t => {
  const { fridge } = setup()
  t.true(isFridge(fridge), 'recognizes a freezer object')
  t.false(isFridge({}), 'rejects a plain object')
  t.end()
})

test('commit expects its args to be a freezer instance and an object', t => {
  const { fridge } = setup()
  t.throws(() => commit({}), 'object + undefined')
  t.throws(() => commit(null, {}), 'null + object')
  t.throws(() => commit(fridge, 1), 'freezer + number')
  t.throws(() => commit(fridge, ''), 'freezer + string')
  t.throws(() => commit(fridge, false), 'freezer + boolean')
  t.doesNotThrow(() => commit(fridge, {}), 'freezer + object')
  t.end()
})

test('commit updates the freezer instance using the provided object', t => {
  const { fridge } = setup()
  commit(fridge, {p0: false, p1: false})
  t.deepEqual(fridge.get(), {p0: false, p1: false})
  t.end()
})

test('morph updates the freezer instance using the provided function', t => {
  const { fridge } = setup()
  const update = ({state, commit}) => commit({...state, p0: !state.p0})
  morph(fridge, update)
  t.deepEqual(fridge.get(), {p0: false, p1: { q0: true, q1: false }})
  t.end()
})
