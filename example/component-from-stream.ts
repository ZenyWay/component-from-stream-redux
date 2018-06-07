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
import createComponentFromStreamFactory, {
  Operator as GenericOperator,
  OperatorFactory as GenericOperatorFactory,
  StreamableDispatcher
} from 'component-from-stream'
import { Component } from 'inferno'
import { Observable, from } from 'rxjs'
import { map } from 'rxjs/operators'
import compose from 'basic-compose'

export type Operator<I={},O=I> = GenericOperator<I,O,Observable<I>,Observable<O>>
export type OperatorFactory<A=void,I={},O=I> =
  GenericOperatorFactory<A,I,O,Observable<I>,Observable<O>>

export default createComponentFromStreamFactory(Component, from)

export function connect <S={},P={}>(
  mapStateToProps: (state: S) => Partial<P>,
  mapDispatchToProps: (dispatch: (...args: any[]) => void) => Partial<P>
): OperatorFactory<any,S,P> {
  return compose.into(0)(map, _connect(mapStateToProps, mapDispatchToProps))
}

// TODO move to redux module
function _connect <S={},P={}>(
  mapStateToProps: (state: S) => Partial<P>,
  mapDispatchToProps: (dispatch: (...args: any[]) => void) => Partial<P>
) {
  return function ({ next }: StreamableDispatcher<any>) {
    const props = mapDispatchToProps(next)
    return function(state: S) {
      return { ...(<object>props), ...(<object>mapStateToProps(state)) } as P
    }
  }
}

export function pipe <I,O>(...operators: Operator<any,any>[]): Operator<I,O> {
  return function (q$: Observable<I>): Observable<O> {
    return q$.pipe(...operators)
  }
}
