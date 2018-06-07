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
export function shallowEqual(a: any, b: any) {
  if(a === b) { return true }
  if(!isObject(a) || !isObject(b)) { return a === b }
  const akeys = Object.keys(a)
  const bkeys = Object.keys(b)

  return akeys.length === bkeys.length && akeys.every(isEqualValues)

  function isEqualValues (key: string) {
    return a[key] === b[key]
  }
}

function isObject(v): v is object {
  return !!v && (typeof v === 'object')
}