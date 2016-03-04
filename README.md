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


## Actions and state updates

Since v2.0.0, there is a simple opinionated way of handling state updates. The concept
is inspired/borrowed from redux-like libraries. An actions is an opportunity
to update the state (and therefore trigger a re-render).

To make it convenient to work with `freezer-js`, an action is a function that receives a `commit` function
in order to update the state:

```js
import React from 'react';
import { warmUp } from 'react-freezer';

function SomeComponent({ fireAction }) {
  return <button onClick={() => fireAction('more')}>click</button>;
}

export default warmUp(SomeComponent, [
  ['fireAction', (arg0, {commit}) => commit({ aFlag: arg0 })]
]);
// after the action has run, the fridge looks like:
// {
//   ...
//   aFlag: 'more',
//   ...
// }
```

In case the action needs to know about the current state, it is also provided
when invoked:

```js
import React from 'react';
import { warmUp } from 'react-freezer';

function SomeComponent({ fireAction }) {
  return <button onClick={() => fireAction('mutation')}>click</button>;
}

export default warmUp(SomeComponent, [
  ['fireAction', (str, {state, commit}) => commit(Object.assign({}, state, {some: state.some + ' - ' + str}))]
]);
// after the action has run, the fridge looks like:
// {
//   ...
//   some: 'mutation - original content',
//   ...
// }
```


## Compound actions

Compound utilities were removed in v2.0.0. They bring in a lot of code and complexity to write code that ends up being more verbose
and error prone than using promises. Instead, actions receive a `commit` function and can implement their flow freely without being limited
by the features of this library:

```js
import React from 'react';
import { warmUp } from 'react-freezer';
import { redirectTo } from 'somewhere';

function LoginForm({ loginAndRedirect }) {
  return <button onClick={() => loginAndRedirect('login', 'pwd', '/user')}>click</button>;
}

function doLoginAndRedirect (login, pwd, dest, {state, commit}) {
  api.Authenticate(login, pwd)
    .then(user => commit({'auth': user}))
    .then(redirectTo(dest))
    .catch(/* application error handling */)
}

export default warmUp(SomeComponent, [
  ['loginAndRedirect', doLoginAndRedirect]
]);
```


## Install

```sh
npm i react-freezer-js -S
```

Note that react and freezer-js are peer dependencies. Depending on you
package manager, you might have to provide them yourself.


## Changelog

### v2.0.0
Simplify the architecture and inject a `commit` function into the actions.

### v1.0.0
Add the reducer-like feature.


## Extra notes

The bundling scripts are from https://github.com/gilbox/react-derive.
