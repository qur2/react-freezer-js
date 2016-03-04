import Freezer from 'freezer-js'

export function isFridge (fridge) {
  return fridge instanceof Freezer
}

export function isObject (value) {
  // http://jsperf.com/isobject4
  return value !== null && typeof value === 'object'
}

// Applies a function to the current state to generate a delta and commits
// the delta (i.e. modifies the state) if it is not `undefined`.
// It handles promises as well.
export function morph (fridge, fn) {
  // inject the state and the commit function
  fn.call(fridge, {
    state: fridge.get(),
    commit: delta => commit(fridge, delta),
  })
}

// Apply the delta to the state (side-effect) and returns the delta,
// so that it can easily be tapped into a promise chain.
// check freezer-js documentation for more about update:
// @see https://github.com/arqex/freezer#update-methods
export function commit (fridge, delta) {
  if (!isFridge(fridge)) {
    throw new Error('commit() was applied on a non-freezer instance')
  }
  if (!isObject(delta)) {
    throw new Error('delta should be an object')
  }
  fridge.get().set(delta)
  return delta
}
