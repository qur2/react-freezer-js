# react-freezer

Helpers for using [freezer-js](https://github.com/arqex/freezer) along with
[react](https://facebook.github.io/react/). The library provides 2 higher
order components that will help you with managing the props of your components,
abstracting the central state atom away.


# example

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


## install

```sh
npm i react-freezer-js -S
```

Note that react and freezer-js are peer dependencies. Depending on you
package manager, you might have to provide them yourself.


## extra notes

The bundling scripts are from https://github.com/gilbox/react-derive.
