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
import redux from '../../'
import componentFromStream, { connect } from '../component-from-stream'
import Counter from '../views/counter'
import reducer from './reducer'
import { createEventHandlers, createEventFactory } from '../event-handlers'
import { tap } from 'rxjs/operators'
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
