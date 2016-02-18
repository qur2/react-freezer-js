import React from 'react'
import sinon from 'sinon'
import test from 'blue-tape'
import Freezer from 'freezer-js'
import ReactDOMServer from 'react-dom/server'
import { cool, warmUp, parallel, serial } from '../'

function setup () {
  const TestComp = props => {
    const { children } = props
    if (children) return children
    if (props.action) props.action()
    if (props.action2) props.action2('argh', 'castle')
    return <i>{JSON.stringify(props).replace(/\"/g, '')}</i>
  }
  const fridge = new Freezer({ui: {theFlag: true}}, {mutable: true})
  return {
    TestComp, fridge,
  }
}

test('Bound actions', t => {
  const { fridge, TestComp } = setup()
  const spy = sinon.spy()
  const WarmedUpComp = warmUp(TestComp, [
    ['action', spy],
  ])
  const CooledApp = cool(TestComp, fridge)
  const renderStuff = () => {
    return ReactDOMServer.renderToStaticMarkup(
      <CooledApp><WarmedUpComp/></CooledApp>
    )
  }
  renderStuff()
  t.true(spy.calledWith({ui: {theFlag: true}}), 'receive the current state')
  t.true(spy.calledOnce)
  t.end()
})

test('Bound actions', t => {
  const { fridge, TestComp } = setup()
  const WarmedUpComp = warmUp(TestComp, [
    ['action2', (arg0, arg1, state) => {
      return { newKey: arg0 + arg1 }
    }],
  ])
  const CooledApp = cool(TestComp, fridge)
  const renderStuff = () => {
    return ReactDOMServer.renderToStaticMarkup(
      <CooledApp><WarmedUpComp/></CooledApp>
    )
  }
  renderStuff()
  t.deepEqual(fridge.get(), {ui: {theFlag: true}, newKey: 'arghcastle'}, 'may modify the state')
  t.end()
})

test('Bound actions in parallel', t => {
  const { fridge, TestComp } = setup()
  const WarmedUpComp = warmUp(TestComp, [
    ['action2', parallel([
      (arg0, arg1, state) => {
        t.deepEqual([arg0, arg1], ['argh', 'castle'])
        return { [arg1]: arg0 }
      },
      (arg0, arg1, state) => {
        t.deepEqual([arg0, arg1], ['argh', 'castle'])
        return { hard: 'code' }
      },
    ])],
  ])
  const CooledApp = cool(TestComp, fridge)
  const renderStuff = () => {
    return ReactDOMServer.renderToStaticMarkup(
      <CooledApp><WarmedUpComp/></CooledApp>
    )
  }
  renderStuff()
  // using setTimeout is a bit shitty but the promise is returned
  // when the action is fired and is out of test scope
  setTimeout(() => {
    t.deepEqual(fridge.get(), {
      ui: {theFlag: true},
      castle: 'argh',
      hard: 'code',
    }, 'all gets the params')
    t.end()
  }, 500)
})

test('Bound actions in sequence', t => {
  const { fridge, TestComp } = setup()
  const WarmedUpComp = warmUp(TestComp, [
    ['action2', (a, b, state) => serial([
      (args) => {
        t.deepEqual([a, b], ['argh', 'castle'])
        return { [b]: a }
      },
      (delta) => {
        t.deepEqual(delta, {castle: 'argh'})
        return Object.assign({ hard: 'code' }, delta)
      },
    ])],
  ])
  const CooledApp = cool(TestComp, fridge)
  const renderStuff = () => {
    return ReactDOMServer.renderToStaticMarkup(
      <CooledApp><WarmedUpComp/></CooledApp>
    )
  }
  renderStuff()
  // using setTimeout is a bit shitty but the promise is returned
  // when the action is fired and is out of test scope
  setTimeout(() => {
    t.deepEqual(fridge.get(), {
      ui: {theFlag: true},
      castle: 'argh',
      hard: 'code',
    }, 'are seeded with all params')
    t.end()
  }, 500)
})
