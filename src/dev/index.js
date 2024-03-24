import React, {
  useState,
  useMemo,
  useLayoutEffect,
  useRef
} from 'react'
import PropTypes from 'prop-types'
import {createRoot} from 'react-dom/client'
import startCase from 'lodash.startcase'
import useEventListener from '@use-it/event-listener'
import Draggable from 'react-draggable'

import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import {useTheme} from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'

import {allFakers} from '@faker-js/faker'
import {ReactWindowGrid} from '../..'
import {db, locales} from './data'

import './index.css'

const border = 'solid 0.5px #aaa'
const boxSizing = 'border-box'

const tests = [
  // copied from ../_tests_/index.js
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
      id: 'test2',
      height: 50,
      width: 100,
      columns: [
        {id: 'column1', label: 'Column 1'},
        {id: 'column2', label: 'Column 2'}
      ],
      recordset: [],
      rowHeaderWidth: 10
    }
  ],
  [
    'Use customized render',
    {
      id: 'test3',
      height: 100,
      width: 200,
      columns: [
        {id: 'column1', label: 'Column 1'},
        {id: 'column2', label: 'Column 2'},
        {id: 'column3', label: 'Column 3'},
        {id: 'column4', label: 'Column 4'},
        {id: 'column5', label: 'Column 5'},
        {id: 'column6', label: 'Column 6'}
      ],
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
      columnHorizontalPadding: 2,
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

const tables = Object.keys(db)

const TableSelect = props => {
  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="table">Select table</InputLabel>
      <Select
        value={props.value}
        onChange={props.onChange}
        inputProps={{
          id: 'table'
        }}
      >
        {tables.map(table => {
          return (
            <MenuItem key={table} value={table}>
              {table}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

TableSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

const LocaleSelect = props => {
  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="locale">Select locale</InputLabel>
      <Select
        value={props.value}
        onChange={props.onChange}
        inputProps={{
          id: 'locale'
        }}
      >
        {locales.map(locale => {
          return (
            <MenuItem key={locale} value={locale}>
              {locale}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

LocaleSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

const Demo = () => {
  const [tableName, setTableName] = useState(tables[0])
  const [locale, setLocale] = useState('en')
  const [numberOfRows, setNumberOfRows] = useState(100)
  const [columns, recordset] = useMemo(() => {
    console.log(`generating ${numberOfRows} records`, tableName)
    const faker = allFakers[locale]
    const columns = []
    for (const columnName of db[tableName]) {
      columns.push({
        id: columnName,
        label: startCase(columnName)
      })
    }
    const recordset = []
    for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
      const record = {}
      for (const columnName of db[tableName]) {
        record[columnName] = faker.helpers.fake(
          `{{${tableName}.${columnName}}}`
        )
      }
      recordset.push(record)
    }
    return [columns, recordset]
  }, [tableName, numberOfRows, locale])
  const panel = useRef(null)
  const [panelWidth, setPanelWidth] = useState(0)
  const theme = useTheme()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const availableWidth =
      panel.current.offsetWidth - 2 * Number(theme.spacing(3).slice(0, -2))
    if (availableWidth !== panelWidth) {
      setPanelWidth(availableWidth)
    }
  })
  const [rowHeaderWidth, setRowHeaderWidth] = useState(50)
  const [fontSize, setFontSize] = useState(16)
  useEventListener('resize', () => setPanelWidth(0))

  const [columnsWidth, setColumnsWidth] = useState({})
  const resizedColumns = useMemo(() => {
    return columns.map((column, index) => {
      return {
        ...column,
        width: columnsWidth[index] || 100
      }
    })
  }, [columnsWidth, columns])

  const firstGridStyle = useMemo(
    () => ({
      fontSize
    }),
    [fontSize]
  )

  return (
    <Paper
      style={{
        padding: Number(theme.spacing(3).slice(0, -2))
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" align="center">
            ReactWindowGrid demo
          </Typography>
        </Grid>
        <Grid item xs={4} sm={2}>
          <LocaleSelect
            value={locale}
            onChange={event => setLocale(event.target.value)}
          />
        </Grid>
        <Grid item xs={5} sm={3}>
          <TableSelect
            value={tableName}
            onChange={event => setTableName(event.target.value)}
          />
        </Grid>
        <Grid item xs={3} sm={1}>
          <TextField
            label="Rows"
            type="number"
            value={numberOfRows}
            onChange={event =>
              setNumberOfRows(Number(event.target.value))
            }
          />
        </Grid>
        <Grid item xs={4} sm={3}>
          <TextField
            label="Row header width"
            type="number"
            value={rowHeaderWidth}
            onChange={event =>
              setRowHeaderWidth(Number(event.target.value))
            }
          />
        </Grid>
        <Grid item xs={3} sm={2}>
          <TextField
            label="Font size"
            type="number"
            value={fontSize}
            onChange={event =>
              setFontSize(Number(event.target.value))
            }
          />
        </Grid>
        <Grid item xs={12} ref={panel}>
          <Typography variant="caption" align="center">
            Auto calculating column width and row
          </Typography>
          <ReactWindowGrid
            style={{
              fontFamily:
                '"Roboto", "Helvetica", "Arial", sans-serif',
              backgroundColor: theme.palette.background.default,
              border,
              ...firstGridStyle
            }}
            height={300}
            width={panelWidth}
            columns={columns}
            recordset={recordset}
            rowHeaderWidth={rowHeaderWidth}
          />
        </Grid>
        <Grid item xs={12} ref={panel}>
          <Typography variant="caption" align="center">
            Controled column width and row with column resizing
          </Typography>
          <ReactWindowGrid
            style={{
              fontFamily:
                '"Roboto", "Helvetica", "Arial", sans-serif',
              backgroundColor: theme.palette.background.default,
              border
            }}
            height={300}
            width={panelWidth}
            columns={resizedColumns}
            recordset={recordset}
            rowHeaderWidth={rowHeaderWidth}
            columnHeaderRenderer={({columnIndex, style}) => {
              const column = resizedColumns[columnIndex]
              return (
                <div
                  style={{
                    ...style,
                    borderBottom: border,
                    paddingLeft: 4,
                    boxSizing,
                    borderRight: border,
                    display: 'flex'
                  }}
                >
                  <Typography
                    style={{
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    variant="caption"
                  >
                    {column.label}
                  </Typography>
                  <Draggable
                    axis="x"
                    defaultClassName="DragHandle"
                    defaultClassNameDragging="DragHandleActive"
                    onDrag={(event, {deltaX}) => {
                      setColumnsWidth({
                        [`${columnIndex}`]: column.width + deltaX
                      })
                    }}
                    position={{x: 0}}
                    zIndex={999}
                  >
                    <div className="DragHandleIcon" />
                  </Draggable>
                </div>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" align="center">
            ReactWindowGrid tests
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" align="center">
            {tests[0][0]}
          </Typography>
          <ReactWindowGrid {...tests[0][1]} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" align="center">
            {tests[1][0]}
          </Typography>
          <ReactWindowGrid {...tests[1][1]} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" align="center">
            {tests[2][0]}
          </Typography>
          <ReactWindowGrid
            {...tests[2][1]}
            columnHeaderProps={{
              style: {
                boxSizing,
                borderLeft: border,
                borderRight: border
              }
            }}
            bodyProps={{
              style: {
                boxSizing,
                border
              }
            }}
            rowHeaderProps={{
              style: {
                borderTop: border,
                boxSizing
              }
            }}
            columnHeaderRenderer={({columnIndex, style}) => {
              const column = tests[2][1].columns[columnIndex]
              return (
                <div
                  style={{
                    ...style,
                    borderTop: border,
                    boxSizing,
                    borderRight: border,
                    display: 'flex'
                  }}
                >
                  {column.label}
                </div>
              )
            }}
            rowHeaderRenderer={({rowIndex, style}) => {
              return (
                <div
                  style={{
                    ...style,
                    boxSizing,
                    borderBottom: border,
                    borderLeft: border
                  }}
                >
                  {rowIndex + 1}
                </div>
              )
            }}
            cellRenderer={({rowIndex, columnIndex, style}) => {
              const props = tests[2][1]
              const column = props.columns[columnIndex]
              const record = props.recordset[rowIndex]
              return (
                <div
                  style={{
                    ...style,
                    boxSizing,
                    borderRight: border,
                    borderBottom: border
                  }}
                >
                  {record[column.id]}
                </div>
              )
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}

createRoot(document.getElementById('app')).render(
  React.createElement(Demo)
)

module.hot.accept()
