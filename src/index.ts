/**
 * @license
 * Copyright 2018 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
import createSubject, { Subject, Subscribable } from 'rx-subject'
import { Reducer, Middleware } from "component-from-stream"
export { Subscribable, Reducer, Middleware }

export type Effect<S,A> =
<E extends Subscribable<A>, Q extends Subscribable<S> = Subscribable<any>>(
  action$: E,
  state$?: Q
) => E

export default function <S,A={}>(
  reducer: Reducer<S,A>,
  ...effects: Effect<S,A>[]
): Middleware<S> {
  return function <Q extends Subscribable<S>>(
    next: (state: S) => void,
    dispatch: (event: A) => void,
    _state$: Q,
    fromES: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
    toES: <T, O extends Subscribable<T>>(stream: O) => Subscribable<T>
  ): (event: A) => void {
    // state variable must be updated first, before update is pushed to effects
    let state: S
    _state$.subscribe(function(s) { state = s }, end, end)
    const events = createSubject<A>()
    const event$ = fromES(events.source$)
    const state$ = fromES(_state$)
    const subs = effects.reduce(
      function(subs, effect) {
        return subs.concat(toES(effect(event$, state$)).subscribe(dispatch))
      },
      // events must first be pushed to reducer, before effects
      [events.source$.subscribe(reduce)]
    )

    return events.sink.next

    function reduce(event: A): void {
      const update = reducer(state, event)
      if (update !== state) { next(update) }
    }

    function end(): void {
      events.sink.complete()
      while (subs.length) {
        subs.pop().unsubscribe()
      }
    }
  }
}
