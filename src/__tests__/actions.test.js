import React from 'react'
import sinon from 'sinon'
import test from 'blue-tape'
import Freezer from 'freezer-js'
import ReactDOMServer from 'react-dom/server'
import { cool, warmUp } from '../'

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
  t.true(spy.calledOnce)
  const actionArg = spy.lastCall.args[0]
  t.true(actionArg.hasOwnProperty('state'))
  t.true(actionArg.hasOwnProperty('commit'))
  t.deepEqual(actionArg.state, {ui: {theFlag: true}}, 'receive the current state')
  t.end()
})

test('Bound actions with extra params', t => {
  const { fridge, TestComp } = setup()
  const WarmedUpComp = warmUp(TestComp, [
    ['action2', (arg0, arg1, {state, commit}) => {
      commit({ newKey: arg0 + arg1 })
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
