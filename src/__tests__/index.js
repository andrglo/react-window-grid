import React from 'react'
import ReactDOM from 'react-dom'
import {act} from 'react-dom/test-utils'
import ReactWindowGrid from '../..'

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

it('can render', () => {
  act(() => {
    ReactDOM.render(<ReactWindowGrid />, container)
  })
  const div = container.querySelector('div')
  expect(div.textContent).toBe('The scroll bar size is 0')
})
