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
import { Reducer, DispatchOperator, StreamableDispatcher } from "component-from-stream"
export { Subscribable, Reducer, DispatchOperator }

export type Effect<S,A> = <
  E extends Subscribable<A> = Subscribable<A>,
  Q extends Subscribable<S> = Subscribable<S>
>(action$: E, state$?: Q) => E

export default function <
  S={},
  A={},
  Q extends Subscribable<S> = Subscribable<S>,
  E extends Subscribable<A> = Subscribable<A>
>(reducer: Reducer<S,A>, ...effects: Effect<S,A>[]): DispatchOperator<A,A,S,E,Q> {
  return function (
    source$: E,
    dispatch: StreamableDispatcher<A>,
    fromES: <T, O extends Subscribable<T>>(stream: Subscribable<T>) => O,
    toES: <T, O extends Subscribable<T>>(stream: O) => Subscribable<T>
  ): Q {
		let state: S
		const states = createSubject<S>()
		const state$: Q = fromES(states.source$)
		const newSubject = source$ !== dispatch.source$ // new Subject to share event$
    const events = newSubject ? createSubject<A>() : dispatch
    const event$ = newSubject ? fromES(events.source$) : events.source$
		events.source$.subscribe(reduce) // no need to unsubscribe this
		if (newSubject) {
			const { unsubscribe } = source$.subscribe((<Subject<A>>events).sink)
			dispatch.source$.subscribe(nop, unsubscribe, unsubscribe) // no need to unsubscribe this
		}
		for (const effect of effects) {
			dispatch.from(effect(event$, state$))
		}
		return state$

		function reduce (event: A) {
			const update = reducer(state, event)
			if (update !== state) {
				states.sink.next((state = update))
			}
		}
	}
}

function nop() {}
