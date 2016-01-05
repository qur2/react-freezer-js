# react-freezer

Helpers for using [freezer-js](https://github.com/arqex/freezer) along with
[react](https://facebook.github.io/react/). The library provides 2 higher
order components that will help you with managing the props of your components,
abstracting the central state atom away.


# example

The `cool` function wraps the target component and binds it to a freezer
instance:

    import React from 'react';
    import { cool } from 'react-freezer';
    // fridge is a freezer instance
    import { fridge } from './state';

    function Grandaddy(props) {
      return <span><compZ /></span>;
    }

    export default cool(Grandaddy, fridge);

Through the context, the fridge can be made available to any sub-component.

The `warmUp` function wraps the target component and provides some props taken
out of the fridge:

    import React from 'react';
    import { cool, warmUp } from 'react-freezer';

    function compZ({ flag }) {
      return <span>{flag}</span>;
    }

    // state.ui.theFlag will be made available under props.flag
    export default warmUp(compZ, [['flag', 'ui', 'theFlag']]);

Whenever the state changes, the cooled component will be re-rendered,
triggering a top-down rendering. By leveraging `freezer-js`'s immutability,
this can be made very efficient.

Note that as for any HoC, they can be combined with decorators
if that's your thing.


## install

    npm i react-freezer -S

Note that react and freezer-js are peer dependencies. Depending on you
package manager, you might have to provide them yourself.


## extra notes

The bundling scripts are from https://github.com/gilbox/react-derive.
