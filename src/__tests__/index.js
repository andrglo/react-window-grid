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
    ReactDOM.render(
      <ReactWindowGrid
        height={100}
        width={100}
        columns={[
          {id: 'column1', label: 'Column 1'},
          {id: 'column2', label: 'Column 2'}
        ]}
        recordset={[
          {column1: 'cell 1/1', column2: 'cell 1/2'},
          {column1: 'cell 2/1', column2: 'cell 2/2'},
          {column1: 'cell 3/1', column2: 'cell 3/2'}
        ]}
        rowHeaderWidth={10}
      />,
      container
    )
  })
  const div = container.querySelector('div')
  expect(div.textContent).toBe('Column 1Column 2123cell 1/1cell 1/2cell 2/1cell 2/2cell 3/1cell 3/2')
})
