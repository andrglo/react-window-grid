# @andrglo/react-window-grid

A react grid with column and row headers, like an spreadsheet


 [![npm version](https://badge.fury.io/js/%40andrglo%2Freact-window-grid.svg)](https://badge.fury.io/js/%40andrglo%2Freact-window-grid) [![Dependency Status][daviddm-image]][daviddm-url] [![CircleCI](https://circleci.com/gh/andrglo/react-window-grid.svg?style=svg)](https://circleci.com/gh/andrglo/react-window-grid) [![Coverage Status](https://coveralls.io/repos/github/andrglo/react-window-grid/badge.svg?branch=master)](https://coveralls.io/github/andrglo/react-window-grid?branch=master)

> See a demo at [code sandbox](https://codesandbox.io/s/reactwindowgrid-demo-ux5we)

## Installation

```bash
# Yarn
yarn add react-window

# NPM
npm install --save react-window
```

## Usage

```javascript
import {ReactWindowGrid} from '@andrglo/react-window-grid'

const Grid = props => (
  <ReactWindowGrid
    height={300}
    width={300}
    columns={props.columns}
    recordset={props.recordset}
    rowHeaderWidth={50}
  />
)

createRoot(document.getElementById('app')).render(
  <Grid
    columns={[
      {id: 'column1', label: 'Column 1'},
      {id: 'column2', label: 'Column 2'}
    ]}
    recordset={[
      {column1: 'cell 1/1', column2: 'cell 1/2'},
      {column1: 'cell 2/1', column2: 'cell 2/2'},
      {column1: 'cell 3/1', column2: 'cell 3/2'}
    ]}
  />)
```

### Props

| Property | Type | Description |
|:---|:---|:---|
| __width__* | number | The grid total width |
| __recordset__* | array of objects | The data to be displayed |
| __columns__* | array of objects | See table bellow |
| __height__ | number | The grid total height |
| __maxHeight__ | number | Limits the maximum height |
| __rowHeaderWidth__ | number | Default is zero. Show a left header for each row and define the width |
| __cellRenderer__ | ({rowIndex: number, columnIndex: number, style: object}) => ReactElement | Render a row header header. If not defined the record value will be showed |
| __columnHeaderRenderer__ | ({columnIndex: number, style: object}) => ReactElement | Render a column header.  If not defined the column label or the column id will be showed |
| __rowHeaderRenderer__ | ({rowIndex: number, style: object}) => ReactElement | Render a row header header. If not defined the row sequence begining with1 will be showed |
| __footerRenderer__ | () => ReactElement | Render a footer after the last row |
| __lineHeight__ | number | Define the line height. If not defined the current font size will be used|
| __columnHeaderHeight__ | number | Define the column header height. If not defined __lineHeight__ will be used|
| __bodyProps__ | object | Additional props to be passed to the react-window [VariableSizeGrid](https://react-window.now.sh/#/api/VariableSizeGrid) that is the grid body |
| __columnHeaderProps__ | object | Additional props to be passed to the react-window [VariableSizeList](https://react-window.now.sh/#/api/VariableSizeList) that is the grid header |
| __rowHeaderProps__ | object | Additional props to be passed to the react-window [VariableSizeList](https://react-window.now.sh/#/api/VariableSizeList) that is the grid row header |
| __columnHorizontalPadding__ | number | For adjustments in column width, for example if you use borders, If not defined zero will be used |
| __columnVerticalPadding__ | number | For adjustments in column height, for example if you use borders. If not defined zero will be used |

### Column props

| Property | Type | Default | Description |
|:---|:---|:---|:---|
| __id__* | string | The field name in the record object  |
| __label__ | string | Label to be displayed in the header, if omitted the __id__ will be showed  |
| __width__ | number | Cell width, if omitted will be calculated from the record field value or column label/id  |
| __height__ | number | Cell height, if omitted will be calculated from the record field value or column label/id  |
| __maxHeight__ | number | Cell height, when height is auto calculated it limits the maximum height |

*required

## How Does It Work?

It's built on top of react-window syncing one grid for the body and two lists one for the column header and the other for the row header

## License

MIT

[daviddm-image]: https://david-dm.org/andrglo/react-window-grid.svg
[daviddm-url]: https://david-dm.org/andrglo/react-window-grid

