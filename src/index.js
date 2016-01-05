import React from 'react';
import Freezer from 'freezer-js';


export const isFridge = fridge => fridge instanceof Freezer;

function getComponentName(Component) {
  return Component.name ||
    Component.displayName ||
    'Component';
}

export default function cool(Component, fridge) {
  if (!fridge instanceof Freezer)
    throw new Error(`That's not a suitable fridge: ${fridge}`);

  const CooledComponent = class extends React.Component {
    // Handling child context
    getChildContext() {
      return {
        fridge: fridge,
        dispatch: (...args) => fridge.trigger(...args),
      };
    }

    // Render shim
    render() {
      return <Component {...this.props} />;
    }

    componentDidMount() {
      // Here the magic happens. Everytime that the
      // state is updated the app will re-render.
      // A real data driven app.
      fridge.on('update', () => this.forceUpdate());
    }
  };
  CooledComponent.childContextTypes = {
    fridge: isFridge,
    dispatch: React.PropTypes.func.isRequired,
  };
  CooledComponent.displayName = 'Cooled' + getComponentName(Component);
  return CooledComponent;
}

function pick(state) {
  return function fridgePicker(path) {
    let v = state;
    for (let p of path) v = v[p];
    return v;
  }
}
const getPropsFromState = (fridge, propPaths) => {
  const state = pick(fridge.get());
  return propPaths.reduce((props, [name, ...p]) => {
    props[name] = state(p);
    return props;
  }, {});
}

export function warmUp(Component, propPaths) {
  const WarmedUpComponent = class extends React.Component {
    render() {
      const stateProps = getPropsFromState(this.context.fridge, propPaths);
      return <Component {...this.props} {...stateProps} />;
    }
  }
  WarmedUpComponent.contextTypes = {
    fridge: isFridge,
    dispatch: React.PropTypes.func.isRequired,
  };
  WarmedUpComponent.displayName = 'WarmedUp' + getComponentName(Component);
  return WarmedUpComponent;
}
