# react-freezer

Helpers for using [freezer-js](https://github.com/arqex/freezer) along with
[react](https://facebook.github.io/react/). The library provides 2 higher
order components that will help you with managing the props of your components,
abstracting the central state atom away.


## Basic features

The `cool` function wraps the target component and binds it to a freezer
instance:

```js
import React from 'react';
import { cool } from 'react-freezer';
// fridge is a freezer instance
import { fridge } from './state';

function Grandaddy(props) {
  return <span><SomeComponent /></span>;
}

export default cool(Grandaddy, fridge);
```

Through the context, the fridge can be made available to any sub-component.

The `warmUp` function wraps the target component and provides some props taken
out of the fridge:

```js
import React from 'react';
import { cool, warmUp } from 'react-freezer';

function SomeComponent({ flag }) {
  return <span>{flag}</span>;
}

// state.ui.theFlag will be made available under props.flag
export default warmUp(SomeComponent, [['flag', 'ui', 'theFlag']]);
```

Whenever the state changes, the cooled component will be re-rendered,
triggering a top-down rendering. By leveraging `freezer-js`'s immutability,
this can be made very efficient.

To get one step closer to a flux-ish flow, action triggers (AKA dispatch) can also be passed in to components. An action trigger is a bound `Freezer.trigger()` call with arbitrary arguments:

```js
import React from 'react';
import { warmUp } from 'react-freezer';

function SomeComponent({ flag, dispatchAction }) {
  // this is calling fridge.trigger('DO_SOMETHING', 'arg0', 'more')
  dispatchAction('more')
  return <span>{flag}</span>;
}

// note the @ that tells the library to bind Freezer.trigger
export default warmUp(SomeComponent, [
  ['flag', 'ui', 'theFlag'],
  ['@dispatchAction', 'DO_SOMETHING', 'arg0']
]);
```

For more notes about triggering, see
https://github.com/arqex/freezer#usage-with-react.

Note that as for any HoC, they can be combined with decorators
if that's your thing.


## Redux-like feature

### Actions and state updates

Since v1.0.0, a more opiniated way of handling actions is provided. The concept
is inspired/borrowed from redux-like libraries. An actions is a mean to run
a reducer function on the state to generate a new updated state.

In the context of
using freezer-js, an action generates a partial state that is merged back into
the state. In order to do that, the actual action will be run by a controller
function and it will handle the state behind the scene:

```js
import React from 'react';
import { warmUp } from 'react-freezer';

function SomeComponent({ flag, fireAction }) {
  return <button onClick={() => fireAction('more')}>click</button>;
}

export default warmUp(SomeComponent, [
  ['fireAction', arg0 => ({ aFlag: arg0 })]
]);
// after the action has run, the fridge looks like:
// {
//   ...
//   aFlag: 'more',
//   ...
// }
```

In case the action needs to know about the current state, it is provided when
invoked:

```js
import React from 'react';
import { warmUp } from 'react-freezer';

function SomeComponent({ flag, fireAction }) {
  return <button onClick={() => fireAction('mutation')}>click</button>;
}

export default warmUp(SomeComponent, [
  ['fireAction', (str, state) => Object.assign({}, state, {some: state.some + ' - ' + str})]
]);
// after the action has run, the fridge looks like:
// {
//   ...
//   some: 'mutation - original content',
//   ...
// }
```

### Compound actions

Sometimes, it is desirable to compose some actions together. Say you have
2 actions, such as remotely fetch a JSON config file (async) and navigate to a
different URL, and you want to execute them in order (i.e. you want to wait
for the fetch to successfully finish before triggering the URL change because you *really* need that config :).

The naive approach is to build a 3rd action that combines both. However, this
will increase the quantity of bookkeeping and promote bad ideas such as copy/pasting
blocks of code.
To help with that, some helpers are provided to combine actions easily.

Here is an example with a sequence that needs to run in order:

```js
import React from 'react';
import { warmUp, serial, commit } from 'react-freezer';
import { fetchTheConfig, navigateTo } from '../somewhere/actions';

function SomeComponent({ flag, fireAction }) {
  return <button onClick={() => fireMultipleAction('configA.json', '/settings/')}>click</button>;
}

export default warmUp(SomeComponent, [
  ['fireMultipleAction', (conf, dest) => serial([
    () => fetchTheConfig(conf),
    commit,
    () => navigateTo(dest)
  ])]
]);
// we managed to reuse the actions with very little declarative glue
```
Here is an example that runs actions in parallel:

```js
import React from 'react';
import { warmUp, parallel } from 'react-freezer';
import { fetchTheUser, fetchTheUserContent } from '../somewhere/actions';

function SomeComponent({ flag, fireAction }) {
  return <button onClick={() => fireMultipleAction('freakazoid')}>click</button>;
}

export default warmUp(SomeComponent, [
  ['fireMultipleAction', (userId) => parallel([
    () => fetchTheUser(userId),
    () => fetchTheUserContent(userId)
  ])]
]);
// here as well, we reused the actions with very little declarative glue
```

## In case you wonder why

There are already plenty of libraries for doing async flow control, that's true. However, the utilities included here provide some small additions to make it more convenient to use along with your freezer state (namely commit and merging of parallel results). So even with using a library such as [Q](https://github.com/kriskowal/q) or [bluebird](https://github.com/petkaantonov/bluebird), there would still be those convenient utilities (they also do context binding for you, did you notice you never need to pass in the state explicitely?).

Another (nicer IMO) approach is to use generator functions along with something like [co](https://github.com/tj/co). However, it's unclear if they are ready for prime time and polyfills are not exactly lightweight (babel-polyfill is at 21.1Kb minified on [cdnjs](https://cdnjs.com/libraries/babel-polyfill)). Since freezer is very light, it feels wrong to provide some helper that take those big file on board.


## Install

```sh
npm i react-freezer-js -S
```

Note that react and freezer-js are peer dependencies. Depending on you
package manager, you might have to provide them yourself.


## Changelog

### v1.0.0
Add the reducer-like feature

## Extra notes

The bundling scripts are from https://github.com/gilbox/react-derive.
