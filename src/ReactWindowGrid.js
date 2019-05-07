import React, {useRef, useState, useLayoutEffect, useMemo} from 'react'
import PropTypes from 'prop-types'
import {VariableSizeList, VariableSizeGrid} from 'react-window'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'

const DEFAULT_WIDTH = 320
const SPACING_UNIT = 8
const COLUMN_WIDTH = 80
const CHAR_WIDTH = 7
const UPPER_CHAR_WIDTH = 12
const CHAR_HEIGHT = 16
const TOP_MARGIN = SPACING_UNIT
const BOTTOM_MARGIN = SPACING_UNIT
const ROW_HEIGHT = CHAR_HEIGHT + TOP_MARGIN + BOTTOM_MARGIN

const NO_PIVOT = {rowIndex: -1, columnIndex: -1}
const noop = () => {}

const renderColumnHeader = params => {
  // console.log('renderColumnHeader', params)
  const {
    index,
    style,
    data: {columns, render, pivot, setpivot}
  } = params
  const column = columns[index]
  return (
    <div
      style={style}
      onMouseEnter={() => setpivot({rowIndex: -1, columnIndex: index})}
      onMouseLeave={() => setpivot(NO_PIVOT)}
    >
      {render
        ? render({
            columnIndex: index,
            label: column.label,
            id: column.id,
            column,
            pivot
          })
        : columns[index].label || columns[index].id || ''}
    </div>
  )
}

const ColumnHeader = props => {
  // console.log('ColumnHeader', props)
  const {
    height,
    itemCount,
    itemSize,
    width,
    columns,
    left = 0,
    render,
    headerRef,
    overscanCount,
    pivot,
    setpivot,
    ...rest
  } = props
  useLayoutEffect(() => {
    // console.log('ColumnHeader useEffect', columns)
    headerRef.current.resetAfterIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns])
  return (
    <VariableSizeList
      ref={headerRef}
      layout="horizontal"
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={itemSize}
      itemData={{columns, render, pivot, setpivot}}
      overscanCount={overscanCount}
      style={{left, overflow: 'hidden'}}
      {...rest}
    >
      {renderColumnHeader}
    </VariableSizeList>
  )
}

ColumnHeader.propTypes = {
  headerRef: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  itemSize: PropTypes.func.isRequired,
  render: PropTypes.func,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  left: PropTypes.number,
  overscanCount: PropTypes.number,
  pivot: PropTypes.object.isRequired,
  setpivot: PropTypes.func.isRequired
}

const renderRowHeader = params => {
  // console.log('renderRowHeader', params)
  const {
    index,
    style,
    data: {render, pivot, setpivot}
  } = params
  return (
    <div
      style={style}
      onMouseEnter={() => setpivot({rowIndex: index, columnIndex: -1})}
      onMouseLeave={() => setpivot(NO_PIVOT)}
    >
      {render
        ? render({
            rowIndex: index,
            pivot
          })
        : index + 1}
    </div>
  )
}

const RowHeader = props => {
  // console.log('RowHeader', props)
  const {
    height,
    width,
    itemCount,
    itemSize,
    render,
    rowHeaderRef,
    overscanCount,
    pivot,
    setpivot,
    ...rest
  } = props
  return (
    <VariableSizeList
      ref={rowHeaderRef}
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={itemSize}
      itemData={{render, pivot, setpivot}}
      overscanCount={overscanCount}
      style={{overflow: 'hidden'}}
      {...rest}
    >
      {renderRowHeader}
    </VariableSizeList>
  )
}

RowHeader.propTypes = {
  rowHeaderRef: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  itemSize: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired,
  overscanCount: PropTypes.number,
  pivot: PropTypes.object.isRequired,
  setpivot: PropTypes.func.isRequired
}

const coalesce = (a, b) => (a === undefined ? b : a)

const getColumnHeight = (value, column) => {
  if (column.height) {
    return column.height
  }
  if (
    column.type === 'date' ||
    column.type === 'number' ||
    typeof value !== 'string'
  ) {
    return ROW_HEIGHT
  }
  const width = column.width || COLUMN_WIDTH
  let valueWidth = 0
  for (const char of value) {
    if (char >= 'A' && char <= 'Z') {
      valueWidth += UPPER_CHAR_WIDTH
    } else {
      valueWidth += CHAR_WIDTH
    }
  }
  const extraLines = Math.trunc(valueWidth / width)
  // console.log('getColumnHeight', value, {valueWidth, extraLines}, 'height will be =>', ROW_HEIGHT + extraLines * CHAR_HEIGHT)
  const height = ROW_HEIGHT + extraLines * CHAR_HEIGHT
  if (column.maxHeight && height > column.maxHeight) {
    return column.maxHeight
  }
  return height
}

