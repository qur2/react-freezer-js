import React from 'react';
import test from 'blue-tape';
import Freezer from 'freezer-js';
import ReactDOMServer from 'react-dom/server';
import cool, { warmUp, isFridge } from '../';


function setup() {
  const TestComp = props => {
    const { children } = props;
    if (children) return children;
    return <i>{JSON.stringify(props).replace(/\"/g, '')}</i>;
  };
  const fridge = new Freezer({ui: {theFlag: true}});
  return {
    TestComp, fridge
  };
}

test('isFridge', t => {
  const { fridge } = setup();
  t.true(isFridge(fridge), 'recognizes a freezer object');
  t.false(isFridge({}), 'rejects a plain object');
  t.end();
});

test('Cooled component', t => {
  const { fridge, TestComp } = setup();
  const CooledComp = cool(TestComp, fridge);
  t.equal(CooledComp.displayName, 'CooledTestComp', 'has a derived name');
  t.deepEqual(CooledComp.childContextTypes, {
    fridge: isFridge,
    dispatch: React.PropTypes.func.isRequired,
  }, 'has some child context types');
  t.end();
});

test('Warmed up component', t => {
  const { fridge, TestComp } = setup();
  const WarmedUpComp = warmUp(TestComp, []);
  t.equal(WarmedUpComp.displayName, 'WarmedUpTestComp', 'has a derived name');
  t.deepEqual(WarmedUpComp.contextTypes, {
    fridge: isFridge,
    dispatch: React.PropTypes.func.isRequired,
  }, 'has some context types');
  t.end();
});

test('Rendered warmed up component', t => {
  const { fridge, TestComp } = setup();
  const WarmedUpComp = warmUp(TestComp, [['flag', 'ui', 'theFlag']]);
  const CooledApp = cool(TestComp, fridge);
  const renderStuff = () => {
    return ReactDOMServer.renderToStaticMarkup(
      <CooledApp><WarmedUpComp a="some" /></CooledApp>
    );
  }
  const rndrd = renderStuff();
  t.equal(rndrd, '<i>{a:some,flag:true}</i>', 'gets fresh props from the fridge');
  t.end();
});
