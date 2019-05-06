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

it('can render and update a counter', () => {
  act(() => {
    ReactDOM.render(<ReactWindowGrid />, container)
  })
  const div = container.querySelector('div')
  expect(div.textContent).toBe('Lets get started!')
})
