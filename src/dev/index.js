import React, {useState, useMemo, useLayoutEffect, useRef} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import startCase from 'lodash.startcase'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import {makeStyles} from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'

import faker from 'faker'
import ReactWindowGrid from '../..'
import {db, locales} from './data'

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

const useStyles = makeStyles(theme => {
  console.log('theme', theme)
  return {
    root: {
      padding: theme.spacing(3)
    },
    grid: {
      backgroundColor: theme.palette.background.default,
      border: '1px solid black'
    }
  }
})

const Demo = () => {
  const classes = useStyles()
  const [tableName, setTableName] = useState(tables[0])
  const [locale, setLocale] = useState('en')
  const [numberOfRows, setNumberOfRows] = useState(10)
  const [columns, recordset] = useMemo(() => {
    console.log(`generating ${numberOfRows} records`, tableName)
    faker.locale = locale
    const columns = []
    for (const columnName of db[tableName]) {
      columns.push({
        id: columnName,
        label: startCase(columnName),
        width: 100
      })
    }
    const recordset = []
    for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
      const record = {}
      for (const columnName of db[tableName]) {
        record[columnName] = faker.fake(`{{${tableName}.${columnName}}}`)
      }
      recordset.push(record)
    }
    return [columns, recordset]
  }, [tableName, numberOfRows, locale])
  const panel = useRef(null)
  const [panelWidth, setPanelWidth] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (panel.current.offsetWidth !== panelWidth) {
      setPanelWidth(panel.current.offsetWidth)
    }
  })
  console.log('render', {columns, recordset, panelWidth})
  return (
    <Paper className={classes.root}>
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
            onChange={event => setNumberOfRows(event.target.value)}
          />
        </Grid>
        <Grid item xs={12} ref={panel}>
          <ReactWindowGrid
            className={classes.grid}
            height={window.innerHeight - 200}
            width={panelWidth}
            columns={columns}
            recordset={recordset}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}

ReactDOM.render(<Demo />, document.getElementById('app'))

module.hot.accept()
