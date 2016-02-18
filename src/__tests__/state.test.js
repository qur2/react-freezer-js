import sinon from 'sinon';
import test from 'blue-tape';
import Freezer from 'freezer-js';
import ReactDOMServer from 'react-dom/server';
import { isFridge, commit, morph, parallel, serial } from '../';


function setup () {
  const fridge = new Freezer({
    p0: true, p1: { q0: true, q1: false },
  });
  return {
    fridge
  };
}

function willDo (delay, fn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(fn()), delay)
  })
}

test('isFridge', t => {
  const { fridge } = setup();
  t.true(isFridge(fridge), 'recognizes a freezer object');
  t.false(isFridge({}), 'rejects a plain object');
  t.end();
});

test('commit expects its args to be a freezer instance and an object', t => {
  const { fridge } = setup();
  t.throws(() => commit({}), 'object + undefined');
  t.throws(() => commit(null, {}), 'null + object');
  t.throws(() => commit(fridge, 1), 'freezer + number');
  t.throws(() => commit(fridge, ''), 'freezer + string');
  t.throws(() => commit(fridge, false), 'freezer + boolean');
  t.doesNotThrow(() => commit(fridge, {}), 'freezer + object');
  t.end();
});

test('commit updates the freezer instance using the provided object', t => {
  const { fridge } = setup();
  commit(fridge, {p0: false, p1: false})
  t.deepEqual(fridge.get(), {p0: false, p1: false});
  t.end();
});

test('morph updates the freezer instance using the provided function', t => {
  const { fridge } = setup();
  const update = state => Object.assign({}, state, {p0: !state.p0})
  morph(fridge, update)
  t.deepEqual(fridge.get(), {p0: false, p1: { q0: true, q1: false }});
  t.end();
});

test('morph understands promises that return values', t => {
  const { fridge } = setup();
  const willUpdate = state => Promise.resolve({p0: false, p1:false})
  return morph(fridge, willUpdate).then(() => {
    t.deepEqual(fridge.get(), {p0: false, p1: false});
  });
});

// test('morph understands promises that return functions', t => {
//   const { fridge } = setup();
//   const willUpdate = state => Promise.resolve({p0: false, p1:false}).then(delta => state => ({p0: !delta.p0, p1: !delta.p1}))
//   return morph(fridge, willUpdate).then(() => {
//     t.deepEqual(fridge.get(), {p0: true, p1: true});
//   });
// });

test('commit is tappable into a promise chain', t => {
  const { fridge } = setup();
  const willUpdate = state => Promise.resolve({p0: false, p1:false}).then(delta => commit(fridge, delta))
  return morph(fridge, willUpdate).then(() => {
    t.deepEqual(fridge.get(), {p0: false, p1: false});
  });
});

test('serial reduces promises', t => {
  const { fridge } = setup();
  const sequence = serial([
    () => ({p0: false, p1:false}),
    (d) => willDo(250, () => ({p0: !d.p0, p1: !d.p1}))
  ])
  return morph(fridge, sequence).then(() => {
    t.deepEqual(fridge.get(), {p0: true, p1: true});
  });
});

test('serial reduces promises and handles explicit commit', t => {
  const { fridge } = setup();
  const sequence = serial([
    () => ({p0: false, p1:false}),
    commit,
    (d) => Promise.resolve({p0: !d.p0, p1: !d.p1})
  ])
  return morph(fridge, sequence).then(() => {
    t.deepEqual(fridge.get(), {p0: false, p1: false}, 'no auto-commit when explicitely set');
  });
});

test('parallel maps promises', t => {
  const { fridge } = setup();
  const sequence = parallel([
    (state) => ({p0: !state.p0}),
    () => willDo(500, () => ({p1: 'p1'}))
  ])
  return morph(fridge, sequence).then(() => {
    t.deepEqual(fridge.get(), {p0: false, p1: 'p1'});
  });
});
