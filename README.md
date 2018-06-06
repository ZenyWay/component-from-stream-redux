# tiny (0.3kB) redux- and redux-observable-like operator for component-from-stream
[![NPM](https://nodei.co/npm/component-from-stream-redux.png?compact=true)](https://nodei.co/npm/component-from-stream-redux/)

tiny (0.3kB gzip) [redux](https://npmjs.com/package/redux)- and
[redux-observable](https://npmjs.com/package/redux-observable)-like
operator for [component-from-stream](https://npmjs.com/package/component-from-stream). <br/>
compatible with observable libraries such as [`RxJS`](http://reactivex.io/rxjs/)
or [`MOST`](https://www.npmjs.com/package/most).

# Example
<!--
see the full [example](./example/index.tsx) in this directory.
run the example in your browser locally with `npm run example`
or [online here](https://cdn.rawgit.com/ZenyWay/component-from-stream-redux/v0.5.0/example/index.html).

-->
```ts
// TODO
```
# <a name="API"></a>API
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
