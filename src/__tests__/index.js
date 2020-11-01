import React from 'react'
import {
  render,
  cleanup,
  // eslint-disable-next-line no-unused-vars
  prettyDOM
} from '@testing-library/react'

import {ReactWindowGrid} from '../..'

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
      columnHorizontalPadding: 8,
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
      id: 'test2',
      height: 50,
      width: 100,
      columns: [
        {id: 'column1', label: 'Column 1'},
        {id: 'column2', label: 'Column 2'}
      ],
      columnHorizontalPadding: 8,
      recordset: [],
      rowHeaderWidth: 10
    }
  ],
  [
    'Use customized render',
    {
      id: 'test3',
      height: 500,
      width: 200,
      columns: [
        {id: 'column1', label: 'Column 1'},
        {id: 'column2', label: 'Column 2'},
        {id: 'column3', label: 'Column 3'},
        {id: 'column4', label: 'Column 4'},
        {id: 'column5', label: 'Column 5'},
        {id: 'column6', label: 'Column 6'}
      ],
      columnHorizontalPadding: 8,
      recordset: [
        {
          column1: 'cell 1/1',
          column2: 'cell 1/2',
          column3: 'cell 1/3',
          column4: 'cell 1/4',
          column5: 'cell 1/5',
          column6: 'cell 1/6'
        },
        {
          column1: 'cell 2/1',
          column2: 'cell 2/2',
          column3: 'cell 2/3',
          column4: 'cell 2/4',
          column5: 'cell 2/5',
          column6: 'cell 2/6'
        },
        {
          column1: 'cell 3/1',
          column2: 'cell 3/2',
          column3: 'cell 3/3',
          column4: 'cell 3/4',
          column5: 'cell 3/5',
          column6: 'cell 3/6'
        },
        {
          column1: 'cell 4/1',
          column2: 'cell 4/2',
          column3: 'cell 4/3',
          column4: 'cell 4/4',
          column5: 'cell 4/5',
          column6: 'cell 4/6'
        },
        {
          column1: 'cell 5/1',
          column2: 'cell 5/2',
          column3: 'cell 5/3',
          column4: 'cell 5/4',
          column5: 'cell 5/5',
          column6: 'cell 5/6'
        },
        {
          column1: 'cell 6/1',
          column2: 'cell 6/2',
          column3: 'cell 6/3',
          column4: 'cell 6/4',
          column5: 'cell 6/5',
          column6: 'cell 6/6'
        }
      ],
      rowHeaderWidth: 30,
      columnHeaderRenderer: ({columnIndex, style}) => {
        const column = tests[2][1].columns[columnIndex]
        return <div style={style}>{column.label}</div>
      },
      rowHeaderRenderer: ({rowIndex, style}) => {
        return <div style={style}>{rowIndex + 1}</div>
      },
      cellRenderer: ({rowIndex, columnIndex, style}) => {
        const props = tests[2][1]
        const column = props.columns[columnIndex]
        const record = props.recordset[rowIndex]
        return <div style={style}>{record[column.id]}</div>
      }
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
  rerender(<ReactWindowGrid {...rest} maxHeight={39} />)
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
  rerender(<ReactWindowGrid {...rest} maxHeight={39} />)
  cells = getAllByText(/^cell/)
  expect(cells.length).toBe(6)
  expect(getStyle(cells[0])).toMatch(/width: 20px;/)
  expect(getStyle(cells[1])).toMatch(/width: 16px;/)
  expect(getStyle(cells[2])).toMatch(/width: 20px;/)
  expect(getStyle(cells[3])).toMatch(/width: 16px;/)
  expect(getStyle(cells[4])).toMatch(/width: 20px;/)
  expect(getStyle(cells[5])).toMatch(/width: 16px;/)
})

test(tests[2][0], async () => {
  const props = tests[2][1]
  const {container, getAllByText, rerender} = render(
    <ReactWindowGrid {...props} />
  )
  // console.log(prettyDOM(container))
  expect(container).toMatchSnapshot()

  const headers = getAllByText(/^Column \d$/)
  expect(headers.length).toBe(6)
  expect(getStyle(headers[0])).toMatch(/width: 16px;/)
  expect(getStyle(headers[5])).toMatch(/width: 16px;/)

  const rowHeaders = getAllByText(/^\d$/)
  expect(rowHeaders.length).toBe(6)

  let cells = getAllByText(/^cell/)
  expect(cells.length).toBe(36)

  const {height, ...rest} = tests[0][1]
  rerender(<ReactWindowGrid {...rest} maxHeight={39} />)
  cells = getAllByText(/^cell/)
  expect(cells.length).toBe(6)
  expect(getStyle(cells[0])).toMatch(/width: 20px;/)
  expect(getStyle(cells[1])).toMatch(/width: 16px;/)
  expect(getStyle(cells[2])).toMatch(/width: 20px;/)
  expect(getStyle(cells[3])).toMatch(/width: 16px;/)
  expect(getStyle(cells[4])).toMatch(/width: 20px;/)
  expect(getStyle(cells[5])).toMatch(/width: 16px;/)
})