const renderCell = params => {
  // console.log('renderCell', params)
  let {
    columnIndex,
    rowIndex,
    style,
    data: {
      recordset,
      footerIndex,
      width,
      columns,
      Footer,
      render,
      pivot,
      setpivot
    }
  } = params
  if (footerIndex === rowIndex) {
    if (columnIndex === 0) {
      style = {...style, width}
      return (
        <div style={style}>
          <Footer />
        </div>
      )
    }
    return null
  }
  const record = recordset[rowIndex]
  const value = (record || {})[columns[columnIndex].id]
  return (
    <div
      style={style}
      onMouseEnter={() => setpivot({rowIndex, columnIndex})}
      onMouseLeave={() => setpivot(NO_PIVOT)}
    >
      {render
        ? render({
            value,
            rowIndex,
            columnIndex,
            record,
            pivot,
            column: columns[columnIndex]
          })
        : value || ''}
    </div>
  )
}

const ReactWindowGrid = props => {
  console.log('ReactWindowGrid', props)
  let {
    height,
    width = DEFAULT_WIDTH,
    recordset,
    footer: Footer,
    columns,
    headerHeight = ROW_HEIGHT,
    headerRenderer,
    cellRenderer,
    rowHeaderRenderer,
    rowHeaderWidth,
    overscanColumnsCount,
    overscanRowsCount,
    headerProps,
    rowHeaderProps,
    bodyProps,
    maxHeight,
    gridRef,
    scrollToTopOnNewRecordset,
    borderHeight = 0,
    disablePivot,
    ...rest
  } = props
  const [rowHeights, totalHeight] = useMemo(() => {
    // console.log('row heights calc started')
    const rowHeights = []
    let totalHeight = 0
    for (const record of recordset) {
      let rowHeight = 0
      for (const column of columns) {
        const value = record[column.id]
        const columnHeight = getColumnHeight(value, column)
        // console.log('getTotalHeight higher column', value, columnHeight, column)
        if (columnHeight > rowHeight) {
          rowHeight = columnHeight
        }
      }
      rowHeights.push(rowHeight)
      totalHeight += rowHeight
    }
    // console.log('getRowHeights ended')
    return [rowHeights, totalHeight]
  }, [recordset, columns])

  const getRowHeight = i => rowHeights[i] || 0
  const mayBeRef = useRef(null)
  if (!gridRef) {
    gridRef = mayBeRef
  }
  const outerRef = React.useRef(null)
  const headerRef = useRef(null)
  const rowHeaderRef = useRef(null)

  let [pivot, setpivot] = useState(NO_PIVOT)
  if (disablePivot) {
    pivot = NO_PIVOT
    setpivot = noop
  }

  const onScroll = params => {
    // console.log('onScroll', params)
    const {scrollLeft, scrollTop} = params
    if (headerRef.current) {
      // console.log('scrolling header')
      headerRef.current.scrollTo(scrollLeft)
    }
    if (rowHeaderRef.current) {
      rowHeaderRef.current.scrollTo(scrollTop)
    }
  }

  useLayoutEffect(() => {
    if (gridRef.current) {
      // console.log('ReactWindowGrid useEffect 1', gridRef.current)
      if (scrollToTopOnNewRecordset) {
        gridRef.current.scrollTo({scrollLeft: 0, scrollTop: 0})
      }
      gridRef.current.resetAfterRowIndex(0)
      if (rowHeaderRef.current) {
        rowHeaderRef.current.resetAfterIndex(0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordset, rowHeights])

  const [finalWidth, setFinalWidth] = useState(0)
  const [hasVerticalScrollBar, setHasVerticalScrollBar] = useState(false)
  const [hasHorizontalScrollBar, setHasHorizontalScrollBar] = useState(false)
  useLayoutEffect(() => {
    if (outerRef.current) {
      const hasHorizontal =
        outerRef.current.scrollWidth > outerRef.current.offsetWidth
      const hasVertical =
        outerRef.current.scrollHeight > outerRef.current.offsetHeight
      if (hasHorizontal !== hasHorizontalScrollBar) {
        setHasHorizontalScrollBar(hasHorizontal)
      }
      if (hasVertical !== hasVerticalScrollBar) {
        setHasVerticalScrollBar(hasVertical)
      }
      if (finalWidth !== outerRef.current.offsetWidth) {
        setFinalWidth(outerRef.current.offsetWidth)
      }
    }
  }, [hasHorizontalScrollBar, hasVerticalScrollBar, finalWidth])

  const footerIndex = Footer ? recordset.length : -1
  const rowCount = recordset.length + (Footer ? 1 : 0)
  const hasRowHeader = rowHeaderRenderer || rowHeaderWidth > 0
  rowHeaderWidth = hasRowHeader ? rowHeaderWidth || COLUMN_WIDTH : 0
  width -= rowHeaderWidth
  const columnsWidth = columns.reduce((w, c) => w + c.width, 0)
  let widthIsNotEnough = width < columnsWidth
  if (height === undefined) {
    height = headerHeight + totalHeight + borderHeight
    if (hasHorizontalScrollBar || widthIsNotEnough) {
      height += scrollbarSize()
    }
  }
  let heightIsNotEnough
  if (height > maxHeight) {
    height = maxHeight
    heightIsNotEnough = true
    if (width < columnsWidth + scrollbarSize()) {
      widthIsNotEnough = true
    }
  }
  useLayoutEffect(() => {
    if (gridRef.current) {
      // console.log('ReactWindowGrid useEffect 2', gridRef.current)
      gridRef.current.resetAfterColumnIndex(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, rowHeights])
  const getColumnWidth = i =>
    coalesce(columns[i] && columns[i].width, COLUMN_WIDTH)
  return (
    <div {...rest}>
      <ColumnHeader
        headerRef={headerRef}
        height={headerHeight}
        width={
          width -
          (hasVerticalScrollBar || heightIsNotEnough ? scrollbarSize() : 0)
        }
        left={rowHeaderWidth}
        itemCount={columns.length}
        itemSize={getColumnWidth}
        render={headerRenderer}
        columns={columns}
        overscanCount={overscanColumnsCount}
        pivot={pivot}
        setpivot={setpivot}
        {...headerProps}
      />
      <div
        style={{
          display: 'flex'
        }}
      >
        {hasRowHeader && (
          <RowHeader
            rowHeaderRef={rowHeaderRef}
            height={
              height -
              headerHeight -
              (hasHorizontalScrollBar || widthIsNotEnough ? scrollbarSize() : 0)
            }
            width={rowHeaderWidth}
            itemCount={recordset.length}
            itemSize={getRowHeight}
            render={rowHeaderRenderer}
            overscanCount={overscanRowsCount}
            pivot={pivot}
            setpivot={setpivot}
            {...rowHeaderProps}
          />
        )}
        <VariableSizeGrid
          ref={gridRef}
          outerRef={outerRef}
          height={height - headerHeight + borderHeight}
          width={width}
          rowCount={rowCount}
          rowHeight={getRowHeight}
          columnCount={columns.length}
          columnWidth={getColumnWidth}
          onScroll={onScroll}
          overscanColumnsCount={overscanColumnsCount}
          overscanRowsCount={overscanRowsCount}
          itemData={{
            recordset,
            footerIndex,
            width:
              finalWidth -
              (hasVerticalScrollBar || heightIsNotEnough ? scrollbarSize() : 0),
            columns,
            Footer,
            pivot,
            setpivot,
            render: cellRenderer
          }}
          {...bodyProps}
        >
          {renderCell}
        </VariableSizeGrid>
      </div>
    </div>
  )
}

ReactWindowGrid.propTypes = {
  height: PropTypes.number,
  maxHeight: PropTypes.number,
  width: PropTypes.number.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  recordset: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  footer: PropTypes.func,
  headerRenderer: PropTypes.func,
  cellRenderer: PropTypes.func,
  rowHeaderRenderer: PropTypes.func,
  rowHeaderWidth: PropTypes.number,
  headerHeight: PropTypes.number,
  borderHeight: PropTypes.number,
  overscanColumnsCount: PropTypes.number,
  overscanRowsCount: PropTypes.number,
  headerProps: PropTypes.object,
  rowHeaderProps: PropTypes.object,
  bodyProps: PropTypes.object,
  gridRef: PropTypes.object,
  style: PropTypes.object,
  scrollToTopOnNewRecordset: PropTypes.bool,
  disablePivot: PropTypes.bool
}

export default ReactWindowGrid
