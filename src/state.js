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
  // compute the new state (could be just some parts)
  const delta = fn.call(fridge, fridge.get())
  // if the delta is a promise, an async flow is implied, wait
  // for the fullfilment to compute the state
  if (delta instanceof Promise) {
    return delta.then(d => {
      // if (typeof d === 'function') return morph(fridge, d)
      if (typeof d !== 'undefined') return commit(fridge, d)
    })// .catch(err => { throw new Error(err) })
  } else if (typeof delta !== 'undefined') {
    return commit(fridge, delta)
  }
}

// Given an array of functions, it builds a new function that will apply them
// serially (in cascade). It is more or less equivalent to a async function
// composition: serial([f, g, h]) ~= (f∘g∘h)(state)
// It is possible to manually decide to commit the intermediary result to the
// state by simply using the `commit` function in the chain. In this case,
// the final result will be `undefined` to avoid an auto-commit. If a final
// commit is still needed, just add `commit` at the very end of the array of
// functions: serial([f, commit, g, h, commit]) ~= (f∘commit∘g∘h∘commit)(state)
// Note that `commit` is used for side-effect.
// @see `commit`
export function serial (promFns) {
  return function (...args) {
    let shouldCommit = true
    // pre-process the callbacks to get the correct context and avoid
    // unnecessary `then()`
    const boundCommit = commit.bind(null, this)
    const boundPromFns = promFns.map(f => {
      if (f === commit) {
        shouldCommit = false
        return boundCommit
      }
      return f
    })
    const p = boundPromFns.reduce(function (delta, promFn) {
      return delta.then(promFn)
    }, Promise.resolve(args))
    return shouldCommit ? p.then(boundCommit) : p.then(() => {})
  }
}

// Given an array of functions, it builds a new function that will execute them
// at the same time, in parallel. The results will be merged together and
// committed to the state.
// Note that in this context manually controlling `commit` does not make sense.
export function parallel (promFns) {
  return function (...args) {
    return Promise.all(promFns.map(f => f(...args))).then(deltas => {
      return Object.assign.apply(Object, [{}].concat(deltas))
    })
  }
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
