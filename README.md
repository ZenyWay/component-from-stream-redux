# tiny (0.3kB) redux- and redux-observable-like operator factory for component-from-stream
[![NPM](https://nodei.co/npm/component-from-stream-redux.png?compact=true)](https://nodei.co/npm/component-from-stream-redux/)

tiny (0.3kB gzip) [redux](https://npmjs.com/package/redux)- and
[redux-observable](https://npmjs.com/package/redux-observable)-like
operator factory for
[component-from-stream](https://npmjs.com/package/component-from-stream). <br/>
compatible with observable libraries such as [`RxJS`](http://reactivex.io/rxjs/)
or [`MOST`](https://www.npmjs.com/package/most).

# Example
see the full [example](./example/index.tsx) in this directory.<br/>
run the example in your browser locally with `"npm run example"`
or [online here](https://cdn.rawgit.com/ZenyWay/component-from-stream-redux/v0.5.4/example/index.html).

the [example from the `component-from-stream` module](https://npmjs.com/package/component-from-stream) explores how to refactor
the [original `component-from-stream` example](https://github.com/acdlite/recompose/blob/master/docs/API.md#componentfromstream)
from [`recompose`](https://npmjs.com/package/recompose)
to split view rendering from reactive operator behaviour.
although it is arguably overkill in this particular example,
it can be further refactored to implement a redux-like setup
for the purpose of illustration.

components react to events which alter their internal state
and sometimes generate external side-effects.
a `redux`/`redux-observable` architecture is naturally well adapted
for implementing components with such behaviour,
and often brings a number of benefits,
among which simpler testing and maintainability.

## `counter/index.ts`
the main module of the `counter` component, which essentially wires it up.
```ts
import redux from 'component-from-stream-redux'
import componentFromStream from '../component-from-stream'
import connect from '../connect'
import Counter from '../views/counter'
import reducer from './reducer'
import { createEventHandlers, createEventFactory } from 'basic-fsa-factories'
import { map, tap } from 'rxjs/operators'
import compose from 'basic-compose'
import log from '../console'

function mapStateToProps ({ props, count }) {
  return { ...props, count }
}

const mapDispatchToProps = createEventHandlers({
  onClickIncrement: 'CLICK_INCREMENT',
  onClickDecrement: 'CLICK_DECREMENT'
})

export default componentFromStream(
  Counter,
  createEventFactory('PROPS'),
  redux(reducer),
  () => tap(log('state:')),
  connect(mapStateToProps, mapDispatchToProps),
  () => tap(log('view-props:'))
)
```
note that only `mapStateToProps` and `mapDispatchToProps` are specific
to the `counter` component.
both functions are projections that map the reducer state or dispatcher function
to view props.
the rest of the code is generic wiring,
and could be abstracted into its own module.

## `counter/reducer.ts`
the reducer is the heart of the redux-based component:
it reacts to incoming events and reduces state accordingly.

the reducer is assembled from pure (stateless) functions in a functional way.
it is itself also a pure function,
and should typically be straightforward to test and maintain.
```ts
import { propCursor } from 'basic-cursors'
import { shallowEqual } from '../utils'

const inProps = propCursor('props')
const inCount = propCursor('count')

const reducers = {
  'PROPS': inProps(update()),
  'CLICK_INCREMENT': inCount(add(1)),
  'CLICK_DECREMENT': inCount(add(-1))
}

function update <S>(equal = shallowEqual) {
  return function (previous: S, current: S) {
    return equal(current, previous) ? previous : current
  }
}

function add (diff: number) {
  return function (previous: number) {
    return previous + diff
  }
}

export default function (state = { count: 0 }, event) {
  const { type, payload } = event
  const reducer = reducers[type]
  return !reducer ? state : reducer(state, payload)
}
```
note that when the state is not modified by an event,
the reducer returns the previous state object
instead of returning a new object representing the same state.
since the redux operator does not re-emit the previously emitted state,
the event is "swallowed":
the view is only re-rendered when the state changes.

## `connect.ts`
in addition to the `redux` operator factory used in
the main module of the `counter` component,
the `component-from-stream-redux` module also exposes
a higher-level `connect` factory, very similar in purpose to
[its source of inspiration from the `react-redux` module](https://github.com/reduxjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options).
the higher-level factory returns a function which,
when composed as follows with a `map` operator yields
an operator factory for the `component-from-stream` factory.

as for the latter, a project-specific module may expose a corresponding shorthand:
```ts
import { map } from 'rxjs/operators'
import compose from 'basic-compose'

export default function <S={},P={}>(
  mapStateToProps: (state: S) => Partial<P>,
  mapDispatchToProps: (dispatch: (...args: any[]) => void) => Partial<P>
) {
  return compose.into(0)(map, connect(mapStateToProps, mapDispatchToProps))
}
```
# <a name="API"></a>API
the [above example](#Example) provides a brief introduction
to the `redux` and `connect` functions exposed by this module.
however, both functions accept additional arguments,
as specified in the below type declarations:
* `redux` rest arguments are effects, similar to [`epics`](https://redux-observable.js.org/docs/basics/Epics.html),
their source of inspiration
from the [redux-observable](https://npmjs.com/package/redux-observable) module,
which transform the state and event streams into a stream of events
that is dispatched back into the reducer.
as for `epics`, events from the input event stream first hit the reducer
before the effects.
`epics` are typically meant to handle side-effects external to the component.
* `connect` accepts an optional 3rd argument, `mergeProps`, that defines how to
merge the output of the `mapStateToProps` and `mapDispatchToProps` functions
into a new view props object.<br/>
when not specified, both outputs are shallow-merged as follows:<br/>
`{ ...stateProps, ...dispatchProps }`
```ts
import { Subscribable } from 'rx-subject'
import { Reducer, OperatorFactory } from "component-from-stream"
export { Subscribable, Reducer }

export declare type Effect<S, A> = <
  E extends Subscribable<A> = Subscribable<A>,
  Q extends Subscribable<S> = Subscribable<S>
>(event$: E, state$?: Q) => E

export default function <
  S = {},
  A = {},
  Q extends Subscribable<S> = Subscribable<S>,
  E extends Subscribable<A> = Subscribable<A>
>(
  reducer: Reducer<S, A>,
  ...effects: Effect<S, A>[]
): OperatorFactory<A, A, S, E, Q>

export declare function connect<S = {}, P = {}>(
  mapStateToProps: (state: S) => Partial<P>,
  mapDispatchToProps: (dispatch: (...args: any[]) => void) => Partial<P>,
  mergeProps?: (stateProps: Partial<P>, dispatchProps: Partial<P>) => P
): ({ next }: StreamableDispatcher<any, any>) => (state: S) => P
```

# `Symbol.observable`
This module expects `Symbol.observable` to be defined in the global scope.
Use a polyfill such as [`symbol-observable`](https://npmjs.com/package/symbol-observable/)
and if necessary a `Symbol` polyfill.
Check the [`symbol-observable-polyfill` script](./package.json#L10)
for an example of how to generate the standalone polyfill,
which can than be [loaded from a script tag](./example/index.html#L27),
or simply add `import 'symbol-observable'` at the top of your project's main file.

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.

# License
Copyright 2018 Stéphane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.
