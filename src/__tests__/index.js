import React from 'react'
import {
  render,
  cleanup,
  // eslint-disable-next-line no-unused-vars
  prettyDOM
} from 'react-testing-library'

import ReactWindowGrid from '../..'

afterEach(cleanup)

const getStyle = container => container.getAttribute('style')

const tests = [
  [
    'Auto calculate height and width',
    {
      id: 'test1',
      height: 50,
      width: 100,
      columns: [
        {id: 'column1', label: 'Column 1'},
        {id: 'column2', label: 'Column 2'}
      ],
      recordset: [
        {column1: 'cell l/c 1/1', column2: 'cell 1/2'},
        {column1: 'cell 2/1', column2: 'cell 2/2'},
        {column1: 'cell 3/1', column2: 'cell 3/2'}
      ],
      rowHeaderWidth: 10
    }
  ],
  [
    'Case when recordset is empty use label or id to calc width',
    {
      id: 'test1',
      height: 50,
      width: 100,
      columns: [
        {id: 'column1', label: 'Column 1'},
        {id: 'column2', label: 'Column 2'}
      ],
      recordset: [],
      rowHeaderWidth: 10
    }
  ]
]

test(tests[0][0], async () => {
  const props = tests[0][1]
  const {container, getAllByText, rerender} = render(
    <ReactWindowGrid {...props} />
  )
  // console.log(prettyDOM(container))
  expect(container).toMatchSnapshot()

  const headers = getAllByText(/^Column \d$/)
  expect(headers.length).toBe(2)
  expect(getStyle(headers[0])).toMatch(/width: 20px;/)
  expect(getStyle(headers[1])).toMatch(/width: 16px;/)

  const rowHeaders = getAllByText(/^\d$/)
  expect(rowHeaders.length).toBe(3)

  let cells = getAllByText(/^cell/)
  expect(cells.length).toBe(6)
  expect(getStyle(cells[0])).toMatch(/width: 20px;/)
  expect(getStyle(cells[1])).toMatch(/width: 16px;/)
  expect(getStyle(cells[2])).toMatch(/width: 20px;/)
  expect(getStyle(cells[3])).toMatch(/width: 16px;/)
  expect(getStyle(cells[4])).toMatch(/width: 20px;/)
  expect(getStyle(cells[5])).toMatch(/width: 16px;/)

  const {height, ...rest} = props
  rerender(<ReactWindowGrid {...rest} maxHeight={39} enablePivot />)
  cells = getAllByText(/^cell/)
  expect(cells.length).toBe(6)
  expect(getStyle(cells[0])).toMatch(/width: 20px;/)
  expect(getStyle(cells[1])).toMatch(/width: 16px;/)
  expect(getStyle(cells[2])).toMatch(/width: 20px;/)
  expect(getStyle(cells[3])).toMatch(/width: 16px;/)
  expect(getStyle(cells[4])).toMatch(/width: 20px;/)
  expect(getStyle(cells[5])).toMatch(/width: 16px;/)
})

test(tests[1][0], async () => {
  const props = tests[1][1]
  const {container, getAllByText, queryByText, rerender} = render(
    <ReactWindowGrid {...props} />
  )
  // console.log(prettyDOM(container))
  expect(container).toMatchSnapshot()

  const headers = getAllByText(/^Column \d$/)
  expect(headers.length).toBe(2)
  expect(getStyle(headers[0])).toMatch(/width: 16px;/)
  expect(getStyle(headers[1])).toMatch(/width: 16px;/)

  const rowHeaders = queryByText(/^\d$/)
  expect(rowHeaders).toBe(null)

  let cells = queryByText(/^cell/)
  expect(cells).toBe(null)

  const {height, ...rest} = tests[0][1]
  rerender(<ReactWindowGrid {...rest} maxHeight={39} enablePivot />)
  cells = getAllByText(/^cell/)
  expect(cells.length).toBe(6)
  expect(getStyle(cells[0])).toMatch(/width: 20px;/)
  expect(getStyle(cells[1])).toMatch(/width: 16px;/)
  expect(getStyle(cells[2])).toMatch(/width: 20px;/)
  expect(getStyle(cells[3])).toMatch(/width: 16px;/)
  expect(getStyle(cells[4])).toMatch(/width: 20px;/)
  expect(getStyle(cells[5])).toMatch(/width: 16px;/)
})
