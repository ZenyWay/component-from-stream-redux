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